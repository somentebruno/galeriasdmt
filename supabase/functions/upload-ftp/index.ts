import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as ftp from "npm:basic-ftp@5.0.3";
import { Buffer } from "node:buffer";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const filename = formData.get('filename') as string;

    if (!file || !filename || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'Invalid file upload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const buffer = await file.arrayBuffer();
    const nodeBuffer = Buffer.from(buffer);
    
    const client = new ftp.Client();
    
    const host = Deno.env.get('FTP_HOST');
    const user = Deno.env.get('FTP_USER');
    const password = Deno.env.get('FTP_PASS');
    const port = parseInt(Deno.env.get('FTP_PORT') || '21');
    const secure = Deno.env.get('FTP_SECURE') === 'true';

    if (!host || !user || !password) {
        throw new Error('Supabase Edge Function: Missing FTP Secrets');
    }

    try {
        await client.access({ host, user, password, port, secure });
        
        // Target directory on Hostinger
        const remoteDir = Deno.env.get('FTP_DIR') || 'public_html/saudedigitalfotos/uploads';
        await client.ensureDir(remoteDir);
        await client.uploadFrom(nodeBuffer, `${remoteDir}/${filename}`);
        
    } finally {
        client.close();
    }

    const publicUrlBase = Deno.env.get('FTP_PUBLIC_URL') || 'https://saudedigitalfotos.brunolucasdev.com/uploads/';
    const sanitizedBase = publicUrlBase.replace(/\/$/, "");
    const publicUrl = `${sanitizedBase}/${filename}`;

    return new Response(JSON.stringify({ 
        message: 'Upload successful',
        publicUrl: publicUrl
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
