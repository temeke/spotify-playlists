import React from 'react';
import { useAppStore } from '../../stores/app-store';
import { useFilters } from '../../hooks/use-filters';
import { GenreFilter } from './GenreFilter';
import { RangeSlider } from './RangeSlider';
import { formatPercentage, keyToString, modeToString } from '../../utils';

export const FilterPanel: React.FC = () => {
  const { filters } = useAppStore();
  const { 
    filterOptions, 
    updateFilter, 
    clearFilters, 
    previewCount, 
    filterCount 
  } = useFilters();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Suodattimet</h2>
          <p className="text-gray-400">
            {previewCount.toLocaleString()} kappaleita ({filterCount} suodatinta aktiivisia)
          </p>
        </div>
        <button
          onClick={clearFilters}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Tyhjennä kaikki
        </button>
      </div>

      {/* Genre Filter */}
      <GenreFilter
        availableGenres={filters.availableGenres}
        selectedGenres={filterOptions.genres || []}
        onGenreChange={(genres) => updateFilter('genres', genres)}
      />

      {/* Audio Feature Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tempo */}
        <RangeSlider
          label="Tempo"
          value={filterOptions.tempoRange || filters.tempoRange}
          min={filters.tempoRange[0]}
          max={filters.tempoRange[1]}
          step={1}
          unit=" BPM"
          onChange={(value) => updateFilter('tempoRange', value)}
        />

        {/* Energy */}
        <RangeSlider
          label="Energia"
          value={filterOptions.energyRange || filters.energyRange}
          min={0}
          max={1}
          step={0.01}
          formatValue={formatPercentage}
          onChange={(value) => updateFilter('energyRange', value)}
        />

        {/* Danceability */}
        <RangeSlider
          label="Tanssittavuus"
          value={filterOptions.danceabilityRange || filters.danceabilityRange}
          min={0}
          max={1}
          step={0.01}
          formatValue={formatPercentage}
          onChange={(value) => updateFilter('danceabilityRange', value)}
        />

        {/* Valence */}
        <RangeSlider
          label="Positiivisuus"
          value={filterOptions.valenceRange || filters.valenceRange}
          min={0}
          max={1}
          step={0.01}
          formatValue={formatPercentage}
          onChange={(value) => updateFilter('valenceRange', value)}
        />

        {/* Acousticness */}
        <RangeSlider
          label="Akustisuus"
          value={filterOptions.acousticnessRange || filters.acousticnessRange}
          min={0}
          max={1}
          step={0.01}
          formatValue={formatPercentage}
          onChange={(value) => updateFilter('acousticnessRange', value)}
        />

        {/* Instrumentalness */}
        <RangeSlider
          label="Instrumentaalisuus"
          value={filterOptions.instrumentalnessRange || filters.instrumentalnessRange}
          min={0}
          max={1}
          step={0.01}
          formatValue={formatPercentage}
          onChange={(value) => updateFilter('instrumentalnessRange', value)}
        />

        {/* Popularity */}
        <RangeSlider
          label="Suosio"
          value={filterOptions.popularityRange || filters.popularityRange}
          min={filters.popularityRange[0]}
          max={filters.popularityRange[1]}
          step={1}
          onChange={(value) => updateFilter('popularityRange', value)}
        />
      </div>

      {/* Key and Mode Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keys */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Sävellaji ({(filterOptions.keys || []).length}/{filters.availableKeys.length})
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {filters.availableKeys.map(key => (
              <label
                key={key}
                className={`
                  flex items-center justify-center p-2 rounded cursor-pointer transition-colors
                  ${(filterOptions.keys || []).includes(key)
                    ? 'bg-green-500/20 border border-green-500/50'
                    : 'bg-gray-700 hover:bg-gray-600'
                  }
                `}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={(filterOptions.keys || []).includes(key)}
                  onChange={(e) => {
                    const currentKeys = filterOptions.keys || [];
                    if (e.target.checked) {
                      updateFilter('keys', [...currentKeys, key]);
                    } else {
                      updateFilter('keys', currentKeys.filter(k => k !== key));
                    }
                  }}
                />
                <span className="text-sm text-white font-mono">
                  {keyToString(key)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Modes */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Moodi ({(filterOptions.modes || []).length}/{filters.availableModes.length})
          </h3>
          <div className="space-y-2">
            {filters.availableModes.map(mode => (
              <label
                key={mode}
                className={`
                  flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors
                  ${(filterOptions.modes || []).includes(mode)
                    ? 'bg-green-500/20 border border-green-500/50'
                    : 'bg-gray-700 hover:bg-gray-600'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={(filterOptions.modes || []).includes(mode)}
                  onChange={(e) => {
                    const currentModes = filterOptions.modes || [];
                    if (e.target.checked) {
                      updateFilter('modes', [...currentModes, mode]);
                    } else {
                      updateFilter('modes', currentModes.filter(m => m !== mode));
                    }
                  }}
                  className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className="text-sm text-white">
                  {modeToString(mode)}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};