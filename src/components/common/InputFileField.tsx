import React from 'react';
import Image from 'next/image';

interface InputFileFieldProps {
  label: string;
  id: string;
  accept: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  preview?: string | null;
  previewAlt?: string;
}

const InputFileField: React.FC<InputFileFieldProps> = ({
  label,
  id,
  accept,
  onChange,
  preview,
  previewAlt,
}) => {
  return (
    <div className="w-full p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="file"
        id={id}
        accept={accept}
        onChange={onChange}
        className="mt-1 block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-indigo-50 file:text-indigo-700
          hover:file:bg-indigo-100"
      />
      {preview && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">미리보기:</p>
          <Image src={preview} alt={previewAlt || "Preview"} width={500} height={300} className="max-w-full h-auto rounded-md shadow-md object-contain" />
        </div>
      )}
    </div>
  );
};

export default InputFileField;
