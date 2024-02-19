const cloudinary = require('cloudinary');
const axios = require('axios');
const { createCanvas } = require('canvas');

module.exports = {
    async convertSocialProfileUrlToImageAndUpload(req, res) {
        try {
            const { fileUrl, username } = req.body;
            const image = await axios.get(fileUrl, {responseType: 'arraybuffer'});
            const returnedB64 = Buffer.from(image.data).toString('base64');
            const contentType = image.headers.get('content-type');
            const imageBase64 = `data:${contentType};base64,${returnedB64}`;
            let result = null;
            if (returnedB64.length > 0) {
                result = await Promise.resolve(cloudinary.v2.uploader.upload(imageBase64, { 
                    public_id: username, 
                    overwrite: true, 
                    invalidate: true 
                }));
            }
            return res.json({message: 'Social image uploaded successfully.', uploadResult: result});
        } catch (error) {
            return res.json({message: 'Error uploading social image', error});
        }
    },

    async createUserAvatar(req, res) {
        try {
            console.log(req.body);
            const { avatarColor, username } = req.body;
            const avatar = generateAvatar(username.charAt(0).toUpperCase(), avatarColor);
            const result = await Promise.resolve(cloudinary.v2.uploader.upload(avatar, { 
                public_id: username, 
                overwrite: true, 
                invalidate: true 
            }));
            return res.json({message: 'Avatar image uploaded successfully.', uploadResult: result});
        } catch (error) {
            return res.json({message: 'Error uploading avatar image', error});
        }
    },
}

function generateAvatar(text, backgroundColor, foregroundColor = 'white') {
    const canvas = createCanvas(200, 200);
    const context = canvas.getContext('2d');

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // context.font = 'normal 80px sans-serif';
    context.fillStyle = foregroundColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    return canvas.toDataURL('image/jpg');
}