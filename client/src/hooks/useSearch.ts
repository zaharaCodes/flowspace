import { useState, useMemo } from 'react';

export function useSearch<T>(items: T[], keys: (keyof T | string)[]) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) =>
      keys.some((key) => {
        const val = key.toString().split('.').reduce((obj: any, k) => obj?.[k], item);
        return String(val || '').toLowerCase().includes(q);
      })
    );
  }, [items, query, keys]);

  return { query, setQuery, filtered };
}