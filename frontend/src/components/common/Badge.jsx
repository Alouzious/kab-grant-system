export default function Badge({ children, variant = 'default' }) {
  const variantClasses = {
    default: 'bg-gray-200 text-gray-800',
    success: 'bg-green-100 text-success',
    warning: 'bg-yellow-100 text-warning',
    danger: 'bg-red-100 text-danger',
    info: 'bg-blue-100 text-info',
  };

  return (
    <span
      className={`inline-block rounded-full text-xs font-medium px-3 py-1 ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
