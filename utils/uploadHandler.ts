import { supabase } from '../lib/supabase';

/**
 * Uploads a file to Supabase Storage.
 * This replaces the Hostinger/FTP method to bypass 403 firewall errors.
 */
export const uploadToHostinger = async (file: File): Promise<string> => {
    try {
        // Sanitize filename
        const ext = file.name.split('.').pop();
        const cleanName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

        const { data, error } = await supabase.storage
            .from('fotos')
            .upload(cleanName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Supabase Storage Error:', error);
            throw new Error(error.message);
        }

        // Get the Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('fotos')
            .getPublicUrl(cleanName);

        return publicUrl;
    } catch (err: any) {
        console.error('Upload error:', err);
        throw new Error(err.message || 'Erro ao fazer upload para o armazenamento');
    }
};

/**
 * Extracts YouTube Video ID from a URL.
 * Supports various formats: youtube.com, youtu.be, embed, etc.
 */
export const getYoutubeID = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Returns the high-resolution thumbnail URL for a YouTube video ID.
 */
export const getVideoThumbnail = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};
