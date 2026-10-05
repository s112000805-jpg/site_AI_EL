import { getPublicLearnerCount } from "@/db/progress";
import { getPublicVisitorCount } from "@/db/visitors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [visitorCount, learnerCount] = await Promise.all([
      getPublicVisitorCount(),
      getPublicLearnerCount(),
    ]);
    return Response.json({ visitorCount, learnerCount }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Public site statistics unavailable", error);
    return Response.json({ error: "網站統計暫時無法顯示" }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
