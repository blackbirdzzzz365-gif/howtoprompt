import { missions } from "@/lib/content";

export async function GET() {
  return Response.json({ missions });
}
