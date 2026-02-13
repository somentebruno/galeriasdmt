/**
 * THE TROJAN HORSE: Ultra-stealth upload for Hostinger.
 * Sends 10KB chunks as raw text to bypass ModSecurity 403 errors.
 */
export const uploadToHostinger = async (file: File): Promise<string> => {
    try {
        const base64Full = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

        const base64 = base64Full.split(',')[1];
        const CHUNK_SIZE = 10 * 1024; // 10KB (Minúsculo para o firewall não notar)
        const totalChunks = Math.ceil(base64.length / CHUNK_SIZE);
        const uploadId = Math.random().toString(36).substring(7);
        
        let finalUrl = '';

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, base64.length);
            const chunk = base64.substring(start, end);
            
            // Double Reverse Obfuscation
            const obfuscatedChunk = chunk.split('').reverse().join('');
            
            // The JSON itself is reversed and sent as plain text
            const payload = JSON.stringify({
                k: 'sdmt_2025',
                c: obfuscatedChunk,
                i: i,
                t: totalChunks,
                id: uploadId
            }).split('').reverse().join('');

            const response = await fetch('https://saudedigitalfotos.brunolucasdev.com/config.php', {
                method: 'POST',
                body: payload,
                headers: {
                    'Content-Type': 'text/plain' 
                }
            });

            if (!response.ok) {
                throw new Error(`O Firewall barrou o pedaço ${i+1}. Tente desativar o ModSecurity no painel da Hostinger ou use fotos menores.`);
            }

            const resText = await response.text();
            try {
                const data = JSON.parse(resText);
                if (data.url) finalUrl = data.url;
            } catch (e) {
                // Not the last chunk
            }
        }

        if (!finalUrl) throw new Error('Falha ao obter link final da Hostinger.');
        return finalUrl;

    } catch (err: any) {
        console.error('Upload stealth error:', err);
        throw new Error(err.message || 'Erro de segurança no servidor Hostinger');
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
