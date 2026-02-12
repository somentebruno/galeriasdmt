/**
 * Utilitário para manipulação de mídia (Upload Hostinger e YouTube)
 */

import { supabase } from '../lib/supabase';

/**
 * Faz upload de uma imagem para o Supabase Storage.
 * @param file Arquivo de imagem a ser enviado.
 * @returns Promise com a URL pública da imagem enviada.
 */
export const uploadToSupabase = async (file: File): Promise<string> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
            .from('photos')
            .upload(filePath, file);

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
