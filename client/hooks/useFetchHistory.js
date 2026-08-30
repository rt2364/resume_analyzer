import { useEffect, useState } from 'react';
import API from './api';

export function useResumeHistory() {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await API.get('/history');

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