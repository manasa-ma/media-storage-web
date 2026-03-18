"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { HardDrive, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle visibility state
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push('/drive');
    setLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-slate-200">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-600 p-4 rounded-2xl mb-4 shadow-lg shadow-blue-200 text-white">
            <HardDrive size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight text-center">CloudDrive</h1>
          <p className="text-slate-500 mt-2 font-medium">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="email" 
                placeholder="name@example.com" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-4 pl-12 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all text-slate-900 font-medium placeholder:text-slate-300" 
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-4 pl-12 pr-12 rounded-xl border-2 border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all text-slate-900 font-bold tracking-widest placeholder:text-slate-300" 
              />
              
              {/* Visibility Toggle Button */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-100 flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Login to Drive"}
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 font-medium italic">
                Securely powered by Supabase & Vercel
            </p>
        </div>
      </div>
    </div>
  );
}