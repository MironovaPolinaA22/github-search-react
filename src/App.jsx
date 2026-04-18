import React, { useState, useEffect } from 'react';

import SearchInput from './components/SearchInput.jsx';
import RepoList from './components/RepoList.jsx';
import ErrorMessage from './components/ErrorMessage.jsx';
import Loading from './components/Loading.jsx';
import EndMessage from './components/EndMessage.jsx';

function App() {
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const token = import.meta.env.VITE_GITHUB_TOKEN;

  const [debouncedUsername, setDebouncedUsername] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username);
      setPage(1);
      setRepos([]);
      setHasMore(true);
      setError('');
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  useEffect(() => {
    if (!debouncedUsername) return;
    const fetchRepos = async () => {
      if (loading || !hasMore) return;

      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `https://api.github.com/users/${debouncedUsername}/repos?per_page=20&page=${page}`,
          { headers: { Authorization: `token ${token}` } }
        );

        if (!res.ok) {
          if (res.status === 404) throw new Error('Пользователь не найден');
          if (res.status === 403) throw new Error('Достигнут лимит запросов');
          throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        if (!Array.isArray(data))
          throw new Error('Некорректные данные');

        if (page === 1) {
          setRepos(data);
        } else {
          setRepos(prev => [...prev, ...data]);
        }

        if (data.length < 20) {
          setHasMore(false);
        }
        if (data.length === 0 && page === 1) {
          setError('Нет репозиториев или пользователь не найден.');
        }
      } catch (err) {
        setError(err.message);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [debouncedUsername, page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        if (!loading && debouncedUsername && hasMore) {
          setPage(prev => prev + 1);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, debouncedUsername, hasMore]);

  return (
    <div className="container">
      <h1>Поиск репозиториев на GitHub</h1>
      <SearchInput value={username} onChange={(e) => setUsername(e.target.value)} />

      <ErrorMessage message={error} />

      <RepoList repos={repos} />

      {loading && <Loading />}

      {!hasMore && repos.length > 0 && <EndMessage />}
    </div>
  );
}

export default App;