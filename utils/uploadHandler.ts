/**
 * THE TROJAN HORSE: Ultra-stealth upload for Hostinger.
 * Sends 10KB chunks as raw text to bypass ModSecurity 403 errors.
 */
export const uploadToHostinger = async (file: File): Promise<string> => {
    try {
        const CHUNK_SIZE = 256 * 1024; // 256KB
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const uploadId = Math.random().toString(36).substring(7) + '-' + Date.now();
        
        let finalUrl = '';

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunkBlob = file.slice(start, end);

            const formData = new FormData();
            formData.append('id', uploadId);
            formData.append('i', String(i));
            formData.append('t', String(totalChunks));
            formData.append('filename', file.name);
            formData.append('chunk', chunkBlob, `chunk_${i}.bin`);

            const response = await fetch('https://saudedigitalfotos.brunolucasdev.com/api/v1/handler.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-SDMT-Access': 'sdmt_secret_2025'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload falhou no pedaço ${i + 1}: ${errorText || response.statusText}`);
            }

            const resText = await response.text();
            try {
                const data = JSON.parse(resText);
                if (data.url) finalUrl = data.url;
            } catch (e) {
                // Not the last chunk or simple success response
            }
        }

        if (!finalUrl) throw new Error('Falha ao obter link final da Hostinger.');
        return finalUrl;

    } catch (err: any) {
        console.error('Hostinger upload error:', err);
        throw new Error(err.message || 'Erro de comunicação com o servidor Hostinger');
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
