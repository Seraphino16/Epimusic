import React, { useState } from 'react';

const RangeSlider = ({ min, max, step, onChange, onReset }) => {
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);

  const handleMinChange = (event) => {
    const value = Number(event.target.value);
    if (value <= maxValue - step) {
      setMinValue(value);
      onChange([value, maxValue]);
    }
  };

  const handleMaxChange = (event) => {
    const value = Number(event.target.value);
    if (value >= minValue + step) {
      setMaxValue(value);
      onChange([minValue, value]);
    }
  };

  const handleReset = (event) => {
    event.preventDefault();
    setMinValue(min);
    setMaxValue(max);
    onReset();
    onChange([min, max]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Selected range: ${minValue} - ${maxValue}`);
  };

  return (
    <div className="range-slider p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
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
      <div className="relative pt-2 mb-8">
        <div className="relative w-full h-2 bg-gray-300 rounded">
          <div
            className="absolute h-2 bg-blue-600 rounded "
            style={{
              left: `${((minValue - min) / (max - min)) * 100}%`,
              width: `${((maxValue - minValue) / (max - min)) * 100}%`,
            }}
          ></div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          className="absolute w-full appearance-none pointer-events-auto h-2 bg-transparent"
          style={{ zIndex: 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          className="absolute w-full appearance-none pointer-events-auto h-2 bg-transparent"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="flex justify-between">
        <button
          onClick={handleReset}
          className="bg-blue-600 text-white hover:underline px-2 py-2 rounded"
        >
          Réinitialiser
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-2 py-2 rounded"
        >
          Valider
        </button>
      </div>
    </div>
  );
};

export default RangeSlider;
