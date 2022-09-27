const escapeStringRegexp = require('escape-string-regexp');
const GOOGLE_TTS_URL = 'http://translate.google.com/translate_tts';
const MAX_CHARS = 200;
const LANGUAGES = {
  'af': 'Afrikaans',
  'sq': 'Albanian',
  'ar': 'Arabic',
  'hy': 'Armenian',
  'ca': 'Catalan',
  'zh': 'Chinese',
  'zh-cn': 'Chinese (Mandarin/China)',
  'zh-tw': 'Chinese (Mandarin/Taiwan)',
  'zh-yue': 'Chinese (Cantonese)',
  'hr': 'Croatian',
  'cs': 'Czech',
  'da': 'Danish',
  'nl': 'Dutch',
  'en': 'English',
  'en-au': 'English (Australia)',
  'en-uk': 'English (United Kingdom)',
  'en-us': 'English (United States)',
  'eo': 'Esperanto',
  'fi': 'Finnish',
  'fr': 'French',
  'de': 'German',
  'el': 'Greek',
  'ht': 'Haitian Creole',
  'hi': 'Hindi',
  'hu': 'Hungarian',
  'is': 'Icelandic',
  'id': 'Indonesian',
  'it': 'Italian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'la': 'Latin',
  'lv': 'Latvian',
  'mk': 'Macedonian',
  'no': 'Norwegian',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'pt-br': 'Portuguese (Brazil)',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sr': 'Serbian',
  'sk': 'Slovak',
  'es': 'Spanish',
  'es-es': 'Spanish (Spain)',
  'es-us': 'Spanish (United States)',
  'sw': 'Swahili',
  'sv': 'Swedish',
  'ta': 'Tamil',
  'th': 'Thai',
  'tr': 'Turkish',
  'vi': 'Vietnamese',
  'cy': 'Welsh'
}

function Text2Speech(_lang, _debug) {
  let lang = _lang || 'en';
  let debug = _debug || false;
  lang = lang.toLowerCase();

  if (!LANGUAGES[lang])
    throw new Error('Language not supported: ' + lang);

  let getArgs = getArgsFactory(lang);

  return {
    tokenize: tokenize,
    getUrls:(text, callback) => getUrls(getArgs, text, callback),
    save: (filepath, text, callback) => save(getArgs, filepath, text, callback)
  }
}

function getUrls(getArgs, text, callback){
    let text_parts = tokenize(text);
    let total = text_parts.length;
    let urls = text_parts.map((part) => {
        let index = text_parts.indexOf(part);
        let args = getArgs(part, index, total);
        return GOOGLE_TTS_URL + args;
    })

    callback(urls)
}

function getArgsFactory(lang){
  return function (text, index, total) {
    let textlen = text.length;
    let encodedText = encodeURIComponent(text);
    let language = lang || 'en';
    return `?ie=UTF-8&tl=${language}&q=${encodedText}&total=${total}&idx=${index}&client=tw-ob&textlen=${textlen}`
  }
}

function tokenize(text) {
  var text_parts = [];
  if (!text)
    throw new Error('No text to speak');

  var punc = '¡!()[]¿?.,;:—«»\n ';
  var punc_list = punc.split('').map(function(char) {
    return escapeStringRegexp(char);
  });

  var pattern = punc_list.join('|');
  var parts = text.split(new RegExp(pattern));
  parts = parts.filter(p => p.length > 0);

  var output = [];
  var i = 0;
  for (let p of parts) {
    if (!output[i]) {
      output[i] = '';
    }
    if (output[i].length + p.length < MAX_CHARS) {
      output[i] += ' ' + p;
    } else {
      i++;
      output[i] = p;
    }
  }
  output[0] = output[0].substr(1);
  return output;
}


module.exports = Text2Speech;
