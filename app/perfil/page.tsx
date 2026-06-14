"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { User, ArrowLeft, Save } from 'lucide-react';

export default function PerfilPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setPhone(user.user_metadata?.phone || '');
      setAddress(user.user_metadata?.address || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabaseBrowser.auth.updateUser({
        data: { full_name: fullName, phone, address },
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Datos actualizados correctamente.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al guardar.' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-emerald-700 transition mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver al inicio
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-100 p-2.5 rounded-xl">
          <User className="w-5 h-5 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-xl font-black text-emerald-950">Mis datos</h1>
          <p className="text-xs text-stone-400">Información personal de tu cuenta</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">Nombre completo</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">Email</label>
          <input
            type="email"
            value={user.email || ''}
            readOnly
            className="w-full bg-stone-100 border border-stone-200 rounded-xl py-2.5 px-4 text-sm text-stone-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            placeholder="Ej: +54 11 1234-5678"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">Dirección</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            placeholder="Tu dirección"
          />
        </div>

        {message && (
          <p className={`text-xs font-semibold ${message.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-emerald-900 hover:bg-emerald-800 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
