import React from 'react';

interface RangeSliderProps {
  label: string;
  value: [number, number];
  min: number;
  max: number;
  step?: number;
  onChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
  unit?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  unit = ''
}) => {
  const handleMinChange = (newMin: number) => {
    onChange([Math.min(newMin, value[1]), value[1]]);
  };

  const handleMaxChange = (newMax: number) => {
    onChange([value[0], Math.max(newMax, value[0])]);
  };

  const formatDisplay = (val: number) => {
    if (formatValue) return formatValue(val);
    return `${val}${unit}`;
  };

  const percentage = (val: number) => ((val - min) / (max - min)) * 100;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{label}</h3>
        <div className="text-green-400 font-mono text-sm">
          {formatDisplay(value[0])} - {formatDisplay(value[1])}
        </div>
      </div>

      <div className="space-y-4">
        {/* Visual range display */}
        <div className="relative h-2 bg-gray-700 rounded">
          <div
            className="absolute h-2 bg-green-500 rounded"
            style={{
              left: `${percentage(value[0])}%`,
              width: `${percentage(value[1]) - percentage(value[0])}%`
            }}
          />
        </div>

        {/* Min slider */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Minimi: {formatDisplay(value[0])}
          </label>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[0]}
            onChange={(e) => handleMinChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Max slider */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Maksimi: {formatDisplay(value[1])}
          </label>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[1]}
            onChange={(e) => handleMaxChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Quick preset buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChange([min, max])}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
          >
            Kaikki
          </button>
          {label === 'Tempo' && (
            <>
              <button
                onClick={() => onChange([60, 90])}
                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              >
                Hidas
              </button>
              <button
                onClick={() => onChange([90, 120])}
                className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                Keskitaso
              </button>
              <button
                onClick={() => onChange([120, 200])}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Nopea
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10B981;
          cursor: pointer;
          border: 2px solid #000;
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10B981;
          cursor: pointer;
          border: 2px solid #000;
        }
      `}</style>
    </div>
  );
};