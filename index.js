require('dotenv').config();

const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors')
const fs = require('fs');
const helmet = require("helmet");
const favicon = require('serve-favicon');
const path = require('path');
const i18n = require('i18n');
const http = require('http');
const cloudinary = require('cloudinary');
const treblle = require('@treblle/express');
const { indexNonce } = require("./nounce");

const app = express();
const server = http.createServer(app);

const PORT = 8080;

if(process.env.NODE_ENV === 'development') {
    const serviceAccount = require('./kickchatdev-service-account.json');
    adminInitializeApp(serviceAccount, 'https://kickchat-dev.firebaseio.com'); // https://kickchat-dev.firebaseio.com does not work
} else {
    let serviceData = {
        "type": process.env.TYPE,
        "project_id": process.env.PROJECT_ID,
        "private_key_id": process.env.PRIVATE_KEY_ID,
        "private_key": process.env.PRIVATE_KEY,
        "client_email": process.env.CLIENT_EMAIL,
        "client_id": process.env.CLIENT_ID,
        "auth_uri": process.env.AUTH_URI,
        "token_uri": process.env.TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
        "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL
    };
    fs.writeFileSync('/tmp/kickchat-service-account.json', JSON.stringify(serviceData), 'utf8');
    const serviceAccountData = require('/tmp/kickchat-service-account.json');
    adminInitializeApp(serviceAccountData, 'https://kickchat.firebaseio.com');
}
cloudinaryConfig();

i18n.configure({
    locales: ['en', 'es', 'de', 'it', 'pt', 'fr'],
    directory: path.join(__dirname, 'locales'),
    defaultLocale: 'en',
    register: global
});
app.use(favicon(path.join(__dirname, 'public/img', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(function (req, res, next) {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self'; connect-src 'self';"
    );
    next();
});
// app.use(
//     treblle({
//         apiKey: process.env.TREBLLE_API_KEY,
//         projectId: process.env.TREBLLE_PROJECT_ID,
//         additionalFieldsToMask: [],
//     })
// );

app.use(helmet({
    // this is set for content security policy
    contentSecurityPolicy: {
        directives: {
            scriptSrc: [
                "'strict-dynamic'", // For nonces to work
                `'nonce-${indexNonce}'`,
            ],
            connectSrc: ["'self'", "https://*.google-analytics.com"],
            scriptSrcAttr: null, // Remove Firefox warning
        },
    },
}));
app.use(express.json({}));
app.use(express.urlencoded({ extended: true }));

const index = require('./controllers/indexCtrl');
const accessToken = require('./routes/access-token');
const validateEmail = require('./routes/validate-email');
const topicPushNotification = require('./routes/topic-push-notification');
const health = require('./routes/health');
const user = require('./routes/user');
const sms77 = require('./routes/sms77');
const referral = require('./routes/referral');
const fileUpload = require('./routes/file-upload');
const news = require('./routes/news');

app.use('/', index);
app.use('/', accessToken);
app.use('/', validateEmail);
app.use('/', topicPushNotification);
app.use('/', health);
app.use('/', user);
app.use('/', sms77);
app.use('/', referral);
app.use('/', fileUpload);
app.use('/news', news);

app.use((error, req, res, next) => {
    console.error('Error: ', error)
    res.status(500).json(error);   
});

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

function adminInitializeApp(serviceAccountJson, databaseURL) {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountJson), 
            databaseURL
        });    
    }
}

function cloudinaryConfig() {
    cloudinary.v2.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET
    });
}
