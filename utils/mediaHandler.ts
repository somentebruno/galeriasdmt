/**
 * Utilitário para manipulação de mídia (Upload Hostinger e YouTube)
 */

import { supabase } from '../lib/supabase';
import heic2any from 'heic2any';

/**
 * Faz upload de uma imagem para o Supabase Storage.
 * Converte HEIC para JPEG automaticamente.
 * @param file Arquivo de imagem a ser enviado.
 * @returns Promise com a URL pública da imagem enviada.
 */
export const uploadToSupabase = async (file: File): Promise<string> => {
    try {
        let fileToUpload = file;

        // Check for HEIC/HEIF
        if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
            console.log('Detectado arquivo HEIC. Convertendo para JPEG...');
            try {
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.8
                });

                // heic2any can return Blob or Blob[]
                const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

                // Create new File from Blob
                const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
                fileToUpload = new File([blob], newFileName, { type: 'image/jpeg' });
                console.log('Conversão concluída:', newFileName);
            } catch (convError) {
                console.error('Erro na conversão HEIC:', convError);
                // Fallback: try uploading original if conversion fails, though it won't display
            }
        }

        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
            .from('photos')
            .upload(filePath, fileToUpload);

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error: any) {
        console.error('Erro detalhado no upload para Supabase:', error);
        throw new Error(`Falha no upload: ${error.message}`);
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
