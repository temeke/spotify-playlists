export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fi-FI').format(num);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generatePlaylistName = (filters: any): string => {
  const parts: string[] = [];
  
  if (filters.genres && filters.genres.length > 0) {
    if (filters.genres.length === 1) {
      parts.push(capitalizeFirst(filters.genres[0]));
    } else if (filters.genres.length <= 3) {
      parts.push(filters.genres.map(capitalizeFirst).join(' & '));
    } else {
      parts.push(`${filters.genres.length} genreä`);
    }
  }

  if (filters.tempoRange) {
    const [min, max] = filters.tempoRange;
    if (min > 60 && max < 200) {
      parts.push(`${min}-${max} BPM`);
    }
  }

  if (filters.energyRange) {
    const [min, max] = filters.energyRange;
    if (min > 0 || max < 1) {
      parts.push(`Energy ${formatPercentage(min)}-${formatPercentage(max)}`);
    }
  }

  const baseName = parts.length > 0 ? parts.join(' - ') : 'Mukautettu soittolista';
  const timestamp = new Date().toLocaleDateString('fi-FI');
  
  return `${baseName} (${timestamp})`;
};

export const generatePlaylistDescription = (filters: any, trackCount: number): string => {
  const parts: string[] = [
    `Automaattisesti luotu soittolista ${trackCount} kappaleella.`
  ];

  if (filters.genres && filters.genres.length > 0) {
    parts.push(`Genret: ${filters.genres.map(capitalizeFirst).join(', ')}.`);
  }

  if (filters.tempoRange) {
    const [min, max] = filters.tempoRange;
    parts.push(`Tempo: ${min}-${max} BPM.`);
  }

  const filterCount = Object.keys(filters).filter(key => 
    filters[key] !== undefined && filters[key] !== null
  ).length;

  if (filterCount > 0) {
    parts.push(`Luotu ${filterCount} suodattimella.`);
  }

  parts.push('Generoitu Spotify Playlist Generator -sovelluksella.');

  return parts.join(' ');
};

export const keyToString = (key: number): string => {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return keys[key] || 'Unknown';
};

export const modeToString = (mode: number): string => {
  return mode === 1 ? 'Major' : 'Minor';
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T, 
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => void>(
  func: T, 
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const removeDuplicateTracks = (tracks: any[]): any[] => {
  const seen = new Set();
  return tracks.filter(track => {
    const key = `${track.name}-${track.artists[0]?.name}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const downloadAsJson = (data: any, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};