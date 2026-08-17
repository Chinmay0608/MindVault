import { useState, useEffect, useCallback } from 'react';
import * as journalApi from '../api/journalApi';

export default function useJournalEntries({ page = 0, size = 10, searchQuery = '', tagFilter = '' } = {}) {
  const [entries, setEntries] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (searchQuery && searchQuery.trim() !== '') {
        data = await journalApi.searchEntries({ q: searchQuery.trim(), page, size });
      } else {
        data = await journalApi.getEntries({ page, size, tag: tagFilter });
      }

      if (Array.isArray(data)) {
        setEntries(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setEntries(data?.content || []);
        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, [page, size, searchQuery, tagFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchEntries();
    }, searchQuery ? 300 : 0);

    return () => clearTimeout(handler);
  }, [fetchEntries, searchQuery]);

  return { entries, totalPages, totalElements, loading, error, refetch: fetchEntries, setEntries };
}
