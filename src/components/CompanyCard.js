"use client";
import { motion } from "framer-motion";
import { Clock, ExternalLink, Trash2, Star, MapPin, Building2, MoreHorizontal } from "lucide-react";

export default function CompanyCard({ company, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    if (status.includes("内定")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
    if (status.includes("面接")) return "bg-orange-100 text-orange-700 border-orange-200";
    if (status.includes("お見送り")) return "bg-gray-100 text-gray-500 border-gray-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, shadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
      onClick={onEdit}
      // ↓ ここに cursor-pointer があるか確認！
      className="group bg-white rounded-2xl p-5 border border-gray-200 shadow-sm cursor-pointer relative overflow-hidden transition-all duration-300"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110" />

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
            {company.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            {company.industry && <span className="flex items-center gap-1"><Building2 size={10} /> {company.industry}</span>}
            {company.conditions?.location && <span className="flex items-center gap-1"><MapPin size={10} /> {company.conditions.location}</span>}
          </div>
        </div>
        <div className="flex gap-0.5">
          {[...Array(company.priority || 0)].map((_, i) => (
            <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getStatusColor(company.status)}`}>
          {company.status}
        </span>
        {company.nextActionDate && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1 font-medium">
            <Clock size={12} /> 
            {new Date(company.nextActionDate).toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}{" "}
            {company.nextActionType}
          </span>
        )}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-50 relative z-10">
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {company.urls?.mypage && (
            <a href={company.urls.mypage} target="_blank" className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 flex items-center gap-1 transition-colors cursor-pointer">
              <ExternalLink size={12} /> MyPage
            </a>
          )}
        </div>
        
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <button 
                onClick={(e) => onDelete(company.id, e)}
                // ↓ ボタンにも cursor-pointer を明示的につける
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                title="削除"
            >
                <Trash2 size={16} />
            </button>
        </div>
      </div>
    </motion.div>
  );
}