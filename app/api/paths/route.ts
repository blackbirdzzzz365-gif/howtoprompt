import { learningPaths } from "@/lib/content";

export async function GET() {
  return Response.json({ paths: learningPaths });
}
