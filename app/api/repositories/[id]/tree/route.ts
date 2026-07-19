import { NextRequest, NextResponse } from "next/server";
import { getRepositoryTree } from "@/lib/services/repository-file-explorer.service";

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

    const repositoryTree = await getRepositoryTree(githubUrl, "main");

    return NextResponse.json({ success: true, ...repositoryTree });
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
