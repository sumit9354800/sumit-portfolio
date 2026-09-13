import React, { useState } from 'react';
import { Lock, Shield, Terminal, ArrowLeft, AlertCircle } from 'lucide-react';
import { setAdminToken } from '../../lib/admin-api';

interface AdminLoginProps {
  onSuccess: (admin: { email: string; name: string; role: string }) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('sumit9354800@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          setAdminToken(data.token);
        }
        onSuccess(data.data);
      } else {
        setError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setError('Connection failure communicating with authentication gateway.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-md border border-[#2B2B2B] bg-[#0A0A0A] p-6 sm:p-8 shadow-2xl relative">
        {/* Header telemetry */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1C1C1C]">
          <div className="flex items-center space-x-2 text-white font-mono text-xs font-bold tracking-wider">
            <Shield className="w-4 h-4 text-white" />
            <span>ADMIN_GATEWAY // CMS_AUTH</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center space-x-1 text-[#888888] hover:text-white font-mono text-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN</span>
          </button>
        </div>

        <div className="mb-6 space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            SECURE ACCESS PORTAL
          </h2>
          <p className="font-mono text-xs text-[#888888]">
            Sign in to manage portfolio content, projects, and database settings.
          </p>
        </div>

        {error && (
          <div className="p-3.5 mb-5 bg-[#1C0E0E] border border-[#3B1E1E] text-[#E89D9D] font-mono text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
              ADMIN EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#242424] focus:border-white text-white font-mono text-sm focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-[#AAAAAA] uppercase tracking-wider mb-1.5">
              SECRET ACCESS KEY // PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#242424] focus:border-white text-white font-mono text-sm focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white hover:bg-[#D4D4D4] disabled:bg-[#444444] text-black font-mono text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'AUTHENTICATING...' : 'AUTHORIZE SESSION'}</span>
            </button>
          </div>
        </form>

        {/* Security Note & Default Credentials reminder */}
        <div className="mt-6 pt-4 border-t border-[#161616] space-y-2">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#666666]">
            <Terminal className="w-3 h-3 text-[#888888]" />
            <span>AUTH_STATUS: ENCRYPTED_HTTP_ONLY_COOKIE</span>
          </div>
          <div className="p-2.5 bg-[#0E0E0E] border border-[#1A1A1A] font-mono text-[10px] text-[#777777] leading-relaxed">
            <span className="text-[#AAAAAA] font-bold">DATABASE AUTH:</span> Credentials stored securely in MongoDB / Database Store. Enter your secret admin password to authenticate.
          </div>
        </div>
      </div>
    </div>
  );
};
