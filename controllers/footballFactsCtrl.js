
const admin = require('firebase-admin');
const helperMethods = require('./helper');
const { Timestamp } = require('firebase-admin/firestore');

const PUSH_NOTIFICATION = 'push_notifications';

module.exports = {
    async addFootballFacts(req, res) {
        try {
            const { en, de, it, fr, es, pt, id } = req.body;
            const pushId = helperMethods.getRandomString(28);
            
            // Store football facts by locale
            const footballFacts = { en, de, it, fr, es, pt };
            
            // Send one notification to global topic with all language versions
            // The mobile app will display the appropriate language based on user's device settings
            const payload = {
                notification: {
                    title: translate('footballFactTitle', 'en', ''),
                    body: translate('footballFactBody', 'en', ''),
                },
                android: {
                    notification: {
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    },
                    priority: "high",
                },
                apns: {
                    headers: {
                        "apns-priority": "5"
                    }
                },
                data: {
                    'type': 'footballFact',
                    'pushId': pushId,
                    'factId': id,
                    // Include all language versions so mobile app can pick the right one
                    'factEn': en || '',
                    'factDe': de || '',
                    'factIt': it || '',
                    'factFr': fr || '',
                    'factEs': es || '',
                    'factPt': pt || '',
                    // Localized titles for each language
                    'titleEn': translate('footballFactTitle', 'en', ''),
                    'titleDe': translate('footballFactTitle', 'de', ''),
                    'titleIt': translate('footballFactTitle', 'it', ''),
                    'titleFr': translate('footballFactTitle', 'fr', ''),
                    'titleEs': translate('footballFactTitle', 'es', ''),
                    'titlePt': translate('footballFactTitle', 'pt', ''),
                    // Localized bodies for each language
                    'bodyEn': translate('footballFactBody', 'en', ''),
                    'bodyDe': translate('footballFactBody', 'de', ''),
                    'bodyIt': translate('footballFactBody', 'it', ''),
                    'bodyFr': translate('footballFactBody', 'fr', ''),
                    'bodyEs': translate('footballFactBody', 'es', ''),
                    'bodyPt': translate('footballFactBody', 'pt', ''),
                    title: translate('footballFactTitle', 'en', ''),
                    body: translate('footballFactBody', 'en', ''),
                },
                topic: 'global' // Send to global topic for all users
                // token: 'cuTaV_LMJ0HoryL4a0oMVG:APA91bFq4s1LtXBv-YmKcnOG8ijhYFmNc20Xq2yd__y_EwkLQpuCOcN7om0yxBViRYk1OdKLPjdsuRwUkSeH--c1JbMyjGz50Xeuf24pXxcd-WUni1Kuki0'
            };
            
            await admin.messaging().send(payload);
            
            // Save push notification to Firestore
            await savePushNotification('Football fact notification', pushId, 'footballFact', 0, {
                'type': 'footballFact',
                'pushId': pushId,
                'facts': footballFacts,
                title: translate('footballFactTitle', 'en', ''),
                body: translate('footballFactBody', 'en', ''),
            });
            
            return res.status(200).json({ 
                message: 'Football facts added and notifications sent successfully',
                pushId: pushId
            });
        } catch (error) {
            return res.status(500).json({ 
                message: 'Error adding football facts',
                error: error.message 
            });
        }
    }
};

function translate(phrase, locale, ph) {
    return __({ phrase, locale }, ph);
}

async function savePushNotification(title, pushId, type, usersOpenCount, data) {
    try {
        await admin.firestore().collection(PUSH_NOTIFICATION).doc(pushId).set({
            title,
            pushId,
            type,
            usersOpenCount,
            data,
            createdAt: Timestamp.now()
        });
    } catch (error) {
        return null;
    }
}
