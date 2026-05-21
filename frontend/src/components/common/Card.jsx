export default function Card({
  children,
  title,
  subtitle,
  className = '',
}) {
  return (
    <div className={`bg-surface rounded-lg shadow-sm border border-border p-6 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-textMain">{title}</h3>
          {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
