require("dotenv").config();
const https = require("https");
const { getSasTokenRForSession } = require("./storage");

const fastify = require("fastify")({ logger: false });

fastify.get("/:session_id/:file_name", async (req, res) => {
  const { session_id, file_name } = req.params;
  let { container_url, sasOutputChanToken, token } =
    await getSasTokenRForSession(session_id);
  const url =
    file_name == "output_chan.m3u8"
      ? `${container_url}/output_chan.m3u8?${sasOutputChanToken}`
      : `${container_url}/${file_name}?${token}`;
  https.get(url, (stream) => {
    res.send(stream);
  });
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen(8000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
