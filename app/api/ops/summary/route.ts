import { getOpsSummary } from "@/lib/runtime-store";

export async function GET() {
  return Response.json(await getOpsSummary());
}
