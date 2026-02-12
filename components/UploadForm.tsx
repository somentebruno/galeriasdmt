import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { uploadToSupabase, getYoutubeID } from '../utils/mediaHandler';
import Button from './UI/Button';

interface UploadFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

type MediaType = 'image' | 'video';

interface UploadItem {
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

const UploadForm: React.FC<UploadFormProps> = ({ onSuccess, onCancel }) => {
    const [type, setType] = useState<MediaType>('image');

    // Image State (Bulk)
    const [files, setFiles] = useState<UploadItem[]>([]);
    const [uploading, setUploading] = useState(false);

    // Video State (Single Logic for now, or keep simple)
    const [youtubeLink, setYoutubeLink] = useState('');
    const [videoTitle, setVideoTitle] = useState(''); // Keep title for video/link
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                status: 'pending' as const
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const processQueue = async () => {
        setUploading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError('Usuário não autenticado');
            setUploading(false);
            return;
        }

        // Process files one by one
        const newFiles = [...files];
        let hasError = false;

        for (let i = 0; i < newFiles.length; i++) {
            if (newFiles[i].status === 'success') continue;

            newFiles[i].status = 'uploading';
            setFiles([...newFiles]);

            try {
                // 1. Upload File
                const url = await uploadToSupabase(newFiles[i].file);

                // 2. Save to DB
                // Use filename as title, remove extension
                const title = newFiles[i].file.name.replace(/\.[^/.]+$/, "");
                // Random aspect for demo variation
                const aspect = Math.random() > 0.5 ? 'wide' : 'square';

                // Extract storage path from URL for future deletions
                // Standard public URL: .../storage/v1/object/public/photos/filename.ext
                // We stored as just "filename.ext" in root of bucket.
                const storagePath = url.split('/').pop();

                const { error: dbError } = await supabase
                    .from('photos')
                    .insert({
                        user_id: user.id,
                        url: url,
                        title: title,
                        media_type: 'image',
                        aspect: aspect,
                        storage_path: storagePath
                    });

                if (dbError) throw dbError;

                newFiles[i].status = 'success';
            } catch (err: any) {
                console.error(err);
                newFiles[i].status = 'error';
                newFiles[i].error = err.message;
                hasError = true;
            }

            setFiles([...newFiles]);
        }

        setUploading(false);

        // If all success, close/callback
        if (!hasError && newFiles.every(f => f.status === 'success')) {
            setTimeout(() => {
                alert('Todos os arquivos foram enviados com sucesso!');
                onSuccess?.();
            }, 500);
        }
    };

    const handleVideoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            if (!youtubeLink) throw new Error("Insira o link do YouTube.");
            if (!videoTitle.trim()) throw new Error("Insira um título para o vídeo.");

            const video_id = getYoutubeID(youtubeLink);
            if (!video_id) throw new Error("Link do YouTube inválido.");

            const url = `https://img.youtube.com/vi/${video_id}/maxresdefault.jpg`;

            const { error: dbError } = await supabase
                .from('photos')
                .insert({
                    user_id: user.id,
                    url: url,
                    title: videoTitle,
                    media_type: 'video',
                    video_id: video_id,
                    aspect: 'video'
                });

            if (dbError) throw dbError;

            alert('Vídeo adicionado com sucesso!');
            setYoutubeLink('');
            setVideoTitle('');
            onSuccess?.();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Adicionar Mídia</h2>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
                    {error}
                </div>
            )}

            {/* Tipo de Mídia */}
            <div className="flex gap-4 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="type"
                        value="image"
                        checked={type === 'image'}
                        onChange={() => setType('image')}
                        disabled={uploading}
                        className="text-primary focus:ring-primary"
                    />
                    <span className="text-slate-700 dark:text-slate-200">Imagens (Upload)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="type"
                        value="video"
                        checked={type === 'video'}
                        onChange={() => setType('video')}
                        disabled={uploading}
                        className="text-primary focus:ring-primary"
                    />
                    <span className="text-slate-700 dark:text-slate-200">Vídeo (YouTube)</span>
                </label>
            </div>

            {type === 'image' ? (
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="mb-4">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            disabled={uploading}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                        />
                        <p className="text-xs text-slate-400 mt-2">O título da foto será o nome do arquivo.</p>
                    </div>

                    {/* File List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-2 space-y-2 mb-4 min-h-[150px]">
                        {files.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <span className="material-icons opacity-20 text-4xl mb-2">add_photo_alternate</span>
                                <p className="text-sm">Nenhum arquivo selecionado</p>
                            </div>
                        ) : (
                            files.map((item, index) => (
                                <div key={index} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded text-slate-500">
                                            {item.status === 'success' ? (
                                                <span className="material-icons text-green-500 text-sm">check</span>
                                            ) : item.status === 'error' ? (
                                                <span className="material-icons text-red-500 text-sm">error</span>
                                            ) : item.status === 'uploading' ? (
                                                <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                                            ) : (
                                                <span className="material-icons text-sm">image</span>
                                            )}
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[200px]">{item.file.name}</p>
                                            {item.error && <p className="text-xs text-red-500">{item.error}</p>}
                                        </div>
                                    </div>
                                    {!uploading && item.status !== 'success' && (
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-icons text-lg">close</span>
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        {onCancel && (
                            <Button variant="ghost" onClick={onCancel} disabled={uploading}>
                                Cancelar
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            onClick={processQueue}
                            disabled={uploading || files.length === 0}
                            icon={uploading ? 'sync' : 'cloud_upload'}
                            className={uploading ? 'animate-pulse' : ''}
                        >
                            {uploading ? `Enviando (${files.filter(f => f.status === 'success').length}/${files.length})...` : 'Enviar Todos'}
                        </Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleVideoSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link do YouTube</label>
                        <input
                            type="url"
                            value={youtubeLink}
                            onChange={(e) => setYoutubeLink(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="https://www.youtube.com/watch?v=..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título do Vídeo</label>
                        <input
                            type="text"
                            value={videoTitle}
                            onChange={(e) => setVideoTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="Ex: Minha viagem"
                            required
                        />
                    </div>
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
                            icon={loading ? 'sync' : 'save'}
                        >
                            {loading ? 'Salvando...' : 'Adicionar Vídeo'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default UploadForm;
