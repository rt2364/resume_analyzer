import React, { useState, useEffect } from 'react';
import API from './api';
import { History, LogOut, Sparkles, UploadCloud, FileText, ArrowRight, Loader2, RefreshCw, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import Auth from './Auth';
import HistoryDrawer from './HistoryDrawer';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    if (savedUser && token) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setResult(null);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError('');
    } else {
      setError('Please select a valid PDF file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload your resume in PDF format.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await API.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Server error.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <Auth onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: '0.95rem' }}>
          Welcome, <strong>{currentUser.name}</strong>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={() => setIsHistoryOpen(true)} 
            className="reset-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <History size={16} /> Past Scans
          </button>
          <button 
            onClick={handleLogout} 
            className="reset-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* History Slide-out Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectHistory={(pastScan) => setResult(pastScan)}
      />

      <header className="header">
        <div className="badge">
          <Sparkles size={16} /> Powered by Google Gemini
        </div>
        <h1>AI Resume & ATS Evaluator</h1>
        <p>Upload your PDF resume and target job role to get instant match scores and actionable fixes.</p>
      </header>

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {!result ? (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="upload-zone">
            <input 
              type="file" 
              accept=".pdf" 
              id="resume-upload" 
              onChange={handleFileChange}
              className="file-input" 
            />
            <label htmlFor="resume-upload" className="upload-label">
              <UploadCloud size={44} className="icon-cloud" />
              {file ? (
                <div className="file-ready">
                  <FileText size={18} />
                  <span>{file.name}</span>
                </div>
              ) : (
                <>
                  <p className="upload-title">Click or Drag & Drop your PDF resume here</p>
                  <span className="upload-sub">Supports single PDF files (max 5MB)</span>
                </>
              )}
            </label>
          </div>

          <div className="input-group">
            <label htmlFor="jd">Target Job Title or Job Description</label>
            <textarea
              id="jd"
              rows={4}
              placeholder="e.g. MERN Stack Developer with React, Node.js, Express, MongoDB..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} /> Analyzing Resume...
              </>
            ) : (
              <>
                Analyze Resume <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="dashboard">
          <div className="dashboard-actions">
            <button onClick={() => setResult(null)} className="reset-btn">
              <RefreshCw size={16} /> Analyze Another Resume
            </button>
          </div>

          <div className="metrics-grid">
            <div className="score-card">
              <h3>Overall ATS Score</h3>
              <div className="score-number">{result.overallScore}/100</div>
              <p>Baseline algorithmic screening score</p>
            </div>
            <div className="score-card">
              <h3>Job Match Rate</h3>
              <div className="score-number">{result.matchPercentage}%</div>
              <p>Relevance to your target job profile</p>
            </div>
          </div>

          <div className="section-card keywords-card">
            <h3><Tag size={20} /> Missing Keywords</h3>
            <div className="keyword-tags">
              {result.missingKeywords?.map((kw, idx) => (
                <span key={idx} className="tag">{kw}</span>
              ))}
            </div>
          </div>

          <div className="analysis-grid">
            <div className="section-card">
              <h3 className="text-success"><CheckCircle2 size={20} /> Key Strengths</h3>
              <ul>
                {result.strengths?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="section-card">
              <h3 className="text-warning"><AlertCircle size={20} /> Areas to Improve</h3>
              <ul>
                {result.weaknesses?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="section-card">
            <h3><Sparkles size={20} /> Actionable Recommendations</h3>
            <ul className="action-list">
              {result.actionableFeedback?.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}