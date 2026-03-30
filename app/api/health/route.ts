export async function GET() {
  return Response.json({
    status: "ok",
    service: "howtoprompt",
    timestamp: new Date().toISOString(),
  });
}
