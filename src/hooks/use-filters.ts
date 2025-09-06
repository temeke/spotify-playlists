import { useState, useCallback, useMemo } from 'react';
import { useAppStore } from '../stores/app-store';
import type { FilterOptions, EnhancedTrack } from '../types';
import { debounce } from '../utils';

export interface UseFiltersReturn {
  filterOptions: Partial<FilterOptions>;
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  updateFilter: <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => void;
  clearFilters: () => void;
  filteredTracks: EnhancedTrack[];
  filterCount: number;
  previewCount: number;
}

export const useFilters = (): UseFiltersReturn => {
  const { filterTracks } = useAppStore();
  const [filterOptions, setFilterOptionsState] = useState<Partial<FilterOptions>>({});

  const setFilterOptions = useCallback((options: Partial<FilterOptions>) => {
    setFilterOptionsState(options);
  }, []);

  const updateFilter = useCallback(<K extends keyof FilterOptions>(
    key: K, 
    value: FilterOptions[K]
  ) => {
    setFilterOptionsState(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterOptionsState({});
  }, []);

  // Debounced filter function to avoid too frequent calculations
  const debouncedFilter = useMemo(
    () => debounce((options: Partial<FilterOptions>) => {
      return filterTracks(options);
    }, 300),
    [filterTracks]
  );

  const filteredTracks = useMemo(() => {
    return filterTracks(filterOptions);
  }, [filterOptions, filterTracks]);

  const filterCount = useMemo(() => {
    return Object.keys(filterOptions).filter(key => {
      const value = filterOptions[key as keyof FilterOptions];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null;
    }).length;
  }, [filterOptions]);

  const previewCount = filteredTracks.length;

  return {
    filterOptions,
    setFilterOptions,
    updateFilter,
    clearFilters,
    filteredTracks,
    filterCount,
    previewCount,
  };
};