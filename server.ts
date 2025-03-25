import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fallback affirmations in case AI generation fails
const fallbackAffirmations = [
  // Self-Worth & Confidence
  "I am worthy of love, respect, and happiness.",
  "I believe in myself and my abilities.",
  "I am confident in my unique talents and gifts.",
  "I deserve all the good things life has to offer.",
  "I am enough, just as I am.",
  "I trust my judgment and experience.",
  "I radiate confidence and self-respect.",
  "I am beautiful inside and out.",
  "I am worthy of my dreams and aspirations.",
  "My self-worth is not determined by others.",
  
  // Success & Achievement
  "I am capable of achieving anything I set my mind to.",
  "I work towards success with determination.",
  "I turn obstacles into opportunities for growth.",
  "I create my own success through hard work.",
  "Every day I'm getting better and better.",
  "I am creating my path to success.",
  "My potential to succeed is limitless.",
  "I celebrate my achievements, both big and small.",
  "I am committed to continuous growth and improvement.",
  "My success inspires others to succeed.",
];

// Track recent affirmations to avoid repetition
const recentAffirmations = new Set();

// Categories for generating diverse affirmations
const affirmationCategories = [
  "self-confidence",
  "success",
  "personal growth",
  "health",
  "relationships",
  "career",
  "resilience",
  "focus",
  "gratitude",
  "creativity"
];

// Generate an affirmation using OpenAI
async function generateAffirmation() {
  // Check if OpenAI API key is set
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_new_api_key_here') {
    console.log('No OpenAI API key provided. Using fallback affirmations.');
    return getRandomFallbackAffirmation();
  }

  try {
    // Pick a random category
    const randomCategory = affirmationCategories[Math.floor(Math.random() * affirmationCategories.length)];
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a positive affirmation generator. Create a single short, positive, non-religious, practical affirmation statement that's motivational and empowering."
        },
        {
          role: "user",
          content: `Generate one short positive affirmation about ${randomCategory}. The affirmation should be in first person (starting with 'I'), should be a single sentence, and should not have any religious or spiritual references. Make it practical and specific.`
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const affirmation = completion.choices[0]?.message?.content?.trim() || getRandomFallbackAffirmation();
    return affirmation;
  } catch (error) {
    console.error('Error generating affirmation:', error);
    return getRandomFallbackAffirmation();
  }
}

// Get a random affirmation from the fallback list
function getRandomFallbackAffirmation() {
  const availableAffirmations = fallbackAffirmations.filter(aff => !recentAffirmations.has(aff));
  
  // If all affirmations have been recently used, reset the tracking
  if (availableAffirmations.length === 0) {
    recentAffirmations.clear();
    return fallbackAffirmations[Math.floor(Math.random() * fallbackAffirmations.length)];
  }
  
  const randomAffirmation = availableAffirmations[Math.floor(Math.random() * availableAffirmations.length)];
  
  // Track this affirmation
  recentAffirmations.add(randomAffirmation);
  
  // Keep the recent affirmations set from growing too large
  if (recentAffirmations.size > fallbackAffirmations.length * 0.7) {
    const values = Array.from(recentAffirmations);
    recentAffirmations.delete(values[0]);
  }
  
  return randomAffirmation;
}

app.get('/api/affirmation', async (req, res) => {
  try {
    const affirmation = await generateAffirmation();
    res.json({ affirmation });
  } catch (error) {
    console.error('Error in affirmation endpoint:', error);
    const fallbackAffirmation = getRandomFallbackAffirmation();
    res.json({ affirmation: fallbackAffirmation });
  }
});

app.post('/api/send-affirmation', (req, res) => {
  res.status(503).json({ 
    success: false, 
    error: 'SMS service is not configured yet. Please set up Twilio credentials.' 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 