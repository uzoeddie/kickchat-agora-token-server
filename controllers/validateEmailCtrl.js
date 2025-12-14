const fs = require("fs");
const path = require("path");
const dns = require('dns').promises;
const net = require('net');

// Load disposable domains into a Set for O(1) lookup (do this ONCE at module load time)
let disposableDomains = null;

function initializeDisposableDomains() {
    if (disposableDomains !== null) {
        return; // Already initialized
    }

    try {
        // Adjust the path to where your lists.tsx file is located
        const filePath = path.join(__dirname, '../lists.txt');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        const domains = fileContent
            .split('\n')
            .map(line => line.trim().toLowerCase())
            .filter(line => line.length > 0);

        // Use Set for O(1) lookup - extremely fast!
        disposableDomains = new Set(domains);
    } catch (error) {
        // Initialize as empty Set to prevent crashes
        disposableDomains = new Set();
    }
}

// Initialize immediately when module is loaded
initializeDisposableDomains();

/**
 * Whenever you update the disposable domains list, don't forget to include
 * test.com, example.com, example1.com, example2.com, example3.com, example4.com,
 * example.org, example1.org, example2.org, example.net, example1.net, example2.net
 */
module.exports = {
    async validateEmail(req, res) {
        try {
            const email = req.query.email;

            // Validate email exists
            if (!email || typeof email !== 'string') {
                return res.status(200).json({
                    valid: false,
                    error: 'Email is required',
                    // remove this in 2026
                    // the latest version of the mobile app does not use these validators field
                    // it's only here for backward compatibility
                    // I used 200 for the error code so that the frontend doesn't handle it that was
                    validators: {
                        regex: { valid: false },
                        typo: { valid: false },
                        disposable: { valid: false },
                        mx: { valid: false },
                        smtp: { valid: false }
                    }
                });
            }

            // Extract domain
            const emailLower = email.trim().toLowerCase();
            const atIndex = emailLower.lastIndexOf('@');

            // Check for valid email format
            if (atIndex === -1 || atIndex === 0 || atIndex === emailLower.length - 1) {
                return res.status(200).json({
                    valid: false,
                    error: 'Invalid email format',
                    validators: {
                        regex: { valid: false },
                        typo: { valid: false },
                        disposable: { valid: false },
                        mx: { valid: false },
                        smtp: { valid: false }
                    }
                });
            }

            const domain = emailLower.substring(atIndex + 1);

            const records = await getMXRecords(domain);
            const hasMXRecord = records && records.length > 0 && records[0].exchange !== ''
            if (!hasMXRecord) {
                return res.status(200).json({
                    valid: false,
                    message: 'Email domain does not have valid mail servers',
                    validators: {
                        regex: { valid: false },
                        typo: { valid: false },
                        disposable: { valid: false },
                        mx: { valid: false },
                        smtp: { valid: false }
                    }
                });
            }

            if (records.length > 0 && records[0].exchange !== '') {
                const result = await checkSMTPConnection(records[0].exchange, 2000);
                if (!result) {
                    return res.status(200).json({
                        valid: false,
                        message: 'Email domain does not have valid mail servers',
                        validators: {
                            regex: { valid: false },
                            typo: { valid: false },
                            disposable: { valid: false },
                            mx: { valid: false },
                            smtp: { valid: false }
                        }
                    });
                }
            }

            // Check if domain is disposable (SUPER FAST - O(1) lookup!)
            const isDisposable = disposableDomains.has(domain);
            if (isDisposable) {
                return res.status(200).json({
                    valid: false,
                    message: 'Disposable email addresses are not allowed',
                    validators: {
                        regex: { valid: false },
                        typo: { valid: false },
                        disposable: { valid: false },
                        mx: { valid: false },
                        smtp: { valid: false }
                    }
                });
            }

            // All checks passed!
            return res.status(200).json({
                valid: true,
                message: 'Email is valid',
                validators: {
                    regex: { valid: true },
                    typo: { valid: true },
                    disposable: { valid: true },
                    mx: { valid: true },
                    smtp: { valid: true }
                }
            });

        } catch (error) {
            return res.status(500).json({
                valid: false,
                error: 'Internal server error'
            });
        }
    },
}

async function getMXRecords(domain) {
    try {
        const records = await dns.resolveMx(domain);
        records.sort((a, b) => a.priority - b.priority);
        return records
    } catch (error) {
        return false;
    }
}

async function checkSMTPConnection(mxHost, timeout = 2000) {
    return new Promise((resolve) => {
        const socket = net.createConnection(25, mxHost);
        let response = '';

        const timer = setTimeout(() => {
            socket.destroy();
            resolve(false);
        }, timeout);

        socket.on('connect', () => {
        // Connection successful
        });

        socket.on('data', (data) => {
        response += data.toString();
        
        // Look for 220 response code (service ready)
        if (response.includes('220')) {
            clearTimeout(timer);
            socket.destroy();
            resolve(true);
        }
        });

        socket.on('error', (error) => {
            clearTimeout(timer);
            resolve(false);
        });
    });
}