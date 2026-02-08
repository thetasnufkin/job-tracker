// src/components/CompanyFormModal.js
"use client";
import { useState, useEffect } from "react";
import { X, Save, Star, ExternalLink, MapPin, Banknote } from "lucide-react";

// 定数定義
const STATUS_OPTIONS = [
  "気になる", "説明会/セミナー", "ES作成中", "ES提出済", 
  "Webテスト", "1次面接", "2次面接", "3次面接", 
  "最終面接", "内定", "保留", "お見送り"
];

export default function CompanyFormModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState(initialData);

  // モーダルが開くたびに初期データをセット
  useEffect(() => {
    setFormData(initialData);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {formData.id ? "企業情報を編集" : "企業を追加"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black p-1 rounded-full hover:bg-gray-200 transition">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="companyForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Basic Info */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-500 mb-1">企業名 <span className="text-red-500">*</span></label>
                <input required className="w-full border border-gray-300 rounded-lg p-2 text-lg font-bold focus:ring-2 focus:ring-black focus:outline-none"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="株式会社〇〇" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">業界</label>
                <input className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-black focus:outline-none"
                  value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} placeholder="メーカー, IT など" />
              </div>
            </section>

            {/* 2. Status & Schedule */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">現在のステータス</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    {STATUS_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">志望度 (★1-5)</label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onClick={() => setFormData({...formData, priority: star})}
                        className={`transition ${formData.priority >= star ? "text-yellow-400 scale-110" : "text-gray-300"}`}>
                        <Star size={24} fill={formData.priority >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">次のアクション内容</label>
                  <input className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-black focus:outline-none"
                    value={formData.nextActionType} onChange={e => setFormData({...formData, nextActionType: e.target.value})} placeholder="例: ES締切, 最終面接" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">日時・期限</label>
                  <input type="datetime-local" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-black focus:outline-none"
                    value={formData.nextActionDate} onChange={e => setFormData({...formData, nextActionDate: e.target.value})} />
                </div>
              </div>
            </div>

            {/* 3. URLs & Account Info */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold border-b border-gray-100 pb-1 mb-2 flex items-center gap-2"><ExternalLink size={16} /> 重要リンク・ID</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-xs text-gray-500 mb-1">MyPage URL</label>
                  <input className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono text-blue-600"
                    value={formData.urls.mypage} onChange={e => setFormData({...formData, urls: {...formData.urls, mypage: e.target.value}})} placeholder="https://..." /></div>
                  <div><label className="block text-xs text-gray-500 mb-1">採用サイト URL</label>
                  <input className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono"
                    value={formData.urls.home} onChange={e => setFormData({...formData, urls: {...formData.urls, home: e.target.value}})} placeholder="https://..." /></div>
              </div>
              <div><label className="block text-xs text-gray-500 mb-1">ログインID / Passメモ</label>
              <input className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 font-mono"
                value={formData.loginInfo} onChange={e => setFormData({...formData, loginInfo: e.target.value})} placeholder="ID: ... / Pass: ..." /></div>
            </section>

            {/* 4. Conditions & Memo */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold border-b border-gray-100 pb-1 mb-2 flex items-center gap-2"><Banknote size={16} /> 条件・詳細メモ</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-gray-500 mb-1">勤務地</label>
                <div className="relative"><MapPin size={14} className="absolute left-2.5 top-2.5 text-gray-400"/>
                <input className="w-full border border-gray-300 rounded-lg pl-8 p-2 text-sm"
                  value={formData.conditions.location} onChange={e => setFormData({...formData, conditions: {...formData.conditions, location: e.target.value}})} /></div></div>
                <div><label className="block text-xs text-gray-500 mb-1">給与 / 年収例</label>
                  <div className="relative"><Banknote size={14} className="absolute left-2.5 top-2.5 text-gray-400"/>
                  <input className="w-full border border-gray-300 rounded-lg pl-8 p-2 text-sm"
                    value={formData.conditions.salary} onChange={e => setFormData({...formData, conditions: {...formData.conditions, salary: e.target.value}})} /></div></div>
              </div>
              <div><label className="block text-xs text-gray-500 mb-1">フリーメモ</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3 h-32 text-sm leading-relaxed"
                value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="選考記録や志望動機など" /></div>
            </section>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition">キャンセル</button>
          <button type="submit" form="companyForm" className="px-5 py-2.5 text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-lg flex items-center gap-2"><Save size={16} /> 保存する</button>
        </div>
      </div>
    </div>
  );
}