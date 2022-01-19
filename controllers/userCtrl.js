const auth = require('firebase-admin/auth');

module.exports = {
    async deleteAdminUser(req, res) {
        try {
            const { uid } = req.body;
            const authAdmin = auth.getAuth();
            await authAdmin.deleteUser(uid);
            return res.json({message: 'Auth user deleted'});

        } catch (error) {
            return res.json(error);
        }
    },
}