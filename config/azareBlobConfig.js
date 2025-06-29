const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// Initialize Blob Service Client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_CONTAINER_NAME
);

module.exports = containerClient;