import { supabase } from '../lib/supabase';

/**
 * Uploads a file via Supabase Edge Function which handles FTP to Hostinger.
 */
export const uploadToHostinger = async (file: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Sanitize filename: remove spaces and special chars, keep extension
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        // Add timestamp to ensure uniqueness
        const uniqueName = `${Date.now()}_${cleanName}`;
        formData.append('filename', uniqueName);

        const { data, error } = await supabase.functions.invoke('upload-ftp', {
            body: formData,
        });

        if (error) {
            // Supabase client might wrap the error. Let's try to get the message from the body if possible
            let msg = error.message;
            if (error instanceof Error && 'details' in error) {
                console.error('Edge Function Details:', (error as any).details);
            }
            throw new Error(`Erro na Edge Function: ${msg}`);
        }

        if (!data || !data.publicUrl) {
             throw new Error('Upload failed: No URL returned');
        }

        return data.publicUrl;
    } catch (err: any) {
        console.error('Upload error:', err);
        throw new Error(err.message || 'Falha no upload via FTP');
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
