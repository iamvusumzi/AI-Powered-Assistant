import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Rocket, Clipboard, Download, Check } from "lucide-react";
import { toast } from "sonner";

type Task = { id: string; task: string; owner?: string; due?: string };
type Tone = "Formal" | "Collaborative" | "Urgent";

function extractSection(markdown: string, heading: string): string {
  const re = new RegExp(`###\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n###\\s+|$)`, "i");
  return markdown.match(re)?.[1].trim() ?? "";
}

function buildEmail(title: string, summary: string, tasks: Task[], tone: Tone): string {
  const exec = extractSection(summary, "Executive Summary");
  const decisions = extractSection(summary, "Key Decisions");

  const greeting =
    tone === "Formal" ? "Dear team,"
    : tone === "Urgent" ? "Team — action required:"
    : "Hi team,";

  const intro =
    tone === "Formal"
      ? `Please find below a summary of "${title}" along with the agreed next steps.`
      : tone === "Urgent"
      ? `Quick recap of "${title}". Please review the items below today and confirm ownership.`
      : `Sharing a quick recap of "${title}" and what we're taking forward.`;

  const actionsBlock = tasks.length
    ? tasks
        .map((t) => `• ${t.task}${t.owner ? ` — ${t.owner}` : ""}${t.due ? ` (due ${t.due})` : ""}`)
        .join("\n")
    : "• No action items captured.";

  const closing =
    tone === "Formal" ? "Kind regards,"
    : tone === "Urgent" ? "Thanks — please reply to confirm,"
    : "Thanks!";

  return [
    greeting,
    "",
    intro,
    "",
    "Summary",
    exec || "—",
    ...(decisions ? ["", "Key Decisions", decisions] : []),
    "",
    "Action Items",
    actionsBlock,
    "",
    closing,
  ].join("\n");
}

export function EmailGeneratorButton({
  title, summary, tasks,
}: { title: string; summary: string; tasks: Task[] }) {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<Tone>("Collaborative");
  const [copied, setCopied] = useState(false);

  const draft = useMemo(() => buildEmail(title, summary, tasks, tone), [title, summary, tasks, tone]);

  const copy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    toast.success("Email draft copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Rocket className="mr-1.5 h-3.5 w-3.5" /> Draft Summary Email
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Summary email draft</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Tone</span>
            <ToggleGroup
              type="single"
              value={tone}
              onValueChange={(v) => v && setTone(v as Tone)}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="Formal">Formal</ToggleGroupItem>
              <ToggleGroupItem value="Collaborative">Collaborative</ToggleGroupItem>
              <ToggleGroupItem value="Urgent">Urgent</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <textarea
            readOnly
            value={draft}
            className="h-80 w-full resize-none rounded-md border bg-muted/30 p-3 font-mono text-xs leading-relaxed focus:outline-none"
          />

          <DialogFooter className="sm:justify-between">
            <p className="text-xs text-muted-foreground">Review before sending in your email client.</p>
            <Button onClick={copy} size="sm">
              {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Clipboard className="mr-1.5 h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Email Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^###\s+/.test(line)) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<h2>${escapeHtml(line.replace(/^###\s+/, ""))}</h2>`);
    } else if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${escapeHtml(line.replace(/^\s*[-*]\s+/, ""))}</li>`);
    } else if (line.trim() === "") {
      if (inList) { out.push("</ul>"); inList = false; }
    } else {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push(`<p>${escapeHtml(line)}</p>`);
    }
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

export function PdfExportButton({ title, summary }: { title: string; summary: string }) {
  const handleDownload = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  @page { margin: 1in; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #111; line-height: 1.55; }
  header { border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 28px; }
  .eyebrow { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #666; }
  h1 { font-size: 26px; margin: 4px 0 0; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.08em; color: #333; margin-top: 28px; border-left: 3px solid #111; padding-left: 10px; }
  p, li { font-size: 13px; }
  ul { padding-left: 20px; }
  footer { margin-top: 48px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 10px; color: #888; }
</style></head><body>
<header>
  <div class="eyebrow">Executive Brief</div>
  <h1>${escapeHtml(title)}</h1>
</header>
${markdownToHtml(summary)}
<footer>Generated ${new Date().toLocaleDateString()} · Velocity AI Workspace</footer>
<script>window.onload = () => { window.focus(); window.print(); };</script>
</body></html>`;

    const w = window.open("", "_blank", "width=900,height=1000");
    if (!w) {
      toast.error("Allow pop-ups to export the PDF");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <Button size="sm" onClick={handleDownload}>
      <Download className="mr-1.5 h-3.5 w-3.5" /> Download Executive Brief (PDF)
    </Button>
  );
}
