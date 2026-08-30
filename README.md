## AI-Powered Resume & ATS Evaluator
A full-stack MERN web application that analyzes PDF resumes against specific job descriptions using the **Google Gemini API**. It provides an overall ATS score, match percentage, key strengths, areas of improvement, and missing technical keywords with a modern interactive dashboard.

---

## Features
- **PDF Ingestion & Text Parsing:** In-memory PDF processing using `Multer` and `pdf-parse`.
- **AI Analysis with Google Gemini:** Structured JSON-based evaluation enforcing ATS score, match percentage, and gap analysis using `gemini-2.5-flash`.
- **JWT Authentication:** Secure user signup and login with hashed passwords via `bcryptjs` and token validation via `jsonwebtoken`.
- **Evaluation History:** Saves each analysis to `MongoDB`, viewable anytime via a slide-out History Drawer.
- **Interactive UI:** Dark-mode React dashboard with real-time feedback, visual scorecards, and keyword badges.

---

## Tech Stack
- **Frontend:** React.js (Vite), Lucide Icons, Axios, Pure CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB & Mongoose ODM
- **AI / SDK:** Google GenAI SDK (`@google/genai`)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **File Handling:** Multer, pdf-parse

---

## Project Structure

```text
resume_analyzer/
├── server.js               # Express API and routes
├── models/
│   ├── User.js             # User Schema for Auth
│   └── ResumeAnalysis.js   # Analysis history Schema
├── middleware/
│   └── auth.js             # JWT verification middleware
├── .env                    # Environment variables
├── package.json
└── client/                 # React Frontend (Vite)
    ├── src/
    │   ├── App.jsx         # Main dashboard
    │   ├── App.css
    │   ├── Auth.jsx        # Login / Register Component
    │   ├── Auth.css
    │   ├── HistoryDrawer.jsx # Slide-out past scans drawer
    │   └── HistoryDrawer.css
    └── package.json
