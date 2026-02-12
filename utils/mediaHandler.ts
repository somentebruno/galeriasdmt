/**
 * Utilitário para manipulação de mídia (Upload Hostinger e YouTube)
 */

/**
 * Faz upload de uma imagem para o servidor Hostinger.
 * @param file Arquivo de imagem a ser enviado.
 * @returns Promise com a URL da imagem enviada.
 */
export const uploadToHostinger = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('imagem', file);

    try {
        const response = await fetch('https://saudedigitalfotos.brunolucasdev.com/upload.php', {
            method: 'POST',
            headers: {
                'Authorization': 'bruno_engenheiro_123',
                // Não definir Content-Type, o browser define automaticamente para multipart/form-data com boundary
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Falha no upload: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();

        // Assumindo que a API retorna algo como { url: '...' } ou a string direta. 
        // Ajuste conforme a resposta real da API se necessário.
        if (data.url) {
            return data.url;
        } else if (typeof data === 'string' && data.startsWith('http')) {
            return data;
        } else {
            // Se a resposta for diferente, vamos tentar extrair ou retornar o que veio
            // Caso a API retorne JSON com erro ou outra estrutura
            if (data.error) throw new Error(data.error);
            return data.toString();
        }

    } catch (error: any) {
        console.error('Erro detalhado no upload para Hostinger:', error);

        // Verifica se é erro de CORS ou Network
        if (error.message === 'Failed to fetch') {
            alert('Erro de conexão ou CORS ao tentar enviar para a Hostinger. Verifique se o servidor PHP aceita requisições deste domínio (localhost) e se o arquivo upload.php está acessível.');
        } else {
            alert(`Erro no upload: ${error.message}`);
        }

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
