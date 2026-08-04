import express from 'express';
import { requireAuth } from '../middleware/auth';
import Groq from 'groq-sdk';

const router = express.Router();

const SYSTEM_PROMPT = `
You are an expert form builder AI. Your goal is to generate JSON arrays representing form fields based on the user's prompt.
You must ONLY output valid JSON. Do not include markdown blocks, explanations, or any other text.
The JSON must be an object with two keys: "title" (string, a good title for the form) and "fields" (an array of objects).

Each field object MUST have these properties:
- "id": a unique string (e.g., "name_field", "q1", etc)
- "type": MUST be one of: "text", "email", "number", "textarea", "select", "radio", "checkbox", "date", "file", "rating", "pageBreak"
- "label": the question or label for the field (string). For "pageBreak" type, this represents the title of the next section/page (e.g. "Payment Information", "Preferences").
- "required": boolean (always false for "pageBreak")
- "options": (ONLY for "select", "radio", or "checkbox" types) an array of string options.
- rating type represents a 1-5 star rating scale.
- pageBreak type represents a visual division between steps/pages in a multi-page form. Use it to separate large collections of fields (more than 4-5 fields) into logical step pages.

Example Prompt: "A quick feedback form for a restaurant"
Example Output:
{
  "title": "Restaurant Feedback Survey",
  "fields": [
    {
      "id": "f_name",
      "type": "text",
      "label": "What is your name?",
      "required": true
    },
    {
      "id": "break_1",
      "type": "pageBreak",
      "label": "Meal Rating",
      "required": false
    },
    {
      "id": "f_rating",
      "type": "radio",
      "label": "How would you rate your meal?",
      "required": true,
      "options": ["Excellent", "Good", "Average", "Poor"]
    },
    {
      "id": "f_comments",
      "type": "textarea",
      "label": "Any additional comments?",
      "required": false
    }
  ]
}
`;

router.post('/generate', requireAuth, async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No content received from AI");

    const parsed = JSON.parse(content);
    res.json(parsed);
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ message: 'Failed to generate form' });
  }
});

router.post('/summarize', requireAuth, async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { formTitle, fields, responses } = req.body;
    if (!responses || !fields) return res.status(400).json({ message: 'Fields and responses are required' });

    const summaryPrompt = `
    You are an expert data analyst AI. Summarize the following form submission responses.
    Form Title: ${formTitle}
    Form Fields: ${JSON.stringify(fields.map((f: any) => ({ id: f.id, label: f.label, type: f.type })))}
    Responses Data: ${JSON.stringify(responses.map((r: any) => r.answers))}

    Provide a professional, bulleted summary highlighting key insights, trends, distribution of ratings/selections if any, and actionable recommendations.
    Output format should be clean markdown. Keep it concise but insightful.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'user', content: summaryPrompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
    });

    const summary = completion.choices[0]?.message?.content || "No summary generated.";
    res.json({ summary });
  } catch (error) {
    console.error("AI Summary Error:", error);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
});

export default router;
