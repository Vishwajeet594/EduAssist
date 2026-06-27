const axios = require("axios");

const generateAnswer =
  async (
    question,
    context
  ) => {
    const strictSystemPrompt = [
      "You are EduAssist, a college assistant.",
      "You must answer using ONLY the provided uploaded-PDF context.",
      "Do not use outside knowledge, assumptions, or general facts.",
      "If the answer is not explicitly supported by the context, reply exactly: 'Not found in the uploaded PDFs.'",
      "Keep the answer concise and factual.",
      "When relevant, include short bullet points or headings, but do not invent anything."
    ].join(" ");

    const response =
      await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model:
            "deepseek/deepseek-chat",

          messages: [
            {
              role: "system",
              content: strictSystemPrompt
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
