const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateAnswer = async (
  question,
  context
) => {
  const completion =
    await groq.chat.completions.create({
      model: "llama3-70b-8192",

      messages: [
        {
          role: "system",
          content:
            "You are a college assistant. Answer only using the provided context.",
        },
        {
          role: "user",
          content: `
Context:
${context}

Question:
${question}
`,
        },
      ],

      temperature: 0.3,
    });

  return completion.choices[0]
    .message.content;
};

module.exports = {
  generateAnswer,
};