import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Layers,
  Cpu,
  Zap,
  ShieldCheck,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/presentation")({
  component: PresentationPage,
});

type Slide = {
  eyebrow?: string;
  title: string;
  render: () => React.ReactNode;
};

const slides: Slide[] = [
  {
    eyebrow: "Velocity",
    title: "AI Workplace Productivity Suite",
    render: () => (
      <div className="flex flex-col items-center text-center gap-8 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium">
          <Sparkles className="h-4 w-4" /> Velocity
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
          AI Workplace Productivity Suite
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
          Maximizing corporate operational velocity by bridging the gap between
          insight and execution.
        </p>
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground/70 mt-8">
          Technical Overview & Architectural Showcase
        </p>
      </div>
    ),
  },
  {
    eyebrow: "01 — Problem",
    title: "The Cost of Administrative Friction",
    render: () => (
      <SlideBody icon={<AlertTriangle className="h-8 w-8" />} title="The Cost of Administrative Friction">
        <ul className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
          <li className="flex gap-4">
            <span className="text-primary font-bold">01</span>
            <span>
              Professionals waste up to <span className="text-foreground font-semibold">40% of their work week</span> parsing dense text,
              extracting action items, and drafting repetitive follow-up communications.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="text-primary font-bold">02</span>
            <span>
              Information silos occur when meeting summaries or research insights sit passively in documents
              without being converted into <span className="text-foreground font-semibold">operational tasks</span>.
            </span>
          </li>
        </ul>
      </SlideBody>
    ),
  },
  {
    eyebrow: "02 — Solution",
    title: "The Unified Velocity Pipeline",
    render: () => (
      <SlideBody icon={<Layers className="h-8 w-8" />} title="The Unified Velocity Pipeline">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { label: "Input Layer", body: "Clean, public-facing SaaS landing marketing deck funnels users into a private launchpad with dedicated dropzones." },
            { label: "Processing Layer", body: "Advanced server-side prompt engineering splits raw input into structural markdown summaries and interactive task lists." },
            { label: "Output Layer", body: "High-velocity actions convert insights directly into boardroom-ready assets (pre-formatted status email drafts and printable PDFs) with a single click." },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl border bg-card p-6 hover:border-primary/40 transition-colors">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
                Step {i + 1}
              </div>
              <h3 className="text-xl font-semibold mb-3">{f.label}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </SlideBody>
    ),
  },
  {
    eyebrow: "03 — Stack",
    title: "Enterprise-Grade Architecture",
    render: () => (
      <SlideBody icon={<Cpu className="h-8 w-8" />} title="Enterprise-Grade Architecture">
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { t: "Frontend Framework", d: "TanStack Start (React + TypeScript) for lightning-fast routing and server functions." },
            { t: "Styling Layer", d: "Tailwind CSS combined with modern shadcn/ui components for a premium user interface." },
            { t: "Data & Security", d: "Supabase fully managing relational storage, user authentication, and strict user-scoped Row-Level Security (RLS) policies." },
            { t: "Intelligent Core", d: "Secured Google Gemini models orchestrated through the server-side Lovable AI Gateway." },
          ].map((g, i) => (
            <div key={i} className="rounded-2xl border bg-card p-6">
              <h3 className="text-lg font-semibold mb-2 text-primary">{g.t}</h3>
              <p className="text-muted-foreground leading-relaxed">{g.d}</p>
            </div>
          ))}
        </div>
      </SlideBody>
    ),
  },
  {
    eyebrow: "04 — Innovation",
    title: "Redefining Workplace Efficiency",
    render: () => (
      <SlideBody icon={<Zap className="h-8 w-8" />} title="Redefining Workplace Efficiency">
        <div className="space-y-5">
          {[
            { t: "Contextual Floating Chat", d: "A fixed conversational chatbot that automatically inherits active document contexts, preventing user copy-paste fatigue." },
            { t: "Smart Email Generator", d: "Context-aware output generator that builds complete, tone-adjustable email drafts from meeting summaries instantly." },
            { t: "Live Impact Telemetry", d: "Dynamic analytics counters showing aggregate ecosystem metrics on the public landing page, and individual metrics on the private dashboard." },
          ].map((p, i) => (
            <div key={i} className="flex gap-5 rounded-2xl border bg-card p-6">
              <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                {i + 1}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">{p.t}</h3>
                <p className="text-muted-foreground leading-relaxed">{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </SlideBody>
    ),
  },
  {
    eyebrow: "05 — Responsibility",
    title: "Trust, Auditing, and Governance",
    render: () => (
      <SlideBody icon={<ShieldCheck className="h-8 w-8" />} title="Trust, Auditing, and Governance">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { t: "Human-in-the-Loop Toggles", d: "Interactive verify checkmarks that let humans review and validate AI-generated tasks before logging them as green 'Human Verified' items." },
            { t: "Input Controls & UI Disclaimers", d: "Strict 50-character minimum length safety validation alongside permanent, sticky system accountability disclaimers." },
          ].map((g, i) => (
            <div key={i} className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-7">
              <ShieldCheck className="h-6 w-6 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">{g.t}</h3>
              <p className="text-muted-foreground leading-relaxed">{g.d}</p>
            </div>
          ))}
        </div>
      </SlideBody>
    ),
  },
  {
    eyebrow: "06 — Conclusion",
    title: "Driving the Future of Workspace Automation",
    render: () => (
      <SlideBody icon={<Rocket className="h-8 w-8" />} title="Driving the Future of Workspace Automation">
        <div className="space-y-8">
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Velocity demonstrates how entry-level engineering can pivot directly into{" "}
            <span className="text-foreground font-semibold">system architecture</span> and high-level{" "}
            <span className="text-foreground font-semibold">product design</span> from day one.
          </p>
          <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 text-center">
            <p className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Thank You.</p>
            <p className="text-lg text-muted-foreground">
              Ready to experience maximum workplace velocity?
            </p>
          </div>
        </div>
      </SlideBody>
    ),
  },
];

function SlideBody({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-5xl">
      <div className="flex items-center gap-4 mb-10">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function PresentationPage() {
  const [index, setIndex] = useState(0);
  const total = slides.length;

  const next = () => setIndex((i) => Math.min(i + 1, total - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Home") setIndex(0);
      else if (e.key === "End") setIndex(total - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  const slide = slides[index];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-br from-background via-background to-muted/30">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 md:px-10 py-5 border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">Velocity</span>
          <span>·</span>
          <span>{slide.eyebrow}</span>
        </div>
        <div className="text-sm text-muted-foreground tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
      </div>

      {/* Slide canvas */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-16 py-12 md:py-20">
        <div
          key={index}
          className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {slide.render()}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
            )}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-6 md:px-10 py-5 border-t bg-background/60 backdrop-blur">
        <Button
          variant="outline"
          onClick={prev}
          disabled={index === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <p className="hidden md:block text-xs text-muted-foreground">
          Use ← → arrow keys to navigate
        </p>
        <Button onClick={next} disabled={index === total - 1} className="gap-2">
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
