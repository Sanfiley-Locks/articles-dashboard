import { getPrisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  const { filename } = await params;
  const upload = await getPrisma().upload.findUnique({ where: { filename } });
  if (!upload) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(upload.data), {
    headers: {
      "Content-Type": upload.mimeType,
      "Content-Length": String(upload.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
