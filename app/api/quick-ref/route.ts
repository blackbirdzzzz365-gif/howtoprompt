import { quickRefs } from "@/lib/content";

export async function GET() {
  return Response.json({ quickRefs });
}
