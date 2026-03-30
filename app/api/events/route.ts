import { recordEvent, savePathSelection } from "@/lib/runtime-store";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userId?: string;
    event?: string;
    payload?: Record<string, string | number | boolean | null>;
  };

  if (!body.userId || !body.event) {
    return Response.json({ error: "userId and event are required" }, { status: 400 });
  }

  if (body.event === "path_selected" && typeof body.payload?.pathSlug === "string") {
    await savePathSelection(body.userId, body.payload.pathSlug);
  }

  const event = await recordEvent(body.userId, body.event, body.payload ?? {});
  return Response.json({ ok: true, event });
}
