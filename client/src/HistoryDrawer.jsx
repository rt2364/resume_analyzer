import React, { useEffect, useState } from 'react';
import API from './api';
import { 
  X, 
  History, 
  FileText, 
  Calendar, 
  ChevronRight, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import './HistoryDrawer.css';

export default function HistoryDrawer({ isOpen, onClose, onSelectHistory }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch user history jab drawer open ho
  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/history');

      if (response.data.success) {
        setHistoryItems(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load evaluation history.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose} 
      />

      {/* Slide-out panel */}
      <aside className={`history-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title">
            <History size={20} className="icon-history" />
            <h3>Evaluation History</h3>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close History">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {loading && (
            <div className="drawer-loading">
              <Loader2 className="spinner" size={24} />
              <span>Loading past scans...</span>
            </div>
          )}

          {error && (
            <div className="drawer-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && historyItems.length === 0 && (
            <div className="drawer-empty">
              <FileText size={36} />
              <p>No previous resume scans found.</p>
            </div>
          )}

          {!loading && (
            <div className="history-list">
              {historyItems.map((item) => (
                <div
                  key={item._id}
                  className="history-card"
                  onClick={() => {
                    onSelectHistory(item);
                    onClose();
                  }}
                >
                  <div className="history-card-top">
                    <span className="file-name" title={item.fileName}>
                      <FileText size={16} />
                      {item.fileName}
                    </span>
                    <span className="score-pill">
                      {item.overallScore}/100
                    </span>
                  </div>

                  <p className="job-role-text">
                    {item.jobDescription.length > 50 
                      ? `${item.jobDescription.slice(0, 50)}...` 
                      : item.jobDescription}
                  </p>

                  <div className="history-card-bottom">
                    <span className="date-text">
                      <Calendar size={13} />
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="view-link">
                      View Report <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}