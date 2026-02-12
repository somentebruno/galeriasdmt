/**
 * Utilitário para manipulação de mídia (Upload Hostinger e YouTube)
 */

import heic2any from 'heic2any';

/**
 * Faz upload de uma imagem para o servidor Hostinger via PHP.
 * Converte HEIC para JPEG automaticamente antes do envio.
 * @param file Arquivo de imagem a ser enviado.
 * @returns Promise com a URL da imagem enviada.
 */
export const uploadToHostinger = async (file: File): Promise<string> => {
    try {
        let fileToUpload = file;

        // Converte HEIC para JPEG se necessário
        if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
            console.log('Detectado arquivo HEIC. Convertendo para JPEG...');
            try {
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.8
                });

                const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
                fileToUpload = new File([blob], newFileName, { type: 'image/jpeg' });
            } catch (convError) {
                console.error('Erro na conversão HEIC:', convError);
            }
        }

        const formData = new FormData();
        formData.append('imagem', fileToUpload);
        formData.append('token', 'bruno_engenheiro_123'); // Send token in body to avoid CORS preflight

        const response = await fetch('https://saudedigitalfotos.brunolucasdev.com/upload.php', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Falha no upload Hostinger: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        if (data.url) {
            return data.url;
        } else if (typeof data === 'string' && data.startsWith('http')) {
            return data;
        } else {
            if (data.error) throw new Error(data.error);
            return data.toString();
        }

    } catch (error: any) {
        console.error('Erro upload Hostinger:', error);
        throw error;
    }
};

/**
 * Extrai o ID de um vídeo do YouTube a partir de várias URLs possíveis.
 * Suporta: youtu.be, youtube.com/watch?v=, embed, etc.
 * @param url URL completa do vídeo.
 * @returns ID do vídeo ou null se inválido.
 */
export const getYoutubeID = (url: string): string | null => {
    if (!url) return null;

    // Regex robusto para capturar ID do YouTube
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11) ? match[2] : null;
};
