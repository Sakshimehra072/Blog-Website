'use client';

import { useState, useEffect } from 'react';
import { fetchBlogs } from '../services/apiService';

export function useBlog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchBlogs();
      if (data && data.success) {
        setBlogs(data.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return { blogs, loading };
}
