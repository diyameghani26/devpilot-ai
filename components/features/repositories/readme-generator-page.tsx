"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Code2,
  Download,
  Eye,
  FileText,
  GitBranch,
  Layers3,
  Lightbulb,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Template = "minimal" | "standard" | "comprehensive";

type SectionKey =
  | "overview"
  | "features"
  | "tech"
  | "installation"
  | "usage"
  | "api"
  | "contributing"
  | "license";

const COPYRIGHT_YEAR = 2026;

// ─── Static data ──────────────────────────────────────────────────────────────

const TEMPLATES: {
  value: Template;
  label: string;
  description: string;
  sections: SectionKey[];
}[] = [
  {
    value: "minimal",
    label: "Minimal",
    description: "Overview, installation, and license only.",
    sections: ["overview", "installation", "license"],
  },
  {
    value: "standard",
    label: "Standard",
    description: "All the essentials for open-source projects.",
    sections: ["overview", "features", "tech", "installation", "usage", "contributing", "license"],
  },
  {
    value: "comprehensive",
    label: "Comprehensive",
    description: "Full documentation including API reference.",
    sections: ["overview", "features", "tech", "installation", "usage", "api", "contributing", "license"],
  },
];

const SECTIONS: { key: SectionKey; label: string; description: string }[] = [
  { key: "overview", label: "Project overview", description: "Name, description, and badges" },
  { key: "features", label: "Features", description: "Key capabilities list" },
  { key: "tech", label: "Tech stack", description: "Detected technologies table" },
  { key: "installation", label: "Installation", description: "Setup and prerequisites" },
  { key: "usage", label: "Usage", description: "Quick-start code examples" },
  { key: "api", label: "API reference", description: "Endpoint documentation" },
  { key: "contributing", label: "Contributing", description: "Contribution guidelines" },
  { key: "license", label: "License", description: "License and legal notices" },
];

// ─── Markdown builder ─────────────────────────────────────────────────────────

function buildReadme(sections: Set<SectionKey>): string {
  const lines: string[] = [];

  if (sections.has("overview")) {
    lines.push(
      "# devpilot-ai",
      "",
      "![Build](https://img.shields.io/github/actions/workflow/status/demo/devpilot-ai/ci.yml?branch=main&style=flat-square) ![License](https://img.shields.io/github/license/demo/devpilot-ai?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)",
      "",
      "> AI-powered code intelligence platform. Analyse repositories, explore architecture, detect security vulnerabilities, and generate documentation — all in one workspace.",
      "",
    );
  }

  if (sections.has("features")) {
    lines.push(
      "## Features",
      "",
      "- **Repository analysis** — Understand code health, complexity, and quality at a glance",
      "- **Architecture explorer** — Visual map of module boundaries, dependencies, and folder roles",
      "- **Security scanner** — Detect exposed secrets, vulnerable packages, and injection risks",
      "- **Bug detection** — Surface runtime and logic errors before they reach production",
      "- **AI chat assistant** — Ask questions about any part of your codebase in plain language",
      "- **README generator** — Produce structured documentation from repository context",
      "",
    );
  }

  if (sections.has("tech")) {
    lines.push(
      "## Tech stack",
      "",
      "| Layer | Technology |",
      "|---|---|",
      "| Framework | Next.js 16 (App Router) |",
      "| Language | TypeScript 5 |",
      "| Styling | Tailwind CSS v4 |",
      "| Animation | Framer Motion |",
      "| Icons | Lucide React |",
      "| Package manager | npm |",
      "",
    );
  }

  if (sections.has("installation")) {
    lines.push(
      "## Installation",
      "",
      "**Prerequisites:** Node.js ≥ 20, npm ≥ 10",
      "",
      "```bash",
      "# Clone the repository",
      "git clone https://github.com/demo/devpilot-ai.git",
      "cd devpilot-ai",
      "",
      "# Install dependencies",
      "npm install",
      "",
      "# Copy environment variables",
      "cp .env.example .env.local",
      "```",
      "",
    );
  }

  if (sections.has("usage")) {
    lines.push(
      "## Usage",
      "",
      "```bash",
      "# Start the development server",
      "npm run dev",
      "",
      "# Build for production",
      "npm run build && npm start",
      "```",
      "",
      "Open http://localhost:3000 to access the workspace. Upload a repository from the Add repository page to begin analysis.",
      "",
    );
  }

  if (sections.has("api")) {
    lines.push(
      "## API reference",
      "",
      "### POST /api/repositories",
      "",
      "Upload and register a repository for analysis.",
      "",
      "| Parameter | Type | Description |",
      "|---|---|---|",
      "| name | string | Repository display name |",
      "| url | string | Remote URL or upload path |",
      "| branch | string? | Target branch (default: main) |",
      "",
      "### GET /api/repositories/:id/analysis",
      "",
      "Retrieve the latest analysis report for a repository.",
      "",
    );
  }

  if (sections.has("contributing")) {
    lines.push(
      "## Contributing",
      "",
      "Contributions are welcome. Please open an issue to discuss your idea before submitting a pull request.",
      "",
      "```bash",
      "# Run the linter before committing",
      "npm run lint",
      "```",
      "",
      "By contributing you agree that your changes will be licensed under the same terms as this project.",
      "",
    );
  }

  if (sections.has("license")) {
    lines.push(
      "## License",
      "",
      `MIT © ${COPYRIGHT_YEAR} DevPilot AI`,
      "",
    );
  }

  return lines.join("\n");
}

// ─── Inline markdown renderer helper ─────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-medium text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-foreground">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      })}
    </>
  );
}

// ─── Preview renderer ─────────────────────────────────────────────────────────

function ReadmePreview({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="mb-3 mt-1 text-xl font-semibold tracking-[-0.03em] text-foreground">
          {line.slice(2)}
        </h1>,
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="mb-2 mt-6 border-b border-border pb-2 text-sm font-semibold text-foreground">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="mb-1.5 mt-4 text-xs font-semibold text-foreground">
          {renderInline(line.slice(4))}
        </h3>,
      );
    } else if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={`code-${i}`} className="my-3 overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-[11px] leading-5 text-muted-foreground">
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
    } else if (line.startsWith("|")) {
      const tableLines: string[] = [line];
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith("|")) {
        tableLines.push(lines[j]);
        j++;
      }
      const dataRows = tableLines.filter((l) => !/^\|[\s\-|:]+\|$/.test(l));
      const [headerRow, ...bodyRows] = dataRows;
      const headerCells = headerRow?.split("|").filter(Boolean).map((c) => c.trim()) ?? [];
      elements.push(
        <div key={`table-${i}`} className="my-3 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {headerCells.map((cell, ci) => (
                  <th key={ci} className="border border-border bg-secondary px-3 py-1.5 text-left font-medium text-muted-foreground">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri}>
                  {row.split("|").filter(Boolean).map((cell, ci) => (
                    <td key={ci} className="border border-border px-3 py-1.5 text-muted-foreground">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      i = j - 1;
    } else if (line.startsWith("- ")) {
      const items: string[] = [line.slice(2)];
      let j = i + 1;
      while (j < lines.length && lines[j].startsWith("- ")) {
        items.push(lines[j].slice(2));
        j++;
      }
      elements.push(
        <ul key={`list-${i}`} className="my-2 space-y-1.5 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>,
      );
      i = j - 1;
    } else if (line.startsWith("![")) {
      elements.push(
        <div key={`badges-${i}`} className="my-2 flex flex-wrap gap-1.5">
          {["Build: passing", "License: MIT", "TypeScript: 5"].map((badge) => (
            <span key={badge} className="inline-flex h-5 items-center rounded-sm border border-border bg-secondary px-2 font-mono text-[10px] text-muted-foreground">
              {badge}
            </span>
          ))}
        </div>,
      );
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={`quote-${i}`} className="my-2 border-l-2 border-border pl-3 text-xs italic leading-5 text-muted-foreground">
          {line.slice(2)}
        </blockquote>,
      );
    } else if (line.trim() !== "") {
      elements.push(
        <p key={`p-${i}`} className="text-xs leading-5 text-muted-foreground">
          {renderInline(line)}
        </p>,
      );
    }

    i++;
  }

  return <div className="py-1">{elements}</div>;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ReadmeSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-6 px-5 py-9 sm:px-8 lg:py-12">
      <div className="h-5 w-36 rounded bg-muted" />
      <div className="h-10 w-80 rounded bg-muted" />
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="h-44 rounded-xl bg-muted" />
          <div className="h-72 rounded-xl bg-muted" />
          <div className="h-20 rounded-xl bg-muted" />
        </div>
        <div className="h-[520px] rounded-xl bg-muted" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ReadmeGeneratorPage() {
  const [template, setTemplate] = React.useState<Template>("standard");
  const [enabledSections, setEnabledSections] = React.useState<Set<SectionKey>>(
    new Set(TEMPLATES.find((t) => t.value === "standard")!.sections),
  );
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isGenerated, setIsGenerated] = React.useState(false);
  const [view, setView] = React.useState<"preview" | "markdown">("preview");
  const [copied, setCopied] = React.useState(false);
  const [downloaded, setDownloaded] = React.useState(false);

  const readme = buildReadme(enabledSections);

  const handleTemplateChange = (value: Template) => {
    setTemplate(value);
    setEnabledSections(new Set(TEMPLATES.find((t) => t.value === value)!.sections));
    setIsGenerated(false);
  };

  const toggleSection = (key: SectionKey) => {
    setEnabledSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setIsGenerated(false);
  };

  const generate = () => {
    setIsGenerating(true);
    setIsGenerated(false);
    window.setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 900);
  };

  const copy = () => {
    navigator.clipboard.writeText(readme).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const download = () => {
    const blob = new Blob([readme], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2200);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link
            href="/repositories/analysis"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Analysis
          </Link>

          <div className="flex items-center gap-2">
            <AnimatePresence initial={false} mode="wait">
              {isGenerated ? (
                <motion.span
                  key="done"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  <Badge variant="success">
                    <CheckCircle2 className="size-3" />
                    README ready
                  </Badge>
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="hidden sm:inline-flex"
                >
                  <Badge variant="neutral">
                    <FileText className="size-3" />
                    README generator
                  </Badge>
                </motion.span>
              )}
            </AnimatePresence>

            <Button variant="ghost" size="sm" onClick={copy} disabled={!isGenerated}>
              {copied ? <Check className="size-3.5" /> : <ClipboardCopy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>

            <Button size="sm" onClick={isGenerated ? download : generate} disabled={isGenerating}>
              {isGenerating ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : isGenerated ? (
                <Download className="size-3.5" />
              ) : (
                <Wand2 className="size-3.5" />
              )}
              {isGenerating
                ? "Generating…"
                : isGenerated
                  ? downloaded
                    ? "Downloaded"
                    : "Download"
                  : "Generate"}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ReadmeSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:py-12"
          >
            {/* ── Hero ── */}
            <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="info">
                    <BookOpen className="size-3" />
                    README generator
                  </Badge>
                  <span className="text-xs text-muted-foreground">UI preview · devpilot-ai</span>
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                  Turn your code into clear documentation.
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                  DevPilot reads your repository and assembles a structured README from detected technologies, project layout, and analysis context.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                <GitBranch className="size-4 text-muted-foreground" />
                <div>
                  <p className="font-mono text-xs font-medium">main</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">18 modules · 142 files</p>
                </div>
              </div>
            </section>

            {/* ── Main grid ── */}
            <section className="mt-8 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
              {/* Left: configuration */}
              <div className="space-y-5">
                {/* Template */}
                <Card>
                  <CardHeader className="border-b border-border pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Template</CardTitle>
                        <CardDescription className="mt-1">Choose a starting structure.</CardDescription>
                      </div>
                      <Layers3 className="size-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 p-4">
                    {TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.value}
                        type="button"
                        onClick={() => handleTemplateChange(tpl.value)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          template === tpl.value
                            ? "border-ring/50 bg-accent"
                            : "border-border bg-surface hover:bg-surface-raised",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium">{tpl.label}</p>
                          {template === tpl.value && <Check className="size-3 shrink-0 text-muted-foreground" />}
                        </div>
                        <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{tpl.description}</p>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Sections */}
                <Card>
                  <CardHeader className="border-b border-border pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Sections</CardTitle>
                        <CardDescription className="mt-1">Toggle which sections to include.</CardDescription>
                      </div>
                      <SlidersHorizontal className="size-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="divide-y divide-border p-0">
                    {SECTIONS.map(({ key, label, description }) => {
                      const active = enabledSections.has(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleSection(key)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          <span
                            className={cn(
                              "grid size-4 shrink-0 place-items-center rounded border transition-colors",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-surface",
                            )}
                          >
                            {active && <Check className="size-2.5" strokeWidth={3} />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium">{label}</p>
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* AI insight */}
                <div className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex gap-2.5">
                    <Bot className="mt-0.5 size-3.5 shrink-0 text-info" />
                    <p className="text-xs leading-5 text-muted-foreground">
                      DevPilot detected{" "}
                      <span className="font-medium text-foreground">
                        TypeScript, Next.js, Tailwind CSS, and Framer Motion
                      </span>{" "}
                      and pre-filled the tech-stack section automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: preview */}
              <Card className="flex flex-col overflow-hidden">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle>Preview</CardTitle>
                      <CardDescription className="mt-1">
                        {isGenerated
                          ? `${enabledSections.size} section${enabledSections.size !== 1 ? "s" : ""} · ${readme.split("\n").length} lines`
                          : "Configure your README then click Generate."}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary p-0.5">
                      {(["preview", "markdown"] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setView(v)}
                          className={cn(
                            "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            view === v
                              ? "bg-card text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {v === "preview" ? <Eye className="size-3" /> : <Code2 className="size-3" />}
                          {v === "preview" ? "Preview" : "Markdown"}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  {!isGenerated ? (
                    <div className="flex min-h-[26rem] flex-col items-center justify-center px-5 py-12 text-center">
                      <span className="grid size-12 place-items-center rounded-xl bg-secondary">
                        <Wand2 className="size-6 text-muted-foreground" />
                      </span>
                      <p className="mt-4 text-sm font-medium">Ready to generate</p>
                      <p className="mt-1.5 max-w-xs text-xs leading-5 text-muted-foreground">
                        Select a template and toggle sections, then click{" "}
                        <span className="font-medium text-foreground">Generate</span> to build your README.
                      </p>
                      <Button size="sm" className="mt-5" onClick={generate}>
                        <Wand2 className="size-3.5" />
                        Generate README
                      </Button>
                    </div>
                  ) : view === "preview" ? (
                    <div className="min-h-[26rem] overflow-auto p-5 sm:p-6">
                      <ReadmePreview content={readme} />
                    </div>
                  ) : (
                    <pre className="min-h-[26rem] overflow-auto p-5 font-mono text-[11px] leading-5 text-muted-foreground sm:p-6">
                      {readme}
                    </pre>
                  )}
                </CardContent>

                {isGenerated && (
                  <div className="border-t border-border px-5 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-2.5">
                        <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-info" />
                        <p className="text-xs leading-5 text-muted-foreground">
                          Generated from repository context. Review before committing.
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={copy}>
                          {copied ? <Check className="size-3.5" /> : <ClipboardCopy className="size-3.5" />}
                          {copied ? "Copied!" : "Copy"}
                        </Button>
                        <Button size="sm" onClick={download}>
                          <Download className="size-3.5" />
                          {downloaded ? "Downloaded" : "Download .md"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </section>

            {/* ── Bottom strip ── */}
            <section className="mt-6 rounded-xl border border-border bg-surface p-4 sm:flex sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-secondary">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <h2 className="text-sm font-medium">Generation context</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Built from repository analysis · 6 detected technologies · Preview data only.
                  </p>
                </div>
              </div>
              <Badge variant="neutral" className="mt-3 sm:mt-0">
                <FileText className="size-3" />
                README.md
              </Badge>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
