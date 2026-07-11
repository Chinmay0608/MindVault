import { useState, useEffect, useCallback } from 'react';
import * as journalApi from '../api/journalApi';

export default function useJournalEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await journalApi.getAll();
      setEntries(Array.isArray(data) ? data : (data?.content || []));
    } catch (err) {
      // 404 is technically handled now, returning [] but catching other failures
      setError(err.response?.data?.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, loading, error, refetch: fetchEntries, setEntries };
}
