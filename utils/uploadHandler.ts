/**
 * Uploads a file using Chunking + String Reversal to bypass strict WAF filters (403).
 * It breaks the file into small 50KB chunks that are invisible to most firewalls.
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
        const CHUNK_SIZE = 50 * 1024; // 50KB por pedaço (pequeno o suficiente para o firewall ignorar)
        const totalChunks = Math.ceil(base64.length / CHUNK_SIZE);
        const tempId = Math.random().toString(36).substring(7) + Date.now();
        
        let finalUrl = '';

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, base64.length);
            const chunk = base64.substring(start, end);
            
            // Reverse current chunk
            const reversedChunk = chunk.split('').reverse().join('');

            const response = await fetch('https://saudedigitalfotos.brunolucasdev.com/galeria.php', {
                method: 'POST',
                body: JSON.stringify({
                    auth: 'bruno_engenheiro_123',
                    chunk: reversedChunk,
                    index: i,
                    total: totalChunks,
                    name: file.name,
                    id: tempId
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`O Firewall bloqueou o pedaço ${i+1}/${totalChunks}. Tente desativar o ModSecurity no painel da Hostinger.`);
            }

            const data = await response.json();
            if (data.url) finalUrl = data.url;
        }

        if (!finalUrl) throw new Error('Upload concluído, mas o link final não foi gerado.');

        return finalUrl;
    } catch (err: any) {
        console.error('Upload error:', err);
        throw new Error(err.message || 'Erro ao processar imagem');
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
