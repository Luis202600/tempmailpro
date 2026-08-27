// ads.txt para Google AdSense.
// Define NEXT_PUBLIC_ADSENSE_CLIENT (p. ej. "ca-pub-1234567890123456") y esta
// ruta servirá automáticamente el registro correcto para tu publicador.
export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  const body = client
    ? `google.com, ${client.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`
    : "# Configura NEXT_PUBLIC_ADSENSE_CLIENT (ej. ca-pub-0000000000000000) para publicar tu ads.txt\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
