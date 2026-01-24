import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.REVALIDATION_SECRET}`) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  console.log("Home page revalidation triggered");

  try {
    revalidatePath("/");

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error revalidating", error: error },
      { status: 500 },
    );
  }
}
