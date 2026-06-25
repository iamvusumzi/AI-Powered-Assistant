import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getGlobalStats } from "@/lib/public-stats.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  FileText,
  BookOpen,
  Mail,
  FileDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  ListChecks,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: MarketingHome,
});

function MarketingHome() {
  const statsFn = useServerFn(getGlobalStats);
  const { data: stats } = useQuery({
    queryKey: ["public-global-stats"],
    queryFn: () => statsFn(),
    staleTime: 60_000,
  });

  const counters = [
    {
      label: "Total Analyses Assisted",
      value: stats?.total ?? 0,
      suffix: "",
      icon: Sparkles,
    },
    {
      label: "Action Items Extracted",
      value: stats?.actions ?? 0,
      suffix: "",
      icon: ListChecks,
    },
    {
      label: "Time Saved Ecosystem-Wide",
      value: Math.round(stats?.hours_saved ?? 0),
      suffix: " hrs",
      icon: Clock,
    },
  ];

  const features = [
    {
      icon: FileText,
      title: "Meeting Summaries",
      body: "Drop raw transcripts. Get executive summaries, decisions, deadlines, and clean owner-tagged action items.",
    },
    {
      icon: BookOpen,
      title: "Research Assistance",
      body: "Paste dense reports or articles. Surface core takeaways and strategic recommendations in seconds.",
    },
    {
      icon: Mail,
      title: "Smart Email Generator",
      body: "One click turns any meeting analysis into a ready-to-send follow-up email — formal, collaborative, or urgent tone.",
    },
    {
      icon: FileDown,
      title: "Client-Ready PDF Briefs",
      body: "Export research takeaways as polished, branded executive briefs for offline distribution.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">Velocity</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Try for Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand/5 via-background to-background" />
        <div className="mx-auto max-w-4xl px-5 py-20 text-center md:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> AI-powered productivity, built for teams
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
            Maximize Your Workplace <span className="text-brand">Velocity</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Transform chaotic meeting logs and dense articles into structured action items instantly.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">
                Try for Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Social proof stats */}
      <section className="border-y bg-card/30">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-5 py-10 md:grid-cols-3">
          {counters.map((c) => (
            <Card key={c.label} className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</span>
                <c.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 text-4xl font-bold tabular-nums">
                {c.value.toLocaleString()}
                <span className="text-2xl text-muted-foreground">{c.suffix}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to move faster
          </h2>
          <p className="mt-3 text-muted-foreground">
            Four focused tools that compress hours of busywork into a single click.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {features.map((f) => (
            <Card key={f.title} className="group p-6 transition-all hover:shadow-glow">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{f.body}</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                Included in every plan
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-gradient-to-br from-brand/5 to-transparent">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to reclaim your week?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Sign up free — no card required. Your first analysis takes under a minute.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/auth">
              Try for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Velocity</span>
          <span>Built for teams who ship.</span>
        </div>
      </footer>
    </div>
  );
}
