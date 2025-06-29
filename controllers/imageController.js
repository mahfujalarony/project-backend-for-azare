const containerClient = require('../config/azareBlobConfig');

const uploadImage = async (req, res) => {
  try {
    // Check if files are provided
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const imageUrls = [];

    // Upload each file to Azure Blob Storage
    for (const file of req.files) {
      const blobName = `${Date.now()}-${file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.upload(file.buffer, file.size, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });

      imageUrls.push(blockBlobClient.url);
    }

    res.status(200).json({ message: 'Images uploaded successfully', imageUrls });
  } catch (err) {
    console.error('Image upload failed:', err);
    res.status(500).json({ error: err.message || 'Image upload failed' });
  }
};

module.exports = { uploadImage };