import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,
  h1: ({ children }) => <h3 className="mt-6 mb-2 font-heading text-2xl font-semibold first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-6 mb-2 font-heading text-xl font-semibold first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-5 mb-1.5 font-heading text-lg font-semibold first:mt-0">{children}</h4>,
  h4: ({ children }) => <h5 className="mt-4 mb-1 font-medium first:mt-0">{children}</h5>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5 marker:text-muted-foreground">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-5 marker:text-muted-foreground">{children}</ol>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-muted-foreground">
      {children}
    </a>
  ),
  hr: () => <hr className="my-5 border-border" />,
  blockquote: ({ children }) => <blockquote className="my-3 border-l-2 border-border pl-4 text-muted-foreground">{children}</blockquote>,
  code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 text-[0.9em]">{children}</code>,
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-sm tabular-nums">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/60 text-left">{children}</thead>,
  th: ({ children }) => <th className="px-3 py-2 font-medium whitespace-nowrap">{children}</th>,
  td: ({ children }) => <td className="border-t px-3 py-2 align-top">{children}</td>,
};

export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
