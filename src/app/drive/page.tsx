"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Folder, HardDrive, Plus, LogOut, Loader2, FileText, Image as ImageIcon, UploadCloud, Trash2, ExternalLink, ChevronRight, Search, Edit3, RotateCcw, Star, Clock, UserPlus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DrivePage() {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [view, setView] = useState<'drive' | 'trash' | 'starred' | 'recent' | 'shared'>('drive');
  const [currentFolder, setCurrentFolder] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/');
      setUser(session.user);
      fetchData(session.access_token);
    };
    init();
  }, [currentFolder, view, router]);

  const fetchData = async (token?: string) => {
    setLoading(true);
    const jwt = token || (await supabase.auth.getSession()).data.session?.access_token;
    const headers = { 'Authorization': `Bearer ${jwt}` };

    try {
        if (view === 'trash') {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trash`, { headers });
            const data = await res.json();
            setFolders(data.folders); setFiles(data.files);
        } else if (view === 'starred') {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/starred`, { headers });
            const data = await res.json();
            setFolders(data.folders); setFiles(data.files);
        } else if (view === 'recent') {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/starred/recent`, { headers });
            setFolders([]); setFiles(await res.json());
        } else if (view === 'shared') {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shares/with-me`, { headers });
            setFolders([]); setFiles(await res.json());
        } else {
            const fId = currentFolder?.id || 'null';
            const fRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/folders?parentId=${fId}`, { headers });
            const fiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files?folderId=${fId}`, { headers });
            setFolders(await fRes.json()); setFiles(await fiRes.json());
        }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const shareFile = async (fileId: string) => {
    const email = prompt("Enter email to share with:");
    if (!email) return;
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shares`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({ fileId, email, permission: 'view' })
    });
    alert("Shared successfully!");
  };

  const toggleStar = async (id: string, type: string, isStarred: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/starred/toggle`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({ id, type, isStarred })
    });
    fetchData();
  };

  const createFolder = async () => {
    const name = prompt("Folder Name:");
    if (!name) return;
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/folders`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({ name, parentId: currentFolder?.id })
    });
    fetchData();
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const filePath = `${session?.user.id}/${Date.now()}-${file.name}`;
    const { data } = await supabase.storage.from('media').upload(filePath, file);
    if (data) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ name: file.name, storagePath: data.path, size: file.size, mimeType: file.type, folderId: currentFolder?.id })
      });
      fetchData();
    }
    setUploading(false);
  };

  const deleteItem = async (id: string, type: string) => {
    if (!confirm("Delete?")) return;
    const { data: { session } } = await supabase.auth.getSession();
    const url = view === 'trash' ? `${process.env.NEXT_PUBLIC_API_URL}/api/trash/permanent/${id}?type=${type}` : `${process.env.NEXT_PUBLIC_API_URL}/api/${type}/${id}`;
    await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${session?.access_token}` } });
    fetchData();
  };

  if (loading && !uploading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-6 flex flex-col fixed h-full shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl mb-10"><HardDrive /> CloudDrive</div>
        
        <nav className="space-y-1 mb-8">
          <button onClick={() => {setView('drive'); setCurrentFolder(null)}} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${view === 'drive' ? 'bg-blue-600 text-white shadow-lg font-bold' : 'text-slate-500 hover:bg-slate-100'}`}><HardDrive size={18}/> My Drive</button>
          <button onClick={() => setView('shared')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${view === 'shared' ? 'bg-blue-600 text-white shadow-lg font-bold' : 'text-slate-500 hover:bg-slate-100'}`}><Users size={18}/> Shared</button>
          <button onClick={() => setView('recent')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${view === 'recent' ? 'bg-blue-600 text-white shadow-lg font-bold' : 'text-slate-500 hover:bg-slate-100'}`}><Clock size={18}/> Recent</button>
          <button onClick={() => setView('starred')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${view === 'starred' ? 'bg-amber-500 text-white shadow-lg font-bold' : 'text-slate-500 hover:bg-slate-100'}`}><Star size={18}/> Starred</button>
          <button onClick={() => setView('trash')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${view === 'trash' ? 'bg-red-500 text-white shadow-lg font-bold' : 'text-slate-500 hover:bg-slate-100'}`}><Trash2 size={18}/> Trash</button>
        </nav>

        {view === 'drive' && (
          <div className="flex flex-col gap-2">
            <button onClick={createFolder} className="bg-slate-800 text-white p-3 rounded-xl font-bold flex gap-2 justify-center hover:bg-black transition shadow-md"><Plus /> New Folder</button>
            <label className="flex items-center justify-center gap-2 bg-white border border-slate-200 p-3 rounded-xl font-bold cursor-pointer hover:bg-slate-50 transition shadow-sm">
              {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud />} Upload File
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        )}
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="mt-auto flex items-center gap-2 text-slate-400 hover:text-red-500 font-medium transition cursor-pointer p-2"><LogOut size={18} /> Logout</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-10">
        <header className="mb-10 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold capitalize text-slate-800">{view.replace('-', ' ')}</h2>
            {view === 'drive' && (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                <span className="hover:text-blue-600 cursor-pointer transition" onClick={() => setCurrentFolder(null)}>My Drive</span>
                {currentFolder && <><ChevronRight size={12} /> <span className="text-slate-900 font-bold">{currentFolder.name}</span></>}
              </div>
            )}
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input type="text" placeholder="Search files..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition" />
          </div>
        </header>

        {/* FOLDERS GRID */}
        {folders.length > 0 && (
          <section className="mb-12">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Folders</h3>
            <div className="grid grid-cols-4 gap-6">
              {folders.filter((f:any) => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((f: any) => (
                <div key={f.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between group shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1" onClick={() => view === 'drive' && setCurrentFolder(f)}>
                    <Folder className={`${f.is_starred ? 'text-amber-400 fill-amber-400' : 'text-blue-400 fill-blue-400'}`} /> 
                    <span className="font-semibold text-slate-700 truncate">{f.name}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => toggleStar(f.id, 'folders', f.is_starred)} className={f.is_starred ? 'text-amber-500' : 'text-slate-300'}><Star size={16} fill={f.is_starred ? "currentColor" : "none"}/></button>
                    <button onClick={() => deleteItem(f.id, 'folders')} className="text-red-400"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FILES GRID */}
        <section>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Files</h3>
          <div className="grid grid-cols-4 gap-8">
            {files.filter((f:any) => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((file: any) => (
              <div key={file.id} className="flex flex-col gap-2 group">
                <div className="w-full h-40 bg-white border border-slate-200 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-sm hover:shadow-xl transition-all">
                   {file.mime_type?.includes('image') ? (
                     <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${file.storage_path}`} className="w-full h-full object-cover" />
                   ) : <FileText className="text-slate-300" size={48} />}
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all backdrop-blur-[1px]">
                      <button onClick={async () => { const { data } = await supabase.storage.from('media').createSignedUrl(file.storage_path, 60); window.open(data?.signedUrl, '_blank') }} className="p-2 bg-white rounded-lg text-blue-600 hover:scale-110 transition shadow-md"><ExternalLink size={18}/></button>
                      <button onClick={() => shareFile(file.id)} className="p-2 bg-white rounded-lg text-green-600 hover:scale-110 transition shadow-md"><UserPlus size={18}/></button>
                      <button onClick={() => toggleStar(file.id, 'files', file.is_starred)} className="p-2 bg-white rounded-lg text-amber-500 hover:scale-110 transition shadow-md"><Star size={18} fill={file.is_starred ? "currentColor" : "none"}/></button>
                      <button onClick={() => deleteItem(file.id, 'files')} className="p-2 bg-white rounded-lg text-red-600 hover:scale-110 transition shadow-md"><Trash2 size={18}/></button>
                   </div>
                </div>
                <div className="px-1 flex justify-between items-start">
                  <span className="font-bold text-slate-700 text-sm truncate block flex-1">{file.name}</span>
                  {file.is_starred && <Star size={12} className="text-amber-500 fill-amber-500 mt-1" />}
                </div>
              </div>
            ))}
            {files.length === 0 && <p className="text-slate-300 italic text-sm">Nothing to show here.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}