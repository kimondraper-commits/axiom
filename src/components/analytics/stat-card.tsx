interface StatCardProps {
  label: string;
  value: number | string;
  highlight?: boolean;
  alert?: boolean;
}

export function StatCard({ label, value, highlight, alert }: StatCardProps) {
  return (
    <div
      className={`rounded-lg border p-5 ${
        alert
          ? "bg-red-50 border-red-200"
          : highlight
          ? "bg-blue-50 border-blue-200"
          : "bg-white border-slate-200"
      }`}
    >
      <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${
        alert ? "text-red-500" : highlight ? "text-blue-600" : "text-slate-500"
      }`}>
        {label}
      </p>
      <p className={`text-3xl font-semibold ${
        alert ? "text-red-700" : highlight ? "text-blue-700" : "text-slate-900"
      }`}>
        {value}
      </p>
    </div>
  );
}
