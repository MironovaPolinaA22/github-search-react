import React from 'react';

function RepoItem({ repo }) {
  return (
    <div className="repo" style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
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
  );
}

export default RepoItem;