import React from 'react';

interface GenreFilterProps {
  availableGenres: string[];
  selectedGenres: string[];
  onGenreChange: (genres: string[]) => void;
}

export const GenreFilter: React.FC<GenreFilterProps> = ({
  availableGenres,
  selectedGenres,
  onGenreChange
}) => {
  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onGenreChange(selectedGenres.filter(g => g !== genre));
    } else {
      onGenreChange([...selectedGenres, genre]);
    }
  };

  const selectAll = () => {
    onGenreChange(availableGenres);
  };

  const clearAll = () => {
    onGenreChange([]);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Genret ({selectedGenres.length}/{availableGenres.length})
        </h3>
        <div className="space-x-2">
          <button
            onClick={selectAll}
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
          >
            Valitse kaikki
          </button>
          <button
            onClick={clearAll}
            className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
          >
            Tyhjennä
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {availableGenres.map(genre => (
            <label
              key={genre}
              className={`
                flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors
                ${selectedGenres.includes(genre) 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : 'bg-gray-700 hover:bg-gray-600'
                }
              `}
            >
              <input
                type="checkbox"
                checked={selectedGenres.includes(genre)}
                onChange={() => handleGenreToggle(genre)}
                className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
              />
              <span className="text-sm text-white capitalize">
                {genre}
              </span>
            </label>
          ))}
        </div>
      </div>

      {availableGenres.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          Ei genrejä löytynyt
        </div>
      )}
    </div>
  );
};