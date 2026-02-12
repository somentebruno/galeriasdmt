import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('imagem');

        if (!file) {
            return new Response(JSON.stringify({ error: 'Nenhuma imagem enviada' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const hostingerFormData = new FormData();
        hostingerFormData.append('imagem', file);

        console.log('Mimicking browser request to Hostinger...');

        const response = await fetch('https://saudedigitalfotos.brunolucasdev.com/upload.php', {
            method: 'POST',
            headers: {
                'Authorization': 'bruno_engenheiro_123',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://saudedigitalfotos.brunolucasdev.com/',
                'Origin': 'https://saudedigitalfotos.brunolucasdev.com/'
            },
            body: hostingerFormData
        });

        const result = await response.text();
        console.log(`Hostinger Response Status: ${response.status}`);

        if (response.status === 403 || result.includes('Forbidden')) {
            return new Response(JSON.stringify({
                error: 'A Hostinger bloqueou o envio (403 Forbidden). Isso é um bloqueio de rede no servidor deles.',
                detail: result.substring(0, 200)
            }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        let finalResponse;
        try {
            finalResponse = JSON.parse(result);
        } catch (e) {
            finalResponse = { url: result.trim() };
        }

        return new Response(JSON.stringify(finalResponse), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Proxy Exception:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
