//since we set "Type": "module" in package.json, we can use ES6 module syntax that uses "import" instead of "require" 
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path from 'path'; 
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

import User from './models/User.js';
import ResumeAnalysis from './models/ResumeAnalysis.js';
import { verifyToken } from './middleware/auth.js';

dotenv.config();

const app = express();
app.use(cors());      // Enable CORS for all routes
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log(' Connected to MongoDB'))
    .catch((err) => console.error(' MongoDB connection failed:', err.message));

const upload = multer({ storage: multer.memoryStorage() }); // Store uploaded files in memory

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});


// --- AUTH ROUTES ---

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide all fields.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ name, email, password: hashedPassword });
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        return res.status(201).json({
            success: true,
            token,
            user: { id: newUser._id, name: newUser.name, email: newUser.email },
        });
    } catch (error) {
        return res.status(500).json({ error: 'Registration failed.' });
    }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Login failed.' });
  }
});

// --- PROTECTED RESUME ROUTES ---

// POST /api/analyze (Protected)
app.post('/api/analyze', verifyToken, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a PDF resume' });
        }
        const jobDescription = req.body.jobDescription || 'General Software Engineering role';

        // 1. Text Extraction from pdf
        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text;

        // 2. Structured prompt for gemini
        const prompt = ` You are an expert technical recruiter and ATS specialist. 
             Analyze the following resume against this Target Job Role/Description: "${jobDescription}".

       Resume Text: ${resumeText}
       Respond only in valid JSON format with this exact schema:
    {
        "overallScore": number (0-100),
        "matchPercentage": number (0-100),
        "strengths": ["string","string"],
        "weaknesses": ["string", "string"],
        "missingKeywords": ["string", "string"],
        "actionableFeedback": ["string", "string"]
    }`;

        // 3. Call Gemini API
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const analysis = JSON.parse(response.text);
        const savedRecord = await ResumeAnalysis.create({ // Save with the authenticated user ID
            user: req.user.userId,
            fileName: req.file.originalname,
            jobDescription,
            ...analysis,
        });

        return res.status(200).json({ success: true, data: analysis });
    } catch (error) {
        console.error('Analysing error:', error);
        return res.status(500).json({ error: 'Failed to analyze resume' });
    }
});

// GET /api/history (Protected: Returns only user's resumes)
app.get('/api/history', verifyToken, async (req, res) => {
    try {
        const userHistory = await ResumeAnalysis.find({ user: req.user.userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: userHistory });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch user history.' });
    }
});

// --- SERVE REACT FRONTEND ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
