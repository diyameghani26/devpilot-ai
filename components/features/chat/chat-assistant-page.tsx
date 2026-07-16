"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Bot,
  Check,
  Copy,
  GitBranch,
  MessageSquare,
  Network,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  isStreaming?: boolean;
};

type ChatSession = {
  id: string;
  title: string;
  repo: string;
  updatedAt: string;
  messages: ChatMessage[];
};

const QUICK_LINKS = [
  { label: "Repository analysis", href: "/repositories/analysis", icon: Activity },
  { label: "Architecture explorer", href: "/repositories/architecture", icon: Network },
  { label: "Security scanner", href: "/repositories/security", icon: ShieldCheck },
] as const;

const SUGGESTED_PROMPTS = [
  { label: "Explain architecture", prompt: "Explain the high-level architecture of devpilot-ai." },
  { label: "Summarize security findings", prompt: "Summarize the most critical security findings and how to fix them." },
  { label: "Suggest refactors", prompt: "Where would you recommend refactoring first, and why?" },
  { label: "Draft PR description", prompt: "Draft a pull request description for recent architecture explorer changes." },
] as const;

function generateMockResponse(prompt: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("architecture")) {
    return `The devpilot-ai app is organized around a feature-first structure. Each product surface lives under \`components/features/<domain>\`, paired with a thin route file in \`app/\`.

\`\`\`ts
// components/features/dashboard/dashboard-page.tsx
export function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* sidebar, header, and workspace overview */}
    </div>
  );
}
\`\`\`

Shared primitives like Button, Card, and Input live in \`components/ui\`, and cross-page navigation is handled by the workspace chrome.`;
  }

  if (lower.includes("security") || lower.includes("vulnerab")) {
    return `Based on the latest scan, the highest-priority issue is a critical exposed credential, followed by two high-severity dependency risks.

\`\`\`ts
// Before
const apiKey = "sk_live_4f9a...";

// After
const apiKey = process.env.PAYMENTS_API_KEY;
\`\`\`

Rotate the credential first, then update the flagged dependency to its patched version.`;
  }

  if (lower.includes("refactor")) {
    return `A good first target is the payments module — several functions mix data-fetching with formatting logic.

\`\`\`ts
function formatInvoice(raw: RawInvoice) {
  const total = raw.items.reduce((sum, item) => sum + item.amount, 0);
  return { ...raw, total, currency: "USD" };
}
\`\`\`

Extracting the formatting into a pure function like this makes it independently testable and reusable across the analysis and dashboard views.`;
  }

  if (lower.includes("doc") || lower.includes("readme") || lower.includes("pull request") || lower.includes("pr ")) {
    return `Here's a draft summary you can adapt:

\`\`\`md
## Summary
Updates the architecture explorer to render module dependencies as an interactive graph.

## Changes
- Added dependency graph renderer
- Linked graph nodes to source files
- Updated tests for the explorer page
\`\`\`

Let me know if you'd like this expanded with a testing section.`;
  }

  return `Here's a quick look based on the current repository context:

\`\`\`ts
type RepoContext = {
  name: string;
  branch: string;
  language: string;
};
\`\`\`

Ask me about the architecture, a recent security scan, or where to focus a refactor, and I'll go deeper.`;
}

function seedSessions(): ChatSession[] {
  return [
    {
      id: "session-1",
      title: "Explain the auth module",
      repo: "devpilot-ai",
      updatedAt: "2h ago",
      messages: [
        { id: "m1", role: "user", content: "Explain the high-level architecture of devpilot-ai." },
        { id: "m2", role: "assistant", content: generateMockResponse("architecture") },
      ],
    },
    {
      id: "session-2",
      title: "Security scan follow-up",
      repo: "payments-service",
      updatedAt: "1d ago",
      messages: [
        { id: "m3", role: "user", content: "What should I fix first from the last security scan?" },
        { id: "m4", role: "assistant", content: generateMockResponse("security") },
      ],
    },
    {
      id: "session-3",
      title: "Refactor suggestions",
      repo: "devpilot-ai",
      updatedAt: "3d ago",
      messages: [
        { id: "m5", role: "user", content: "Where should I refactor first?" },
        { id: "m6", role: "assistant", content: generateMockResponse("refactor") },
      ],
    },
  ];
}

type ContentPart = { type: "text"; value: string } | { type: "code"; lang?: string; value: string };

function parseMessageContent(content: string): ContentPart[] {
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: ContentPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    parts.push({ type: "code", lang: match[1], value: match[2].replace(/\n$/, "") });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) parts.push({ type: "text", value: content.slice(lastIndex) });

  return parts;
}

const TOKEN_PATTERN =
  /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(\b(?:function|const|let|var|return|if|else|for|while|import|from|export|default|class|new|async|await|try|catch|throw|interface|type|extends|public|private|static|readonly|void|null|undefined|true|false|this)\b)/g;

function highlightCode(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  const regex = new RegExp(TOKEN_PATTERN.source, "g");

  while ((match = regex.exec(code)) !== null) {
    if (match.index > lastIndex) nodes.push(code.slice(lastIndex, match.index));
    const [full, comment, string, number, keyword] = match;
    let className: string | undefined;
    if (comment) className = "text-muted-foreground italic";
    else if (string) className = "text-success";
    else if (number) className = "text-warning";
    else if (keyword) className = "text-info";
    nodes.push(className ? <span key={key++} className={className}>{full}</span> : full);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < code.length) nodes.push(code.slice(lastIndex));

  return nodes;
}

function CodeBlock({ lang, code }: { lang?: string; code: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable in this environment
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5">
        <span className="font-mono text-[11px] text-muted-foreground">{lang || "text"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            copied && "text-success",
          )}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3">
        <code className="font-mono text-[11px] leading-5 text-foreground">{highlightCode(code)}</code>
      </pre>
    </div>
  );
}

function InlineText({ text }: { text: string }) {
  const segments = text.split(/(`[^`]+`)/g);
  return (
    <>
      {segments.map((segment, index) =>
        segment.startsWith("`") && segment.endsWith("`") && segment.length > 1 ? (
          <code key={index} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
            {segment.slice(1, -1)}
          </code>
        ) : (
          <React.Fragment key={index}>{segment}</React.Fragment>
        ),
      )}
    </>
  );
}

function MessageContent({ content }: { content: string }) {
  const parts = parseMessageContent(content);
  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.type === "code") return <CodeBlock key={index} lang={part.lang} code={part.value} />;
        const paragraphs = part.value.split(/\n{2,}/).filter((paragraph) => paragraph.trim().length > 0);
        return paragraphs.map((paragraph, pIndex) => (
          <p key={`${index}-${pIndex}`} className="leading-6">
            <InlineText text={paragraph} />
          </p>
        ));
      })}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
        )}
      >
        {isUser ? <span className="text-[11px] font-semibold">DW</span> : <Bot className="size-4" />}
      </span>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
          isUser ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm border border-border bg-surface text-foreground",
        )}
      >
        {message.content.length === 0 && message.isStreaming ? (
          <span className="inline-block h-4 w-24 animate-pulse rounded bg-muted-foreground/20" />
        ) : (
          <>
            <MessageContent content={message.content} />
            {message.isStreaming ? (
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-current align-middle" />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
        <Bot className="size-4" />
      </span>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-surface px-4 py-3.5">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="size-1.5 rounded-full bg-muted-foreground"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) {
  return (
    <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-5 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-foreground">
        <Bot className="size-7" />
      </span>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">Ask DevPilot AI anything</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Get instant answers about architecture, security, and code quality across your repositories.
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelectPrompt(item.prompt)}
            className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-surface-raised"
          >
            <span className="block font-medium">{item.label}</span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function HistoryPanelContent({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <Button variant="secondary" size="sm" className="w-full justify-center" onClick={onNew}>
        <Plus className="size-4" />
        New chat
      </Button>
      <div className="mt-4 flex-1 space-y-1 overflow-y-auto">
        {sessions.map((session) => {
          const active = session.id === activeId;
          return (
            <div
              key={session.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
                active ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <button type="button" onClick={() => onSelect(session.id)} className="min-w-0 flex-1 text-left">
                <p className="truncate">{session.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {session.repo} · {session.updatedAt}
                </p>
              </button>
              <button
                type="button"
                onClick={() => onDelete(session.id)}
                className="hidden shrink-0 rounded-md p-1 text-muted-foreground hover:bg-background hover:text-destructive group-hover:block"
                aria-label={`Delete ${session.title}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContextPanelContent({ onSuggestionSelect }: { onSuggestionSelect: (prompt: string) => void }) {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Repository context</CardTitle>
              <CardDescription className="mt-1 text-xs">Currently in scope for this chat.</CardDescription>
            </div>
            <GitBranch className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="font-mono text-xs font-medium">devpilot-ai</p>
            <p className="mt-1 text-[11px] text-muted-foreground">main · 482 files · TypeScript</p>
          </div>
          <div className="space-y-1.5">
            {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">AI suggestions</CardTitle>
              <CardDescription className="mt-1 text-xs">Add one to your message.</CardDescription>
            </div>
            <Sparkles className="size-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {SUGGESTED_PROMPTS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onSuggestionSelect(item.prompt)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: (value: string) => void;
  disabled: boolean;
}) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend(value);
    }
  };

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Ask DevPilot about this repository..."
        className="min-h-[52px] max-h-40 resize-none pr-14 text-sm"
        aria-label="Message DevPilot assistant"
      />
      <Button
        type="button"
        size="icon"
        onClick={() => onSend(value)}
        disabled={disabled || !value.trim()}
        className="absolute bottom-2 right-2 size-9"
        aria-label="Send message"
      >
        <Send className="size-4" />
      </Button>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-4 sm:px-6">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-72 shrink-0 border-r border-border p-3 lg:block">
          <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
          <div className="mt-4 space-y-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-12 w-full animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="hidden w-80 shrink-0 border-l border-border p-4 xl:block">
          <div className="h-40 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function ChatAssistantPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [sessions, setSessions] = React.useState<ChatSession[]>(() => seedSessions());
  const [activeId, setActiveId] = React.useState<string>("session-1");
  const [input, setInput] = React.useState("");
  const [isThinking, setIsThinking] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [contextOpen, setContextOpen] = React.useState(false);

  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const streamIntervalRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    return () => {
      if (streamIntervalRef.current) window.clearInterval(streamIntervalRef.current);
    };
  }, []);

  const activeSession = sessions.find((session) => session.id === activeId) ?? sessions[0] ?? null;
  const lastMessage = activeSession?.messages[activeSession.messages.length - 1];

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages.length, lastMessage?.content]);

  const updateMessages = (sessionId: string, updater: (messages: ChatMessage[]) => ChatMessage[]) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, messages: updater(session.messages) } : session)),
    );
  };

  const streamAssistantReply = (sessionId: string, fullText: string) => {
    const id = crypto.randomUUID();
    updateMessages(sessionId, (messages) => [...messages, { id, role: "assistant", content: "", isStreaming: true }]);

    let revealed = 0;
    streamIntervalRef.current = window.setInterval(() => {
      revealed += 4;
      updateMessages(sessionId, (messages) =>
        messages.map((message) => (message.id === id ? { ...message, content: fullText.slice(0, revealed) } : message)),
      );
      if (revealed >= fullText.length) {
        if (streamIntervalRef.current) window.clearInterval(streamIntervalRef.current);
        updateMessages(sessionId, (messages) =>
          messages.map((message) => (message.id === id ? { ...message, content: fullText, isStreaming: false } : message)),
        );
      }
    }, 18);
  };

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking || !activeSession) return;

    const sessionId = activeSession.id;
    const isFirstMessage = activeSession.messages.length === 0;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };

    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              title: isFirstMessage ? trimmed.slice(0, 42) : session.title,
              updatedAt: "Just now",
              messages: [...session.messages, userMessage],
            }
          : session,
      ),
    );
    setInput("");
    setIsThinking(true);

    window.setTimeout(() => {
      setIsThinking(false);
      streamAssistantReply(sessionId, generateMockResponse(trimmed));
    }, 700);
  };

  const handleNewChat = () => {
    const id = crypto.randomUUID();
    const fresh: ChatSession = { id, title: "New chat", repo: "devpilot-ai", updatedAt: "Just now", messages: [] };
    setSessions((prev) => [fresh, ...prev]);
    setActiveId(id);
    setHistoryOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const next = prev.filter((session) => session.id !== id);
      if (id !== activeId) return next;

      if (next.length > 0) {
        setActiveId(next[0].id);
        return next;
      }

      const fresh: ChatSession = { id: crypto.randomUUID(), title: "New chat", repo: "devpilot-ai", updatedAt: "Just now", messages: [] };
      setActiveId(fresh.id);
      return [fresh];
    });
  };

  if (isLoading) return <ChatSkeleton />;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Open chat history"
          >
            <MessageSquare className="size-4" />
          </button>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" className="hidden sm:inline-flex">
            <Bot className="size-3" />
            Chat assistant
          </Badge>
          <button
            type="button"
            onClick={() => setContextOpen(true)}
            className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground xl:hidden"
            aria-label="Open repository context"
          >
            <Sparkles className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-border p-3 lg:flex">
          <HistoryPanelContent
            sessions={sessions}
            activeId={activeSession?.id ?? null}
            onSelect={setActiveId}
            onNew={handleNewChat}
            onDelete={handleDeleteSession}
          />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          {activeSession && activeSession.messages.length > 0 ? (
            <div className="flex items-center gap-2 border-b border-border px-4 py-3 sm:px-6">
              <span className="grid size-7 place-items-center rounded-lg bg-secondary">
                <Bot className="size-3.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{activeSession.title}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{activeSession.repo}</p>
              </div>
            </div>
          ) : null}

          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {activeSession && activeSession.messages.length > 0 ? (
              <div className="mx-auto flex max-w-3xl flex-col gap-6">
                {activeSession.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isThinking ? <TypingIndicator /> : null}
                <div ref={bottomRef} />
              </div>
            ) : (
              <EmptyState onSelectPrompt={handleSend} />
            )}
          </div>

          <div className="border-t border-border p-4 sm:p-6">
            <div className="mx-auto max-w-3xl">
              <Composer value={input} onChange={setInput} onSend={handleSend} disabled={isThinking} />
            </div>
          </div>
        </main>

        <aside className="hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-border p-4 xl:flex">
          <ContextPanelContent onSuggestionSelect={(prompt) => setInput(prompt)} />
        </aside>
      </div>

      <AnimatePresence>
        {historyOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close chat history"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-3rem))] flex-col border-r border-border bg-background p-3 shadow-2xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div className="flex items-center justify-between px-1 py-2">
                <p className="text-sm font-semibold">Chat history</p>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Close chat history"
                >
                  <X className="size-4" />
                </button>
              </div>
              <HistoryPanelContent
                sessions={sessions}
                activeId={activeSession?.id ?? null}
                onSelect={(id) => {
                  setActiveId(id);
                  setHistoryOpen(false);
                }}
                onNew={handleNewChat}
                onDelete={handleDeleteSession}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {contextOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close repository context"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setContextOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 right-0 z-50 flex w-[min(20rem,calc(100vw-3rem))] flex-col overflow-y-auto border-l border-border bg-background p-4 shadow-2xl xl:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold">Repository context</p>
                <button
                  type="button"
                  onClick={() => setContextOpen(false)}
                  className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Close repository context"
                >
                  <X className="size-4" />
                </button>
              </div>
              <ContextPanelContent
                onSuggestionSelect={(prompt) => {
                  setInput(prompt);
                  setContextOpen(false);
                }}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}