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
  React.useEffect(() => { contentCache.current.clear(); setSelectedPath(null); setContent(""); void loadTree(); }, [loadTree]);
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
  return <Card className="mt-6"><CardHeader><CardTitle>Repository files</CardTitle><CardDescription>Browse the connected repository and inspect source files.</CardDescription></CardHeader><CardContent>{isLoadingTree ? <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Loading repository files</div> : treeError ? <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive"><p>{treeError}</p><Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => void loadTree()}>Retry</Button></div> : <div className="grid min-h-[24rem] overflow-hidden rounded-lg border border-border lg:grid-cols-[minmax(13rem,0.75fr)_minmax(0,1.5fr)]"><div className="max-h-[32rem] overflow-auto border-b border-border bg-surface p-2 lg:border-b-0 lg:border-r">{tree.length ? tree.map((node) => renderNode(node)) : <p className="p-3 text-sm text-muted-foreground">No files found.</p>}</div><div className="min-w-0 bg-muted/20"><div className="border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">{selectedPath ?? "Select a file to preview"}</div>{isLoadingFile ? <div className="flex items-center gap-3 p-5 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />Loading file</div> : fileError ? <p className="p-5 text-sm text-destructive">{fileError}</p> : selectedPath ? <pre className="max-h-[30rem] overflow-auto p-4 text-xs leading-6 text-foreground"><code>{content}</code></pre> : <p className="p-5 text-sm text-muted-foreground">Choose a file from the tree to view its contents.</p>}</div></div>}</CardContent></Card>;
}
