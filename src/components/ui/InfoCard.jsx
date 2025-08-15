import { ChevronRight } from "lucide-react";


export default function InfoCard({ title, value }) {
  return (
    <div className="bg-red-50 rounded-lg p-4 w-60 shadow-sm">
      {/* Top small line */}
      <div className="w-6 h-[2px] bg-red-800 mb-1"></div>

      {/* Title and Icon */}
      <div className="flex justify-between items-center">
        <h3 className="text-black font-semibold">{title}</h3>
        <ChevronRight size={16} className="text-gray-500" />
      </div>

      {/* Value */}
      <div className="text-gray-500 mt-1 text-lg">{value}</div>
    </div>
  );
}
