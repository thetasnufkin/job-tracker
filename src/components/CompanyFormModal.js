"use client";
import { useState, useEffect } from "react";
import { X, Save, Star, ExternalLink, MapPin, Banknote, Trash2 } from "lucide-react";

const STATUS_OPTIONS = [
  "気になる", "説明会/セミナー", "ES作成中", "ES提出済", 
  "Webテスト", "1次面接", "2次面接", "3次面接", 
  "最終面接", "内定", "保留", "お見送り"
];

export default function CompanyFormModal({ isOpen, onClose, onSave, onDelete, initialData }) {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDeleteClick = () => {
    if (confirm("本当にこの情報を削除しますか？\n（この操作は取り消せません）")) {
      onDelete(formData.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header: 閉じるボタンに cursor-pointer */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-gray-800">
            {formData.id ? "詳細・編集" : "新規追加"}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-pointer">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
          <form id="companyForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 企業名・業界 */}
            <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">企業名 <span className="text-red-500">*</span></label>
                  <input required className="w-full border-gray-200 bg-gray-50 rounded-lg p-3 text-lg font-bold focus:ring-2 focus:ring-black focus:bg-white transition outline-none"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="株式会社〇〇" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">業界</label>
                  <input className="w-full border-gray-200 bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-black focus:bg-white transition outline-none"
                    value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} placeholder="IT, 商社..." />
                </div>
              </div>
            </section>

            {/* ステータス・アクション */}
            <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                <h3 className="font-bold text-gray-700">選考状況</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">現在のステータス</label>
                  <div className="relative">
                    <select className="w-full appearance-none border-gray-200 bg-gray-50 rounded-lg p-3 pr-8 focus:ring-2 focus:ring-indigo-500 outline-none font-medium cursor-pointer"
                      value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      {STATUS_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">▼</div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">志望度</label>
                  {/* 星ボタンに cursor-pointer */}
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onClick={() => setFormData({...formData, priority: star})}
                        className={`transition hover:scale-110 cursor-pointer ${formData.priority >= star ? "text-amber-400" : "text-gray-200"}`}>
                        <Star size={26} fill={formData.priority >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-indigo-800 mb-1 block">次の予定 (イベント名)</label>
                  <input className="w-full border-indigo-200 bg-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-indigo-300"
                    value={formData.nextActionType} onChange={e => setFormData({...formData, nextActionType: e.target.value})} placeholder="例: 最終面接, ES締切" />
                </div>
                <div>
                  <label className="text-xs font-bold text-indigo-800 mb-1 block">日時</label>
                  <input type="datetime-local" className="w-full border-indigo-200 bg-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    value={formData.nextActionDate} onChange={e => setFormData({...formData, nextActionDate: e.target.value})} />
                </div>
              </div>
            </section>

            {/* URL & Memo */}
            <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
               <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><ExternalLink size={16} /> リンク・ログイン情報</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input className="border-gray-200 bg-gray-50 rounded-lg p-2 text-sm" value={formData.urls.mypage} onChange={e => setFormData({...formData, urls: {...formData.urls, mypage: e.target.value}})} placeholder="MyPage URL" />
                    <input className="border-gray-200 bg-gray-50 rounded-lg p-2 text-sm" value={formData.urls.home} onChange={e => setFormData({...formData, urls: {...formData.urls, home: e.target.value}})} placeholder="採用サイト URL" />
                  </div>
                  <input className="w-full border-gray-200 bg-gray-50 rounded-lg p-2 text-sm font-mono" value={formData.loginInfo} onChange={e => setFormData({...formData, loginInfo: e.target.value})} placeholder="ID / Pass メモ" />
               </div>

               <div className="pt-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">フリーメモ</label>
                  <textarea className="w-full border-gray-200 bg-gray-50 rounded-lg p-3 h-24 text-sm resize-none focus:bg-white focus:ring-2 focus:ring-black outline-none"
                    value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="面接の感触や、次の対策など..." />
               </div>
            </section>
          </form>
        </div>

        {/* Footer: キャンセル・保存・削除ボタンに cursor-pointer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
          {formData.id ? (
            <button 
              type="button"
              onClick={handleDeleteClick}
              className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Trash2 size={16} /> <span className="hidden sm:inline">削除</span>
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition cursor-pointer">キャンセル</button>
            <button type="submit" form="companyForm" className="px-6 py-2.5 text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-lg flex items-center gap-2 cursor-pointer">
              <Save size={18} /> 保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}