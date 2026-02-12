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
            throw new Error('Nenhuma imagem enviada');
        }

        const hostingerFormData = new FormData();
        hostingerFormData.append('imagem', file);

        console.log('Forwarding request to Hostinger...');

        const response = await fetch('https://saudedigitalfotos.brunolucasdev.com/upload.php', {
            method: 'POST',
            headers: {
                'Authorization': 'bruno_engenheiro_123'
            },
            body: hostingerFormData
        });

        const result = await response.text();
        console.log('Hostinger response status:', response.status);

        // Check if result is valid JSON
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(result);
        } catch (e) {
            // If not JSON, return as is (could be the URL string)
            return new Response(result, {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (!response.ok) {
            throw new Error(`Hostinger error: ${response.status} ${result}`);
        }

        return new Response(JSON.stringify(jsonResponse), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
