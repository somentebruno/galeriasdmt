/**
 * Uploads a file using string reversal obfuscation to bypass strict firewalls (403).
 */
export const uploadToHostinger = async (file: File): Promise<string> => {
    try {
        const base64Full = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

        // Remove prefix 'data:image/...;base64,'
        const base64 = base64Full.split(',')[1];
        
        // Obfuscation: Reverse the string so the firewall doesn't recognize image headers
        const reversed = base64.split('').reverse().join('');

        const body = new URLSearchParams();
        body.append('a', 'bruno_engenheiro_123'); // auth
        body.append('d', reversed);               // data
        body.append('n', file.name);               // name

        const response = await fetch('https://saudedigitalfotos.brunolucasdev.com/galeria.php', {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            throw new Error(`Acesso negado pelo servidor (403). Verifique o ModSecurity no painel da Hostinger.`);
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
