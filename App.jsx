import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

function App() {
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debouncedUsername, setDebouncedUsername] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const token = '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';

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedUsername(username);
      setPage(1);
      setRepos([]);
      setHasMore(true);
      setError('');
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [username]);

  useEffect(() => {
    if (!debouncedUsername || !hasMore) return;

    const fetchRepos = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `https://api.github.com/users/${debouncedUsername}/repos?per_page=20&page=${page}`,
          {
            headers: {
              Authorization: `token ${token}`, // добавляем авторизацию
            },
          }
        );

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Пользователь не найден');
          } else if (res.status === 403) {
            throw new Error('Достигнут лимит запросов или требуются дополнительные разрешения');
          } else {
            throw new Error(`Ошибка: ${res.status} ${res.statusText}`);
          }
        }
        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error('Некорректные данные от API');
        }

        if (page === 1) {
          setRepos(data);
        } else {
          setRepos((prev) => [...prev, ...data]);
        }

        if (data.length < 20) {
          setHasMore(false);
        }

        if (data.length === 0 && page === 1) {
          setError('Нет репозиториев или пользователь не найден.');
        }
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        setError(err.message);
        setHasMore(false);
        setRepos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [debouncedUsername, page, hasMore]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (!loading && debouncedUsername && hasMore) {
        setPage((prev) => prev + 1);
      }
    }
  }, [loading, debouncedUsername, hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="container">
      <h1>Поиск репозиториев на GitHub</h1>
      <input
        className="input"
        type="text"
        placeholder="Введите имя пользователя"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {error && <div className="error">{error}</div>}

      <div style={{ marginTop: 20 }}>
        {repos.map((repo) => (
          <div key={repo.id} className="repo" style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <h2>{repo.name}</h2>
            <p>{repo.description || 'Нет описания'}</p>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Перейти к репозиторию
            </a>
            <div style={{ marginTop: 10 }}>
              <strong>Звёзды:</strong> {repo.stargazers_count}
            </div>
            <div>
              <strong>Последнее обновление:</strong> {new Date(repo.updated_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {loading && <div className="loading">Загрузка...</div>}

      {!hasMore && repos.length > 0 && (
        <div style={{ textAlign: 'center', margin: '20px 0', color: '#555' }}>
          Больше репозиториев не найдено!
        </div>
      )}
    </div>
  );
}

export default App;