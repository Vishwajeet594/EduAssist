const axios = require("axios");

const generateAnswer =
  async (
    question,
    context
  ) => {

    const response =
      await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model:
            "deepseek/deepseek-chat",

          messages: [
            {
              role: "system",
              content:
                "Answer only using the provided context."
            },
            {
              role: "user",
              content: `
Context:
${context}

Question:
${question}
`
            }
          ]
        },
        {
          headers: {
            Authorization:
              `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type":
              "application/json"
          }
        }
      );

    return response.data
      .choices[0]
      .message.content;
  };

module.exports = {
  generateAnswer
};