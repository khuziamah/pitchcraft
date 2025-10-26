// api/generate-pitch.js

// Sirf server-side mein istemal hone waali library
const { GoogleGenerativeAI } = require('@google/generative-ai');

// API key ko Vercel Environment Variables se lenge
const API_KEY = process.env.VITE_GEMINI_API_KEY; // Ya aap jo bhi naam rakhna chahein (e.g., GEMINI_API_KEY)

// Agar API_KEY nahi hai to error dein (deploy time par check ho jayega)
if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY environment variable is not set.");
  // Production mein agar ye nahi mila to function ko fail kar sakte hain
  // Ya development ke liye ek dummy key use kar sakte hain
}

const genAI = new GoogleGenerativeAI(API_KEY);

export default async function handler(req, res) {
  // Sirf POST requests ko allow karein
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Request body se idea aur tone nikalein
  const { idea, tone } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Idea is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Apne model ka naam yahan likhein
    const prompt = `Generate a startup pitch as a JSON object with keys "name", "tagline", "pitch", "problem", "solution". Base it on this idea: "${idea}" and use a ${tone} tone.`;

    const result = await model.generateContent(prompt);
    const text = (await result.response.text()).replace(/```json/g, '').replace(/```/g, '').trim();

    // Browser ke liye JSON string ko bhej rahe hain
    res.status(200).json({ text });
  } catch (error) {
    console.error('Error generating pitch in serverless function:', error);
    res.status(500).json({ error: 'Failed to generate pitch. Please check server logs.' });
  }
}