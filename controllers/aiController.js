import ai from "../configs/ai.js";
import Resume from "../models/Resume.js";

// Controller for enhancing a resume's professional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer. Enhance the professional summary in 1-2 ATS-friendly sentences highlighting skills, experience, and career goals. Return only the final text.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      temperature: 0.5,
    });

    const enhancedContent = response.choices[0].message.content.trim();

    return res.status(200).json({
      enhancedContent,
    });
  } catch (error) {
    console.error("Professional Summary Error:", error);

    return res.status(500).json({
      message: "Failed to enhance professional summary",
    });
  }
};

// Controller for enhancing job description
// POST: /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume writer. Improve the job description in 1-2 ATS-friendly sentences using strong action verbs and measurable achievements. Return only the final text.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      temperature: 0.5,
    });

    const enhancedContent = response.choices[0].message.content.trim();

    return res.status(200).json({
      enhancedContent,
    });
  } catch (error) {
    console.error("Job Description Error:", error);

    return res.status(500).json({
      message: "Failed to enhance job description",
    });
  }
};

// Controller for uploading and parsing resume
// POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.userId;

    if (!resumeText) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const userPrompt = `
Extract structured information from the following resume.

Resume Content:
${resumeText}

Return ONLY valid JSON in this exact format:

{
  "professional_summary": "",
  "skills": [],
  "personal_info": {
    "image": "",
    "full_name": "",
    "profession": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": ""
  },
  "experience": [
    {
      "company": "",
      "position": "",
      "start_date": "",
      "end_date": "",
      "description": "",
      "is_current": false
    }
  ],
  "project": [
    {
      "name": "",
      "type": "",
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "graduation_date": "",
      "gpa": ""
    }
  ]
}
`;

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI resume parser. Always return clean valid JSON only without markdown.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.2,
    });

    const extractedData = response.choices[0].message.content
      .replace(/```json|```/gi, "")
      .trim();

    let parsedData;

    try {
      parsedData = JSON.parse(extractedData);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);

      return res.status(500).json({
        message: "Invalid AI response format",
      });
    }

    // Save resume to database
    const newResume = await Resume.create({
      userId,
      title,
      ...parsedData,
    });

    return res.status(200).json({
      success: true,
      resumeId: newResume._id,
    });
  } catch (error) {
    console.error("Upload Resume Error:", error);

    return res.status(500).json({
      message: "Failed to upload and parse resume",
    });
  }
};