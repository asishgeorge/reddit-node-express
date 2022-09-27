const gtts = require("./node-gtts")('en');

const getAudioUrl = (text) => {
    let audio_urls = []
    gtts.getUrls(text, function (r) {
        audio_urls = r
    })

    return audio_urls

}


module.exports = {
    getAudioUrl
}