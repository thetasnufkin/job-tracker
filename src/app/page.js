"use client";
import { useState, useEffect, useMemo } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp, where } from "firebase/firestore";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { db, auth, googleProvider } from "@/lib/firebase";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

// Components
import CompanyFormModal from "@/components/CompanyFormModal";
import CompanyCard from "@/components/CompanyCard";
import CalendarView from "@/components/CalendarView";
import BookmarkList from "@/components/BookmarkList";
import { Plus, Search, LogIn, LogOut, LayoutGrid, Calendar as CalIcon, Bookmark, Sparkles } from "lucide-react";

const INITIAL_FORM = {
  name: "", industry: "", status: "気になる", priority: 3,
  nextActionDate: "", nextActionType: "",
  urls: { mypage: "", home: "", recruit: "" },
  loginInfo: "", conditions: { location: "", salary: "" }, note: ""
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(
          collection(db, "companies"), 
          where("userId", "==", currentUser.uid), 
          orderBy("updatedAt", "desc")
        );
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          setCompanies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        setCompanies([]);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleSaveData = async (dataToSave) => {
    try {
      const payload = { ...dataToSave, userId: user.uid, updatedAt: serverTimestamp() };
      if (dataToSave.id) {
        const { id, ...updateData } = payload;
        await updateDoc(doc(db, "companies", id), updateData);
      } else {
        await addDoc(collection(db, "companies"), { ...payload, createdAt: serverTimestamp() });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (confirm("削除しますか？")) await deleteDoc(doc(db, "companies", id));
  };

  const openNew = (date = null) => {
    const initialDate = date ? format(date, "yyyy-MM-dd'T'09:00") : "";
    setFormData({ ...INITIAL_FORM, nextActionDate: initialDate });
    setIsModalOpen(true);
  };

  const openEdit = (company) => {
    setFormData({ ...INITIAL_FORM, ...company, urls: { ...INITIAL_FORM.urls, ...company.urls }, conditions: { ...INITIAL_FORM.conditions, ...company.conditions } });
    setIsModalOpen(true);
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => 
      c.name.toLowerCase().includes(searchText.toLowerCase()) || 
      c.industry?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [companies, searchText]);

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F5] p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">💼</div>
          <h1 className="text-3xl font-extrabold mb-3 tracking-tight text-gray-900">Job Tracker</h1>
          <p className="text-gray-500 mb-8 font-medium">就活を、もっとスマートに。</p>
          <button onClick={() => signInWithPopup(auth, googleProvider)}
            className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg cursor-pointer">
            <LogIn size={20} /> Googleで始める
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-gray-900 font-sans pb-32 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">JT</div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">Job Tracker</h1>
          </div>

          {/* Tabs: ここに cursor-pointer を追加 */}
          <div className="flex bg-gray-100/80 p-1.5 rounded-full relative">
            {[
              { id: "list", icon: LayoutGrid, label: "リスト" },
              { id: "calendar", icon: CalIcon, label: "カレンダー" },
              { id: "bookmarks", icon: Bookmark, label: "ブックマーク" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-colors z-10 cursor-pointer ${
                  activeTab === tab.id ? "text-black" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-full shadow-sm border border-black/5"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon size={14} /> {tab.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
             <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-black transition-colors cursor-pointer" title="ログアウト">
               <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <AnimatePresence mode="wait">
          
          {/* List View */}
          {activeTab === "list" && (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Toolbar: 新規追加ボタンに cursor-pointer を追加 */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center">
                <div className="relative flex-1 w-full group">
                  <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input type="text" placeholder="企業名や業界で検索..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-transparent focus:border-indigo-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm text-sm font-medium outline-none"
                    value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                </div>
                <button onClick={() => openNew()} className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-2xl hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-gray-200 cursor-pointer">
                  <Plus size={18} /> <span className="hidden sm:inline">新規追加</span>
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCompanies.map((company) => (
                  <CompanyCard key={company.id} company={company} onEdit={() => openEdit(company)} onDelete={handleDelete} />
                ))}
                
                {filteredCompanies.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-400 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Sparkles size={24} className="text-gray-300" /></div>
                    <p>表示する企業がありません。<br/>右上のボタンから追加してみましょう！</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Calendar View */}
          {activeTab === "calendar" && (
            <motion.div 
              key="calendar"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <CalendarView companies={companies} onAddEvent={openNew} onEditEvent={openEdit} />
            </motion.div>
          )}

          {/* Bookmarks View */}
          {activeTab === "bookmarks" && (
            <motion.div 
              key="bookmarks"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <BookmarkList user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button: cursor-pointerを追加 */}
      <button onClick={() => openNew()} className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform cursor-pointer">
        <Plus size={24} />
      </button>

      <CompanyFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveData} onDelete={(id) => { handleDelete(id); setIsModalOpen(false); }} initialData={formData} />
    </div>
  );
}