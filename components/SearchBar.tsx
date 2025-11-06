import React, { useState, useEffect, useRef } from 'react';
import { SearchableNode } from '../App';

interface SearchBarProps {
  nodes: SearchableNode[];
  onSelect: (result: SearchableNode) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ nodes, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchableNode[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length > 1) {
      const filtered = nodes.filter(item => 
          item.node.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10); // Limit results for performance and UI
      setResults(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, nodes]);

  // Handle clicks outside of the search bar to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (result: SearchableNode) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onSelect(result);
  };

  return (
    <div ref={searchRef} className="relative w-full md:w-80 lg:w-96">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 1 && setResults(results)}
          placeholder="Search for a node..."
          className="w-full px-4 py-2 pl-10 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-colors"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {isOpen && (
        <ul className="absolute z-30 top-full mt-2 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((result) => (
            <li key={result.node.id}>
              <button
                onClick={() => handleSelect(result)}
                className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors focus:outline-none focus:bg-slate-700"
              >
                <span className="block font-semibold text-white">{result.node.title}</span>
                {result.breadcrumb && (
                  <span className="block text-xs text-slate-400 mt-1">
                    {result.breadcrumb}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
