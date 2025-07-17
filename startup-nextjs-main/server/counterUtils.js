const { db } = require("./firebaseAdmin");

const COUNTER_CONFIGS = {
  properties: {
    collection: "propertiesCounter",
    prefix: "PROP",
  },
  propertyDocuments: {
    collection: "propertyDocumentsCounter",
    prefix: "DOC",
  },
  propertyVerificationHistory: {
    collection: "propertyVerificationHistoryCounter",
    prefix: "HIST",
  },
  propertyImages: {
    collection: "propertyImagesCounter",
    prefix: "IMG",
  },
};

/**
 * Get the next ID for a specific entity type.
 * @param {'properties'|'propertyDocuments'|'propertyVerificationHistory'|'propertyImages'} type
 * @returns {Promise<string>} The next ID (e.g., PROP001)
 */
async function getNextId(type) {
  const config = COUNTER_CONFIGS[type];
  const counterRef = db.collection(config.collection).doc("counter");
  const counterDoc = await counterRef.get();
  let nextId = 1;
  if (counterDoc.exists) {
    nextId = counterDoc.data().lastId + 1;
  }
  await counterRef.set({ lastId: nextId }, { merge: true });
  return `${config.prefix}${String(nextId).padStart(3, "0")}`;
}

/**
 * Initialize all counters if they don't exist.
 */
async function initializeAllCounters() {
  for (const config of Object.values(COUNTER_CONFIGS)) {
    const counterRef = db.collection(config.collection).doc("counter");
    const counterDoc = await counterRef.get();
    if (!counterDoc.exists) {
      await counterRef.set({ lastId: 0 });
      console.log(`Initialized ${config.collection}`);
    }
  }
}

async function getOrIncrementCounter(type) {
  // type is one of: 'properties', 'propertyDocuments', 'propertyVerificationHistory', 'propertyImages'
  const config = COUNTER_CONFIGS[type];
  if (!config) throw new Error(`Unknown counter type: ${type}`);
  const counterRef = db.collection(config.collection).doc("counter");
  const counterDoc = await counterRef.get();
  let nextId = 1;
  if (counterDoc.exists) {
    nextId = counterDoc.data().lastId + 1;
  }
  await counterRef.set({ lastId: nextId }, { merge: true });
  return `${config.prefix}${String(nextId).padStart(3, "0")}`;
}

module.exports = {
  getNextId,
  initializeAllCounters,
  getOrIncrementCounter,
};
