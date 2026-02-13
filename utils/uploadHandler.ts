/**
 * Uploads a file using JSON + String Reversal to bypass strict WAF filters.
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
        const reversed = base64.split('').reverse().join('');

        const response = await fetch('https://saudedigitalfotos.brunolucasdev.com/galeria.php', {
            method: 'POST',
            body: JSON.stringify({
                a: 'bruno_engenheiro_123',
                d: reversed,
                n: file.name
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
           if (response.status === 403) {
               throw new Error('O Firewall da Hostinger bloqueou o envio. Tente fotos menores ou verifique o arquivo galeria.php.');
           }
           throw new Error(`Erro no servidor (Status: ${response.status})`);
        }

        const data = await response.json();
        if (!data.url) throw new Error('Servidor não retornou o link.');

        return data.url;
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
