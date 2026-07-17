"use client";

import * as React from "react";
import { ChevronRight, FileCode2, FileJson, FileText, Folder, FolderOpen, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { repositoriesApi, type RepositoryTreeEntry } from "@/lib/api";

type TreeNode = { name: string; path: string; type: "file" | "directory"; children: TreeNode[] };
const codeExtensions = new Set(["ts", "tsx", "js", "jsx", "py", "go", "rs", "java", "css", "html", "md"]);
const getFileIcon = (name: string) => name.endsWith(".json") ? FileJson : codeExtensions.has(name.split(".").pop()?.toLowerCase() ?? "") ? FileCode2 : FileText;

const syntaxLanguages: Record<string, string> = {
  js: "JavaScript", jsx: "JSX", ts: "TypeScript", tsx: "TSX", json: "JSON", md: "Markdown",
  css: "CSS", html: "HTML", py: "Python", go: "Go", rs: "Rust", java: "Java",
};

const tokenPattern = /(\/\/.*$|#.*$|\/\*[\s\S]*?\*\/|`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:const|let|var|function|return|if|else|for|while|import|from|export|default|async|await|new|class|extends|interface|type|public|private|static|void|def|in|True|False|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b)/g;

function highlightLine(line: string, language: string) {
  if (language === "Markdown") {
    return line.startsWith("#") ? <span className="text-info">{line}</span> : line.startsWith("```") ? <span className="text-warning">{line}</span> : line;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  for (const match of line.matchAll(tokenPattern)) {
    const [token] = match;
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push(line.slice(lastIndex, index));
    const className = token.startsWith("//") || token.startsWith("#") || token.startsWith("/*")
      ? "text-muted-foreground italic"
      : token.startsWith("\"") || token.startsWith("'") || token.startsWith("`")
        ? "text-success"
        : /^\d/.test(token)
          ? "text-warning"
          : "text-info";
    parts.push(<span key={`${index}-${token}`} className={className}>{token}</span>);
    lastIndex = index + token.length;
  }
  if (lastIndex < line.length) parts.push(line.slice(lastIndex));
  return parts.length ? parts : line;
}

function SourceCodeViewer({ path, content }: { path: string; content: string }) {
  const extension = path.split(".").pop()?.toLowerCase() ?? "";
  const language = syntaxLanguages[extension] ?? "Plain text";
  const lines = React.useMemo(() => content.split("\n"), [content]);

  return <div className="max-h-[30rem] overflow-auto bg-muted/10 font-mono text-xs leading-6">
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-muted/90 px-4 py-2 text-[11px] text-muted-foreground backdrop-blur">
      <span>{lines.length.toLocaleString()} lines</span><span>{language}</span>
    </div>
    <pre className="min-w-max py-3"><code>{lines.map((line, index) => <span key={`${index}-${line}`} className="flex min-h-6"><span aria-hidden="true" className="w-12 shrink-0 select-none border-r border-border/60 pr-3 text-right text-muted-foreground">{index + 1}</span><span className="whitespace-pre px-4 text-foreground">{highlightLine(line, language)}</span></span>)}</code></pre>
  </div>;
}

const buildTree = (entries: RepositoryTreeEntry[]): TreeNode[] => {
  const roots: TreeNode[] = [];
  const nodes = new Map<string, TreeNode>();
  for (const entry of [...entries].sort((left, right) => left.path.localeCompare(right.path))) {
    const parts = entry.path.split("/");
    let siblings = roots;
    let currentPath = "";
    for (const [index, name] of parts.entries()) {
      currentPath = currentPath ? `${currentPath}/${name}` : name;
      let node = nodes.get(currentPath);
      if (!node) {
        node = { name, path: currentPath, type: index === parts.length - 1 ? entry.type : "directory", children: [] };
        nodes.set(currentPath, node);
        siblings.push(node);
      }
      if (index === parts.length - 1) node.type = entry.type;
      siblings = node.children;
    }
  }
  const sortNodes = (items: TreeNode[]): TreeNode[] => items.sort((left, right) => left.type === right.type ? left.name.localeCompare(right.name) : left.type === "directory" ? -1 : 1).map((node) => ({ ...node, children: sortNodes(node.children) }));
  return sortNodes(roots);
};

export function RepositoryFileExplorer({ repositoryId }: { repositoryId: string }) {
  const [tree, setTree] = React.useState<TreeNode[]>([]);
  const [treeError, setTreeError] = React.useState("");
  const [isLoadingTree, setIsLoadingTree] = React.useState(true);
  const [expandedPaths, setExpandedPaths] = React.useState<Set<string>>(new Set());
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null);
  const [content, setContent] = React.useState("");
  const [fileError, setFileError] = React.useState("");
  const [isLoadingFile, setIsLoadingFile] = React.useState(false);
  const contentCache = React.useRef(new Map<string, string>());
  const loadTree = React.useCallback(async () => {
    setIsLoadingTree(true); setTreeError("");
    try {
      const result = await repositoriesApi.getTree(repositoryId);
      const nextTree = buildTree(result.tree);
      setTree(nextTree);
      setExpandedPaths(new Set(nextTree.filter((node) => node.type === "directory").map((node) => node.path)));
    } catch (error) { setTreeError(error instanceof Error ? error.message : "Unable to load repository files."); }
    finally { setIsLoadingTree(false); }
  }, [repositoryId]);
  React.useEffect(() => {
    queueMicrotask(() => {
      contentCache.current.clear();
      setSelectedPath(null);
      setContent("");
      void loadTree();
    });
  }, [loadTree]);
  const selectFile = async (path: string) => {
    setSelectedPath(path); setFileError("");
    const cachedContent = contentCache.current.get(path);
    if (cachedContent !== undefined) { setContent(cachedContent); return; }
    setIsLoadingFile(true); setContent("");
    try { const file = await repositoriesApi.getFile(repositoryId, path); contentCache.current.set(path, file.content); setContent(file.content); }
    catch (error) { setFileError(error instanceof Error ? error.message : "Unable to load file contents."); }
    finally { setIsLoadingFile(false); }
  };
  const renderNode = (node: TreeNode, depth = 0): React.ReactNode => {
    const isDirectory = node.type === "directory"; const isExpanded = expandedPaths.has(node.path); const Icon = isDirectory ? (isExpanded ? FolderOpen : Folder) : getFileIcon(node.name);
    return <React.Fragment key={node.path}><button type="button" onClick={() => isDirectory ? setExpandedPaths((paths) => { const next = new Set(paths); if (next.has(node.path)) next.delete(node.path); else next.add(node.path); return next; }) : void selectFile(node.path)} className={cn("flex w-full items-center gap-1.5 rounded px-2 py-1 text-left font-mono text-xs transition-colors hover:bg-muted", selectedPath === node.path && "bg-secondary text-foreground")} style={{ paddingLeft: `${depth * 16 + 8}px` }}>{isDirectory ? <ChevronRight className={cn("size-3 shrink-0 transition-transform", isExpanded && "rotate-90")} /> : <span className="size-3 shrink-0" />}<Icon className={cn("size-3.5 shrink-0", isDirectory ? "text-warning" : "text-muted-foreground")} /><span className="truncate">{node.name}</span></button>{isDirectory && isExpanded ? node.children.map((child) => renderNode(child, depth + 1)) : null}</React.Fragment>;
  };
  return <Card className="mt-6"><CardHeader><CardTitle>Repository files</CardTitle><CardDescription>Browse the connected repository and inspect source files.</CardDescription></CardHeader><CardContent>{isLoadingTree ? <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Loading repository files</div> : treeError ? <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive"><p>{treeError}</p><Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => void loadTree()}>Retry</Button></div> : <div className="grid min-h-[24rem] overflow-hidden rounded-lg border border-border lg:grid-cols-[minmax(13rem,0.75fr)_minmax(0,1.5fr)]"><div className="max-h-[32rem] overflow-auto border-b border-border bg-surface p-2 lg:border-b-0 lg:border-r">{tree.length ? tree.map((node) => renderNode(node)) : <p className="p-3 text-sm text-muted-foreground">No files found.</p>}</div><div className="min-w-0 bg-muted/20"><div className="border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">{selectedPath ?? "Select a file to preview"}</div>{isLoadingFile ? <div className="flex items-center gap-3 p-5 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Loading file</div> : fileError ? <p className="p-5 text-sm text-destructive">{fileError}</p> : selectedPath ? <SourceCodeViewer path={selectedPath} content={content} /> : <p className="p-5 text-sm text-muted-foreground">Choose a file from the tree to view its contents.</p>}</div></div>}</CardContent></Card>;
}
