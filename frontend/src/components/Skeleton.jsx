export default function Skeleton({ className = '', lines = 1, height = 'h-4', widths }) {
  const defaultWidths = ['w-full', 'w-3/4', 'w-5/6', 'w-2/3', 'w-4/5'];

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${height} ${widths ? widths[i % widths.length] : defaultWidths[i % defaultWidths.length]} rounded-lg`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-[#1A1A24] rounded-[14px] border border-[#2A2A3A] p-6 space-y-4 ${className}`}>
      <div className="skeleton h-5 w-1/3 rounded-lg" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-4 w-5/6 rounded-lg" />
        <div className="skeleton h-4 w-2/3 rounded-lg" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="skeleton h-7 w-20 rounded-full" />
        <div className="skeleton h-7 w-16 rounded-full" />
        <div className="skeleton h-7 w-24 rounded-full" />
      </div>
    </div>
  );
}
