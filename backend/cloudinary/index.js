const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const crypto = require('crypto');
const mime = require('mime-types');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  timeout: 60 * 60 * 1000,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let format = mime.extension(file.mimetype);

    // Fallback if mime extension returns false or doesn't match original extension
    if (!format || format !== file.originalname.split('.').pop()) {
      format = file.mimetype === 'audio/mpeg' ? 'mp3' : file.originalname.split('.').pop();
    }

    const originalName = file.originalname.split('.').slice(0, -1).join('.');
    const randomString = crypto.randomBytes(6).toString('hex');
    const public_id = `${originalName}_${randomString}`;

    // Explicitly determine resource_type to avoid deletion issues later
    let resource_type = 'raw';
    if (file.mimetype.startsWith('image/')) {
      resource_type = 'image';
    } else if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      resource_type = 'video';
    }

    return {
      folder: 'Materials',
      public_id: public_id,
      resource_type: resource_type,
      format: format,
      overwrite: false,
    };
  },
});

module.exports = {
  cloudinary,
  storage,
};