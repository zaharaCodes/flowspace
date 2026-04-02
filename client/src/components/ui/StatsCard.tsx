interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'indigo';
  icon?: React.ReactNode;
}

const colorMap = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700',   icon: 'bg-blue-100 text-blue-600' },
  green:  { bg: 'bg-green-50',  border: 'border-green-100',  text: 'text-green-700',  icon: 'bg-green-100 text-green-600' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', icon: 'bg-orange-100 text-orange-600' },
  red:    { bg: 'bg-red-50',    border: 'border-red-100',    text: 'text-red-700',    icon: 'bg-red-100 text-red-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', icon: 'bg-purple-100 text-purple-600' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', icon: 'bg-indigo-100 text-indigo-600' },
};

export default function StatsCard({ title, value, subtitle, color = 'blue', icon }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border p-5 ${c.bg} ${c.border} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${c.text} opacity-70`}>{title}</p>
          <p className={`text-3xl font-bold mt-1.5 ${c.text}`}>{value}</p>
          {subtitle && <p className={`text-xs mt-1 ${c.text} opacity-60`}>{subtitle}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}