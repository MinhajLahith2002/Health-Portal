import React from 'react';

export interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

export interface PatientFormProps {
  fields: FormField[];
  values: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  buttonText?: string;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({ 
  fields, 
  values, 
  onChange, 
  onSubmit, 
  buttonText = "Save", 
  onCancel,
  isLoading = false
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {fields.map((field, idx) => (
        <div key={idx} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          
          {field.type === 'select' ? (
            <select
              name={field.name}
              value={values[field.name] || ''}
              onChange={onChange}
              required={field.required}
              className="border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="" disabled>Select {field.label}</option>
              {field.options?.map((opt, oIdx) => (
                <option key={oIdx} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input 
              type={field.type} 
              name={field.name}
              value={values[field.name] || ''}
              onChange={onChange}
              required={field.required}
              placeholder={field.placeholder}
              className="border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          )}
        </div>
      ))}
      
      <div className="flex gap-3 mt-4 pt-2">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-semibold border border-zinc-300 text-zinc-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          disabled={isLoading}
          className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : buttonText}
        </button>
      </div>
    </form>
  );
};
