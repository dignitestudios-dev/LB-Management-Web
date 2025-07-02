// components/SearchBar.jsx
import React, { useState, useEffect } from "react";

const SearchBar = ({ onSearch, delay = 500 }) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(query);
    }, delay);

    return () => clearTimeout(handler);
  }, [query]);

  return (
    <div className="mb-4 flex justify-end">
      <input
        type="text"
        placeholder="Search..."
        className="border px-4 py-2 rounded w-64 shadow"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
