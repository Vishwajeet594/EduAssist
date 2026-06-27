const { franc } = require("franc");

const SCRIPT_RULES = [
  { lang: "bn", regex: /[\u0980-\u09FF]/ },
  { lang: "ta", regex: /[\u0B80-\u0BFF]/ },
  { lang: "te", regex: /[\u0C00-\u0C7F]/ }
];

const MARATHI_HINTS = [
  "आहे",
  "काय",
  "कधी",
  "कसे",
  "कशी",
  "मला",
  "माझे",
  "तुमचे",
  "करायचे",
  "भरायचा",
  "शकतो",
  "शकते",
  "नाही",
  "अर्ज",
  "शिष्यवृत्ती",
  "फॉर्म"
];

const detectScriptLanguage = (text) => {
  for (const rule of SCRIPT_RULES) {
    if (rule.regex.test(text)) {
      return rule.lang;
    }
  }

  return null;
};

const detectDevanagariLanguage = (text) => {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (MARATHI_HINTS.some((hint) => normalized.includes(hint))) {
    return "mr";
  }

  return "hi";
};

const detectLanguage = (text = "") => {
  const input = String(text).trim();

  if (!input) {
    return "en";
  }

  const scriptLang = detectScriptLanguage(input);
  if (scriptLang) {
    return scriptLang;
  }

  if (/[\u0900-\u097F]/.test(input)) {
    return detectDevanagariLanguage(input);
  }

  const alphaCount = (input.match(/[a-z]/gi) || []).length;
  const minRomanLength = 20;

  if (alphaCount < minRomanLength) {
    return "en";
  }

  const lang = franc(input, { minLength: 10 });

  const map = {
    eng: "en",
    hin: "hi",
    ben: "bn",
    tam: "ta",
    tel: "te",
    mar: "mr"
  };

  return map[lang] || "en";
};

module.exports = detectLanguage;
