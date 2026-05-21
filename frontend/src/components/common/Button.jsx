export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  const baseStyles =
    'font-medium rounded-md transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary:
      'bg-primary text-white hover:bg-primaryDark focus:ring-2 focus:ring-primary focus:ring-offset-2',
    secondary:
      'bg-secondary text-white hover:bg-secondaryDark focus:ring-2 focus:ring-secondary focus:ring-offset-2',
    accent:
      'bg-accent text-white hover:bg-accentDark focus:ring-2 focus:ring-accent focus:ring-offset-2',
    outline:
      'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-2 focus:ring-primary',
    danger:
      'bg-danger text-white hover:bg-red-700 focus:ring-2 focus:ring-danger focus:ring-offset-2',
    success:
      'bg-success text-white hover:bg-green-700 focus:ring-2 focus:ring-success focus:ring-offset-2',
  };

  return (
    <button
      className={`${baseStyles} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
