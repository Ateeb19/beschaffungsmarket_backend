const fs = require("fs");
const axios = require("axios");
const path = require("path");

const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = `${Date.now()}-${file.originalname}`;

    fs.rename(file.path, `uploads/${fileName}`, (err) => {
      if (err) {
        reject(err);
        console.error("Error saving file: ", err);
      } else {
        resolve(fileName);
        console.log({ message: "File uploaded and saved successfully" });
      }
    });
  });
};

const downloadInvoice = async (fileUrl) => {
  const fileName = `${Date.now()}.pdf`;
  const uploadsDir = path.join(__dirname, "..", "uploads");

  try {
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);

    // Download file as stream
    const response = await axios.get(fileUrl, { responseType: "stream" });
    const writer = fs.createWriteStream(filePath);

    // Pipe and await completion
    await new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("File downloaded and saved:", fileName);
    return fileName;
  } catch (error) {
    console.error("Failed to download file:", error);
    throw error;
  }
};

module.exports = { uploadFile, downloadInvoice };
