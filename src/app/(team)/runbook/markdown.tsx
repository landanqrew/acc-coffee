import ReactMarkdown, { type Components } from "react-markdown";

// Phone-first rendering of the Lead-authored Runbook markdown. react-markdown
// escapes raw HTML and sanitizes link URLs by default, so this is safe to render
// without dangerouslySetInnerHTML. Lists render as clear step-by-step lists.
//
// Heading levels are intentionally flattened: h1 and h2 both render as a small
// h3, and h3 as an even smaller h4, so no section header blows up to large text
// on a phone. The collapse is deliberate — don't "restore" the hierarchy.
const components: Components = {
  h1: ({ children }) => (
    <h3 className="mt-4 text-base font-semibold first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mt-4 text-base font-semibold first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-3 text-sm font-semibold first:mt-0">{children}</h4>
  ),
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-disc space-y-1 pl-5 leading-relaxed">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-5 leading-relaxed">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-neutral-900 underline underline-offset-2"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.85em]">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-neutral-300 pl-3 text-neutral-600">
      {children}
    </blockquote>
  ),
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-3 text-sm text-neutral-800">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
