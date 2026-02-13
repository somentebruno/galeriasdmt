/**
 * Uploads a file to Hostinger using a stealthy JSON/Base64 method to bypass firewalls.
 */
export const uploadToHostinger = async (file: File): Promise<string> => {
    try {
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

        const response = await fetch('https://saudedigitalfotos.brunolucasdev.com/galeria.php', {
            method: 'POST',
            body: JSON.stringify({
                auth: 'bruno_engenheiro_123',
                data: base64,
                name: file.name
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Servidor recusou a conexão (Status: ${response.status})`);
        }

        const data = await response.json();
        if (!data.url) throw new Error('O servidor não retornou o link da imagem.');

        return data.url;
    } catch (err: any) {
        console.error('Upload error:', err);
        throw new Error(err.message || 'Falha ao processar upload');
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
