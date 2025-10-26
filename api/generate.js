// api/generate-pitch.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { idea, tone } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Idea is required' });
  }

  try {
    // === YAHAN BADLAV KIYA GAYA HAI ===
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // "2.5" ko "1.5" kar diya
    // ===================================

    const prompt = `Generate a startup pitch as a JSON object with keys "name", "tagline", "pitch", "problem", "solution". Base it on this idea: "${idea}" and use a ${tone} tone.`;

    const result = await model.generateContent(prompt);
    const text = (await result.response.text()).replace(/```json/g, '').replace(/```/g, '').trim();

    res.status(200).json({ text });
  } catch (error) {
    console.error('Error generating pitch in serverless function:', error);
    res.status(500).json({ error: 'Failed to generate pitch. Please check server logs.' });
  }
}