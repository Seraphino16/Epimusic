import React, { useState } from 'react';

const RangeSlider = ({ min, max, step, onChange }) => {
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);

  const handleMinChange = (event) => {
    const value = Math.min(Number(event.target.value), maxValue - step);
    setMinValue(value);
    onChange([value, maxValue]);
  };

  const handleMaxChange = (event) => {
    const value = Math.max(Number(event.target.value), minValue + step);
    setMaxValue(value);
    onChange([minValue, value]);
  };

  return (
    <div className="range-slider">
      <div className="flex justify-between items-center">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          className="w-20 p-1 border rounded"
        />
        <span className="mx-2">-</span>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          className="w-20 p-1 border rounded"
        />
      </div>
      <div className="relative pt-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          className="absolute w-full pointer-events-none"
          style={{ zIndex: 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          className="absolute w-full pointer-events-none"
          style={{ zIndex: 4 }}
        />
        <div className="relative w-full">
          <div
            className="absolute bg-gray-300 h-2"
            style={{
              left: `${((minValue - min) / (max - min)) * 100}%`,
              right: `${100 - ((maxValue - min) / (max - min)) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
