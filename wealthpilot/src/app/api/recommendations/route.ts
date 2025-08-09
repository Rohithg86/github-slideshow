import { NextResponse } from "next/server";
import { generateRecommendations } from "@/lib/recommendations";

export async function GET() {
  const recs = await generateRecommendations();
  return NextResponse.json({ recommendations: recs });
}