const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const path = require("path");
const axios = require("axios");
const cors = require("cors");

const reddit = require("./services/reddit");
const gtts = require("./services/gtts");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", async (_req, res) => {
  try {
    // get access token
    let { access_token } = await reddit.getAccessToken();

    // get the latest reddit post
    let thread_data = await reddit.getThreadFromReddit(
      access_token,
      "askreddit"
    );

    if (thread_data.length !== 2) {
      return res.send("no data");
    }
    // format the data
    let formatted_thread_response = reddit.formatThread(thread_data);

    let audioList = [];

    audioList = [];
    formatted_thread_response.forEach((thread) => {
      thread.audio = gtts.getAudioUrl(thread.body);
      audioList = [...audioList, ...thread.audio];
    });

    let promises = [];
    for (const audio of audioList) {
      promises.push(getBase64Audio(audio));
    }
    let response = {}
    response.thread = formatted_thread_response
    response.base64_audio = await Promise.all(promises);

    console.log("sent", response.base64_audio.length);
    res.send(response);
  } catch (error) {
    res.send(error.message);
  }
});

const get_audio_path = (filename) => {
  return path.join(__dirname, "resources/audio", filename);
};

app.get("/audio-base64", async (req, res) => {
  let url = req.query.url;
  console.log("url1");
  try {
    return { content: getBase64Audio(url) };
  } catch (error) {
    res.send(error.message);
  }
});

const getBase64Audio = async (url) => {
  try {
    let response = await axios.get(url, {
      responseType: "arraybuffer",
    });
    let base64 = new Buffer.from(response.data, "binary").toString("base64");

    console.log("base64");
    return `data:audio/mpeg;base64,${base64}`;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// const getAudioBase64 = (audioFile, callback) => {
//   let reader = new FileReader();
//   reader.onload = function (event) {
//     let data = event.target.result.split(","),
//       decodedImageData = Buffer.from(data[1]).toString("base64"); // the actual conversion of data from binary to base64 format
//     callback(decodedImageData);
//   };
//   reader.readAsDataURL(audioFile);
// };

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
