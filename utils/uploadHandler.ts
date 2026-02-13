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

        // Use fetch instead of invoke to get the full response body on error
        const response = await fetch('https://fptswbdbsxlaqvqzdiwt.supabase.co/functions/v1/upload-ftp', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => 'Unknown error');
            console.error('Edge Function Error:', errorBody);
            
            let message = 'Erro no componente de upload';
            try {
                const json = JSON.parse(errorBody);
                message = json.error || json.message || errorBody;
                if (json.details) console.log('DEBUG FTP:', json.details);
            } catch (e) {
                message = errorBody;
            }
            throw new Error(`Upload Falhou: ${message}`);
        }

        const data = await response.json();

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
