const {
  StorageSharedKeyCredential,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} = require("@azure/storage-blob");

const azure_storage_account = process.env.azure_storage_account;
const azure_storage_access_key = process.env.azure_storage_access_key;

const sharedKeyCredential = new StorageSharedKeyCredential(
  azure_storage_account,
  azure_storage_access_key
);

const blobServiceClient = new BlobServiceClient(
  `https://${azure_storage_account}.blob.core.windows.net`,
  sharedKeyCredential
);

async function getSasTokenCRUForSession(session_id) {
  const containerName = "session-" + session_id;
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();

  // for uploading blob to Container
  const expiresOn = new Date(new Date().valueOf() + 10 * 60 * 1000);
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: containerName,
      expiresOn,
      permissions: BlobSASPermissions.parse("rcw"),
    },
    sharedKeyCredential
  );
  return {
    session_id,
    token: sasToken.toString(),
    container_url: containerClient.url,
  };
}

async function getSasTokenRForSession(session_id) {
  const containerName = "session-" + session_id;
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();

  // for reading blob from Container
  const expiresOn = new Date(new Date().valueOf() + 10 * 60 * 1000);
  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: containerName,
      expiresOn,
      permissions: BlobSASPermissions.parse("r"),
    },
    sharedKeyCredential
  );
  const expiresOn24h = new Date(new Date().valueOf() + 24 * 60 * 60 * 1000);
  const sasMixerToken = generateBlobSASQueryParameters(
    {
      containerName: containerName,
      blobName: "mixer.m3u8",
      expiresOn: expiresOn24h,
      permissions: BlobSASPermissions.parse("r"),
    },
    sharedKeyCredential
  );
  const sasOutputChanToken = generateBlobSASQueryParameters(
    {
      containerName: containerName,
      blobName: "output_chan.m3u8",
      expiresOn: expiresOn24h,
      permissions: BlobSASPermissions.parse("r"),
    },
    sharedKeyCredential
  );
  return {
    session_id,
    token: sasToken.toString(),
    sasMixerToken: sasMixerToken.toString(),
    sasOutputChanToken: sasOutputChanToken.toString(),
    container_url: containerClient.url,
  };
}
module.exports = { getSasTokenCRUForSession, getSasTokenRForSession };
