"use client";
import { useState } from "react";
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO 
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function CalendarView({ companies, onAddEvent, onEditEvent }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (day) => {
    return companies.filter(c => {
      if (!c.nextActionDate) return false;
      return isSameDay(parseISO(c.nextActionDate), day);
    }).sort((a, b) => a.nextActionDate.localeCompare(b.nextActionDate));
  };

  const getEventColor = (type = "") => {
    if (type.includes("面接")) return "bg-red-100 text-red-700 border-red-200";
    if (type.includes("締切") || type.includes("ES")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (type.includes("説明会") || type.includes("セミナー")) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[700px]">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
        <h2 className="text-xl font-bold text-gray-800">
          {format(currentDate, "yyyy年 M月", { locale: ja })}
        </h2>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition text-gray-600 cursor-pointer"><ChevronLeft size={18} /></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 text-xs font-bold text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition cursor-pointer">今日</button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition text-gray-600 cursor-pointer"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-100 bg-[#FAFAFA]">
        {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
          <div key={d} className={`text-[11px] font-bold text-center py-2 uppercase tracking-wide ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-gray-100 gap-px">
        {calendarDays.map((day) => {
          const events = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());

          return (
            <div 
              key={day.toString()} 
              onClick={() => onAddEvent(day)}
              // ↓ ここに cursor-pointer を追加！これでマス全体が指マークになります
              className={`bg-white relative p-1 transition-colors hover:bg-gray-50 cursor-pointer group flex flex-col ${
                !isCurrentMonth ? "bg-gray-50/30" : ""
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday ? "bg-indigo-600 text-white shadow-md" : 
                  !isCurrentMonth ? "text-gray-300" : "text-gray-700"
                }`}>
                  {format(day, "d")}
                </span>
                <button className="text-gray-300 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-all p-1 cursor-pointer">
                  <Plus size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar px-1 pb-1">
                {events.map(event => (
                  <div 
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); onEditEvent(event); }}
                    // ↓ ここにも cursor-pointer を念押しで追加
                    className={`text-[10px] px-2 py-1 rounded-md border truncate font-medium shadow-sm hover:scale-[1.02] transition-transform cursor-pointer ${getEventColor(event.nextActionType)}`}
                  >
                    <span className="font-bold mr-1">{event.nextActionType || "予定"}</span>
                    <span className="opacity-75 text-[9px]">{event.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}