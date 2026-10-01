import { useState, useEffect, useCallback } from 'react';

export default function useCtf() {
  const [challenges, setChallenges] = useState([]);
  const [solved, setSolved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pwn-shop-solved') || '[]');
    } catch {
      return [];
    }
  });
  const [hints, setHints] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pwn-shop-hints') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    fetch('/api/ctf/challenges')
      .then(r => r.json())
      .then(data => setChallenges(data.challenges));
  }, []);

  useEffect(() => {
    localStorage.setItem('pwn-shop-solved', JSON.stringify(solved));
  }, [solved]);

  useEffect(() => {
    localStorage.setItem('pwn-shop-hints', JSON.stringify(hints));
  }, [hints]);

  const submitFlag = useCallback(async (flag) => {
    const res = await fetch('/api/ctf/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag }),
    });
    const data = await res.json();

    if (data.correct && !solved.includes(data.challenge_key)) {
      setSolved(prev => [...prev, data.challenge_key]);
    }

    return data;
  }, [solved]);

  const getHint = useCallback(async (challengeKey, level) => {
    const cacheKey = `${challengeKey}-${level}`;
    if (hints[cacheKey]) return hints[cacheKey];

    const res = await fetch(`/api/ctf/hint/${challengeKey}/${level}`);
    const data = await res.json();

    setHints(prev => {
      const next = { ...prev, [cacheKey]: data };
      return next;
    });

    return data;
  }, [hints]);

  const resetProgress = useCallback(() => {
    setSolved([]);
    setHints({});
    localStorage.removeItem('pwn-shop-solved');
    localStorage.removeItem('pwn-shop-hints');
  }, []);

  return {
    challenges,
    solved,
    hints,
    submitFlag,
    getHint,
    resetProgress,
    progress: { current: solved.length, total: challenges.length || 4 },
  };
}
