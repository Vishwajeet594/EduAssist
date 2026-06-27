const translate = require("translate-google");

const translateToEnglish = async (
  text
) => {
  return await translate(
    text,
    { to: "en" }
  );
};

const translateFromEnglish =
  async (
    text,
    lang
  ) => {
    return await translate(
      text,
      { to: lang }
    );
  };

module.exports = {
  translateToEnglish,
  translateFromEnglish
};