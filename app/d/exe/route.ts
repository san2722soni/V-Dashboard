import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/clientBuild/getActiveDownload?platform=windows`,
      { cache: "no-store" }
    );
    const result = await res.json();

    if (result?.success && result?.data?.downloadUrl) {
      return NextResponse.redirect(result.data.downloadUrl);
    }

    return new NextResponse("No active build available.", { status: 404 });
  } catch {
    return new NextResponse("Failed to fetch download link.", { status: 500 });
  }
}
