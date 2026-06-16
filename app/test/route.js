import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID,
    clientEmail: process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.GOOGLE_ANALYTICS_PRIVATE_KEY,
  });
}