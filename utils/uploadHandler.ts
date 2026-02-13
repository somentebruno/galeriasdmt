import { supabase } from '../lib/supabase';

/**
 * Uploads a file directly to Hostinger via the PHP upload script.
 * @param file The file to upload.
 * @returns The public URL of the uploaded file.
 */
export const uploadToHostinger = async (file: File): Promise<string> => {
    try {
        const formData = new FormData();
        // The PHP script expects the field name 'imagem'
        formData.append('imagem', file);
        
        const response = await fetch('https://saudedigitalfotos.brunolucasdev.com/upload.php', {
            method: 'POST',
            body: formData,
            headers: {
                // The PHP script expects this secret key in the Authorization header
                'Authorization': 'bruno_engenheiro_123'
            }
        });

        if (!response.ok) {
            let errorMessage = `Erro no servidor: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.mensagem || errorMessage;
            } catch (e) {
                // If not JSON, try text
                const text = await response.text().catch(() => '');
                if (text.includes('403 Forbidden')) {
                    errorMessage = "Acesso Negado (403): O servidor Hostinger bloqueou a requisição. Verifique o .htaccess ou ModSecurity.";
                }
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.status !== 'sucesso' || !data.url) {
            throw new Error(data.mensagem || 'Falha no upload');
        }

        return data.url;
    } catch (err: any) {
        console.error('Hostinger Upload error:', err);
        throw new Error(err.message || 'Falha ao enviar imagem para o servidor');
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
