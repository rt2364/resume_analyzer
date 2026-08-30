import { useEffect, useState } from 'react';
import axios from 'axios';

export function useResumeHistory() {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/history');
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error('Could not load history', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return { history, refreshHistory: fetchHistory };
}