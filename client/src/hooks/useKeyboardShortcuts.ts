import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.target instanceof HTMLSelectElement) return;

      switch (e.key) {
        case 'p':
        case 'P':
          if (!e.metaKey && !e.ctrlKey) navigate('/projects');
          break;
        case 'd':
        case 'D':
          if (!e.metaKey && !e.ctrlKey) navigate('/dashboard');
          break;
        case 't':
        case 'T':
          if (!e.metaKey && !e.ctrlKey) navigate('/team');
          break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navigate]);
}