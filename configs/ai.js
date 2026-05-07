import Groq from "groq-sdk";

const ai = new Groq({
  apiKey: process.env.OPENAI_API_KEY,
});

export default ai;