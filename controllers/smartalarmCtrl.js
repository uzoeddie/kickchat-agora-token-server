const express = require("express");
const router = express.Router();

router.get('/metrics', (req, res) => {
    return res.json({
        branch_id: '1',
        alarm_id: '1',
        state: 'coming',
    });
});

module.exports = router;