import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    let githubUrl = "";
    try {
      const base64 = id.replace(/-/g, "+").replace(/_/g, "/");
      githubUrl = Buffer.from(base64, "base64").toString("utf8");
    } catch {
      return NextResponse.json({ success: false, message: "Invalid repository ID format" }, { status: 400 });
    }

    if (!githubUrl.startsWith("https://github.com/")) {
      return NextResponse.json({ success: false, message: "Invalid repository URL" }, { status: 400 });
    }

    const name = githubUrl.replace(/^https:\/\/(www\.)?github\.com\//, "").replace(/\/$/, "");

    const repository = {
      _id: id,
      name,
      githubUrl,
      branch: "main",
      status: "ready",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, repository });
  } catch (error: any) {
    if (error.type === "github_rate_limit") {
      return NextResponse.json({
        success: false,
        error: "GitHub API rate limit exceeded.",
        message: "Configure a GitHub Personal Access Token or wait until the limit resets.",
        type: "github_rate_limit"
      }, { status: 429 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
