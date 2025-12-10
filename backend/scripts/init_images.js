// crush_node.js

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

// === CONFIGURATION ===
// UPDATE THIS PATH to where your raw images are!
const SOURCE_DIR = "/mnt/data/torrents/cats";
const OUTPUT_DIR = "/mnt/data/cats";
const TARGET_WIDTH = 1200;
const CONCURRENCY = 2; // Low concurrency for E-450 CPU
// =====================

async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

console.log(`[Init] Checking directories...`);
await ensureDir(OUTPUT_DIR);

console.log(`[Init] Scanning source directory: ${SOURCE_DIR}`);
let files = [];
try {
  files = await fs.readdir(SOURCE_DIR);
} catch (e) {
  console.error(`ERROR: Could not read source directory. Is the path correct?`);
  console.error(e);
  process.exit(1);
}

// Filter for images only
const validFiles = files.filter((f) => f.match(/\.(jpg|jpeg|png|bmp|tiff)$/i));
console.log(`[Init] Found ${validFiles.length} images.`);

let processedCount = 0;
let skippedCount = 0;
let errorCount = 0;

// Process in chunks
for (let i = 0; i < validFiles.length; i += CONCURRENCY) {
  const batch = validFiles.slice(i, i + CONCURRENCY);

  await Promise.all(
    batch.map(async (filename) => {
      try {
        // 1. Calculate Hash for folder structure (00-ff)
        const hash = crypto.createHash("md5").update(filename).digest("hex");
        const shard = hash.substring(0, 2);
        const shardDir = path.join(OUTPUT_DIR, shard);

        // Ensure shard folder exists
        await ensureDir(shardDir);

        // 2. Define Output Path
        const nameWithoutExt = path.parse(filename).name;
        const outPath = path.join(shardDir, `${nameWithoutExt}.webp`);

        // 3. CHECK IF EXISTS (Resume capability)
        try {
          await fs.access(outPath);
          skippedCount++;
          // Optional: Uncomment to see skipped files
          // process.stdout.write('S');
          return;
        } catch {
          // File doesn't exist, proceed to process
        }

        // 4. Resize and Convert
        await sharp(path.join(SOURCE_DIR, filename))
          .resize({
            width: TARGET_WIDTH,
            withoutEnlargement: true,
          })
          .webp({ quality: 90 })
          .toFile(outPath);

        processedCount++;
        // Simple visual feedback dot
        process.stdout.write(".");
      } catch (err) {
        errorCount++;
        console.error(`\n[Error] ${filename}: ${err.message}`);
      }
    })
  );

  // Log progress every 100 files
  if ((i + CONCURRENCY) % 100 < CONCURRENCY) {
    const totalDone = processedCount + skippedCount + errorCount;
    const percent = ((totalDone / validFiles.length) * 100).toFixed(2);
    console.log(`\n[Progress] ${totalDone}/${validFiles.length} (${percent}%) - New: ${processedCount}, Skipped: ${skippedCount}`);
  }
}

console.log("\n\n=== DONE ===");
console.log(`Processed: ${processedCount}`);
console.log(`Skipped:   ${skippedCount}`);
console.log(`Errors:    ${errorCount}`);
