require("dotenv").config();
const mysqldump = require("mysqldump");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const streamifier = require("streamifier");

// 🔥 Parse Railway DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL);

const DB_CONFIG = {
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace("/", ""),
  port: dbUrl.port || 3306
};

// ☁️ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔥 Upload using STREAM (no timeout)
const uploadToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "db-backups",
        format: "sql"
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const fileBuffer = fs.readFileSync(filePath);
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

async function backupDatabase() {
  try {
    console.log("🚀 Starting Railway MySQL backup...");

    const backupFileName = `backup-${Date.now()}.sql`;
    const backupPath = path.join(__dirname, backupFileName);

    // 🧠 Step 1: Create SQL Dump
    await mysqldump({
      connection: DB_CONFIG,
      dumpToFile: backupPath,
    });

    console.log("✅ Backup file created locally:", backupFileName);

    // ☁️ Step 2: Upload to Cloudinary (stream method)
    const uploadResult = await uploadToCloudinary(backupPath);

    console.log("☁️ Backup uploaded successfully:");
    console.log(uploadResult.secure_url);

    // 🧹 Step 3: Delete local file (important for Render free disk)
    fs.unlinkSync(backupPath);
    console.log("🧹 Local backup file deleted");

  } catch (error) {
    console.error("❌ Backup Error:", error);
  }
}

backupDatabase();
