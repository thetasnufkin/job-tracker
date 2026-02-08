"use client";
import { useState, useEffect, useMemo } from "react";
// Firebase関連
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp, where } from "firebase/firestore";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { db, auth, googleProvider } from "@/lib/firebase";
// UI部品
import CompanyFormModal from "@/components/CompanyFormModal"; // さっき作ったファイル
import { Plus, Trash2, Search, ExternalLink, Star, LogIn, LogOut, Clock, User } from "lucide-react";

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

  // モーダル管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  
  // フィルター用
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // --- 1. ログイン監視 & データ取得 ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // ログイン時：自分のデータだけ(userId == currentUser.uid)を取得
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

  // --- 2. データ操作 (保存・削除) ---
  const handleSaveData = async (dataToSave) => {
    try {
      // ユーザーIDを付与して保存
      const payload = { 
        ...dataToSave, 
        userId: user.uid, 
        updatedAt: serverTimestamp() 
      };

      if (dataToSave.id) {
        // 更新モード
        const { id, ...updateData } = payload; // idを除外して更新
        await updateDoc(doc(db, "companies", id), updateData);
      } else {
        // 新規作成モード
        await addDoc(collection(db, "companies"), { ...payload, createdAt: serverTimestamp() });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("保存エラー:", error);
      alert("保存できませんでした");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm("本当に削除しますか？")) {
      await deleteDoc(doc(db, "companies", id));
    }
  };

  // --- 3. UI操作 ---
  const openNew = () => {
    setFormData(INITIAL_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (company) => {
    // 既存データと初期値をマージ（古いデータ形式への対策）
    setFormData({
      ...INITIAL_FORM,
      ...company,
      urls: { ...INITIAL_FORM.urls, ...company.urls },
      conditions: { ...INITIAL_FORM.conditions, ...company.conditions }
    });
    setIsModalOpen(true);
  };

  // --- 4. フィルター処理 ---
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchText = c.name.toLowerCase().includes(searchText.toLowerCase()) || 
                        c.industry?.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
      return matchText && matchStatus;
    });
  }, [companies, searchText, statusFilter]);

  const getStatusStyle = (status) => {
    if (status.includes("内定")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (status.includes("面接")) return "bg-orange-100 text-orange-700 border-orange-200";
    if (status.includes("お見送り")) return "bg-gray-100 text-gray-500 border-gray-200";
    return "bg-green-50 text-green-700 border-green-200";
  };

  // --- 5. 描画 (ログイン前) ---
  if (!user && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-2">🚀 Job Tracker</h1>
          <p className="text-gray-500 mb-8">就活のすべてを、ここで管理しよう。</p>
          <button onClick={() => signInWithPopup(auth, googleProvider)}
            className="w-full bg-black text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition">
            <LogIn size={20} /> Googleでログイン
          </button>
        </div>
      </div>
    );
  }

  // --- 6. 描画 (ログイン後メイン画面) ---
  return (
    <div className="min-h-screen bg-[#F7F7F5] text-gray-900 font-sans pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2 tracking-tight">
              💼 Job Tracker <span className="hidden sm:inline-block text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Pro</span>
            </h1>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                <User size={14} /> {user?.displayName || "User"}
              </div>
              <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-black transition" title="ログアウト">
                <LogOut size={20} />
              </button>
              <button onClick={openNew} className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2 text-sm font-bold shadow-md">
                <Plus size={16} /> 新規
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input type="text" placeholder="企業名、業界で検索..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-black/10 text-sm"
                value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            </div>
            <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">全ステータス</option>
              {[ "気になる", "説明会/セミナー", "ES作成中", "ES提出済", "面接", "内定", "お見送り"].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* Main List */}
      <main className="max-w-5xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <div key={company.id} onClick={() => openEdit(company)} 
              className="group bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition cursor-pointer relative overflow-hidden">
              
              <div className="absolute top-0 right-0 p-2 flex gap-0.5">
                {[...Array(company.priority || 0)].map((_, i) => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}
              </div>

              <div className="mb-3 pr-8">
                <h2 className="font-bold text-gray-900 text-lg leading-tight mb-1">{company.name}</h2>
                {company.industry && <p className="text-xs text-gray-500">{company.industry}</p>}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs px-2 py-1 rounded-md border font-medium ${getStatusStyle(company.status)}`}>
                  {company.status}
                </span>
                {company.nextActionDate && (
                  <span className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 border border-red-100 flex items-center gap-1 font-medium">
                    <Clock size={12} /> {company.nextActionDate.slice(5).replace("T", " ")}
                  </span>
                )}
              </div>

              <div className="flex gap-2 mb-3" onClick={e => e.stopPropagation()}>
                {company.urls?.mypage && <a href={company.urls.mypage} target="_blank" className="text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded flex items-center gap-1 text-gray-600 hover:bg-gray-100"><ExternalLink size={12} /> MyPage</a>}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                 <p className="text-xs text-gray-400 line-clamp-1 flex-1">{company.note || "メモなし"}</p>
                 <button onClick={(e) => handleDelete(company.id, e)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        {filteredCompanies.length === 0 && <div className="text-center py-20 text-gray-400"><p>データがありません。</p></div>}
      </main>

      {/* Component: Form Modal */}
      <CompanyFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveData} 
        initialData={formData} 
      />

    </div>
  );
}