import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";
import { fetchLandingStatus } from "@/lib/api/status";
import {
  Satellite,
  ShieldAlert,
  Activity,
  Orbit,
  Radio,
  Route,
  BarChart3,
  ArrowRight,
  Zap,
  Globe,
  Eye,
} from "lucide-react";

export default async function Home() {
  let status = null;
  let error: string | undefined;

  try {
    status = await fetchLandingStatus();
  } catch {
    error = "Could not reach API backend";
  }

  return (
    <div className="relative min-h-full bg-[#040810] text-slate-100 selection:bg-teal-900/50 overflow-hidden">
      {/* ─── Starfield Dot Grid ─── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #64748b 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* ─── Ambient Glow (very subtle, no heavy gradients) ─── */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full bg-teal-500/[0.04] blur-[160px] z-0" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-[600px] h-[400px] rounded-full bg-violet-600/[0.03] blur-[120px] z-0" />

      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#040810]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10">
          <div className="flex items-center gap-2.5">
            <Orbit className="h-5 w-5 text-teal-400" />
            <span className="text-lg font-semibold tracking-wide text-white">
              ORBITAL<span className="text-teal-400">.AI</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#metrics" className="hover:text-white transition-colors">Metrics</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
          </div>

          <StatusPill status={status} error={error} />
        </div>
      </nav>

      <main className="relative z-10">
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="mx-auto max-w-7xl px-6 sm:px-10 pt-24 pb-32 sm:pt-36 sm:pb-40">
          <div className="max-w-4xl space-y-8">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/[0.06] px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-teal-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-400" />
              </span>
              Orbital Network Active
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.05]">
              Autonomous Orbital
              <br />
              <span className="text-teal-400">Traffic Control</span>
            </h1>

            <p className="max-w-2xl text-lg sm:text-xl leading-relaxed text-slate-400">
              AI-driven infrastructure that monitors, predicts, and manages orbital traffic in real time — preventing collisions and optimizing space lane efficiency for the next era of spaceflight.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                className="bg-teal-500 text-[#040810] font-semibold hover:bg-teal-400 border-0 h-12 px-7 text-sm transition-all"
                render={<Link href="#features" />}
                nativeButton={false}
              >
                Explore Platform
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                render={<Link href="#metrics" />}
                nativeButton={false}
                variant="outline"
                className="border-slate-700/80 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white h-12 px-7 text-sm transition-all"
              >
                View Live Metrics
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════════ METRICS BAR ═══════════════ */}
        <section id="metrics" className="border-y border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.06]">
            {[
              { value: "34,200+", label: "Objects Tracked", icon: <Eye className="h-4 w-4 text-teal-400" /> },
              { value: "< 2ms", label: "Decision Latency", icon: <Zap className="h-4 w-4 text-amber-400" /> },
              { value: "99.97%", label: "Collision Prevention", icon: <ShieldAlert className="h-4 w-4 text-emerald-400" /> },
              { value: "24/7", label: "Autonomous Ops", icon: <Globe className="h-4 w-4 text-violet-400" /> },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-10 sm:px-10 sm:py-12 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {stat.icon}
                  <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{stat.value}</span>
                </div>
                <span className="text-xs uppercase tracking-widest text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════ FEATURES ═══════════════ */}
        <section id="features" className="mx-auto max-w-7xl px-6 sm:px-10 py-28 sm:py-36">
          <div className="mb-16 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-4">Core Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Intelligent infrastructure for safe orbital operations
            </h2>
          </div>

          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 bg-white/[0.04] rounded-2xl overflow-hidden">
            {[
              {
                icon: <Radio className="h-6 w-6 text-teal-400" />,
                title: "Real-time Monitoring",
                body: "Track every satellite, station, and debris fragment across all orbital regimes — LEO, MEO, GEO, and beyond — with sub-meter precision.",
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-amber-400" />,
                title: "Congestion Prediction",
                body: "Forecast orbital congestion windows and collision probabilities days in advance using physics-informed neural networks.",
              },
              {
                icon: <Route className="h-6 w-6 text-sky-400" />,
                title: "Dynamic Rerouting",
                body: "Automatically compute and execute optimal trajectory changes to reroute spacecraft around high-risk zones in milliseconds.",
              },
              {
                icon: <Activity className="h-6 w-6 text-emerald-400" />,
                title: "Lane Optimization",
                body: "Define and continuously refine virtual orbital lanes that maximize throughput while maintaining safe separation distances.",
              },
              {
                icon: <ShieldAlert className="h-6 w-6 text-rose-400" />,
                title: "Cascade Prevention",
                body: "Detect early warning signs of Kessler syndrome scenarios and coordinate multi-satellite evasive maneuvers autonomously.",
              },
              {
                icon: <Satellite className="h-6 w-6 text-violet-400" />,
                title: "Fleet Integration",
                body: "Seamlessly interface with any constellation operator through standardized APIs and real-time telemetry feeds.",
              },
            ].map((feature) => (
              <article
                key={feature.title}
                className="group bg-[#040810] p-8 sm:p-10 transition-colors duration-200 hover:bg-white/[0.02]"
              >
                <div className="mb-6 inline-flex rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/[0.06] transition-all group-hover:ring-white/[0.1]">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ═══════════════ CTA SECTION ═══════════════ */}
        <section id="capabilities" className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 py-28 sm:py-36">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-10 sm:p-16 text-center">
              <div className="mx-auto max-w-2xl space-y-6">
                <div className="inline-flex rounded-full bg-teal-500/[0.08] p-4">
                  <Orbit className="h-8 w-8 text-teal-400" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Ready to secure your orbital operations?
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Join the global consortium of space agencies and commercial operators already using Orbital AI to keep space safe and sustainable.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <Button
                    className="bg-teal-500 text-[#040810] font-semibold hover:bg-teal-400 border-0 h-12 px-8 text-sm transition-all"
                    render={<Link href="#" />}
                    nativeButton={false}
                  >
                    Request Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    render={<Link href="#" />}
                    nativeButton={false}
                    variant="outline"
                    className="border-slate-700/80 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white h-12 px-8 text-sm transition-all"
                  >
                    Read Documentation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="border-t border-white/[0.06] py-10">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Orbit className="h-4 w-4" />
              <span>© 2026 Orbital AI. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-600">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
