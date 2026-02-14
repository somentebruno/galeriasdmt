/**
 * THE TROJAN HORSE: Ultra-stealth upload for Hostinger.
 * Sends 10KB chunks as raw text to bypass ModSecurity 403 errors.
 */
// Use VITE_ prefix for Vite projects, but checking for both to be safe
const UPLOAD_URL = (import.meta as any).env?.VITE_UPLOAD_URL || (import.meta as any).env?.NEXT_PUBLIC_UPLOAD_URL || 'https://api.brunolucasdev.com/upload.php';

/**
 * Standard upload for Hostinger API.
 * Sends the file as multipart/form-data.
 */
export const uploadToHostinger = async (file: File): Promise<string> => {
    // 6. Validation: Limit size (10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
        throw new Error('O arquivo é muito grande. O limite é de 10MB.');
    }

    // 6. Validation: Accept only images
    if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo não é uma imagem válida.');
    }

    try {
        const formData = new FormData();
        // 3. multipart/form-data using "file" field
        formData.append('file', file);

        // 3. fetch with POST
        const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: formData,
            // 7. No manual Content-Type header (browser sets boundary)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload falhou: ${errorText || response.statusText}`);
        }

        // 4. Handle response (JSON or Text)
        const resText = await response.text();
        let publicUrl = '';

        try {
            const data = JSON.parse(resText);
            // Expected JSON format contains URL or relative path
            if (data.url) {
                publicUrl = data.url;
            } else if (data.file_name) {
                // 5. Build URL from filename if provided
                publicUrl = `https://api.brunolucasdev.com/uploads/${data.file_name}`;
            }
        } catch (e) {
            // Not JSON, use response text as fallback if it looks like a URL
            if (resText.startsWith('http')) {
                publicUrl = resText.trim();
            } else {
                throw new Error(`Resposta do servidor inválida: ${resText}`);
            }
        }

        if (!publicUrl) {
            throw new Error('O servidor não retornou o link da imagem.');
        }

        return publicUrl;

    } catch (err: any) {
        console.error('API upload error:', err);
        throw new Error(err.message || 'Erro de comunicação com o servidor de upload');
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
