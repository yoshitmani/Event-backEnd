import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.OPENAI_API_KEY,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateWithRetry = async (prompt, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a skill recommendation AI. Always return valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: process.env.OPENAI_MODEL,
        temperature: 0.5,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      const is429 = error?.status === 429;
      const isLast = attempt === retries;

      if (is429 && !isLast) {
        const delayMs = 2 ** attempt * 5000;

        console.warn(
          `Rate limited. Retrying in ${
            delayMs / 1000
          }s... (attempt ${attempt}/${retries})`
        );

        await sleep(delayMs);
      } else {
        throw error;
      }
    }
  }
};

export const getSkillSuggestions = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid skills array.",
      });
    }

    const cleanedSkills = skills
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);

    if (cleanedSkills.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least 2 skills.",
      });
    }

    const prompt = `
You are an expert technical career advisor with deep knowledge of 2025 industry hiring trends.

A user has listed the following skills on their resume:
${cleanedSkills.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Your task:
1. Analyze the skill set and identify the likely role/domain (e.g., Frontend Developer, Data Scientist, DevOps Engineer, etc.).
2. Based on that domain and 2025 industry demand, identify:
   - Missing Skills: Important skills commonly expected but absent (max 6).
   - Recommended Improvements: Actionable advice to strengthen the profile (max 5).
   - Related Skills: Adjacent/complementary skills worth exploring (max 4).

Respond ONLY in this exact JSON format with no markdown, no extra text:
{
  "detectedRole": "string",
  "missingSkills": ["skill1", "skill2"],
  "recommendedImprovements": ["improvement1", "improvement2"],
  "relatedSkills": ["skill1", "skill2"]
}

`;

    const text = await generateWithRetry(prompt);

    const cleaned = text.replace(/```json|```/gi, "").trim();

    const parsed = JSON.parse(cleaned);

    return res.status(200).json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("Skill Suggestion Error:", error);

    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI service is busy. Please try again later.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate skill suggestions.",
    });
  }
};