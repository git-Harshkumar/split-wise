import { forwardRef } from 'react';

export const Input = forwardRef(function Input({ label, error, id, ...props }, ref) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${inputId}-error`;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`input ${error ? 'input-error' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className="error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, id, ...props }, ref) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${inputId}-error`;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={`input ${error ? 'input-error' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        rows={4}
        {...props}
      />
      {error && (
        <p id={errorId} className="error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export const Select = forwardRef(function Select({ label, error, id, options, placeholder, ...props }, ref) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${selectId}-error`;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`input ${error ? 'input-error' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export const Checkbox = forwardRef(function Checkbox({ label, id, ...props }, ref) {
  const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        className="checkbox"
        style={{
          width: 20,
          height: 20,
          cursor: 'pointer',
          accentColor: 'var(--color-blue)',
          flexShrink: 0
        }}
        {...props}
      />
      {label && <span style={{ fontWeight: 500 }}>{label}</span>}
    </label>
  );
});

export const CheckboxGroup = ({ label, options, name, value = [], onChange, error, required }) => {
  const groupId = name || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${groupId}-error`;

  const handleChange = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <fieldset className="form-group" style={{ border: 'none', padding: 0 }}>
      {label && (
        <legend className="label" style={{ marginBottom: 12 }}>
          {label}
          {required && <span style={{ color: 'var(--color-danger)' }}> *</span>}
        </legend>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 16px' }}>
        {options.map(opt => {
          const isChecked = value.includes(opt.value);
          return (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                padding: '10px 16px',
                border: '3px solid',
                borderColor: isChecked ? 'var(--color-blue)' : 'var(--color-border)',
                borderRadius: 'var(--border-radius)',
                background: isChecked ? 'var(--color-blue-bg)' : 'var(--color-white)',
                boxShadow: isChecked ? 'var(--shadow-offset)' : 'var(--shadow-offset-sm)',
                transition: 'all var(--transition-fast)',
                fontWeight: isChecked ? 600 : 500,
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                name={name}
                value={opt.value}
                checked={isChecked}
                onChange={() => handleChange(opt.value)}
                style={{
                  width: 20,
                  height: 20,
                  cursor: 'pointer',
                  accentColor: 'var(--color-blue)'
                }}
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="error-text" role="alert" style={{ marginTop: 8 }}>
          {error}
        </p>
      )}
    </fieldset>
  );
};

export const RadioGroup = ({ label, options, name, value, onChange, error }) => {
  const groupId = name || label?.toLowerCase().replace(/\s+/g, '-');
  const errorId = `${groupId}-error`;

  return (
    <fieldset className="form-group" style={{ border: 'none', padding: 0 }}>
      {label && <legend className="label">{label}</legend>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map(opt => (
          <label
            key={opt.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              padding: '12px 16px',
              border: '3px solid var(--color-border)',
              borderRadius: 'var(--border-radius)',
              background: 'var(--color-white)',
              boxShadow: 'var(--shadow-offset-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              style={{
                width: 20,
                height: 20,
                border: '2px solid var(--color-border)',
                borderRadius: '50%',
                appearance: 'none',
                cursor: 'pointer'
              }}
            />
            <span style={{ fontWeight: 500 }}>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p id={errorId} className="error-text" role="alert">{error}</p>}
    </fieldset>
  );
};