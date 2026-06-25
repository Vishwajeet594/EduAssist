const translate = require("translate-google");

const translateToEnglish = async (text) => {
  return await translate(text, {
    to: "en"
  });
};

module.exports = {
  translateToEnglish
};