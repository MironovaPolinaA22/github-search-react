import React from 'react';
import RepoItem from './RepoItem';

function RepoList({ repos }) {
  return (
    <div>
      {repos.map((repo) => (
        <RepoItem key={repo.id} repo={repo} />
      ))}
    </div>
  );
}

export default RepoList;