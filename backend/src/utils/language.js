const { franc } =
  require("franc");

const detectLanguage =
  (text) => {

    const lang =
      franc(text);

    const map = {
      hin: "hi",
      ben: "bn",
      tam: "ta",
      tel: "te",
      mar: "mr",
      eng: "en"
    };

    return map[lang] || "en";
  };

module.exports =
  detectLanguage;