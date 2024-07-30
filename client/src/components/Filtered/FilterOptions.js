import React from "react";

const FilterOptions = ({ options, sectionId }) => (
  <div className="space-y-6">
    {options.map((option, optionIdx) => (
      <div key={option.value} className="flex items-center">
        <input
          defaultValue={option.value}
          defaultChecked={option.checked}
          id={`filter-${sectionId}-${optionIdx}`}
          name={`${sectionId}[]`}
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor={`filter-${sectionId}-${optionIdx}`} className="ml-3 min-w-0 flex-2 text-gray-500 text-sm lg:text-base">
          {option.label}
        </label>
      </div>
    ))}
  </div>
);

export default FilterOptions;
