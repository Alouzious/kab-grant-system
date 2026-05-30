import Card from './Card';

export default function StatCard({ title, value, subtitle, icon }) {
  return (
    <Card className="text-center">
      {icon && <div className="text-4xl mb-2">{icon}</div>}
      <div className="text-3xl font-bold text-primary mb-1">{value}</div>
      <p className="text-sm font-medium text-textMain">{title}</p>
      {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
    </Card>
  );
}
