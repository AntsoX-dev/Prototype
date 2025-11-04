const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
    secure: true
});

module.exports = { cloudinary };
