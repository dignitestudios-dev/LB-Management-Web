import { ChevronRight } from "lucide-react";


export default function InfoCard({ title, value }) {
  return (
    <div className="w-60 rounded-lg border border-primary/20 bg-primary/10 p-4 shadow-sm">
      {/* Top small line */}
      <div className="mb-1 h-[2px] w-6 bg-primary"></div>

      {/* Title and Icon */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-primary">{title}</h3>
        <ChevronRight size={16} className="text-gray-500" />
      </div>

      {/* Value */}
      <div className="mt-1 text-lg font-medium text-slate-700">{value}</div>
    </div>
  );
}
