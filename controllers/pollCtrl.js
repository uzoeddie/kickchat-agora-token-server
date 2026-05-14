const admin = require("firebase-admin");

// not used

const POLLS = "polls";
const SOCIAL_POSTS = "posts"; // adjust to your actual collection name

/**
 * In-memory store for the current live poll.
 * Shape: { id: string, pollEnd: string, status: string } | null
 */
let livePollStore = null;

/**
 * Fetch the live poll from Firebase and cache it in the in-memory store.
 * Returns the cached poll or null if none exists.
 */
async function fetchAndStoreLivePoll() {
  const db = admin.firestore();

  const liveSnap = await db
    .collection(POLLS)
    .where("status", "==", "live")
    .limit(1)
    .get();

  if (liveSnap.empty) {
    livePollStore = null;
    return null;
  }

  const doc = liveSnap.docs[0];
  livePollStore = { id: doc.id, ...doc.data() };
  console.log("[pollCtrl] Live poll fetched and stored:", livePollStore.id);
  return livePollStore;
}

/**
 * Returns the cached live poll. If the store is empty, fetches from Firebase first.
 */
async function getLivePoll() {
  if (!livePollStore) {
    return await fetchAndStoreLivePoll();
  }
  return livePollStore;
}

/**
 * Clears the in-memory live poll store.
 * Call this after a poll has ended or when a new poll becomes live.
 */
function clearLivePollStore() {
  livePollStore = null;
}

/**
 * Ends a single poll by id. Idempotent — safe to call on an already-ended poll.
 */
async function endPollById(pollId) {
  const db = admin.firestore();

  const pollRef = db.collection(POLLS).doc(pollId);

  // Transactional claim: only the caller that flips 'live' -> 'ended' wins.
  // Everyone else short-circuits. Protects against client + cron racing.
  const claimed = await db.runTransaction(async (tx) => {
    const snap = await tx.get(pollRef);
    if (!snap.exists) return false;
    if (snap.data().status !== "live") return false;

    tx.update(pollRef, {
      status: "ended",
      endedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  });

  if (!claimed) return { ended: false, reason: "not-live" };

  // Mirror status on the related social post
  const postSnap = await db
    .collection(SOCIAL_POSTS)
    .where("poll.pollId", "==", pollId)
    .limit(1)
    .get();

  if (!postSnap.empty) {
    await postSnap.docs[0].ref.update({
      "poll.status": "ended",
      createdAt: new Date().toISOString(),
    });
  }

  // Clear the in-memory store since the poll has ended
  clearLivePollStore();

  return { ended: true };
}

/**
 * Checks the in-memory store for a live poll and ends it if its time has expired.
 * Falls back to Firebase if the store is empty.
 */
async function endExpiredPolls() {
  const poll = await getLivePoll();

  if (!poll) return { ended: false };

  const endMs = new Date(poll.pollEnd).getTime();

  if (Number.isNaN(endMs) || Date.now() <= endMs) {
    return { ended: false };
  }

  try {
    const result = await endPollById(poll.id);
    return { ended: result.ended };
  } catch (e) {
    console.error("[endExpiredPolls] failed for", poll.id, e);
    return { ended: false, error: true };
  }
}

module.exports = {
  // Expose the worker so the cron file can import it
  endExpiredPolls,
  // Expose store helpers for use when a new poll is created
  fetchAndStoreLivePoll,
  clearLivePollStore,
};
