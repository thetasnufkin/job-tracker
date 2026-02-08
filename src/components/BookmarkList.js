"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trash2, ExternalLink, Bookmark, Loader2 } from "lucide-react";

export default function BookmarkList({ user }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "bookmarks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snapshot) => {
      setBookmarks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!url || !title) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "bookmarks"), {
        userId: user.uid,
        title,
        url,
        createdAt: serverTimestamp()
      });
      setUrl("");
      setTitle("");
    } catch (err) {
      console.error(err);
      alert("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("このブックマークを削除しますか？")) {
      await deleteDoc(doc(db, "bookmarks", id));
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 登録フォーム */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Bookmark size={20} className="text-indigo-600" /> 新しいブックマークを追加
        </h3>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
          <input 
            className="flex-1 border-gray-200 bg-gray-50 p-3 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition"
            placeholder="サイト名 (例: マイナビ)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input 
            className="flex-[2] border-gray-200 bg-gray-50 p-3 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none transition"
            placeholder="URL (https://...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          {/* 追加ボタン: cursor-pointer */}
          <button 
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-gray-800 disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            追加
          </button>
        </form>
      </div>

      {/* リスト表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookmarks.map(bm => (
          <div key={bm.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center group hover:shadow-md transition hover:-translate-y-0.5">
            <a href={bm.url} target="_blank" rel="noreferrer" className="flex-1 flex items-center gap-4 truncate cursor-pointer">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <ExternalLink size={20} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-gray-800">{bm.title}</div>
                <div className="text-xs text-gray-400 truncate">{bm.url}</div>
              </div>
            </a>
            
            {/* 削除ボタン: cursor-pointer */}
            <button 
              onClick={() => handleDelete(bm.id)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition ml-2 cursor-pointer"
              title="削除"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        
        {bookmarks.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
            <p>まだブックマークがありません。</p>
            <p className="text-sm mt-1">よく使う就活サイトを登録して、アクセスを爆速に。</p>
          </div>
        )}
      </div>
    </div>
  );
}