import React from 'react';

function SearchInput({ value, onChange }) {
  return (
    <input
      className="input"
      type="text"
      placeholder="Введите имя пользователя"
      value={value}
      onChange={onChange}
    />
  );
}

export default SearchInput;