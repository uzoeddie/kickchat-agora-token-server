require('dotenv').config();

const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors')
const fs = require('fs');
const helmet = require("helmet");
const favicon = require('serve-favicon');
const path = require('path');
const i18n = require('i18n');

const PORT = 8080;

if(process.env.NODE_ENV === 'development') {
    const serviceAccount = require('./kickchat-service-account.json');
    adminInitializeApp(serviceAccount);
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
    adminInitializeApp(serviceAccountData);
}

const app = express();
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
app.use(cors());
app.use(helmet());
app.use(express.json({}));
app.use(express.urlencoded({ extended: true }));

const index = require('./controllers/indexCtrl');
const accessToken = require('./routes/access-token');
const validateEmail = require('./routes/validate-email');
const topicPushNotification = require('./routes/topic-push-notification');
const health = require('./routes/health');

app.use('/', index);
app.use('/', accessToken);
app.use('/', validateEmail);
app.use('/', topicPushNotification);
app.use('/', health);

app.use((error, req, res, next) => {
    console.error('Error: ', error)
   
    res.status(500).json(error);   
});

app.listen(PORT, () => {
    console.log(process.env.SERVICE_ACCOUNT);
    console.log(`Listening on port: ${PORT}`);
});

function adminInitializeApp(serviceAccountJson) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson), 
        databaseURL: 'https://kickchat.firebaseio.com'
    });
}
