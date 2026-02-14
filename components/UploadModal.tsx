import * as React from 'react';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../lib/supabase';
import { uploadToHostinger, getYoutubeID, getVideoThumbnail } from '../utils/uploadHandler';
import Button from './UI/Button';
import exifr from 'exifr';


// Cloudinary Configuration (Unsigned Upload)
const CLOUDINARY_CLOUD_NAME = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;

interface UploadModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

type Tab = 'photos' | 'video';

interface UploadItem {
    file: File;
    status: 'pending' | 'converting' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
    preview: string;
    taken_at?: string;
    latitude?: number;
    longitude?: number;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState<Tab>('photos');
    
    // Photo State
    const [files, setFiles] = useState<UploadItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Video State
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [videoError, setVideoError] = useState('');
    const [videoLoading, setVideoLoading] = useState(false);

    // --- PHOTO LOGIC ---

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newItems: UploadItem[] = acceptedFiles.map(file => ({
            file,
            status: 'pending',
            progress: 0,
            preview: URL.createObjectURL(file)
        }));
        setFiles(prev => [...prev, ...newItems]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/webp': [],
            'image/heic': ['.heic'],
            'image/heif': ['.heif'],
            'image/heic-sequence': ['.heic'],
            'image/heif-sequence': ['.heif']
        }
    });

    const removeFile = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const convertHeicWithCloudinary = async (file: File): Promise<File> => {
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
            throw new Error('Configuração da Cloudinary ausente no .env ou Vercel.');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: 'POST', body: formData }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro na Cloudinary: ${errorData.error?.message || 'Falha no upload'}`);
        }

        const data = await response.json();
        // Cloudinary retorna secure_url. Forçamos a conversão para JPG mudando a extensão
        const jpgUrl = data.secure_url.replace(/\.[^/.]+$/, ".jpg");

        // Baixamos o JPG convertido para enviar para a Hostinger
        const jpgResponse = await fetch(jpgUrl);
        const jpgBlob = await jpgResponse.blob();
        
        return new File([jpgBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
    };

    const processQueue = async () => {
        setIsProcessing(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert('Você precisa estar logado para fazer upload.');
            setIsProcessing(false);
            return;
        }

        const newFiles = [...files];
        let hasError = false;

        for (let i = 0; i < newFiles.length; i++) {
            if (newFiles[i].status === 'success') continue;

            let fileToUpload = newFiles[i].file;
            const originalName = fileToUpload.name;

            try {
                // 1. Extract Metadata (Exif) early - especially important for HEIC before it gets converted
                let takenAt = new Date().toISOString();
                let lat = null;
                let lng = null;

                try {
                    // 1. Extração Agressiva de Exif
                    console.log(`%c[Metadata] Analisando ${originalName}...`, "color: blue; font-weight: bold;");
                    const metadata = await exifr.parse(fileToUpload, {
                        tiff: true,
                        xmp: true,
                        exif: true,
                        gps: true,
                        reviveValues: true
                    });
                    
                    if (metadata) {
                        const keys = Object.keys(metadata);
                        console.log(`[Metadata] ${originalName} - Campos extraídos:`, keys.join(', '));
                        
                        // Busca exaustiva: qualquer campo que tenha "date", "time", "created" ou "original" no nome
                        let candidateDate: any = null;
                        
                        // Prioridade 1: Campos padrão conhecidos
                        candidateDate = metadata.DateTimeOriginal || metadata.CreateDate || metadata.DateCreated || metadata.DateTimeDigitized || metadata.ModifyDate || metadata.GPSDateStamp;
                        
                        // Prioridade 2: Busca por texto se nada foi encontrado em campos padrão
                        if (!candidateDate) {
                            const dateKeys = keys.filter(k => 
                                k.toLowerCase().includes('date') || 
                                k.toLowerCase().includes('time') || 
                                k.toLowerCase().includes('orig')
                            ).sort();
                            
                            for (const dk of dateKeys) {
                                const val = metadata[dk];
                                if (val instanceof Date || (typeof val === 'string' && val.match(/^\d{4}/))) {
                                    candidateDate = val;
                                    console.log(`[Metadata] Data encontrada via busca heurística (${dk}):`, candidateDate);
                                    break;
                                }
                            }
                        }
                        
                        if (candidateDate) {
                            takenAt = (candidateDate instanceof Date) 
                                ? candidateDate.toISOString() 
                                : new Date(candidateDate).toISOString();
                            console.log(`%c[Metadata] ${originalName} -> DATA DETECTADA: ${takenAt}`, "color: green; font-weight: bold;");
                        } else {
                            // 2. Fallback para a data de modificação do arquivo (última tentativa local)
                            if ((fileToUpload as any).lastModified) {
                                takenAt = new Date((fileToUpload as any).lastModified).toISOString();
                                console.warn(`%c[Metadata] ${originalName} -> Nenhuma data Exif. Usando data do arquivo: ${takenAt}`, "color: orange;");
                            }
                        }
                        
                        if (metadata.latitude) lat = metadata.latitude;
                        if (metadata.longitude) lng = metadata.longitude;
                    } else {
                        console.warn(`[Metadata] exifr.parse retornou null para ${originalName}`);
                        if ((fileToUpload as any).lastModified) {
                            takenAt = new Date((fileToUpload as any).lastModified).toISOString();
                        }
                    }
                } catch (metaErr) {
                    console.error(`%c[Metadata] Falha crítica em ${originalName}:`, "color: red;", metaErr);
                    if ((fileToUpload as any).lastModified) {
                        takenAt = new Date((fileToUpload as any).lastModified).toISOString();
                    }
                }

                // 2. Convert HEIC/HEIF if needed using Cloudinary API
                const fileName = originalName.toLowerCase();
                const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif') || 
                              fileToUpload.type.includes('heic') || fileToUpload.type.includes('heif');

                if (isHeic) {
                    newFiles[i].status = 'converting';
                    setFiles([...newFiles]);
                    
                    console.log(`[Cloudinary] Convertendo ${originalName}...`);
                    fileToUpload = await convertHeicWithCloudinary(fileToUpload);
                    console.log(`[Cloudinary] Sucesso: ${fileToUpload.name}`);
                }

                // 3. Upload to Hostinger
                newFiles[i].status = 'uploading';
                setFiles([...newFiles]);

                const publicUrl = await uploadToHostinger(fileToUpload);

                // 3. Save to Supabase
                // Use original filename as title (without extension)
                const title = originalName.replace(/\.[^/.]+$/, "");
                const aspect = Math.random() > 0.5 ? 'wide' : 'square'; // Metadata simplification

                const { error: dbError } = await supabase
                    .from('photos')
                    .insert({
                        user_id: user.id,
                        url: publicUrl, // External Hostinger URL
                        title: title,
                        media_type: 'image',
                        aspect: aspect,
                        storage_path: null, // Important: External storage
                        taken_at: takenAt,
                        latitude: lat,
                        longitude: lng
                    });

                if (dbError) throw dbError;

                newFiles[i].status = 'success';
                newFiles[i].progress = 100;

            } catch (err: any) {
                console.error(err);
                newFiles[i].status = 'error';
                newFiles[i].error = err.message;
                hasError = true;
            }
            setFiles([...newFiles]);
        }

        setIsProcessing(false);
        if (!hasError && newFiles.length > 0) {
            alert('Uploads concluídos!');
            onSuccess?.();
        }
    };

    // --- VIDEO LOGIC ---

    const handleVideoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setVideoError('');
        setVideoLoading(true);

        try {
             const { data: { user } } = await supabase.auth.getUser();
             if (!user) throw new Error('Usuário não autenticado');

             const videoId = getYoutubeID(youtubeUrl);
             if (!videoId) throw new Error('Link do YouTube inválido.');

             const thumbnail = getVideoThumbnail(videoId);
             // No title input requested, use a generic one or fetch from YouTube API (complex).
             // Plan said "Input for YouTube URL" only.
             // We'll use "Video do YouTube" or the ID as title for now since we don't have an API key for Data API v3 configured.
             const title = `Video ${videoId}`;

             const { error: dbError } = await supabase
                .from('photos')
                .insert({
                    user_id: user.id,
                    url: thumbnail,
                    title: title,
                    media_type: 'video',
                    video_id: videoId,
                    aspect: 'video',
                    storage_path: null
                });

             if (dbError) throw dbError;

             alert('Vídeo adicionado!');
             setYoutubeUrl('');
             onSuccess?.();

        } catch (err: any) {
            setVideoError(err.message);
        } finally {
            setVideoLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-md transition-all"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header / Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-800">
                    <button
                        className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'photos' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        onClick={() => setActiveTab('photos')}
                    >
                        <span className="material-icons text-base align-middle mr-2">photo_library</span>
                        Enviar Fotos
                    </button>
                    <button
                        className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'video' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        onClick={() => setActiveTab('video')}
                    >
                         <span className="material-icons text-base align-middle mr-2">play_circle</span>
                        Adicionar Vídeo
                    </button>
                    <button onClick={onClose} className="px-4 text-slate-400 hover:text-slate-600">
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    
                    {activeTab === 'photos' && (
                        <div className="space-y-6">
                            {/* Dropzone */}
                            <div 
                                {...getRootProps()} 
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                            >
                                <input {...getInputProps()} />
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
                                    <span className="material-icons text-2xl">cloud_upload</span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-200 font-medium">Arraste fotos aqui ou clique para selecionar</p>
                                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP, HEIC (iPhone)</p>
                            </div>

                            {/* File List */}
                            {files.length > 0 && (
                                <div className="space-y-3">
                                    {files.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                            <div className="w-10 h-10 rounded overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                                                {item.file.name.toLowerCase().endsWith('.heic') || item.file.name.toLowerCase().endsWith('.heif') ? (
                                                    <span className="material-icons text-xl">insert_photo</span>
                                                ) : (
                                                    <img src={item.preview} className="w-full h-full object-cover" alt="preview" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between mb-1">
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate flex items-center gap-2">
                                                        {item.file.name}
                                                        {(item.file.name.toLowerCase().endsWith('.heic') || item.file.name.toLowerCase().endsWith('.heif')) && (
                                                            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1 rounded font-bold">HEIC</span>
                                                        )}
                                                    </p>
                                                    <span className={`text-xs font-semibold ${item.status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>
                                                        {item.status === 'pending' ? 'Aguardando' : 
                                                         item.status === 'converting' ? 'Convertendo HEIC...' :
                                                         item.status === 'uploading' ? 'Enviando...' :
                                                         item.status === 'success' ? 'Concluído' : 'Erro'}
                                                    </span>
                                                </div>
                                                {/* Progress Bar */}
                                                {(item.status === 'uploading' || item.status === 'converting') && (
                                                    <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className={`h-full ${item.status === 'converting' ? 'bg-amber-400 w-1/2 animate-pulse' : 'bg-primary w-2/3 animate-pulse'}`}></div>
                                                    </div>
                                                )}
                                                {item.status === 'error' && <p className="text-xs text-red-500 mt-1">{item.error}</p>}
                                            </div>
                                            {item.status !== 'success' && !isProcessing && (
                                                <button onClick={() => removeFile(index)} className="text-slate-400 hover:text-red-500">
                                                    <span className="material-icons text-lg">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                             {/* Actions */}
                             <div className="flex justify-end gap-3 pt-2">
                                <Button variant="ghost" onClick={onClose} disabled={isProcessing}>Cancelar</Button>
                                <Button 
                                    variant="primary" 
                                    onClick={processQueue} 
                                    disabled={files.length === 0 || isProcessing}
                                    icon={isProcessing ? 'sync' : 'send'}
                                >
                                    {isProcessing ? 'Processando...' : `Enviar ${files.length > 0 ? `(${files.length})` : ''}`}
                                </Button>
                             </div>
                        </div>
                    )}

                    {activeTab === 'video' && (
                        <form onSubmit={handleVideoSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Link do YouTube</label>
                                <div className="relative">
                                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">link</span>
                                    <input 
                                        type="url"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        placeholder="https://youtu.be/..."
                                        required
                                    />
                                </div>
                                {videoError && <p className="text-sm text-red-500 mt-2">{videoError}</p>}
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-xl text-sm flex gap-3">
                                <span className="material-icons shrink-0">info</span>
                                <p>O vídeo será adicionado à galeria como um link referenciado. Nenhum arquivo será enviado.</p>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-6">
                                <Button variant="ghost" type="button" onClick={onClose} disabled={videoLoading}>Cancelar</Button>
                                <Button 
                                    variant="primary" 
                                    type="submit" 
                                    disabled={videoLoading || !youtubeUrl}
                                    icon={videoLoading ? 'sync' : 'save'}
                                >
                                    {videoLoading ? 'Salvando...' : 'Adicionar Vídeo'}
                                </Button>
                             </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
};

export default UploadModal;
