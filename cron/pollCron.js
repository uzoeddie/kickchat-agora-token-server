const cron = require("node-cron");
const { endExpiredPolls } = require("../controllers/pollCtrl");

// not used
function registerPollCron() {
  // Every minute
  cron.schedule("* * * * *", async () => {
    try {
      const { ended, failed } = await endExpiredPolls();
      if (ended > 0 || failed > 0) {
        console.log(`[cron] endExpiredPolls ended=${ended} failed=${failed}`);
      }
    } catch (e) {
      console.error("[cron] endExpiredPolls threw", e);
    }
  });

  console.log("[cron] poll expiration job registered");
}

module.exports = { registerPollCron };
