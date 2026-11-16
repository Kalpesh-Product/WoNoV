require("dotenv").config();
const mongoose = require("mongoose");

const SOURCE_COLLECTION = "partners";
const TARGET_COLLECTION = "partnership";

const migrate = async () => {
  if (!process.env.DB_URL) throw new Error("DB_URL is not configured.");

  await mongoose.connect(process.env.DB_URL, { serverSelectionTimeoutMS: 5000 });
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    const sourceExists = collections.some(({ name }) => name === SOURCE_COLLECTION);
    const targetExists = collections.some(({ name }) => name === TARGET_COLLECTION);

    if (!sourceExists) {
      console.log(targetExists
        ? "The partnership collection already exists; no migration needed."
        : "No partners collection exists; nothing to migrate.");
      return;
    }

    const source = db.collection(SOURCE_COLLECTION);
    const count = await source.countDocuments();
    const targetCount = targetExists
      ? await db.collection(TARGET_COLLECTION).countDocuments()
      : 0;
    if (targetCount > 0) {
      throw new Error("Both collections contain records. Stop and reconcile them manually; no data was changed.");
    }
    if (!process.argv.includes("--apply")) {
      console.log(`Dry run: ${count} record(s) would be moved from partners to partnership${targetExists ? " (replacing an empty destination)" : ""}. Run with --apply to rename the collection.`);
      return;
    }

    if (targetExists) {
      // Mongoose may have created the new, empty collection before this migration ran.
      await db.collection(TARGET_COLLECTION).drop();
    }
    await source.rename(TARGET_COLLECTION, { dropTarget: false });
    const migratedCount = await db.collection(TARGET_COLLECTION).countDocuments();
    if (migratedCount !== count) {
      throw new Error(`Collection renamed, but record count changed from ${count} to ${migratedCount}.`);
    }
    console.log(`Renamed partners to partnership; verified ${migratedCount} record(s).`);
  } finally {
    await mongoose.disconnect();
  }
};

migrate().catch((error) => {
  console.error("Partnership collection migration failed:", error);
  process.exitCode = 1;
});
