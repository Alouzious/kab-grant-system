export default function Alert({ children, variant = 'info', title }) {
  const variantClasses = {
    success: 'bg-green-50 border-l-4 border-l-success text-success',
    warning: 'bg-yellow-50 border-l-4 border-l-warning text-warning',
    danger: 'bg-red-50 border-l-4 border-l-danger text-danger',
    info: 'bg-blue-50 border-l-4 border-l-info text-info',
  };

  return (
    <div className={`rounded-md p-4 ${variantClasses[variant]}`}>
      {title && <p className="font-semibold mb-1">{title}</p>}
      <p className="text-sm">{children}</p>
    </div>
  );
}
