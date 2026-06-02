import { dbConnect } from "@/server/db/connect";
import { Interview } from "@/server/models/Interview";

/**
 * Fix E11000 duplicate key error on share.tokenHash index
 * Run: npm exec ts-node scripts/fix-interview-index.ts
 */
async function fixInterviewIndex() {
  try {
    console.log("Connecting to database...");
    await dbConnect();

    console.log("Dropping old unique index on share.tokenHash...");
    try {
      await Interview.collection.dropIndex("share.tokenHash_1");
      console.log("✓ Old index dropped");
    } catch (err: any) {
      if (err.code === 27) {
        console.log("✓ Index doesn't exist (already dropped)");
      } else {
        throw err;
      }
    }

    console.log("Recreating index with partialFilterExpression...");
    await Interview.collection.createIndex(
      { "share.tokenHash": 1 },
      {
        unique: true,
        sparse: true,
        partialFilterExpression: { "share.tokenHash": { $ne: null } },
      }
    );
    console.log("✓ New index created successfully");

    console.log("\n✅ Interview index fixed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

fixInterviewIndex();
