import React from "react";
import { ParameterFieldProps } from "../../interfaces/template-form.interface";

const ParameterField: React.FC<ParameterFieldProps> = ({
  paramName,
  paramValue,
  onChange,
  inputType = "text",
  label,
  options,
  className = "",
}) => {
  const displayName =
    label ||
    paramName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const fieldId = `param-${paramName}`;

  // Handle different input types
  const renderInput = () => {
    if (options && options.length > 0) {
      return (
        <select
          id={fieldId}
          name={paramName}
          value={paramValue || ""}
          onChange={onChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (inputType === "textarea") {
      return (
        <textarea
          id={fieldId}
          name={paramName}
          value={paramValue || ""}
          onChange={onChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      );
    }

    return (
      <input
        type={inputType}
        id={fieldId}
        name={paramName}
        checked={inputType === "checkbox" ? paramValue : undefined}
        value={inputType !== "checkbox" ? paramValue || "" : undefined}
        onChange={onChange}
        className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
          inputType === "number" ? "w-32" : ""
        }`}
      />
    );
  };

  return (
    <div className={className}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {displayName}
      </label>
      <div className="mt-1">{renderInput()}</div>
    </div>
  );
};

export default ParameterField;
