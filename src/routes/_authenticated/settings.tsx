import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle, FileWarning } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [disclaimer, setDisclaimer] = useState(true);
  const [strictLen, setStrictLen] = useState(true);
  const [audit, setAudit] = useState(false);

  useEffect(() => {
    setDisclaimer(localStorage.getItem("velocity:disclaimer") !== "0");
    setStrictLen(localStorage.getItem("velocity:strictLen") !== "0");
    setAudit(localStorage.getItem("velocity:audit") === "1");
  }, []);

  const persist = (k: string, v: boolean) => localStorage.setItem(k, v ? "1" : "0");

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Responsible AI Controls</h1>
        <p className="text-sm text-muted-foreground">Configure safety guardrails, disclaimers, and audit behavior.</p>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 text-warning" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="disc" className="text-base font-medium">Persistent disclaimer bar</Label>
                <Switch id="disc" checked={disclaimer} onCheckedChange={(v) => { setDisclaimer(v); persist("velocity:disclaimer", v); }} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Shows "AI-generated content can be inaccurate" on every active document view.</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <FileWarning className="mt-1 h-5 w-5 text-brand" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="strict" className="text-base font-medium">Strict minimum-length validation</Label>
                <Switch id="strict" checked={strictLen} onCheckedChange={(v) => { setStrictLen(v); persist("velocity:strictLen", v); }} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Rejects inputs under 50 characters on both client and server to reduce AI hallucinations.</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-success" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="audit" className="text-base font-medium">Verification auditing</Label>
                <Switch id="audit" checked={audit} onCheckedChange={(v) => { setAudit(v); persist("velocity:audit", v); }} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Logs human verification toggles to your local audit trail.</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-muted/40">
          <h2 className="text-sm font-semibold">Platform safety limitations</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground list-disc ml-5">
            <li>AI summaries may omit nuance or context — always validate critical action items.</li>
            <li>Velocity does not provide legal, medical, or financial advice.</li>
            <li>Do not paste regulated personal data (PHI, financial PII) into the workspace.</li>
            <li>Verified badges represent human-confirmed accuracy, not legal sign-off.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
