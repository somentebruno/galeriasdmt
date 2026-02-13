import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as ftp from "npm:basic-ftp@5.0.3";
import { Buffer } from "node:buffer";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get file from request
    const formData = await req.formData();
    const file = formData.get('file');
    const filename = formData.get('filename') as string;

    if (!file || !filename) {
      return new Response(JSON.stringify({ error: 'File or filename missing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!(file instanceof File)) {
       return new Response(JSON.stringify({ error: 'Uploaded content is not a file' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const buffer = await file.arrayBuffer();
    const nodeBuffer = Buffer.from(buffer);
    
    // 2. FTP Connection
    const client = new ftp.Client();
    // client.ftp.verbose = true; // Uncomment for debugging
    
    const host = Deno.env.get('FTP_HOST');
    const user = Deno.env.get('FTP_USER');
    const password = Deno.env.get('FTP_PASS');
    const port = parseInt(Deno.env.get('FTP_PORT') || '21');
    const secure = Deno.env.get('FTP_SECURE') === 'true'; // Set to 'true' for FTPS

    if (!host || !user || !password) {
        throw new Error('Missing FTP configuration');
    }

    try {
        await client.access({
            host,
            user,
            password,
            port,
            secure: secure ? true : false, // Default false (plain FTP) or use "implicit"
        });

        // 3. Upload
        // Target directory: /public_html/uploads (adjust based on hosting)
        // We will upload to a 'uploads' folder in the root of the FTP user's home
        const remoteDir = 'public_html/uploads'; 
        await client.ensureDir(remoteDir);
        
        // Upload file
        // uploadFrom(source, remotePath)
        await client.uploadFrom(nodeBuffer, `${remoteDir}/${filename}`);
        
    } finally {
        client.close();
    }

    // 4. Return Public URL
    // The user needs to configure the Base URL that maps to the FTP folder
    // e.g. https://mysite.com/uploads
    const publicUrlBase = Deno.env.get('FTP_PUBLIC_URL');
    if (!publicUrlBase) {
        throw new Error('FTP_PUBLIC_URL env var not set');
    }
    
    // Ensure no double slash
    const sanitizedBase = publicUrlBase.replace(/\/$/, "");
    const publicUrl = `${sanitizedBase}/${filename}`;

    return new Response(JSON.stringify({ 
        message: 'Upload successful',
        publicUrl: publicUrl,
        filename: filename
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
