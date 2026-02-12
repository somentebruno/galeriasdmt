import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { uploadToHostinger, getYoutubeID } from '../utils/mediaHandler';
import Button from './UI/Button';

interface UploadFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

type MediaType = 'image' | 'video';

const UploadForm: React.FC<UploadFormProps> = ({ onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<MediaType>('image');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [youtubeLink, setYoutubeLink] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            let url = null;
            let video_id = null;
            let aspect = 'square'; // Default

            // Validação básica
            if (!title.trim()) throw new Error("O título é obrigatório.");

            if (type === 'image') {
                if (!file) throw new Error("Selecione uma imagem para enviar.");

                // Upload para Hostinger
                url = await uploadToHostinger(file);

                // Determine aspect ratio if possible, or random for demo? 
                // Let's keep 'square' or 'wide' randomly for visual variety if not determined.
                aspect = Math.random() > 0.5 ? 'wide' : 'square';

            } else {
                if (!youtubeLink) throw new Error("Insira o link do YouTube.");

                video_id = getYoutubeID(youtubeLink);
                if (!video_id) throw new Error("Link do YouTube inválido.");

                // For YouTube, we can store the thumbnail as URL or just leave it null if we use iframe
                // But let's verify if `url` is required in DB. I believe `url` was created as non-nullable in original setup?
                // Let's use the mq thumbnail for url if it's a video, so it works with <img /> tags too as fallback
                url = `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg`;
                aspect = 'video';
            }

            // Salvar no Supabase (Table: photos)
            const { error: dbError } = await supabase
                .from('photos')
                .insert({
                    user_id: user.id,
                    url: url,
                    title: title,
                    description: description,
                    media_type: type,
                    video_id: video_id,
                    aspect: aspect
                });

            if (dbError) throw dbError;

            alert('Upload realizado com sucesso!');

            // Limpar form
            setTitle('');
            setDescription('');
            setFile(null);
            setYoutubeLink('');

            onSuccess?.();
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao salvar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Adicionar Foto ou Vídeo</h2>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Tipo de Mídia */}
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            value="image"
                            checked={type === 'image'}
                            onChange={() => setType('image')}
                            className="text-primary focus:ring-primary"
                        />
                        <span className="text-slate-700 dark:text-slate-200">Imagem</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            value="video"
                            checked={type === 'video'}
                            onChange={() => setType('video')}
                            className="text-primary focus:ring-primary"
                        />
                        <span className="text-slate-700 dark:text-slate-200">Vídeo (YouTube)</span>
                    </label>
                </div>

                {/* Campos Comuns */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="Título da mídia"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição (Opcional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none h-24"
                        placeholder="Descreva a imagem ou vídeo..."
                    />
                </div>

                {/* Campos Específicos */}
                {type === 'image' ? (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Arquivo de Imagem</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        <p className="text-xs text-slate-400 mt-1">Upload via Hostinger</p>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link do YouTube</label>
                        <input
                            type="url"
                            value={youtubeLink}
                            onChange={(e) => setYoutubeLink(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>
                )}

                {/* Ações */}
                <div className="flex justify-end gap-2 pt-2">
                    {onCancel && (
                        <Button variant="ghost" onClick={onCancel} type="button">
                            Cancelar
                        </Button>
                    )}
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                        icon={loading ? 'sync' : 'cloud_upload'}
                        className={loading ? 'animate-pulse' : ''}
                    >
                        {loading ? 'Enviando...' : 'Salvar Mídia'}
                    </Button>
                </div>

            </form>
        </div>
    );
};

export default UploadForm;
