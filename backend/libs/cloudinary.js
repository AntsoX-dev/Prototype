import { v2 as cloudinary } from "cloudinary";

/**
 * @param {Buffer} fileBuffer 
 * @param {string} folder 
 * @returns {Promise<object>} 
 */
export const uploadFileToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", 
        folder: folder, 
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};
