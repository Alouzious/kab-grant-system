export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <input
        className={`form-input ${error ? 'border-danger focus:ring-danger focus:border-danger' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
