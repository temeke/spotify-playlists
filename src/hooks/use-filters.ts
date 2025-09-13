import { useCallback, useMemo } from 'react';
import { useAppStore } from '../stores/app-store';
import type { FilterOptions, EnhancedTrack } from '../types';

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
  const {
    filterTracks,
    filterOptions,
    setFilterOptions: setStoreFilterOptions,
    updateFilterOption,
    clearFilterOptions
  } = useAppStore();

  const setFilterOptions = useCallback((options: Partial<FilterOptions>) => {
    setStoreFilterOptions(options);
  }, [setStoreFilterOptions]);

  const updateFilter = useCallback(<K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    updateFilterOption(key, value);
  }, [updateFilterOption]);

  const clearFilters = useCallback(() => {
    clearFilterOptions();
  }, [clearFilterOptions]);

  // Note: Could implement debounced filtering for better performance if needed

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