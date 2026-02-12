import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import Button from '../components/UI/Button';

const AuthView: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Verifique seu e-mail para confirmar o cadastro!' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Ocorreu um erro' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-500">
                <div className="p-8 md:p-12">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <img src="/logo.png" alt="Saúde Digital MT" className="h-32 w-auto object-contain" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Entre para acessar a Galeria</p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white outline-none transition-all"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Senha</label>
                            <input
                                type="password"
                                required
                                className="w-full px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50 text-slate-800 dark:text-white outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {message && (
                            <div className={`p-4 rounded-2xl text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'}`}>
                                {message.text}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full !py-4 shadow-xl"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Carregando...
                                </span>
                            ) : (
                                isSignUp ? 'Criar Conta' : 'Entrar'
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        {isSignUp ? (
                            <p>Já tem uma conta? <button onClick={() => setIsSignUp(false)} className="text-primary font-bold hover:underline">Entre aqui</button></p>
                        ) : (
                            <p>Não tem uma conta? <button onClick={() => setIsSignUp(true)} className="text-primary font-bold hover:underline">Cadastre-se</button></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthView;
