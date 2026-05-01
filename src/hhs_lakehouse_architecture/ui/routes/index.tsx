import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { animate } from "motion";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Database, Mail, FolderDown, AlertTriangle, Clock,
  Cloud, Layers, ChevronRight, ChevronLeft,
  HardDrive, Cpu, FileCode, Play, Server,
  CheckCircle, ArrowDown, Zap, Package, TriangleAlert,
  GitMerge, History, RefreshCw, ArrowRight, Users, BarChart3, TrendingUp,
  Lock, FileText, Search, Sun, Moon,
  Share2, Globe, Shield, Monitor,
} from "lucide-react";
import { useTheme } from "@/components/apx/theme-provider";

export const Route = createFileRoute("/")({
  component: HHSChapters,
});

// ─── Data ─────────────────────────────────────────────────────────────────────

const AGENCIES = [
  {
    id: "medicaid", abbr: "DOH", name: "Dept. of Health", sub: "Medicaid",
    colors: { border: "border-sky-600/60", bg: "bg-sky-950/40", text: "text-sky-300", dot: "bg-sky-400", dim: "bg-sky-950/20 border-sky-800/40 text-sky-500" },
    silos: ["Eligibility DB\n(Oracle 11g)", "Claims System\n(SQL Server)", "Provider Portal\n(MySQL)", "Enrollment\n(Excel / FTP)"],
  },
  {
    id: "snap", abbr: "DHS", name: "Dept. of Human Svcs.", sub: "SNAP",
    colors: { border: "border-emerald-600/60", bg: "bg-emerald-950/40", text: "text-emerald-300", dot: "bg-emerald-400", dim: "bg-emerald-950/20 border-emerald-800/40 text-emerald-500" },
    silos: ["Case Mgmt\n(AS/400)", "EBT System\n(Proprietary)", "Monthly Reports\n(SFTP drops)"],
  },
  {
    id: "cps", abbr: "DCFS", name: "Child & Family Svcs.", sub: "CPS",
    colors: { border: "border-orange-600/60", bg: "bg-orange-950/40", text: "text-orange-300", dot: "bg-orange-400", dim: "bg-orange-950/20 border-orange-800/40 text-orange-500" },
    silos: ["Intake Forms\n(SQL Server)", "Case Tracker\n(Oracle 10g)", "Court System\n(Legacy COBOL)"],
  },
  {
    id: "behavioral", abbr: "DBHDS", name: "Behavioral Health", sub: "DBHDS",
    colors: { border: "border-violet-600/60", bg: "bg-violet-950/40", text: "text-violet-300", dot: "bg-violet-400", dim: "bg-violet-950/20 border-violet-800/40 text-violet-500" },
    silos: ["Client Registry\n(Access DB)", "Treatment Plans\n(SQL Server)", "Billing System\n(ICD-10 flat files)"],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Pt = { x: number; y: number };

function getCenter(el: Element, container: Element): Pt {
  const e = el.getBoundingClientRect();
  const c = container.getBoundingClientRect();
  return { x: e.left - c.left + e.width / 2, y: e.top - c.top + e.height / 2 };
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ─── Chapter Intro Overlay ────────────────────────────────────────────────────

function ChapterIntro({
  chapter, subtitle, description, onDone,
}: {
  chapter: number; subtitle: string; description: string; onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950"
      onClick={onDone}
    >
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-slate-500 uppercase tracking-[0.4em] text-sm font-semibold mb-3"
      >
        Chapter {chapter}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="text-5xl font-bold text-white text-center mb-4"
      >
        {subtitle}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.7 }}
        className="text-slate-400 text-base text-center max-w-md"
      >
        {description}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0 }}
        className="text-slate-600 text-sm mt-8"
      >
        click to skip
      </motion.p>
    </motion.div>
  );
}

// ─── Flying Packet (FTP / Email) ──────────────────────────────────────────────

function FlyingPacket({
  from, to, type, label, delay: startDelay, hasError, repeatDelay,
}: {
  from: Pt; to: Pt; type: "ftp" | "email";
  label: string; delay: number; hasError?: boolean; repeatDelay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"hidden" | "flying" | "result">("hidden");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const run = async () => {
      await sleep(startDelay);
      while (mounted.current) {
        if (!ref.current) break;
        const midX = (from.x + to.x) / 2 + (Math.random() - 0.5) * 80;
        const midY = (from.y + to.y) / 2 - 90 - Math.random() * 40;
        await animate(ref.current, { x: from.x - 16, y: from.y - 16, opacity: 1 }, { duration: 0 });
        setStatus("flying");
        await animate(
          ref.current,
          { x: [from.x - 16, midX - 16, to.x - 16], y: [from.y - 16, midY - 16, to.y - 16] },
          { duration: type === "ftp" ? 3.2 : 2.1, ease: "easeInOut" }
        );
        if (!mounted.current) break;
        setStatus("result");
        await sleep(900);
        if (!mounted.current) break;
        await animate(ref.current, { opacity: 0 }, { duration: 0.3 });
        setStatus("hidden");
        await sleep(repeatDelay + Math.random() * 1500);
      }
    };
    run();
    return () => { mounted.current = false; };
  }, [from.x, from.y, to.x, to.y, type, startDelay, repeatDelay, hasError]);

  return (
    <div
      ref={ref}
      className="absolute pointer-events-none"
      style={{ top: 0, left: 0, zIndex: 30, width: 32, height: 32 }}
    >
      {status === "flying" && (
        <div className={`flex flex-col items-center`}>
          <div className={`rounded-lg p-1.5 shadow-lg ${type === "ftp" ? "bg-amber-800 border border-amber-600" : "bg-slate-700 border border-slate-500"}`}>
            {type === "ftp" ? <FolderDown className="w-3.5 h-3.5 text-amber-300" /> : <Mail className="w-3.5 h-3.5 text-slate-300" />}
          </div>
          <span className="text-[12px] text-slate-400 mt-0.5 whitespace-nowrap bg-slate-900/80 px-1 rounded">{label}</span>
        </div>
      )}
      {status === "result" && (
        <div className={`rounded-lg px-2 py-1 text-[13px] font-bold border ${hasError ? "bg-red-950 border-red-600 text-red-300" : "bg-slate-800 border-slate-600 text-slate-400"}`}>
          {hasError ? "❌ FAILED" : "✓ Sent"}
        </div>
      )}
    </div>
  );
}

// ─── Chapter 1 ────────────────────────────────────────────────────────────────

function Chapter1() {
  const containerRef = useRef<HTMLDivElement>(null);
  const agencyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [centers, setCenters] = useState<Pt[]>([]);
  const [playing, setPlaying] = useState(false);

  const computeCenters = useCallback(() => {
    if (!containerRef.current) return;
    const pts = agencyRefs.current.map((el) =>
      el ? getCenter(el, containerRef.current!) : { x: 0, y: 0 }
    );
    setCenters(pts);
  }, []);

  useEffect(() => {
    computeCenters();
    const obs = new ResizeObserver(computeCenters);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [computeCenters]);

  const transfers = centers.length === 4
    ? [
        { from: centers[0], to: centers[1], type: "email" as const, label: "Income verification", delay: 800, repeatDelay: 4000, hasError: false },
        { from: centers[1], to: centers[2], type: "ftp" as const, label: "SNAP eligibility", delay: 2200, repeatDelay: 5500, hasError: false },
        { from: centers[2], to: centers[3], type: "email" as const, label: "Case referral", delay: 1200, repeatDelay: 4800, hasError: true },
        { from: centers[3], to: centers[0], type: "ftp" as const, label: "Auth request", delay: 3500, repeatDelay: 6000, hasError: false },
        { from: centers[0], to: centers[2], type: "email" as const, label: "Medical records", delay: 5000, repeatDelay: 7000, hasError: true },
        { from: centers[1], to: centers[3], type: "ftp" as const, label: "Caseload data", delay: 4000, repeatDelay: 5000, hasError: false },
      ]
    : [];

  const problems = [
    { icon: Clock, label: "3-day lag", sub: "Nightly FTP batches" },
    { icon: AlertTriangle, label: "Duplicates", sub: "No master record" },
    { icon: TriangleAlert, label: "Failed transfers", sub: "No retry logic" },
    { icon: Database, label: "7 formats", sub: "CSV, EDI, HL7, PDF…" },
    { icon: HardDrive, label: "No lineage", sub: "Who changed what?" },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top label */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-red-400 text-sm font-semibold uppercase tracking-widest">The Problem</p>
          <h2 className="text-white text-xl font-bold">Every agency is an island</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Data shared via FTP drops and email — manual, delayed, error-prone
          </p>
        </div>
        <button
          onClick={() => setPlaying(!playing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-bold transition-all ${playing ? "border-red-600/60 bg-red-950/40 text-red-300" : "border-slate-600 bg-slate-800 text-slate-200 hover:border-slate-400"}`}
        >
          <Play className="w-3.5 h-3.5" />
          {playing ? "Stop simulation" : "Simulate data sharing"}
        </button>
      </div>

      <div ref={containerRef} className="relative flex-1">
        {/* SVG connection arcs (static, background) */}
        {centers.length === 4 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {[[0,1],[1,2],[2,3],[3,0],[0,2],[1,3]].map(([a, b], i) => {
              const from = centers[a], to = centers[b];
              const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - 80 };
              return (
                <path
                  key={i}
                  d={`M ${from.x} ${from.y} Q ${mid.x} ${mid.y} ${to.x} ${to.y}`}
                  stroke="#1e293b" strokeWidth="1.5" strokeDasharray="5 4" fill="none"
                />
              );
            })}
          </svg>
        )}

        {/* Agency cards — 2×2 grid */}
        <div className="absolute inset-0 grid grid-cols-2 gap-4" style={{ zIndex: 10 }}>
          {AGENCIES.map((ag, idx) => (
            <div
              key={ag.id}
              ref={(el) => { agencyRefs.current[idx] = el; }}
              className={`rounded-xl border ${ag.colors.border} ${ag.colors.bg} backdrop-blur-sm p-4 flex flex-col gap-2`}
            >
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${ag.colors.dot}`} />
                <div>
                  <p className={`text-[14px] font-bold uppercase tracking-widest ${ag.colors.text}`}>{ag.abbr}</p>
                  <p className="text-white text-base font-bold leading-tight">{ag.name}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-[13px] text-slate-500 border border-slate-700/60 rounded px-1.5 py-0.5">
                  <HardDrive className="w-2.5 h-2.5" />
                  Siloed
                </div>
              </div>

              {/* Internal silos */}
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {ag.silos.map((silo) => {
                  const [name, tech] = silo.split("\n");
                  return (
                    <div key={silo} className={`rounded-lg border px-2 py-1.5 ${ag.colors.dim}`}>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Database className="w-2.5 h-2.5" />
                        <p className="text-[13px] font-bold leading-tight">{name}</p>
                      </div>
                      <p className="text-[12px] opacity-60">{tech}</p>
                    </div>
                  );
                })}
              </div>

              {/* Silo wall indicator */}
              <div className="mt-auto flex items-center gap-1 text-[13px] text-red-500/70">
                <AlertTriangle className="w-3 h-3" />
                <span>No external API · data exits via FTP / email</span>
              </div>
            </div>
          ))}
        </div>

        {/* Flying packets */}
        {playing && transfers.map((t, i) => (
          <FlyingPacket key={i} {...t} />
        ))}
      </div>

      {/* Problem stats bar */}
      <div className="grid grid-cols-5 gap-2 shrink-0">
        {problems.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="rounded-lg border border-red-900/50 bg-red-950/30 p-2 flex flex-col items-center text-center gap-1">
            <Icon className="w-3.5 h-3.5 text-red-400" />
            <p className="text-[14px] font-bold text-red-300">{label}</p>
            <p className="text-[13px] text-red-500/80">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chapter 2 ────────────────────────────────────────────────────────────────

interface StreamParticle { id: number; agencyIdx: number; }

function Chapter2() {
  const containerRef = useRef<HTMLDivElement>(null);
  const agencyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const storageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "streaming" | "built">("idle");
  const [particles, setParticles] = useState<StreamParticle[]>([]);
  const [storageVisible, setStorageVisible] = useState(false);
  const [computeVisible, setComputeVisible] = useState(false);
  const [checks, setChecks] = useState<string[]>([]);
  const particleId = useRef(0);
  const streamActive = useRef(false);

  const runBuild = useCallback(async () => {
    if (phase !== "idle") return;
    setPhase("streaming");
    streamActive.current = true;

    // Stream particles from each agency to storage
    const streamLoop = async () => {
      while (streamActive.current) {
        for (let agIdx = 0; agIdx < 4; agIdx++) {
          if (!streamActive.current) break;
          const id = particleId.current++;
          setParticles((p) => [...p, { id, agencyIdx: agIdx }]);
          setTimeout(() => setParticles((p) => p.filter((x) => x.id !== id)), 1800);
          await sleep(120);
        }
        await sleep(200);
      }
    };

    streamLoop();

    // Materialise storage after 1s
    await sleep(1000);
    setStorageVisible(true);

    // Show checks one by one
    await sleep(800);
    setChecks(["Cloud-native storage (ADLS / S3 / GCS)"]);
    await sleep(700);
    setChecks((c) => [...c, "Open format — Delta Lake (Parquet + transaction log)"]);
    await sleep(700);
    setChecks((c) => [...c, "Data separated from compute"]);
    await sleep(800);
    setComputeVisible(true);
    await sleep(600);
    setChecks((c) => [...c, "Compute scales independently"]);

    streamActive.current = false;
    setPhase("built");
  }, [phase]);

  const reset = useCallback(() => {
    streamActive.current = false;
    setPhase("idle");
    setParticles([]);
    setStorageVisible(false);
    setComputeVisible(false);
    setChecks([]);
  }, []);

  // Compute agency card centers relative to container for particle animation
  const [agencyCenters, setAgencyCenters] = useState<Pt[]>([]);
  const [storageCenter, setStorageCenter] = useState<Pt>({ x: 0, y: 0 });

  const recompute = useCallback(() => {
    if (!containerRef.current) return;
    setAgencyCenters(
      agencyRefs.current.map((el) =>
        el ? getCenter(el, containerRef.current!) : { x: 0, y: 0 }
      )
    );
    if (storageRef.current)
      setStorageCenter(getCenter(storageRef.current, containerRef.current));
  }, []);

  useEffect(() => {
    recompute();
    const obs = new ResizeObserver(recompute);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [recompute, storageVisible]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top label */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest">The Foundation</p>
          <h2 className="text-white text-xl font-bold">Separate data from compute · One cloud store</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            All agency data lands in a single cloud storage layer in open format
          </p>
        </div>
        <div className="flex gap-2">
          {phase !== "idle" && (
            <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-sm font-medium hover:border-slate-500 transition-colors">
              Reset
            </button>
          )}
          <button
            onClick={runBuild}
            disabled={phase !== "idle"}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-bold transition-all ${phase !== "idle" ? "border-blue-700/60 bg-blue-950/40 text-blue-400 cursor-default" : "border-blue-500 bg-blue-600 text-white hover:bg-blue-500"}`}
          >
            <Play className="w-3.5 h-3.5" />
            {phase === "idle" ? "Build foundation" : phase === "streaming" ? "Building…" : "Complete ✓"}
          </button>
        </div>
      </div>

      <div ref={containerRef} className="relative flex-1 flex flex-col gap-3">

        {/* Agency row — compact, top */}
        <div className="grid grid-cols-4 gap-2 shrink-0" style={{ zIndex: 10 }}>
          {AGENCIES.map((ag, idx) => (
            <motion.div
              key={ag.id}
              ref={(el) => { agencyRefs.current[idx] = el; }}
              animate={{ opacity: phase === "built" ? 0.4 : 1 }}
              transition={{ duration: 1 }}
              className={`rounded-xl border ${ag.colors.border} ${ag.colors.bg} p-3`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-1.5 h-1.5 rounded-full ${ag.colors.dot}`} />
                <p className={`text-[14px] font-bold ${ag.colors.text}`}>{ag.abbr}</p>
              </div>
              <div className="flex flex-col gap-1">
                {ag.silos.slice(0, 2).map((s) => {
                  const [name] = s.split("\n");
                  return (
                    <div key={s} className={`rounded border px-1.5 py-1 text-[13px] ${ag.colors.dim} flex items-center gap-1`}>
                      <Database className="w-2.5 h-2.5 shrink-0" />
                      {name}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Streaming particle layer */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
          <AnimatePresence>
            {particles.map((p) => {
              const from = agencyCenters[p.agencyIdx] ?? { x: 0, y: 0 };
              const to = storageCenter;
              const color = ["bg-sky-400", "bg-emerald-400", "bg-orange-400", "bg-violet-400"][p.agencyIdx];
              return (
                <motion.div
                  key={p.id}
                  className={`absolute w-2 h-2 rounded-full ${color} shadow-[0_0_6px_currentColor]`}
                  style={{ top: 0, left: 0 }}
                  initial={{ x: from.x - 4, y: from.y - 4, opacity: 1, scale: 1 }}
                  animate={{ x: to.x - 4, y: to.y - 4, opacity: 0.4, scale: 0.7 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, ease: "easeIn" }}
                />
              );
            })}
          </AnimatePresence>
        </div>

        {/* Arrow indicators */}
        {phase !== "idle" && (
          <div className="flex justify-around shrink-0 py-1" style={{ zIndex: 5 }}>
            {AGENCIES.map((ag) => (
              <motion.div key={ag.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <ArrowDown className={`w-4 h-4 ${ag.colors.text} animate-bounce`} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Unified Cloud Storage */}
        <AnimatePresence>
          {storageVisible && (
            <motion.div
              ref={storageRef}
              initial={{ opacity: 0, scaleY: 0.3, y: 30 }}
              animate={{ opacity: 1, scaleY: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              className="relative rounded-xl border-2 border-blue-500/70 bg-blue-950/50 p-5 shrink-0"
              style={{ zIndex: 10 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500 rounded-lg p-2 shrink-0"><Cloud className="w-5 h-5 text-white" /></div>
                <div>
                  <p className="text-[14px] text-blue-400 uppercase tracking-widest font-semibold">Unified Cloud Object Storage</p>
                  <h3 className="text-white font-bold text-lg">One foundation for all agency data</h3>
                </div>
                <div className="ml-auto flex gap-2">
                  {["ADLS Gen2", "S3", "GCS"].map((s) => (
                    <span key={s} className="text-[14px] border border-blue-700/60 bg-blue-900/40 text-blue-300 px-2 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>

              {/* Data zones */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Raw / Bronze", desc: "All agency data as-is", icon: Package, color: "border-amber-700/50 bg-amber-950/40 text-amber-300" },
                  { label: "Open Format", desc: "Delta Lake · Parquet · ORC", icon: FileCode, color: "border-blue-600/50 bg-blue-900/40 text-blue-300" },
                  { label: "Immutable Log", desc: "Transaction log — full history", icon: Layers, color: "border-teal-600/50 bg-teal-950/40 text-teal-300" },
                ].map(({ label, desc, icon: Icon, color }) => (
                  <div key={label} className={`rounded-lg border p-3 ${color}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5" />
                      <p className="text-sm font-bold">{label}</p>
                    </div>
                    <p className="text-[14px] opacity-70">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Incoming agency streams indicator */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-[14px] text-slate-400">Ingesting from:</span>
                {AGENCIES.map((ag) => (
                  <motion.span
                    key={ag.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 * AGENCIES.indexOf(ag) }}
                    className={`text-[13px] font-bold px-2 py-0.5 rounded-full border ${ag.colors.dim}`}
                  >
                    {ag.abbr}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compute layer */}
        <AnimatePresence>
          {computeVisible && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-xl border border-cyan-600/50 bg-cyan-950/40 p-4 w-48"
              style={{ zIndex: 25 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-cyan-700/80 rounded-lg p-1.5"><Cpu className="w-4 h-4 text-white" /></div>
                <div>
                  <p className="text-[13px] text-cyan-400 uppercase tracking-widest font-bold">Compute</p>
                  <p className="text-white text-sm font-bold">Separate Layer</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {["SQL Warehouse", "ML Cluster", "Notebooks", "Dashboards"].map((c) => (
                  <div key={c} className="flex items-center gap-1.5 rounded border border-cyan-800/40 bg-cyan-900/20 px-2 py-1">
                    <Zap className="w-2.5 h-2.5 text-cyan-400" />
                    <span className="text-[13px] text-cyan-300">{c}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded border border-cyan-700/40 bg-cyan-900/20 px-2 py-1.5 text-center">
                <p className="text-[13px] text-cyan-400 font-medium">Reads from storage</p>
                <p className="text-[12px] text-cyan-600">Scales independently</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Achievement checks */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        {[
          "Cloud-native storage (ADLS / S3 / GCS)",
          "Open format — Delta Lake (Parquet + transaction log)",
          "Data separated from compute",
          "Compute scales independently",
        ].map((label) => (
          <motion.div
            key={label}
            initial={{ opacity: 0.15 }}
            animate={{ opacity: checks.includes(label) ? 1 : 0.15 }}
            className={`rounded-lg border p-2.5 flex items-start gap-2 ${checks.includes(label) ? "border-emerald-600/60 bg-emerald-950/40" : "border-slate-700/40 bg-slate-900/40"}`}
          >
            <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${checks.includes(label) ? "text-emerald-400" : "text-slate-700"}`} />
            <p className={`text-[14px] font-medium leading-snug ${checks.includes(label) ? "text-emerald-300" : "text-slate-600"}`}>{label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Chapter 3 Data ───────────────────────────────────────────────────────────

const COMMITS = [
  { v: "00000", op: "WRITE",  detail: "Initial load — 1.2M Medicaid claims",    color: "emerald", ts: "2024-01-01 06:00" },
  { v: "00001", op: "WRITE",  detail: "Nightly batch — 48k new claims",          color: "emerald", ts: "2024-01-02 02:15" },
  { v: "00002", op: "MERGE",  detail: "Update 3,201 member addresses",           color: "blue",    ts: "2024-01-02 08:30" },
  { v: "00003", op: "DELETE", detail: "Purge 120 expired duplicate records",     color: "red",     ts: "2024-01-02 11:00" },
  { v: "00004", op: "SCHEMA", detail: "ADD COLUMN risk_score DOUBLE",            color: "violet",  ts: "2024-01-03 09:45" },
];

const TT_VERSIONS = [
  { v: 0, label: "Initial load",      rows: [["M-001","Smith, John","Active"],["M-002","Jones, Mary","Active"],["M-003","Lee, David","Pending"]] },
  { v: 1, label: "After batch write", rows: [["M-001","Smith, John","Active"],["M-002","Jones, Mary","Active"],["M-003","Lee, David","Pending"],["M-004","Brown, Lisa","Active"],["M-005","Davis, Tom","Active"]] },
  { v: 2, label: "After DELETE",      rows: [["M-001","Smith, John","Active"],["M-002","Jones, Mary","Active"],["M-004","Brown, Lisa","Active"],["M-005","Davis, Tom","Active"]] },
  { v: 3, label: "After MERGE",       rows: [["M-001","Smith, John","Enrolled"],["M-002","Jones, Mary","Enrolled"],["M-004","Brown, Lisa","Active"],["M-005","Davis, Tom","Enrolled"]] },
];

// ─── Chapter 3 ────────────────────────────────────────────────────────────────

function Chapter3() {
  const [visibleCommits, setVisibleCommits] = useState(0);
  const [ttVersion, setTtVersion] = useState(0);
  const [atomicPhase, setAtomicPhase] = useState<"idle"|"writing"|"failed"|"rollback"|"clean">("idle");
  const [schemaActive, setSchemaActive] = useState(false);
  const [mergePhase, setMergePhase] = useState(0);
  const [mergeRunning, setMergeRunning] = useState(false);

  // Auto-stream commits on mount
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => { i++; setVisibleCommits(i); if (i >= COMMITS.length) clearInterval(id); }, 550);
    return () => clearInterval(id);
  }, []);

  const runAtomic = useCallback(async () => {
    if (atomicPhase !== "idle") return;
    for (const p of ["writing","failed","rollback","clean"] as const) {
      setAtomicPhase(p); await sleep(p === "clean" ? 1600 : 850);
    }
    setAtomicPhase("idle");
  }, [atomicPhase]);

  const runSchema = useCallback(async () => {
    if (schemaActive) return;
    setSchemaActive(true); await sleep(2800); setSchemaActive(false);
  }, [schemaActive]);

  const runMerge = useCallback(async () => {
    if (mergeRunning) return;
    setMergeRunning(true);
    for (let p = 1; p <= 4; p++) { setMergePhase(p); await sleep(p === 4 ? 1200 : 900); }
    await sleep(600); setMergePhase(0); setMergeRunning(false);
  }, [mergeRunning]);

  const commitColor = (c: string) =>
    c === "emerald" ? { border: "border-emerald-700/50", bg: "bg-emerald-950/40", badge: "bg-emerald-900/60 text-emerald-300", text: "text-emerald-400" } :
    c === "blue"    ? { border: "border-blue-700/50",    bg: "bg-blue-950/40",    badge: "bg-blue-900/60 text-blue-300",       text: "text-blue-400" } :
    c === "red"     ? { border: "border-red-700/50",     bg: "bg-red-950/40",     badge: "bg-red-900/60 text-red-300",         text: "text-red-400" } :
                      { border: "border-violet-700/50",  bg: "bg-violet-950/40",  badge: "bg-violet-900/60 text-violet-300",   text: "text-violet-400" };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div>
        <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest">The Upgrade</p>
        <h2 className="text-white text-xl font-bold">Delta Lake — ACID transactions on your cloud store</h2>
        <p className="text-slate-400 text-sm mt-0.5">A JSON transaction log turns raw object storage into a reliable, queryable lakehouse table</p>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-3 min-h-0 overflow-hidden">

        {/* ── Col 1: Transaction Log ── */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          <div className="rounded-xl border border-amber-600/50 bg-amber-950/25 p-4 flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-2 mb-3 shrink-0">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 font-bold text-base font-mono">_delta_log/</span>
              <span className="text-[13px] text-amber-600 ml-auto">commit journal</span>
            </div>
            <div className="flex flex-col gap-1.5 overflow-y-auto">
              {COMMITS.map((c, i) => {
                const col = commitColor(c.color);
                return (
                  <AnimatePresence key={c.v}>
                    {i < visibleCommits && (
                      <motion.div
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.32 }}
                        className={`rounded-lg border px-2.5 py-2 shrink-0 ${col.border} ${col.bg}`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[12px] font-mono ${col.text}`}>{c.v}.json</span>
                          <span className={`text-[13px] font-bold px-1.5 py-0.5 rounded ${col.badge}`}>{c.op}</span>
                        </div>
                        <p className="text-[13px] text-slate-300">{c.detail}</p>
                        <p className="text-[12px] text-slate-600 mt-0.5">{c.ts}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                );
              })}
            </div>
            <div className="mt-3 shrink-0 rounded-lg border border-amber-800/40 bg-amber-950/40 p-2">
              <p className="text-[13px] text-amber-400 font-medium">Every operation = one commit file</p>
              <p className="text-[12px] text-amber-600 mt-0.5">Time travel, rollback, and auditing for free</p>
            </div>
          </div>
        </div>

        {/* ── Col 2: ACID Cards ── */}
        <div className="flex flex-col gap-2.5 min-h-0">

          {/* Atomic */}
          <div className="rounded-xl border border-blue-600/50 bg-blue-950/25 p-3 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-300 font-black text-xl w-6">A</span>
              <div className="flex-1">
                <p className="text-white font-bold text-sm leading-tight">Atomic</p>
                <p className="text-slate-400 text-[14px]">All-or-nothing writes</p>
              </div>
              <button onClick={runAtomic} disabled={atomicPhase !== "idle"}
                className="px-2 py-1 rounded text-[13px] border border-blue-700/60 bg-blue-900/40 text-blue-300 hover:border-blue-400 disabled:opacity-40 transition-colors">
                Simulate
              </button>
            </div>
            <div className="flex gap-1">
              {(["writing","failed","rollback","clean"] as const).map((p) => (
                <motion.div key={p}
                  animate={{ opacity: atomicPhase === p ? 1 : atomicPhase === "idle" ? 0.3 : 0.15, scale: atomicPhase === p ? 1.03 : 1 }}
                  className={`flex-1 rounded border p-1.5 text-center text-[12px] font-bold ${
                    p === "writing"  ? "border-blue-700/50 bg-blue-900/30 text-blue-300" :
                    p === "failed"   ? "border-red-700/50 bg-red-900/30 text-red-300" :
                    p === "rollback" ? "border-amber-700/50 bg-amber-900/30 text-amber-300" :
                                       "border-emerald-700/50 bg-emerald-900/30 text-emerald-300"}`}>
                  {p === "rollback" ? "ROLLBACK" : p.toUpperCase()}
                </motion.div>
              ))}
            </div>
            <AnimatePresence>
              {atomicPhase === "clean" && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-[13px] text-emerald-400 mt-1.5 text-center font-medium">
                  ✓ Table consistent — write never partially committed
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Consistent */}
          <div className="rounded-xl border border-violet-600/50 bg-violet-950/25 p-3 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-violet-300 font-black text-xl w-6">C</span>
              <div className="flex-1">
                <p className="text-white font-bold text-sm leading-tight">Consistent</p>
                <p className="text-slate-400 text-[14px]">Schema enforcement — bad data blocked</p>
              </div>
              <button onClick={runSchema} disabled={schemaActive}
                className="px-2 py-1 rounded text-[13px] border border-violet-700/60 bg-violet-900/40 text-violet-300 hover:border-violet-400 disabled:opacity-40 transition-colors">
                Test
              </button>
            </div>
            <AnimatePresence mode="wait">
              {schemaActive ? (
                <motion.div key="schema" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded border border-red-700/50 bg-red-950/40 p-2 font-mono text-[12px]">
                  <p className="text-red-400">INSERT VALUES ('M-999', NULL, 'BAD_DATE')</p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                    className="text-red-300 mt-1">❌ member_id NOT NULL · date invalid</motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
                    className="text-emerald-400 mt-0.5">✓ Row rejected — table unchanged</motion.p>
                </motion.div>
              ) : (
                <motion.p key="idle" className="text-[13px] text-slate-500">Click Test to send a bad row →</motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Isolated */}
          <div className="rounded-xl border border-teal-600/50 bg-teal-950/25 p-3 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-teal-300 font-black text-xl w-6">I</span>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Isolated</p>
                <p className="text-slate-400 text-[14px]">Concurrent writers — no corruption</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[
                { w: "Writer A", detail: "v5 → commit → v6 ✓" },
                { w: "Writer B", detail: "v5 → conflict → retry v6 → v7 ✓" },
              ].map(({ w, detail }) => (
                <div key={w} className="flex-1 rounded border border-teal-700/40 bg-teal-900/20 p-2">
                  <p className="text-[13px] font-bold text-teal-300">{w}</p>
                  <p className="text-[12px] text-teal-500 mt-0.5">{detail}</p>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-slate-500 mt-1.5">Optimistic concurrency — no table-level locks</p>
          </div>

          {/* Durable */}
          <div className="rounded-xl border border-amber-600/50 bg-amber-950/25 p-3 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-300 font-black text-xl w-6">D</span>
              <div>
                <p className="text-white font-bold text-sm leading-tight">Durable</p>
                <p className="text-slate-400 text-[14px]">Log survives cluster failures</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[
                { label: "Cluster crash", sub: "compute lost", col: "border-red-700/40 bg-red-950/30 text-red-300" },
                { label: "_delta_log/", sub: "persists in ADLS", col: "border-amber-700/40 bg-amber-950/30 text-amber-300" },
                { label: "Recovery", sub: "zero data loss", col: "border-emerald-700/40 bg-emerald-950/30 text-emerald-300" },
              ].map(({ label, sub, col }, i, arr) => (
                <>
                  <div key={label} className={`flex-1 rounded border p-1.5 text-center ${col}`}>
                    <p className="text-[13px] font-bold">{label}</p>
                    <p className="text-[12px] opacity-70">{sub}</p>
                  </div>
                  {i < arr.length - 1 && <span key={`arr-${i}`} className="text-slate-600 text-sm">→</span>}
                </>
              ))}
            </div>
          </div>
        </div>

        {/* ── Col 3: Time Travel + MERGE ── */}
        <div className="flex flex-col gap-3 min-h-0">

          {/* Time Travel */}
          <div className="rounded-xl border border-indigo-600/50 bg-indigo-950/25 p-4 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-indigo-400" />
              <p className="text-white font-bold text-base">Time Travel</p>
              <span className="text-[13px] text-indigo-500 ml-auto font-mono">VERSION AS OF {ttVersion}</span>
            </div>
            {/* SQL snippet */}
            <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 px-3 py-2 mb-3 font-mono text-[14px] leading-relaxed">
              <span className="text-blue-400">SELECT</span>{" "}<span className="text-slate-300">*</span>{" "}
              <span className="text-blue-400">FROM</span>{" "}<span className="text-emerald-400">medicaid_claims</span><br />
              <span className="text-violet-400">VERSION AS OF</span>{" "}<span className="text-amber-300">{ttVersion}</span>
            </div>
            {/* Version selector */}
            <div className="flex gap-1 mb-3">
              {TT_VERSIONS.map((v) => (
                <button key={v.v} onClick={() => setTtVersion(v.v)}
                  className={`flex-1 py-1 rounded text-[13px] font-bold border transition-all ${v.v === ttVersion ? "border-indigo-500 bg-indigo-700 text-white" : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"}`}>
                  v{v.v}
                </button>
              ))}
            </div>
            {/* Table snapshot */}
            <AnimatePresence mode="wait">
              {(() => {
                const snap = TT_VERSIONS[ttVersion];
                return (
                  <motion.div key={ttVersion} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <p className="text-[13px] text-indigo-400 mb-1.5 font-medium">{snap.label} · {snap.rows.length} rows</p>
                    <div className="space-y-1">
                      {snap.rows.map((row, i) => (
                        <div key={i} className="flex items-center gap-2 text-[12px] font-mono rounded bg-slate-900/60 px-2 py-1">
                          <span className="text-slate-500">{row[0]}</span>
                          <span className="text-slate-300 flex-1">{row[1]}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${row[2] === "Enrolled" ? "bg-emerald-900 text-emerald-300" : row[2] === "Active" ? "bg-blue-900 text-blue-300" : "bg-amber-900 text-amber-300"}`}>{row[2]}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>

          {/* MERGE */}
          <div className="rounded-xl border border-cyan-600/50 bg-cyan-950/25 p-4 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <GitMerge className="w-4 h-4 text-cyan-400" />
              <p className="text-white font-bold text-base">MERGE (Upsert)</p>
              <button onClick={runMerge} disabled={mergeRunning}
                className="ml-auto px-2.5 py-1 rounded text-[13px] border border-cyan-600/60 bg-cyan-900/40 text-cyan-300 hover:border-cyan-400 disabled:opacity-40 transition-colors font-bold">
                Run MERGE
              </button>
            </div>
            <div className="space-y-1.5">
              {[
                { p: 1, label: "Read incoming batch (3,201 records)", color: "blue" },
                { p: 2, label: "MATCHED → UPDATE member addresses",    color: "amber" },
                { p: 3, label: "NOT MATCHED → INSERT new members",     color: "emerald" },
                { p: 4, label: "Atomic commit → _delta_log/ 00002.json", color: "violet" },
              ].map(({ p, label, color }) => (
                <motion.div key={p}
                  animate={{ opacity: mergePhase >= p ? 1 : 0.2, scale: mergePhase === p ? 1.01 : 1 }}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors ${
                    mergePhase >= p
                      ? color === "blue"    ? "border-blue-700/60 bg-blue-950/40"       :
                        color === "amber"   ? "border-amber-700/60 bg-amber-950/40"     :
                        color === "emerald" ? "border-emerald-700/60 bg-emerald-950/40" :
                                              "border-violet-700/60 bg-violet-950/40"
                      : "border-slate-700/30 bg-slate-900/20"
                  }`}>
                  <span className={`text-[13px] font-bold w-4 shrink-0 ${mergePhase > p ? "text-emerald-400" : mergePhase === p ? "text-white animate-pulse" : "text-slate-600"}`}>
                    {mergePhase > p ? "✓" : p}
                  </span>
                  <p className={`text-[13px] ${mergePhase >= p ? "text-slate-200" : "text-slate-600"}`}>{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chapter 4 Data ───────────────────────────────────────────────────────────

const BRONZE_TABLES = [
  {
    idx: 0, table: "medicaid.claims_bronze",
    method: "Auto Loader", methodColor: "sky",
    startRows: 1_200_000, rate: 920,  startVersion: 42,
    schema: ["claim_id STRING", "member_id STRING", "service_date DATE", "billed_amount DECIMAL", "_source_file STRING", "_ingested_at TIMESTAMP"],
  },
  {
    idx: 1, table: "snap.cases_bronze",
    method: "Structured Streaming", methodColor: "emerald",
    startRows: 450_000, rate: 340, startVersion: 18,
    schema: ["case_id STRING", "recipient_id STRING", "benefit_month DATE", "ebt_amount DECIMAL", "_kafka_offset LONG", "_ingested_at TIMESTAMP"],
  },
  {
    idx: 2, table: "cps.intakes_bronze",
    method: "Batch Job", methodColor: "orange",
    startRows: 82_000, rate: 130, startVersion: 7,
    schema: ["intake_id STRING", "child_id STRING", "report_date DATE", "disposition STRING", "worker_id STRING", "_ingested_at TIMESTAMP"],
  },
  {
    idx: 3, table: "behavioral.clients_bronze",
    method: "Auto Loader", methodColor: "violet",
    startRows: 165_000, rate: 210, startVersion: 23,
    schema: ["client_id STRING", "visit_date DATE", "provider_id STRING", "diagnosis_code STRING", "_source_file STRING", "_ingested_at TIMESTAMP"],
  },
] as const;

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

// ─── Chapter 4 ────────────────────────────────────────────────────────────────

interface BronzeState { rows: number; version: number; lastTs: string; }

function Chapter4() {
  const [ingesting, setIngesting] = useState(false);
  const [done, setDone] = useState(false);
  const [bronzeState, setBronzeState] = useState<BronzeState[]>(
    BRONZE_TABLES.map((t) => ({ rows: t.startRows, version: t.startVersion, lastTs: "" }))
  );
  const [particles, setParticles] = useState<{ id: number; agIdx: number }[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const agencyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tableRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [agCenters, setAgCenters] = useState<Pt[]>([]);
  const [tblCenters, setTblCenters] = useState<Pt[]>([]);
  const timers = useRef<ReturnType<typeof setInterval>[]>([]);
  const pidRef = useRef(0);

  const recompute = useCallback(() => {
    if (!containerRef.current) return;
    setAgCenters(agencyRefs.current.map((el) => el ? getCenter(el, containerRef.current!) : { x: 0, y: 0 }));
    setTblCenters(tableRefs.current.map((el) => el ? getCenter(el, containerRef.current!) : { x: 0, y: 0 }));
  }, []);

  useEffect(() => {
    recompute();
    const obs = new ResizeObserver(recompute);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => { obs.disconnect(); timers.current.forEach(clearInterval); };
  }, [recompute]);

  const startIngestion = useCallback(() => {
    setIngesting(true);
    setDone(false);

    // Row count + version ticker
    timers.current.push(setInterval(() => {
      setBronzeState((prev) =>
        prev.map((s, i) => {
          const t = BRONZE_TABLES[i];
          const newRows = s.rows + t.rate;
          const bump = Math.random() < 0.25;
          const now = new Date();
          return { rows: newRows, version: bump ? s.version + 1 : s.version, lastTs: now.toISOString().slice(11, 19) };
        })
      );
    }, 250));

    // Particle emitter — stagger by agency
    BRONZE_TABLES.forEach((_, i) => {
      timers.current.push(setInterval(() => {
        const id = pidRef.current++;
        setParticles((p) => [...p.slice(-32), { id, agIdx: i }]);
        setTimeout(() => setParticles((p) => p.filter((x) => x.id !== id)), 1600);
      }, 350 + i * 80));
    });

    // Auto-stop after 8s
    setTimeout(() => {
      timers.current.forEach(clearInterval);
      timers.current = [];
      setIngesting(false);
      setParticles([]);
      setDone(true);
    }, 8000);
  }, []);

  const reset = useCallback(() => {
    timers.current.forEach(clearInterval);
    timers.current = [];
    setIngesting(false);
    setDone(false);
    setParticles([]);
    setBronzeState(BRONZE_TABLES.map((t) => ({ rows: t.startRows, version: t.startVersion, lastTs: "" })));
  }, []);

  const methodColor = (c: string) =>
    c === "sky"     ? "border-sky-700/60 bg-sky-900/30 text-sky-300"         :
    c === "emerald" ? "border-emerald-700/60 bg-emerald-900/30 text-emerald-300" :
    c === "orange"  ? "border-orange-700/60 bg-orange-900/30 text-orange-300"    :
                      "border-violet-700/60 bg-violet-900/30 text-violet-300";

  const agColor = (i: number) => [
    { dot: "bg-sky-400",    dim: "bg-sky-950/30 border-sky-700/50 text-sky-400"     },
    { dot: "bg-emerald-400",dim: "bg-emerald-950/30 border-emerald-700/50 text-emerald-400" },
    { dot: "bg-orange-400", dim: "bg-orange-950/30 border-orange-700/50 text-orange-400"  },
    { dot: "bg-violet-400", dim: "bg-violet-950/30 border-violet-700/50 text-violet-400"  },
  ][i];

  const particleColors = ["bg-sky-400", "bg-emerald-400", "bg-orange-400", "bg-violet-400"];

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest">The Medallion Begins</p>
          <h2 className="text-white text-xl font-bold">Bronze ingestion — Delta on the foundation</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Agency data lands raw into Delta tables inside the unified cloud store · ACID-guaranteed from the start
          </p>
        </div>
        <div className="flex gap-2">
          {(ingesting || done) && (
            <button onClick={reset} className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-sm font-medium hover:border-slate-500 transition-colors">
              Reset
            </button>
          )}
          <button
            onClick={startIngestion}
            disabled={ingesting}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border text-sm font-bold transition-all ${ingesting ? "border-amber-700/60 bg-amber-950/40 text-amber-400 cursor-wait" : done ? "border-emerald-600 bg-emerald-950/40 text-emerald-300" : "border-amber-500 bg-amber-600 text-white hover:bg-amber-500"}`}
          >
            {ingesting ? (
              <><div className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />Ingesting…</>
            ) : done ? <>✓ Ingestion complete</> : <><Play className="w-3.5 h-3.5" />Start ingestion</>}
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 flex flex-col gap-2 relative min-h-0">

        {/* Particle overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 25 }}>
          <AnimatePresence>
            {particles.map((p) => {
              const from = agCenters[p.agIdx] ?? { x: 0, y: 0 };
              const to = tblCenters[p.agIdx] ?? { x: 0, y: 0 };
              return (
                <motion.div
                  key={p.id}
                  className={`absolute w-2 h-2 rounded-full ${particleColors[p.agIdx]} shadow-[0_0_6px_currentColor]`}
                  style={{ top: 0, left: 0 }}
                  initial={{ x: from.x - 4, y: from.y - 4, opacity: 1, scale: 1.2 }}
                  animate={{ x: to.x - 4, y: to.y - 4, opacity: 0.5, scale: 0.8 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.3, ease: "easeIn" }}
                />
              );
            })}
          </AnimatePresence>
        </div>

        {/* ── Agency sources (top, compact) ── */}
        <div className="grid grid-cols-4 gap-2 shrink-0" style={{ zIndex: 10 }}>
          {AGENCIES.map((ag, i) => (
            <div
              key={ag.id}
              ref={(el) => { agencyRefs.current[i] = el; }}
              className={`rounded-xl border p-3 ${ag.colors.border} ${ag.colors.bg}`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className={`w-1.5 h-1.5 rounded-full ${agColor(i).dot}`} />
                <p className={`text-[14px] font-bold ${ag.colors.text}`}>{ag.abbr}</p>
                <span className={`ml-auto text-[12px] px-1.5 py-0.5 rounded-full border font-medium ${methodColor(BRONZE_TABLES[i].methodColor)}`}>
                  {BRONZE_TABLES[i].method}
                </span>
              </div>
              <div className="space-y-1">
                {ag.silos.slice(0, 2).map((s) => {
                  const [name] = s.split("\n");
                  return (
                    <div key={s} className={`rounded border px-1.5 py-1 text-[13px] flex items-center gap-1 ${ag.colors.dim}`}>
                      <Database className="w-2.5 h-2.5 shrink-0" />{name}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Ingestion method labels + arrows ── */}
        <div className="grid grid-cols-4 gap-2 shrink-0" style={{ zIndex: 10 }}>
          {BRONZE_TABLES.map((t, i) => (
            <div key={t.idx} className="flex flex-col items-center gap-1">
              <motion.div
                animate={{ opacity: ingesting ? 1 : 0.4, scale: ingesting ? 1 : 0.95 }}
                className={`rounded-lg border px-2.5 py-1 text-[13px] font-bold flex items-center gap-1.5 ${methodColor(t.methodColor)}`}
              >
                {t.method === "Auto Loader" && <Package className="w-3 h-3" />}
                {t.method === "Structured Streaming" && <Zap className="w-3 h-3" />}
                {t.method === "Batch Job" && <RefreshCw className="w-3 h-3" />}
                {t.method}
              </motion.div>
              <motion.div animate={{ opacity: ingesting ? 1 : 0.25 }}>
                <ArrowDown className={`w-3.5 h-3.5 ${agColor(i).dot.replace("bg-", "text-")} ${ingesting ? "animate-bounce" : ""}`} />
              </motion.div>
            </div>
          ))}
        </div>

        {/* ── Unified Cloud Storage with Delta Bronze ── */}
        <div className="flex-1 rounded-xl border border-slate-600/50 bg-slate-900/50 p-3 flex flex-col gap-2 min-h-0" style={{ zIndex: 10 }}>
          {/* Storage header */}
          <div className="flex items-center gap-2 shrink-0">
            <Cloud className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 font-bold text-sm">Unified Cloud Object Storage</span>
            <div className="flex gap-1.5 ml-2">
              {["ADLS Gen2", "S3", "GCS"].map((s) => (
                <span key={s} className="text-[13px] border border-slate-700/60 bg-slate-800/60 text-slate-400 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>

          {/* Bronze zone — Delta tables */}
          <div className="rounded-lg border-2 border-amber-600/60 bg-amber-950/20 p-3 flex-1 flex flex-col gap-2 min-h-0">
            <div className="flex items-center gap-2 mb-1 shrink-0">
              <span className="text-amber-400 font-black text-lg leading-none">Δ</span>
              <span className="text-amber-300 font-bold text-sm uppercase tracking-widest">Bronze Zone</span>
              <span className="text-[13px] text-amber-600 ml-1">Raw · As-is · Delta tables · ACID</span>
              {ingesting && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="ml-auto flex items-center gap-1 text-[13px] text-amber-400 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Live ingestion
                </motion.span>
              )}
            </div>

            {/* 4 Delta table cards */}
            <div className="grid grid-cols-4 gap-2 flex-1 min-h-0">
              {BRONZE_TABLES.map((t, i) => {
                const s = bronzeState[i];
                const ac = agColor(i);
                return (
                  <div
                    key={t.idx}
                    ref={(el) => { tableRefs.current[i] = el; }}
                    className={`rounded-lg border flex flex-col p-2.5 gap-1.5 ${AGENCIES[i].colors.border} ${AGENCIES[i].colors.bg}`}
                  >
                    {/* Table name */}
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 font-black text-[15px] leading-none">Δ</span>
                      <span className={`text-[13px] font-mono font-bold ${AGENCIES[i].colors.text} truncate`}>{t.table}</span>
                    </div>

                    {/* Live stats */}
                    <div className="flex items-center gap-2">
                      <motion.span
                        key={Math.floor(s.rows / (t.rate * 5))}
                        initial={{ scale: 1.15, color: "#fcd34d" }}
                        animate={{ scale: 1, color: "#e2e8f0" }}
                        transition={{ duration: 0.3 }}
                        className="text-sm font-bold text-slate-200 tabular-nums"
                      >
                        {fmt(s.rows)}
                      </motion.span>
                      <span className="text-[13px] text-slate-500">rows</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-slate-400 font-mono">v{s.version}</span>
                      {s.lastTs && (
                        <span className="text-[12px] text-slate-600 truncate">{s.lastTs}</span>
                      )}
                    </div>

                    {/* Schema chips */}
                    <div className="flex flex-col gap-0.5 mt-auto">
                      {t.schema.slice(0, 3).map((col) => {
                        const [name, type] = col.split(" ");
                        return (
                          <div key={col} className="flex items-center gap-1">
                            <span className={`text-[12px] font-mono ${AGENCIES[i].colors.text} opacity-70`}>{name}</span>
                            <span className="text-[10px] text-slate-600">{type}</span>
                          </div>
                        );
                      })}
                      <span className="text-[10px] text-slate-600 mt-0.5">+{t.schema.length - 3} more cols</span>
                    </div>

                    {/* _delta_log indicator */}
                    <div className={`rounded border px-1.5 py-1 text-[12px] font-mono ${ac.dim} shrink-0`}>
                      _delta_log/ · ACID ✓
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Silver + Gold (dimmed — coming soon) */}
          <div className="grid grid-cols-2 gap-2 shrink-0">
            {[
              { label: "Silver Zone", desc: "Cleansed · Validated · Conformed", col: "border-slate-600/30 bg-slate-800/20 text-slate-600" },
              { label: "Gold Zone",   desc: "Curated · Analytics-ready · Served", col: "border-yellow-800/20 bg-yellow-950/10 text-yellow-800" },
            ].map(({ label, desc, col }) => (
              <div key={label} className={`rounded-lg border p-2.5 flex items-center gap-3 opacity-40 ${col}`}>
                <span className="font-black text-base leading-none">Δ</span>
                <div>
                  <p className="text-[14px] font-bold">{label}</p>
                  <p className="text-[13px] opacity-70">{desc}</p>
                </div>
                <span className="ml-auto text-[12px] border border-current rounded px-1.5 py-0.5 opacity-60">Chapter 5 →</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chapter 5 data ───────────────────────────────────────────────────────────

const SILVER_SOURCES = [
  {
    idx: 0, agency: "DOH", color: "sky",
    bronze: "medicaid.claims_bronze", silver: "medicaid.members_silver",
    rawRows: 1_200_000, cleanRows: 1_054_200, dupsPct: 12,
    issues: ["12% dup member_ids", "SSN plaintext", "Mixed date formats"],
    transforms: ["Dedup", "Mask PII", "Normalize dates"],
  },
  {
    idx: 1, agency: "DHS", color: "emerald",
    bronze: "snap.cases_bronze", silver: "snap.cases_silver",
    rawRows: 450_000, cleanRows: 413_100, dupsPct: 8,
    issues: ["8% dup case_ids", "Income as strings", "Null county codes"],
    transforms: ["Dedup", "Cast types", "Fill nulls"],
  },
  {
    idx: 2, agency: "DCFS", color: "orange",
    bronze: "cps.intakes_bronze", silver: "cps.intakes_silver",
    rawRows: 82_000, cleanRows: 79_540, dupsPct: 3,
    issues: ["3% dup intake_ids", "Reporter name exposed", "Legacy dates"],
    transforms: ["Dedup", "Mask PII", "Normalize dates"],
  },
  {
    idx: 3, agency: "DBHDS", color: "violet",
    bronze: "behavioral.clients_bronze", silver: "behavioral.clients_silver",
    rawRows: 165_000, cleanRows: 140_250, dupsPct: 15,
    issues: ["15% dup client_ids", "SSN plaintext", "Non-standard ICD"],
    transforms: ["Dedup", "Mask PII", "Normalize ICD-10"],
  },
] as const;

function silverSrcColor(color: string) {
  const map: Record<string, { border: string; bg: string; text: string; dot: string; badge: string }> = {
    sky:     { border: "border-sky-600/60",     bg: "bg-sky-950/40",     text: "text-sky-300",     dot: "bg-sky-400",     badge: "bg-sky-900/60 text-sky-300 border-sky-700/60" },
    emerald: { border: "border-emerald-600/60", bg: "bg-emerald-950/40", text: "text-emerald-300", dot: "bg-emerald-400", badge: "bg-emerald-900/60 text-emerald-300 border-emerald-700/60" },
    orange:  { border: "border-orange-600/60",  bg: "bg-orange-950/40",  text: "text-orange-300",  dot: "bg-orange-400",  badge: "bg-orange-900/60 text-orange-300 border-orange-700/60" },
    violet:  { border: "border-violet-600/60",  bg: "bg-violet-950/40",  text: "text-violet-300",  dot: "bg-violet-400",  badge: "bg-violet-900/60 text-violet-300 border-violet-700/60" },
  };
  return map[color] ?? map.sky;
}

function Chapter5() {
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(false);

  const runPipeline = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setPhase(1);
    await sleep(1400);
    setPhase(2);
    await sleep(1800);
    setPhase(3);
    await sleep(1400);
    setPhase(4);
    setRunning(false);
  }, [running]);

  const fmtR = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : `${(n / 1_000).toFixed(1)}k`;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* ── Header ── */}
      <div className="shrink-0 flex items-start justify-between">
        <div>
          <p className="text-[14px] font-bold tracking-widest text-slate-400 mb-1">THE MEDALLION RISES</p>
          <h2 className="text-2xl font-black text-white mb-1">Silver Zone — Cleansing & Conforming</h2>
          <p className="text-sm text-slate-400">
            Raw bronze cleaned · duplicates removed · PII masked · first cross-agency join
          </p>
        </div>
        <button
          onClick={runPipeline}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 text-slate-900 text-sm font-bold hover:bg-white transition-colors disabled:opacity-50 shrink-0"
        >
          <Play className="w-3.5 h-3.5" />
          {running ? "Running…" : phase === 0 ? "Run Pipeline" : "Re-run"}
        </button>
      </div>

      {/* ── Bronze source row ── */}
      <div className="shrink-0 grid grid-cols-4 gap-2">
        {SILVER_SOURCES.map((src) => {
          const c = silverSrcColor(src.color);
          return (
            <div key={src.agency} className={`rounded-xl border p-3 transition-colors duration-500 ${phase >= 1 ? "border-red-700/60 bg-red-950/30" : `${c.border} ${c.bg}`}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                <p className={`text-[13px] font-bold ${c.text}`}>{src.bronze}</p>
                {phase >= 1 && (
                  <span className="ml-auto text-[12px] text-red-400 font-bold">issues ▲</span>
                )}
              </div>
              <p className="text-lg font-black text-white">
                {fmtR(src.rawRows)} <span className="text-[13px] font-normal text-slate-400">rows raw</span>
              </p>
              <AnimatePresence>
                {phase >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-1 overflow-hidden"
                  >
                    {src.issues.map((issue) => (
                      <div key={issue} className="flex items-center gap-1 text-[12px] text-red-300">
                        <TriangleAlert className="w-2.5 h-2.5 shrink-0 text-red-400" />
                        {issue}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── Transform strip ── */}
      <div className="shrink-0 grid grid-cols-4 gap-2">
        {SILVER_SOURCES.map((src) => {
          const c = silverSrcColor(src.color);
          return (
            <div key={src.agency} className="flex flex-col items-center gap-1">
              <ArrowDown className={`w-3.5 h-3.5 transition-colors duration-700 ${phase >= 2 ? c.text : "text-slate-700"}`} />
              <div className={`w-full rounded-lg border px-2 py-1.5 flex flex-wrap gap-1 justify-center transition-all duration-700 ${phase >= 2 ? `${c.border} ${c.bg}` : "border-slate-800 bg-slate-900/20"}`}>
                {src.transforms.map((t, ti) => (
                  <motion.span
                    key={t}
                    className={`text-[12px] font-semibold px-1.5 py-0.5 rounded border transition-colors duration-500 ${phase >= 2 ? c.badge : "bg-slate-800 text-slate-600 border-slate-700"}`}
                    animate={{ opacity: phase >= 2 ? 1 : 0.3 }}
                    transition={{ delay: phase >= 2 ? ti * 0.25 : 0 }}
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
              <ArrowDown className={`w-3.5 h-3.5 transition-colors duration-700 ${phase >= 3 ? c.text : "text-slate-700"}`} />
            </div>
          );
        })}
      </div>

      {/* ── Silver zone ── */}
      <div className="flex-1 min-h-0 rounded-xl border border-slate-500/50 bg-slate-900/40 p-3 flex flex-col gap-2">
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-[13px] font-black tracking-widest text-slate-200">◆ SILVER ZONE</span>
          <span className="text-[13px] text-slate-500">Cleaned · Deduplicated · Conformed · ACID-guaranteed</span>
        </div>

        {/* 4 silver tables */}
        <div className="shrink-0 grid grid-cols-4 gap-2">
          {SILVER_SOURCES.map((src) => {
            const c = silverSrcColor(src.color);
            return (
              <motion.div
                key={src.agency}
                className={`rounded-lg border p-2.5 transition-all duration-700 ${phase >= 3 ? `${c.border} ${c.bg}` : "border-slate-800 bg-slate-900/30 opacity-30"}`}
                animate={{ opacity: phase >= 3 ? 1 : 0.25 }}
              >
                <p className={`text-[13px] font-bold mb-1 ${phase >= 3 ? c.text : "text-slate-600"}`}>{src.silver}</p>
                {phase >= 3 ? (
                  <>
                    <p className="text-lg font-black text-white">
                      {fmtR(src.cleanRows)} <span className="text-[13px] font-normal text-slate-400">rows</span>
                    </p>
                    <p className="text-[13px] text-emerald-400 mt-0.5">−{src.dupsPct}% dupes removed</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                      <span className="text-[12px] text-slate-400">_delta_log/ · ACID ✓</span>
                    </div>
                  </>
                ) : (
                  <p className="text-[14px] text-slate-700 mt-1">waiting…</p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Unified client payoff */}
        <AnimatePresence>
          {phase >= 4 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 min-h-0 rounded-xl border border-blue-500/50 bg-blue-950/20 p-3 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[13px] font-black tracking-widest text-blue-300">CROSS-AGENCY JOIN</span>
                <code className="text-[14px] text-blue-200 font-mono bg-blue-900/40 px-2 py-0.5 rounded border border-blue-800/50">
                  unified_client_silver
                </code>
                <span className="text-[13px] text-slate-500 ml-auto">
                  Joined on masked_ssn · one row per person across all agencies
                </span>
              </div>

              {/* Join diagram */}
              <div className="shrink-0 flex items-center gap-2 flex-wrap">
                {SILVER_SOURCES.map((src, i) => {
                  const c = silverSrcColor(src.color);
                  return (
                    <div key={src.agency} className="flex items-center gap-2">
                      <div className={`rounded px-2 py-0.5 border text-[12px] font-mono ${c.border} ${c.bg} ${c.text}`}>
                        {src.silver.split(".")[1]}
                      </div>
                      {i < SILVER_SOURCES.length - 1 && (
                        <span className="text-slate-600 text-sm font-bold">+</span>
                      )}
                    </div>
                  );
                })}
                <ArrowRight className="w-4 h-4 text-blue-400 mx-1" />
                <div className="rounded-lg px-3 py-1 border border-blue-500/60 bg-blue-900/30 text-[13px] font-mono font-bold text-blue-200">
                  unified_client_silver
                </div>
              </div>

              {/* Sample record */}
              <div className="flex-1 min-h-0 rounded-lg bg-slate-950/70 border border-slate-700/50 p-2.5 font-mono text-[13px] overflow-auto">
                <p className="text-slate-500 mb-2">-- One person · four programs · impossible to see before the lakehouse</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                  <div><span className="text-blue-400">unified_id   </span><span className="text-emerald-300">  "UC-20240101234"</span></div>
                  <div><span className="text-blue-400">county       </span><span className="text-emerald-300">  "Fairfax"</span></div>
                  <div><span className="text-blue-400">masked_ssn   </span><span className="text-amber-300">  "***-**-8821"</span></div>
                  <div><span className="text-blue-400">age_group    </span><span className="text-emerald-300">  "35–44"</span></div>
                  <div><span className="text-blue-400">member_id    </span><span className="text-sky-300">  "MED-001234"</span></div>
                  <div><span className="text-blue-400">case_id      </span><span className="text-emerald-300">  "SNAP-88421"</span></div>
                  <div><span className="text-blue-400">intake_id    </span><span className="text-orange-300">  "CPS-7823"</span></div>
                  <div><span className="text-blue-400">programs     </span><span className="text-violet-300">  ["Medicaid","SNAP","CPS"]</span></div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              className="flex-1 min-h-0 rounded-xl border border-dashed border-slate-700/50 flex items-center justify-center"
            >
              <p className="text-[14px] text-slate-600">
                unified_client_silver · cross-agency join appears after pipeline completes
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Chapter 6 data ───────────────────────────────────────────────────────────

const GOLD_TABLES = [
  {
    idx: 0, color: "amber",
    table: "program_overlap_gold",
    grain: "1 row per person · monthly snapshot",
    metric: "Multi-program families",
    value: "23,841", change: "+4.2% MoM", changeUp: true,
    consumer: "Executive Dashboard", consumerType: "bi" as const,
    description: "Families enrolled in 3+ programs — cross-agency insight impossible before the lakehouse.",
    sql: `SELECT county, age_group,\n  COUNT(*) AS families\nFROM program_overlap_gold\nWHERE program_count >= 3\nGROUP BY county, age_group\nORDER BY families DESC`,
    queryMs: 340,
    resultRows: 47,
  },
  {
    idx: 1, color: "sky",
    table: "county_health_metrics_gold",
    grain: "1 row per county · per month",
    metric: "Medicaid utilization",
    value: "67.3%", change: "−1.1% vs target", changeUp: false,
    consumer: "Population Health Dashboard", consumerType: "bi" as const,
    description: "County-level Medicaid utilization, chronic condition prevalence, and preventable ER rates.",
    sql: `SELECT county, utilization_rate,\n  chronic_pct, er_preventable_pct\nFROM county_health_metrics_gold\nWHERE month = '2024-03'\nORDER BY utilization_rate DESC`,
    queryMs: 210,
    resultRows: 134,
  },
  {
    idx: 2, color: "emerald",
    table: "snap_efficiency_gold",
    grain: "1 row per district · per month",
    metric: "Benefit error rate",
    value: "1.8%", change: "−0.3% YoY", changeUp: true,
    consumer: "SNAP Program Report", consumerType: "report" as const,
    description: "SNAP benefit accuracy, recertification on-time rates, and district efficiency scores.",
    sql: `SELECT district, error_rate,\n  recert_on_time_pct, avg_benefit_amt\nFROM snap_efficiency_gold\nWHERE fiscal_year = 2024\nORDER BY error_rate DESC`,
    queryMs: 180,
    resultRows: 22,
  },
  {
    idx: 3, color: "orange",
    table: "child_outcomes_gold",
    grain: "1 row per closed case",
    metric: "Recurrence rate",
    value: "9.4%", change: "−2.1% vs 2023", changeUp: true,
    consumer: "CPS Risk ML Model", consumerType: "ml" as const,
    description: "CPS case resolution, placement stability, and recurrence — feature store for risk scoring.",
    sql: `SELECT age_group, placement_type,\n  AVG(recurrence_90d) AS recurrence,\n  AVG(days_to_close) AS avg_close\nFROM child_outcomes_gold\nGROUP BY age_group, placement_type`,
    queryMs: 290,
    resultRows: 18,
  },
  {
    idx: 4, color: "violet",
    table: "bh_access_gold",
    grain: "1 row per provider · per month",
    metric: "Avg wait days",
    value: "18.3 days", change: "+2.4 vs target", changeUp: false,
    consumer: "BH Access Dashboard", consumerType: "bi" as const,
    description: "Behavioral health provider capacity, wait times, and treatment engagement by region.",
    sql: `SELECT region, provider_type,\n  AVG(wait_days) AS avg_wait,\n  SUM(capacity_gap) AS gap\nFROM bh_access_gold\nORDER BY avg_wait DESC`,
    queryMs: 150,
    resultRows: 64,
  },
] as const;

function goldColor(color: string) {
  const map: Record<string, { border: string; bg: string; text: string; ring: string; bar: string }> = {
    amber:   { border: "border-amber-600/60",   bg: "bg-amber-950/40",   text: "text-amber-300",   ring: "ring-amber-500/40",   bar: "bg-amber-500" },
    sky:     { border: "border-sky-600/60",     bg: "bg-sky-950/40",     text: "text-sky-300",     ring: "ring-sky-500/40",     bar: "bg-sky-500" },
    emerald: { border: "border-emerald-600/60", bg: "bg-emerald-950/40", text: "text-emerald-300", ring: "ring-emerald-500/40", bar: "bg-emerald-500" },
    orange:  { border: "border-orange-600/60",  bg: "bg-orange-950/40",  text: "text-orange-300",  ring: "ring-orange-500/40",  bar: "bg-orange-500" },
    violet:  { border: "border-violet-600/60",  bg: "bg-violet-950/40",  text: "text-violet-300",  ring: "ring-violet-500/40",  bar: "bg-violet-500" },
  };
  return map[color] ?? map.amber;
}

function Chapter6() {
  const [selected, setSelected] = useState(0);
  const [queryPhase, setQueryPhase] = useState<"idle" | "running" | "done">("idle");
  const [progressPct, setProgressPct] = useState(0);

  const tbl = GOLD_TABLES[selected];
  const c = goldColor(tbl.color);

  useEffect(() => {
    setQueryPhase("idle");
    setProgressPct(0);
  }, [selected]);

  const runQuery = useCallback(async () => {
    if (queryPhase === "running") return;
    setQueryPhase("running");
    setProgressPct(0);
    const steps = 16;
    const stepMs = Math.ceil(tbl.queryMs / steps);
    for (let i = 1; i <= steps; i++) {
      await sleep(stepMs);
      setProgressPct((i / steps) * 100);
    }
    setQueryPhase("done");
  }, [queryPhase, tbl]);

  const ConsumerIcon = ({ type }: { type: "bi" | "report" | "ml" }) =>
    type === "bi" ? <BarChart3 className="w-2.5 h-2.5 shrink-0" /> :
    type === "ml" ? <Zap className="w-2.5 h-2.5 shrink-0" /> :
    <FileCode className="w-2.5 h-2.5 shrink-0" />;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* ── Header ── */}
      <div className="shrink-0 flex items-start justify-between">
        <div>
          <p className="text-[14px] font-bold tracking-widest text-amber-400/80 mb-1">THE GOLD LAYER</p>
          <h2 className="text-2xl font-black text-white mb-1">Gold Zone — Analytics-Ready</h2>
          <p className="text-sm text-slate-400">Pre-aggregated · Photon-accelerated · Purpose-built for BI, reports, and ML</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-700/50 bg-amber-950/30 text-amber-300 text-[13px] font-semibold">
            <Zap className="w-3 h-3" /> Photon Enabled
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/40 text-slate-400 text-[13px] font-mono">
            OPTIMIZE + ZORDER
          </div>
        </div>
      </div>

      {/* ── Silver → Gold lineage strip ── */}
      <div className="shrink-0 flex items-center gap-2 overflow-hidden">
        <span className="text-[12px] text-slate-500 font-mono shrink-0">FROM</span>
        <div className="flex gap-1 flex-wrap">
          {["members_silver", "cases_silver", "intakes_silver", "clients_silver", "unified_client_silver"].map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded border border-slate-600/50 bg-slate-800/40 text-[10px] font-mono text-slate-300">{t}</span>
          ))}
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="text-[12px] text-amber-400/80 font-mono shrink-0">AGGREGATE → OPTIMIZE → Gold tables</span>
      </div>

      {/* ── Main area: table grid + query panel ── */}
      <div className="flex-1 min-h-0 flex gap-3">

        {/* Gold table grid */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {/* Row 1: 3 tables */}
          <div className="grid grid-cols-3 gap-2">
            {GOLD_TABLES.slice(0, 3).map((t) => {
              const tc = goldColor(t.color);
              const isSel = selected === t.idx;
              return (
                <button
                  key={t.table}
                  onClick={() => setSelected(t.idx)}
                  className={`rounded-xl border p-3 text-left transition-all duration-200 ${tc.border} ${tc.bg} ${isSel ? `ring-2 ${tc.ring}` : "opacity-70 hover:opacity-95"}`}
                >
                  <p className={`text-[12px] font-mono font-bold mb-2 ${tc.text}`}>{t.table}</p>
                  <p className="text-2xl font-black text-white leading-none">{t.value}</p>
                  <p className={`text-[13px] font-medium mt-1 ${tc.text}`}>{t.metric}</p>
                  <p className={`text-[12px] mt-0.5 ${t.changeUp ? "text-emerald-400" : "text-red-400"}`}>{t.change}</p>
                  <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center gap-1.5">
                    <ConsumerIcon type={t.consumerType} />
                    <span className="text-[12px] text-slate-400">{t.consumer}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5">{t.grain}</p>
                </button>
              );
            })}
          </div>
          {/* Row 2: 2 tables */}
          <div className="grid grid-cols-2 gap-2">
            {GOLD_TABLES.slice(3).map((t) => {
              const tc = goldColor(t.color);
              const isSel = selected === t.idx;
              return (
                <button
                  key={t.table}
                  onClick={() => setSelected(t.idx)}
                  className={`rounded-xl border p-3 text-left transition-all duration-200 ${tc.border} ${tc.bg} ${isSel ? `ring-2 ${tc.ring}` : "opacity-70 hover:opacity-95"}`}
                >
                  <p className={`text-[12px] font-mono font-bold mb-2 ${tc.text}`}>{t.table}</p>
                  <p className="text-2xl font-black text-white leading-none">{t.value}</p>
                  <p className={`text-[13px] font-medium mt-1 ${tc.text}`}>{t.metric}</p>
                  <p className={`text-[12px] mt-0.5 ${t.changeUp ? "text-emerald-400" : "text-red-400"}`}>{t.change}</p>
                  <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center gap-1.5">
                    <ConsumerIcon type={t.consumerType} />
                    <span className="text-[12px] text-slate-400">{t.consumer}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-0.5">{t.grain}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Query panel ── */}
        <div className="w-72 shrink-0 flex flex-col gap-2">
          <div className={`flex-1 rounded-xl border p-3 flex flex-col gap-2.5 ${c.border} bg-slate-900/60`}>
            <div>
              <p className={`text-[13px] font-bold font-mono ${c.text}`}>{tbl.table}</p>
              <p className="text-[12px] text-slate-400 mt-1">{tbl.description}</p>
            </div>

            {/* SQL */}
            <div className="flex-1 min-h-0 rounded-lg bg-slate-950/80 border border-slate-700/50 p-2 font-mono text-[12px] leading-relaxed overflow-auto">
              {tbl.sql.split("\n").map((line, i) => (
                <div key={i}>
                  {line.startsWith("SELECT") || line.startsWith("FROM") || line.startsWith("WHERE") || line.startsWith("GROUP") || line.startsWith("ORDER") ? (
                    <span><span className="text-blue-400">{line.split(" ")[0]}</span>{" "}<span className="text-slate-300">{line.slice(line.indexOf(" ") + 1)}</span></span>
                  ) : (
                    <span className="text-slate-400">{line}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Execute button */}
            <button
              onClick={runQuery}
              disabled={queryPhase === "running"}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-bold border transition-all ${queryPhase === "running" ? "bg-slate-800 border-slate-700 text-slate-500" : `${c.bg} ${c.border} ${c.text} hover:opacity-90`}`}
            >
              <Play className="w-3 h-3" />
              {queryPhase === "running" ? "Executing…" : queryPhase === "done" ? "Re-run" : "Execute Query"}
            </button>

            {/* Result area */}
            <AnimatePresence>
              {queryPhase !== "idle" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  {/* Progress bar */}
                  <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full transition-all duration-75 ${queryPhase === "done" ? "bg-emerald-500" : c.bar}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {queryPhase === "done" && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[14px] text-emerald-300 font-bold">{tbl.queryMs}ms</span>
                        <span className="text-[13px] text-slate-500">· Photon · {tbl.resultRows} rows</span>
                      </div>
                      <div className="rounded-lg bg-slate-950/80 border border-slate-700/40 p-2 font-mono text-[11px] space-y-0.5">
                        <p className="text-emerald-400">✓ {tbl.resultRows} rows returned</p>
                        <p className="text-slate-500">0 files scanned · served from cache</p>
                        <p className="text-slate-500">ZORDER optimized · Photon accelerated</p>
                      </div>
                      <div className="rounded-lg border border-dashed border-slate-700/50 p-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3 h-3 text-slate-500" />
                          <span className="text-[12px] text-slate-500 font-medium">vs. siloed approach</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-center">
                            <p className="text-[14px] font-black text-red-400">~4 hrs</p>
                            <p className="text-[10px] text-slate-600">manual join across 4 systems</p>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                          <div className="text-center">
                            <p className="text-[14px] font-black text-emerald-400">{tbl.queryMs}ms</p>
                            <p className="text-[10px] text-slate-600">single SQL on gold table</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chapter 7 ────────────────────────────────────────────────────────────────

const ARCH_LAYERS = [
  {
    id: "sources", chapter: 1, colorKey: "slate",
    label: "Agency Sources",
    subtitle: "DOH · DHS · DCFS · DBHDS — 14 databases, FTP / email",
    items: ["DOH / Medicaid", "DHS / SNAP", "DCFS / Child Protection", "DBHDS / Behavioral Health"] as string[],
    detail: "Seven agencies. Fourteen databases. Data exits only via FTP drops and email — manual, delayed, error-prone. No lineage. No audit trail. No cross-agency view possible.",
  },
  {
    id: "storage", chapter: 2, colorKey: "blue",
    label: "Unified Cloud Object Storage",
    subtitle: "ADLS Gen2 · S3 · GCS — foundation of the lakehouse",
    items: ["Open format (Parquet)", "Infinite scale", "Compute-independent", "Cost-tiered storage"] as string[],
    detail: "All agency data lands in one cloud store. Compute separates from storage — analysts spin clusters on demand without touching the data layer. The foundation everything else builds on.",
  },
  {
    id: "delta", chapter: 3, colorKey: "indigo",
    label: "Delta Lake Protocol",
    subtitle: "_delta_log · ACID · Time Travel · Schema enforcement",
    items: ["ACID transactions", "Time travel (VERSION AS OF)", "MERGE / upsert", "Schema on write"] as string[],
    detail: "A JSON transaction log turns raw object storage into a reliable, auditable table. Every write is atomic. Every past version is queryable. Concurrent readers never block writers.",
  },
  {
    id: "bronze", chapter: 4, colorKey: "orange",
    label: "Bronze Zone",
    subtitle: "Raw · As-is · Delta tables · ACID-guaranteed from arrival",
    items: ["medicaid.claims_bronze", "snap.cases_bronze", "cps.intakes_bronze", "behavioral.clients_bronze"] as string[],
    detail: "Agency data lands raw and unchanged. Auto Loader, Structured Streaming, and Batch jobs ingest at source cadence. Full ACID guarantees from the moment data arrives — no data loss, ever.",
  },
  {
    id: "silver", chapter: 5, colorKey: "silver",
    label: "Silver Zone",
    subtitle: "Cleaned · Deduplicated · PII-masked · Cross-agency joined",
    items: ["medicaid.members_silver", "snap.cases_silver", "cps.intakes_silver", "unified_client_silver ★"] as string[],
    detail: "Raw bronze deduplicated, PII masked, dates normalized. The pivotal table: unified_client_silver joins all four agencies — one row per person across Medicaid, SNAP, CPS, and Behavioral Health for the first time ever.",
  },
  {
    id: "gold", chapter: 6, colorKey: "amber",
    label: "Gold Zone",
    subtitle: "Pre-aggregated · ZORDER-optimized · Photon-accelerated",
    items: ["program_overlap_gold", "county_health_metrics_gold", "child_outcomes_gold", "bh_access_gold"] as string[],
    detail: "Business-level aggregates purpose-built for BI dashboards, executive reports, and ML feature stores. ZORDER-optimized and served by Photon. Queries that took 4+ hours now run in milliseconds.",
  },
] as const;

function archLayerTheme(colorKey: string) {
  const map: Record<string, { border: string; bg: string; text: string; badge: string; dot: string }> = {
    slate:  { border: "border-slate-600/60",  bg: "bg-slate-800/30",  text: "text-slate-300",  badge: "bg-slate-700/80 text-slate-300 border-slate-600",   dot: "bg-slate-400" },
    blue:   { border: "border-blue-600/60",   bg: "bg-blue-950/40",   text: "text-blue-300",   badge: "bg-blue-900/80 text-blue-300 border-blue-700",       dot: "bg-blue-400" },
    indigo: { border: "border-indigo-600/60", bg: "bg-indigo-950/40", text: "text-indigo-300", badge: "bg-indigo-900/80 text-indigo-300 border-indigo-700", dot: "bg-indigo-400" },
    orange: { border: "border-orange-600/60", bg: "bg-orange-950/40", text: "text-orange-300", badge: "bg-orange-900/80 text-orange-300 border-orange-700", dot: "bg-orange-400" },
    silver: { border: "border-slate-400/50",  bg: "bg-slate-700/30",  text: "text-slate-200",  badge: "bg-slate-600/80 text-slate-200 border-slate-500",    dot: "bg-slate-300" },
    amber:  { border: "border-amber-600/60",  bg: "bg-amber-950/40",  text: "text-amber-300",  badge: "bg-amber-900/80 text-amber-300 border-amber-700",    dot: "bg-amber-400" },
  };
  return map[colorKey] ?? map.slate;
}

function Chapter7() {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    setRevealed(0);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setRevealed(i);
      if (i >= ARCH_LAYERS.length) clearInterval(timer);
    }, 300);
    return () => clearInterval(timer);
  }, []);

  const selectedLayer = ARCH_LAYERS.find((l) => l.id === selected) ?? null;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* ── Header ── */}
      <div className="shrink-0 flex items-start justify-between">
        <div>
          <p className="text-[14px] font-bold tracking-widest text-blue-400/80 mb-1">THE COMPLETE ARCHITECTURE</p>
          <h2 className="text-2xl font-black text-white mb-1">Everything Built, Layer by Layer</h2>
          <p className="text-sm text-slate-400">
            From fragmented agency islands to a unified lakehouse — six chapters, one architecture · click any layer to explore
          </p>
        </div>
        <button
          onClick={() => { setRevealed(0); setTimeout(() => { let i = 0; const t = setInterval(() => { i++; setRevealed(i); if (i >= ARCH_LAYERS.length) clearInterval(t); }, 300); }, 50); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-300 text-[13px] font-semibold hover:border-slate-500 transition-colors shrink-0"
        >
          <Play className="w-3 h-3" /> Replay
        </button>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 min-h-0 flex gap-4">

        {/* ── Architecture stack ── */}
        <div className="flex-1 flex flex-col gap-1.5 min-h-0 justify-between">

          {/* Unity Catalog — governance banner at top */}
          <div className="shrink-0 rounded-lg border border-dashed border-blue-500/40 bg-blue-950/10 px-3 py-2 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <div>
              <span className="text-[13px] font-black text-blue-300">Unity Catalog</span>
              <span className="text-[12px] text-slate-500 ml-2">Data discovery · Lineage · RBAC · Column-level security · Cross-workspace governance</span>
            </div>
          </div>

          {/* Layer stack — Gold at top, Sources at bottom */}
          <div className="flex-1 flex flex-col-reverse gap-1.5 justify-end min-h-0">
            {[...ARCH_LAYERS].map((layer, i) => {
              const t = archLayerTheme(layer.colorKey);
              const revealIdx = ARCH_LAYERS.length - 1 - i; // bottom layers reveal first
              const isVisible = revealIdx < revealed;
              const isSel = selected === layer.id;
              return (
                <motion.button
                  key={layer.id}
                  onClick={() => setSelected(isSel ? null : layer.id)}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -24 }}
                  transition={{ duration: 0.35 }}
                  className={`shrink-0 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${t.border} ${t.bg} ${isSel ? `ring-2 ring-current ${t.text}` : "hover:opacity-95"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${t.badge}`}>Ch.{layer.chapter}</span>
                    <span className={`text-base font-bold shrink-0 ${t.text}`}>{layer.label}</span>
                    <span className="text-[12px] text-slate-500 min-w-0 truncate hidden lg:block">{layer.subtitle}</span>
                    <div className="ml-auto flex gap-1 shrink-0">
                      {layer.items.slice(0, 3).map((item) => (
                        <span key={item} className={`text-[10px] px-1.5 py-0.5 rounded border hidden xl:inline-block ${t.border} opacity-70 ${t.text} font-mono`}>{item}</span>
                      ))}
                      {layer.items.length > 3 && (
                        <span className="text-[10px] text-slate-600 hidden xl:inline-block self-center">+{layer.items.length - 3}</span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Compute band */}
          <div className="shrink-0 rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 flex items-center gap-4 flex-wrap">
            <span className="text-[12px] font-black text-slate-500 tracking-wider shrink-0">COMPUTE</span>
            {[
              { name: "SQL Warehouse", dot: "bg-red-400" },
              { name: "Photon Engine",  dot: "bg-orange-400" },
              { name: "Auto Loader",    dot: "bg-sky-400" },
              { name: "Delta Live Tables", dot: "bg-emerald-400" },
              { name: "ML Runtime",     dot: "bg-violet-400" },
              { name: "Databricks Workflows", dot: "bg-pink-400" },
            ].map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
                <span className="text-[12px] text-slate-400">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Detail panel ── */}
        <div className="w-72 shrink-0 h-full">
          <AnimatePresence mode="wait">
            {selectedLayer ? (
              <motion.div
                key={selectedLayer.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                className={`h-full rounded-xl border p-4 flex flex-col gap-3 ${archLayerTheme(selectedLayer.colorKey).border} bg-slate-900/80`}
              >
                <div>
                  <span className={`text-[12px] font-bold px-2 py-1 rounded border ${archLayerTheme(selectedLayer.colorKey).badge}`}>
                    Chapter {selectedLayer.chapter}
                  </span>
                  <h3 className={`text-lg font-black mt-2.5 ${archLayerTheme(selectedLayer.colorKey).text}`}>{selectedLayer.label}</h3>
                  <p className="text-[12px] text-slate-400 mt-1">{selectedLayer.subtitle}</p>
                </div>
                <p className="text-[14px] text-slate-300 leading-relaxed flex-none">{selectedLayer.detail}</p>
                <div className="flex-1 flex flex-col gap-1.5 min-h-0">
                  <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Tables / Components</p>
                  <div className="space-y-1 overflow-auto">
                    {selectedLayer.items.map((item) => (
                      <div
                        key={item}
                        className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${archLayerTheme(selectedLayer.colorKey).border} ${archLayerTheme(selectedLayer.colorKey).bg}`}
                      >
                        <Database className="w-2.5 h-2.5 shrink-0 opacity-50" />
                        <span className={`text-[13px] font-mono ${archLayerTheme(selectedLayer.colorKey).text}`}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full rounded-xl border border-dashed border-slate-700/40 flex flex-col items-center justify-center gap-2 px-6"
              >
                <Layers className="w-6 h-6 text-slate-700" />
                <p className="text-[14px] text-slate-600 text-center">
                  Click any layer to explore its role in the architecture
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Unity Catalog animations ─────────────────────────────────────────────────

function UCAnimDiscovery() {
  const query = "Medicaid member data";
  const [typed, setTyped] = useState(0);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTyped((t) => { if (t >= query.length) { clearInterval(iv); return t; } return t + 1; }), 55);
    const t1 = setTimeout(() => setShown(1), query.length * 55 + 350);
    const t2 = setTimeout(() => setShown(2), query.length * 55 + 750);
    const t3 = setTimeout(() => setShown(3), query.length * 55 + 1150);
    return () => { clearInterval(iv); [t1, t2, t3].forEach(clearTimeout); };
  }, []);
  const RESULTS = [
    { table: "medicaid.members_silver", owner: "DOH Team", fresh: "2h ago", downstream: 3 },
    { table: "program_overlap_gold",    owner: "Analytics",  fresh: "1d ago", downstream: 5 },
    { table: "medicaid.claims_bronze",  owner: "DOH Ingest", fresh: "4m ago", downstream: 1 },
  ];
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border border-slate-600/50 bg-slate-900/70 px-3 py-2 flex items-center gap-2">
        <Search className="w-3 h-3 text-slate-500 shrink-0" />
        <span className="text-[14px] font-mono text-white">{query.slice(0, typed)}<span className={typed < query.length ? "animate-pulse" : "opacity-0"}>|</span></span>
      </div>
      <div className="space-y-1.5">
        {RESULTS.slice(0, shown).map((r) => (
          <motion.div key={r.table} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="rounded-lg border border-emerald-700/40 bg-emerald-950/20 px-2.5 py-2">
            <div className="flex items-center gap-1.5"><Database className="w-3 h-3 text-emerald-400 shrink-0" /><span className="text-[13px] font-mono font-bold text-emerald-300">{r.table}</span></div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] text-slate-400">Owner: {r.owner}</span>
              <span className="text-[10px] text-slate-400">Updated: {r.fresh}</span>
              <span className="text-[10px] text-blue-400">{r.downstream}↓ downstream</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function UCAnimSemantics() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [400, 1000, 1600].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="flex-1 rounded-lg border border-sky-700/50 bg-sky-950/30 p-2">
          <p className="text-[12px] font-bold text-sky-400 mb-1.5">DOH / Medicaid</p>
          {["member_id", "ssn", "dob", "service_date"].map((f) => <div key={f} className="text-[12px] font-mono text-slate-300 py-0.5">{f}</div>)}
        </div>
        <div className="flex-1 rounded-lg border border-violet-700/50 bg-violet-950/30 p-2">
          <p className="text-[12px] font-bold text-violet-400 mb-1.5">DBHDS / BH</p>
          {["client_id", "ssn", "birth_date", "visit_date"].map((f) => <div key={f} className="text-[12px] font-mono text-slate-300 py-0.5">{f}</div>)}
        </div>
      </div>
      <AnimatePresence>
        {phase >= 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2"><div className="flex-1 h-px bg-sky-600/50" /><span className="text-[10px] text-slate-500 shrink-0">mapping →</span><div className="flex-1 h-px bg-violet-600/50" /></motion.div>}
        {phase >= 2 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-blue-500/60 bg-blue-950/30 p-2.5">
            <p className="text-[12px] font-bold text-blue-300 mb-1.5">Business Glossary — Person Identity</p>
            {[["person_id", "unified across agencies"], ["masked_ssn", "***-**-XXXX (always)"], ["birth_date", "ISO-8601 canonical"]].map(([k, v]) => (
              <div key={k} className="text-[10px] font-mono py-0.5"><span className="text-blue-400">{k}</span><span className="text-slate-500"> → {v}</span></div>
            ))}
          </motion.div>
        )}
        {phase >= 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-[12px] text-emerald-400"><CheckCircle className="w-3 h-3" />Cross-agency queries are now unambiguous</motion.div>}
      </AnimatePresence>
    </div>
  );
}

function UCAnimLineage() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [200, 550, 900, 1250, 1600].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  const nodes = [
    { label: "Agency FTP", sub: "DOH raw file",      border: "border-slate-600/60", bg: "bg-slate-800/40", text: "text-slate-300" },
    { label: "claims_bronze",  sub: "Delta table",   border: "border-orange-600/60", bg: "bg-orange-950/40", text: "text-orange-300" },
    { label: "members_silver", sub: "cleaned",       border: "border-slate-400/50",  bg: "bg-slate-700/30",  text: "text-slate-200" },
    { label: "program_overlap_gold", sub: "aggregated", border: "border-amber-600/60", bg: "bg-amber-950/40", text: "text-amber-300" },
    { label: "Dashboard",      sub: "Executive BI",  border: "border-blue-600/60",   bg: "bg-blue-950/40",   text: "text-blue-300" },
  ];
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[12px] text-slate-500">Column-level provenance — 5 hops, one click</p>
      {nodes.map((n, i) => (
        <div key={n.label} className="flex items-center gap-1.5">
          <motion.div animate={{ opacity: phase > i ? 1 : 0.12 }} className={`flex-1 rounded-lg border px-2 py-1.5 ${n.border} ${n.bg}`}>
            <p className={`text-[12px] font-mono font-bold ${n.text}`}>{n.label}</p>
            <p className="text-[10px] text-slate-500">{n.sub}</p>
          </motion.div>
          {i < nodes.length - 1 && <ArrowRight className={`w-3 h-3 shrink-0 transition-colors duration-500 ${phase > i ? "text-slate-400" : "text-slate-700"}`} />}
        </div>
      ))}
      {phase >= 5 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Full column-level provenance confirmed</motion.div>}
    </div>
  );
}

function UCAnimCost() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [300, 700, 1100, 1500, 2000].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  const queries = [
    { name: "DOH full_scan",        cost: 847, pct: 100, hot: true },
    { name: "DHS monthly_report",   cost: 312, pct: 37,  hot: false },
    { name: "Analytics crossjoin",  cost: 228, pct: 27,  hot: false },
    { name: "DCFS case_export",     cost: 89,  pct: 10,  hot: false },
  ];
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12px] text-slate-500 font-mono">Query spend · this month</p>
      <div className="space-y-2">
        {queries.map((q, i) => (
          <motion.div key={q.name} animate={{ opacity: phase > i ? 1 : 0.1 }} className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-mono text-slate-300">{q.name}</span>
              <span className={`text-[12px] font-bold ${q.hot ? "text-red-400" : "text-slate-400"}`}>${q.cost}/mo</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div className={`h-full rounded-full ${q.hot ? "bg-red-500" : q.cost > 200 ? "bg-amber-500" : "bg-emerald-500"}`} initial={{ width: 0 }} animate={{ width: phase > i ? `${q.pct}%` : "0%" }} transition={{ duration: 0.5 }} />
            </div>
          </motion.div>
        ))}
      </div>
      {phase >= 5 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-emerald-700/50 bg-emerald-950/30 p-2.5">
          <p className="text-[12px] font-bold text-emerald-300 mb-1">💡 Recommendation</p>
          <p className="text-[12px] text-slate-300">Add <span className="font-mono text-amber-300">ZORDER(county)</span> to claims_bronze</p>
          <p className="text-[12px] text-emerald-400 mt-0.5">→ Estimated saving: $680/mo (−80%)</p>
        </motion.div>
      )}
    </div>
  );
}

function UCAnimAccess() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [500, 1400, 2200].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <div className="flex flex-col gap-2 font-mono text-[12px]">
      <div className="flex items-center gap-1.5 mb-0.5">
        <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
        <span className="text-slate-400">DOH Analyst · role: medicaid_analyst</span>
      </div>
      <div className={`rounded-lg border p-2.5 transition-all duration-500 ${phase >= 1 ? "border-red-700/60 bg-red-950/30" : "border-slate-700/40 bg-slate-900/30 opacity-30"}`}>
        <p className="text-slate-400">SELECT * FROM</p>
        <p className="text-orange-300">{"  "}cps.intakes_silver</p>
        {phase >= 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 flex items-center gap-1.5"><span className="text-red-400 font-bold">✗ ACCESS DENIED</span><span className="text-slate-500">· row-level policy</span></motion.div>}
      </div>
      <div className={`rounded-lg border p-2.5 transition-all duration-500 ${phase >= 2 ? "border-emerald-700/60 bg-emerald-950/20" : "border-slate-700/40 bg-slate-900/30 opacity-30"}`}>
        <p className="text-slate-400">SELECT * FROM</p>
        <p className="text-sky-300">{"  "}medicaid.members_silver</p>
        {phase >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5">
            <div className="flex items-center gap-1.5 mb-1"><span className="text-emerald-400 font-bold">✓ GRANTED</span><span className="text-slate-500">· column policy applied</span></div>
            {phase >= 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0.5 mt-1 pl-2 border-l border-slate-700">
                <div><span className="text-blue-400">member_id{"  "}</span><span className="text-emerald-300">MED-001234</span></div>
                <div><span className="text-blue-400">masked_ssn </span><span className="text-amber-300">***-**-8821</span></div>
                <div><span className="text-blue-400">county{"     "}</span><span className="text-emerald-300">Fairfax</span></div>
                <div><span className="text-blue-400">dob{"        "}</span><span className="text-amber-300">REDACTED</span></div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function UCAnimSharing() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [300, 800, 1300, 2200].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  const partners = ["CDC", "Federal HHS", "State Auditor"];
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border border-blue-700/50 bg-blue-950/30 p-2.5">
        <p className="text-[12px] font-bold text-blue-300 mb-0.5">HHS Lakehouse</p>
        <p className="text-[10px] font-mono text-slate-400">county_health_metrics_gold · 1.2M rows</p>
      </div>
      {phase >= 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2"><div className="flex-1 h-px bg-blue-600/40" /><span className="text-[10px] text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-700/50 bg-blue-950/30 shrink-0">Δ Delta Sharing · no copy</span><div className="flex-1 h-px bg-blue-600/40" /></motion.div>}
      <div className="space-y-1.5">
        {partners.map((p, i) => (
          <motion.div key={p} animate={{ opacity: phase >= i + 2 ? 1 : 0.12 }} className="flex items-center gap-2 rounded-lg border border-emerald-700/40 bg-emerald-950/20 px-2.5 py-1.5">
            <CheckCircle className={`w-3 h-3 shrink-0 transition-colors ${phase >= i + 2 ? "text-emerald-400" : "text-slate-700"}`} />
            <span className="text-[12px] font-bold text-slate-300">{p}</span>
            <span className="text-[10px] text-emerald-400 ml-auto">{phase >= i + 2 ? "Connected" : "—"}</span>
          </motion.div>
        ))}
      </div>
      {phase >= 4 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-slate-700/40 bg-slate-900/40 p-2 space-y-1">{["No data moved or copied", "Access revokable in seconds", "Full audit log maintained"].map((t) => <div key={t} className="flex items-center gap-1.5 text-[10px] text-slate-400"><CheckCircle className="w-2.5 h-2.5 text-emerald-400 shrink-0" />{t}</div>)}</motion.div>}
    </div>
  );
}

function UCAnimAI() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [200, 500, 800, 1100, 1400, 1900].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  const checks = [
    { label: "Training data",     value: "child_outcomes_gold v42" },
    { label: "Bias report",       value: "Passed · 2024-02-15" },
    { label: "DCFS approval",     value: "Signed · Dir. Martinez" },
    { label: "HIPAA compliance",  value: "Verified" },
    { label: "Predictions logged",value: "12,847 (auditable)" },
  ];
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border border-violet-700/50 bg-violet-950/30 px-3 py-2">
        <p className="text-[12px] font-bold text-violet-300">Model: cps_risk_v3</p>
        <p className="text-[10px] text-slate-400">CPS intake recurrence risk scoring</p>
      </div>
      <div className="space-y-1.5">
        {checks.map((c, i) => (
          <motion.div key={c.label} animate={{ opacity: phase >= i + 1 ? 1 : 0.1 }} className="flex items-center gap-2 rounded-lg border border-slate-700/40 bg-slate-900/40 px-2.5 py-1.5">
            <CheckCircle className={`w-3 h-3 shrink-0 transition-colors duration-300 ${phase >= i + 1 ? "text-emerald-400" : "text-slate-700"}`} />
            <span className="text-[12px] text-slate-400 shrink-0">{c.label}</span>
            <span className="text-[12px] font-mono text-slate-200 ml-auto">{phase >= i + 1 ? c.value : "—"}</span>
          </motion.div>
        ))}
      </div>
      {phase >= 6 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-[12px] text-emerald-400"><CheckCircle className="w-3 h-3" />Every prediction traceable to source data</motion.div>}
    </div>
  );
}

function UCAnimQuality() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [300, 700, 1100, 1500, 1900, 2300].map((ms, i) => setTimeout(() => setPhase(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  const ticks = [
    { time: "14:00", rows: "923k", ok: true },
    { time: "15:00", rows: "891k", ok: true },
    { time: "16:00", rows: "847k", ok: true },
    { time: "17:00", rows: "0",    ok: false },
  ];
  return (
    <div className="flex flex-col gap-2 font-mono">
      <p className="text-[12px] text-slate-500">medicaid.claims_bronze · ingestion monitor</p>
      <div className="space-y-1.5">
        {ticks.map((t, i) => (
          <motion.div key={t.time} animate={{ opacity: phase >= i + 1 ? 1 : 0.1 }} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors duration-500 ${!t.ok && phase >= i + 1 ? "border-red-700/60 bg-red-950/30" : "border-slate-700/40 bg-slate-900/40"}`}>
            <span className={`w-3 shrink-0 ${t.ok ? "text-emerald-400" : "text-red-400"}`}>{t.ok ? "✓" : "✗"}</span>
            <span className="text-slate-500">{t.time}</span>
            <span className={t.ok ? "text-slate-300" : "text-red-300 font-bold"}>{t.rows} rows</span>
            {!t.ok && phase >= i + 1 && <span className="text-red-400 text-[10px] ml-auto animate-pulse">ALERT</span>}
          </motion.div>
        ))}
      </div>
      {phase >= 5 && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-red-700/40 bg-red-950/20 p-2 space-y-1">
          <p className="text-[10px] text-red-300 font-bold">⚡ Alert: 0 rows for 6h</p>
          {phase >= 6 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0.5">{["Auto Loader check triggered", "On-call engineer paged", "Downstream silver/gold frozen"].map((m) => <p key={m} className="text-[10px] text-slate-400">→ {m}</p>)}</motion.div>}
        </motion.div>
      )}
    </div>
  );
}

function UCAnimPanel({ id }: { id: string }) {
  if (id === "discovery") return <UCAnimDiscovery />;
  if (id === "semantics") return <UCAnimSemantics />;
  if (id === "lineage")   return <UCAnimLineage />;
  if (id === "cost")      return <UCAnimCost />;
  if (id === "access")    return <UCAnimAccess />;
  if (id === "sharing")   return <UCAnimSharing />;
  if (id === "ai")        return <UCAnimAI />;
  if (id === "quality")   return <UCAnimQuality />;
  return null;
}

// ─── Chapter 8 ────────────────────────────────────────────────────────────────

function Chapter8() {
  const [selected, setSelected] = useState<string | null>("access");
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    setRevealed(0);
    let i = 0;
    const t = setInterval(() => { i++; setRevealed(i); if (i >= 8) clearInterval(t); }, 200);
    return () => clearInterval(t);
  }, []);

  const capabilities = [
    {
      id: "discovery", row: 0, label: "Discovery", traditional: false,
      desc: "Semantic search across all assets — find trusted data without knowing schema names.",
      hhs: "An epidemiologist types 'Medicaid member data' and immediately finds medicaid.members_silver — its owner, last refresh time, and 3 downstream gold tables. No Slack messages, no waiting.",
    },
    {
      id: "semantics", row: 0, label: "Business Semantics", traditional: false,
      desc: "Business glossary maps technical field names to shared definitions across teams.",
      hhs: "'member_id' in DOH and 'client_id' in DBHDS are catalogued as the same concept. Cross-agency SQL is now unambiguous. 'Vulnerable family' is defined once: program_count ≥ 3.",
    },
    {
      id: "lineage", row: 0, label: "Lineage", traditional: false,
      desc: "Column-level data lineage: trace any field from source system to final dashboard.",
      hhs: "Click program_overlap_gold → trace back through unified_client_silver → 4 silver tables → 4 bronze tables → 4 agency FTP drops. Full column-level provenance in one click.",
    },
    {
      id: "cost", row: 0, label: "Cost Controls", traditional: false,
      desc: "Monitor query spend by team, tag cost centers, surface optimization recommendations.",
      hhs: "DOH team burning $4,200/month on full-scan queries against claims_bronze. Unity Catalog flags the top 5 expensive queries and recommends ZORDER on county — cost drops 80%.",
    },
    {
      id: "access", row: 1, label: "Access Control", traditional: true,
      desc: "Column masking, row-level security, RBAC at table/schema/catalog level. Where traditional catalogs stopped.",
      hhs: "DOH analysts query medicaid.* but are blocked from cps.intakes_silver (child PII). DCFS workers see only cases in their county via row-level filters. SSNs always masked for non-admin roles.",
    },
    {
      id: "sharing", row: 1, label: "Secure Open Data Sharing", traditional: false,
      desc: "Share live governed data with external partners — no copy, revokable in seconds. Powered by Delta Sharing.",
      hhs: "county_health_metrics_gold is shared with CDC and federal HHS agencies — live, no ETL, no data movement. Access revoked the moment a data use agreement expires.",
    },
    {
      id: "ai", row: 1, label: "AI Governance", traditional: false,
      desc: "Model registry + feature store governance — track training data, bias metrics, and audit trails.",
      hhs: "The CPS risk model is registered with its training data (child_outcomes_gold v42), DCFS sign-off, and bias report. Every prediction is traceable back to the source records that drove it.",
    },
    {
      id: "quality", row: 1, label: "Quality Monitoring", traditional: false,
      desc: "Automated quality rules, freshness monitoring, and anomaly detection with SLA alerts.",
      hhs: "Alert: medicaid.claims_bronze received 0 new rows for 6 hours — Auto Loader stalled. unified_client_silver null rate on county jumped from 0.1% to 4.2% overnight — upstream schema drift detected.",
    },
  ] as const;

  const sel = capabilities.find((c) => c.id === selected) ?? null;

  const assets = [
    { label: "Tables",  icon: <Database className="w-3.5 h-3.5" />, desc: "Delta / Iceberg" },
    { label: "Files",   icon: <FileCode className="w-3.5 h-3.5" />,  desc: "Parquet, CSV, JSON" },
    { label: "PDFs",    icon: <FileText className="w-3.5 h-3.5" />,  desc: "Unstructured docs" },
    { label: "MCP",     icon: <Cpu className="w-3.5 h-3.5" />,       desc: "Tool governance" },
    { label: "Models",  icon: <Zap className="w-3.5 h-3.5" />,       desc: "ML model registry" },
    { label: "Agents",  icon: <Users className="w-3.5 h-3.5" />,     desc: "AI agent access" },
  ];

  return (
    <div className="h-full flex flex-col gap-3">
      {/* ── Header ── */}
      <div className="shrink-0 flex items-start justify-between">
        <div>
          <p className="text-[14px] font-bold tracking-widest text-blue-400/80 mb-1">UNIFIED GOVERNANCE</p>
          <h2 className="text-2xl font-black text-white mb-1">Unity Catalog</h2>
          <p className="text-sm text-slate-400">
            Every asset · Every platform · One governance layer — well beyond what traditional catalogs ever offered
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {["Postgres", "Delta Lake", "ICEBERG"].map((f) => (
            <span key={f} className="px-2 py-1 rounded border border-slate-600/50 bg-slate-800/40 text-[12px] text-slate-400 font-mono">{f}</span>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 min-h-0 flex gap-3">

        {/* ── Left: grid + assets + federated ── */}
        <div className="flex-1 flex flex-col gap-2.5 min-h-0">

          {/* Traditional catalog callout */}
          <div className="shrink-0 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-red-700/50 bg-red-950/20 text-[12px] text-red-400 font-bold">
              <Lock className="w-2.5 h-2.5" /> TRADITIONAL CATALOGS
            </div>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="text-[12px] text-slate-500">only managed Access Control · Unity Catalog adds everything else</span>
          </div>

          {/* 2 × 4 capability grid */}
          <div className="shrink-0 space-y-1.5">
            {([0, 1] as const).map((row) => (
              <div key={row} className="grid grid-cols-4 gap-1.5">
                {capabilities.filter((c) => c.row === row).map((cap, i) => {
                  const gIdx = row * 4 + i;
                  const isVis = gIdx < revealed;
                  const isSel = selected === cap.id;
                  const isT = cap.traditional;
                  return (
                    <motion.button
                      key={cap.id}
                      onClick={() => setSelected(isSel ? null : cap.id)}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: isVis ? 1 : 0, y: isVis ? 0 : -10 }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                        isT
                          ? `border-red-600/60 bg-red-950/50 ${isSel ? "ring-2 ring-red-500/50" : "hover:opacity-90"}`
                          : `border-emerald-600/60 bg-emerald-950/40 ${isSel ? "ring-2 ring-emerald-500/50" : "opacity-80 hover:opacity-100"}`
                      }`}
                    >
                      {isT && <p className="text-[10px] text-red-500 font-bold mb-1 tracking-wider">TRADITIONAL CATALOGS</p>}
                      <p className={`text-sm font-bold ${isT ? "text-red-300" : "text-emerald-300"}`}>{cap.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{cap.desc}</p>
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Asset types */}
          <div className="shrink-0">
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Unified governance for all assets</p>
            <div className="grid grid-cols-6 gap-1.5">
              {assets.map((a) => (
                <div key={a.label} className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-2 py-2 flex flex-col items-center gap-1">
                  <div className="text-slate-400">{a.icon}</div>
                  <p className="text-[13px] font-semibold text-slate-300">{a.label}</p>
                  <p className="text-[10px] text-slate-600 text-center">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Federated platforms */}
          <div className="shrink-0 flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-bold text-slate-500 shrink-0">FEDERATE</span>
            {["BigQuery", "Oracle", "Teradata", "Snowflake", "SAP", "SQL Server"].map((p) => (
              <span key={p} className="px-2 py-0.5 rounded border border-slate-700/40 bg-slate-800/30 text-[12px] text-slate-400">{p}</span>
            ))}
            <span className="text-[12px] text-slate-600">and more…</span>
          </div>
        </div>

        {/* ── Right: detail panel ── */}
        <div className="w-80 shrink-0 h-full">
          <AnimatePresence mode="wait">
            {sel ? (
              <motion.div
                key={sel.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
                className={`h-full rounded-xl border p-4 flex flex-col gap-3 ${
                  sel.traditional ? "border-red-600/60 bg-red-950/20" : "border-emerald-600/60 bg-emerald-950/20"
                }`}
              >
                {sel.traditional && (
                  <div className="flex items-center gap-1.5 text-[12px] text-red-400 font-bold">
                    <Lock className="w-3 h-3" /> Where traditional catalogs stopped
                  </div>
                )}
                <h3 className={`text-lg font-black ${sel.traditional ? "text-red-300" : "text-emerald-300"}`}>
                  {sel.label}
                </h3>
                <p className="text-[14px] text-slate-300 leading-relaxed">{sel.desc}</p>

                <div className={`flex-1 rounded-xl border p-3 flex flex-col gap-2 min-h-0 overflow-auto ${
                  sel.traditional ? "border-red-700/40 bg-slate-950/60" : "border-blue-700/40 bg-blue-950/20"
                }`}>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Live Demo</p>
                  <UCAnimPanel id={sel.id} />
                </div>

                {!sel.traditional && (
                  <div className="flex items-center gap-1.5 text-[12px] text-emerald-400 shrink-0">
                    <CheckCircle className="w-3 h-3 shrink-0" />
                    <span>Unity Catalog capability — beyond Access Control</span>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="h-full rounded-xl border border-dashed border-slate-700/40 flex items-center justify-center"
              >
                <p className="text-[14px] text-slate-600 text-center px-4">Click a capability to see the HHS use case</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Chapter 9 data ───────────────────────────────────────────────────────────

type GenieResultNumber = { type: "number"; value: string; label: string; subtext: string; good: boolean };
type GenieResultTable  = { type: "table";  headers: string[]; rows: string[][] };
type GenieResult = GenieResultNumber | GenieResultTable;

type GenieMsg =
  | { role: "welcome" }
  | { role: "user";    text: string }
  | { role: "thinking" }
  | { role: "genie";   sql: string; result: GenieResult; table: string; ms: number };

const GENIE_QS = [
  {
    id: "q1",
    chip: "Families on 3+ programs in Fairfax?",
    question: "How many families in Fairfax county are enrolled in 3 or more programs?",
    thinkMs: 1900,
    table: "program_overlap_gold",
    sql: `SELECT COUNT(*) AS families\nFROM program_overlap_gold\nWHERE county = 'Fairfax'\n  AND program_count >= 3`,
    result: { type: "number", value: "847", label: "families on 3+ programs", subtext: "+4.2% vs last month", good: true } as GenieResultNumber,
  },
  {
    id: "q2",
    chip: "Highest CPS recurrence by county?",
    question: "Which counties have the highest CPS recurrence rates this year?",
    thinkMs: 2300,
    table: "child_outcomes_gold",
    sql: `SELECT county,\n  ROUND(AVG(recurrence_90d)*100,1) AS rate_pct\nFROM child_outcomes_gold\nWHERE fiscal_year = 2024\nGROUP BY county\nORDER BY rate_pct DESC\nLIMIT 5`,
    result: { type: "table", headers: ["County", "Recurrence Rate"], rows: [["Prince William","14.2%"],["Richmond City","12.8%"],["Hampton","11.3%"],["Norfolk","10.7%"],["Roanoke","9.9%"]] } as GenieResultTable,
  },
  {
    id: "q3",
    chip: "BH wait times in Northern Virginia?",
    question: "What's the average behavioral health wait time in Northern Virginia?",
    thinkMs: 1600,
    table: "bh_access_gold",
    sql: `SELECT ROUND(AVG(wait_days),1) AS avg_wait\nFROM bh_access_gold\nWHERE region = 'Northern Virginia'\n  AND month >= '2024-01'`,
    result: { type: "number", value: "22.4", label: "days average wait", subtext: "+2.4 days above 20-day target", good: false } as GenieResultNumber,
  },
  {
    id: "q4",
    chip: "SNAP districts above 2% error rate?",
    question: "Which SNAP districts have error rates above 2% this fiscal year?",
    thinkMs: 1700,
    table: "snap_efficiency_gold",
    sql: `SELECT district, error_rate,\n  recert_on_time_pct AS on_time\nFROM snap_efficiency_gold\nWHERE error_rate > 2.0\n  AND fiscal_year = 2024\nORDER BY error_rate DESC`,
    result: { type: "table", headers: ["District","Error Rate","On-time Recert"], rows: [["Southwest","3.8%","71%"],["Valley","2.9%","78%"],["Southside","2.3%","82%"]] } as GenieResultTable,
  },
] as const;

function Chapter9() {
  const [msgs, setMsgs] = useState<GenieMsg[]>([{ role: "welcome" }]);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const ask = useCallback(async (q: typeof GENIE_QS[number]) => {
    if (busy) return;
    setBusy(true);
    setMsgs((prev) => [...prev, { role: "user", text: q.question }]);
    await sleep(350);
    setMsgs((prev) => [...prev, { role: "thinking" }]);
    await sleep(q.thinkMs);
    const start = Date.now();
    setMsgs((prev) => [
      ...prev.slice(0, -1),
      { role: "genie", sql: q.sql, result: q.result, table: q.table, ms: q.thinkMs },
    ]);
    setBusy(false);
    void start;
  }, [busy]);

  const consultedTables = [...new Set(
    msgs.filter((m): m is Extract<GenieMsg, { role: "genie" }> => m.role === "genie").map((m) => m.table)
  )];

  return (
    <div className="h-full flex flex-col gap-3">
      {/* ── Header ── */}
      <div className="shrink-0 flex items-start justify-between">
        <div>
          <p className="text-[14px] font-bold tracking-widest text-blue-400/80 mb-1">AI / BI</p>
          <h2 className="text-2xl font-black text-white mb-1">Genie — Ask Your Data Anything</h2>
          <p className="text-sm text-slate-400">Natural language queries over your governed gold tables · no SQL required</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-700/50 bg-blue-950/20 text-[13px] text-blue-300 font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected to HHS Lakehouse
          </div>
        </div>
      </div>

      {/* ── Question chips ── */}
      <div className="shrink-0 flex flex-wrap gap-1.5">
        {GENIE_QS.map((q) => (
          <button
            key={q.id}
            onClick={() => ask(q)}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-600/60 bg-slate-800/40 text-[13px] text-slate-300 hover:border-blue-500/60 hover:text-blue-300 hover:bg-blue-950/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Search className="w-2.5 h-2.5 shrink-0" />{q.chip}
          </button>
        ))}
      </div>

      {/* ── Main: chat + sidebar ── */}
      <div className="flex-1 min-h-0 flex gap-3">

        {/* Chat */}
        <div className="flex-1 min-h-0 rounded-xl border border-slate-700/50 bg-slate-900/40 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-3 space-y-3">
            {msgs.map((m, i) => {
              if (m.role === "welcome") return (
                <div key={i} className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-[14px] font-black text-white mt-0.5">G</div>
                  <div className="flex-1 rounded-xl rounded-tl-none bg-slate-800/60 border border-slate-700/50 p-3">
                    <p className="text-[14px] text-white font-semibold mb-1">Genie — HHS Lakehouse</p>
                    <p className="text-[14px] text-slate-300 leading-relaxed">I'm connected to your HHS Lakehouse and have access to 5 Gold tables covering Medicaid, SNAP, Child Protection, Behavioral Health, and cross-program analytics. Ask me anything in plain English.</p>
                  </div>
                </div>
              );
              if (m.role === "user") return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                  <div className="max-w-[75%] rounded-xl rounded-tr-none bg-blue-600/20 border border-blue-600/30 px-3 py-2">
                    <p className="text-[14px] text-blue-100">{m.text}</p>
                  </div>
                </motion.div>
              );
              if (m.role === "thinking") return (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-[14px] font-black text-white mt-0.5">G</div>
                  <div className="rounded-xl rounded-tl-none bg-slate-800/60 border border-slate-700/50 px-3 py-2.5 flex items-center gap-1.5">
                    {[0, 1, 2].map((d) => (
                      <motion.div key={d} className="w-1.5 h-1.5 rounded-full bg-blue-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} />
                    ))}
                    <span className="text-[13px] text-slate-400 ml-1">Querying gold tables…</span>
                  </div>
                </motion.div>
              );
              if (m.role === "genie") return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-[14px] font-black text-white mt-0.5">G</div>
                  <div className="flex-1 rounded-xl rounded-tl-none bg-slate-800/60 border border-slate-700/50 p-3 space-y-2.5">
                    {/* SQL */}
                    <div className="rounded-lg bg-slate-950/70 border border-slate-700/40 p-2 font-mono text-[12px] leading-relaxed">
                      {m.sql.split("\n").map((line, li) => {
                        const kw = ["SELECT","FROM","WHERE","GROUP","ORDER","LIMIT","AND","ROUND","AVG","COUNT"];
                        const parts = line.split(/\b/);
                        return (
                          <div key={li}>
                            {parts.map((p, pi) => (
                              <span key={pi} className={kw.includes(p.trim()) ? "text-blue-400" : p.match(/['"0-9.]/) ? "text-emerald-300" : "text-slate-300"}>{p}</span>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                    {/* Result */}
                    {m.result.type === "number" && (
                      <div className={`rounded-lg border p-3 ${m.result.good ? "border-emerald-700/50 bg-emerald-950/20" : "border-red-700/50 bg-red-950/20"}`}>
                        <p className={`text-3xl font-black ${m.result.good ? "text-emerald-300" : "text-red-300"}`}>{m.result.value}</p>
                        <p className="text-[14px] text-slate-300 mt-0.5">{m.result.label}</p>
                        <p className={`text-[13px] mt-1 ${m.result.good ? "text-emerald-400" : "text-red-400"}`}>{m.result.subtext}</p>
                      </div>
                    )}
                    {m.result.type === "table" && (() => {
                      const tbl = m.result as GenieResultTable;
                      return (
                        <div className="rounded-lg border border-slate-700/40 overflow-hidden">
                          <div className="grid text-[12px] font-bold text-slate-400 bg-slate-800/60 border-b border-slate-700/40" style={{ gridTemplateColumns: `repeat(${tbl.headers.length}, 1fr)` }}>
                            {tbl.headers.map((h) => <div key={h} className="px-2 py-1.5">{h}</div>)}
                          </div>
                          {tbl.rows.map((row, ri) => (
                            <div key={ri} className="grid text-[13px] border-b border-slate-800/60 last:border-0 hover:bg-slate-700/20" style={{ gridTemplateColumns: `repeat(${tbl.headers.length}, 1fr)` }}>
                              {row.map((cell, ci) => <div key={ci} className={`px-2 py-1.5 ${ci === 0 ? "text-slate-200" : "text-slate-400"}`}>{cell}</div>)}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    <p className="text-[12px] text-slate-500">{m.table} · {m.ms}ms · Photon</p>
                  </div>
                </motion.div>
              );
              return null;
            })}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="w-52 shrink-0 flex flex-col gap-2">
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-3 flex flex-col gap-2">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Gold Tables Available</p>
            {["program_overlap_gold","county_health_metrics_gold","snap_efficiency_gold","child_outcomes_gold","bh_access_gold"].map((t) => {
              const consulted = consultedTables.includes(t);
              return (
                <div key={t} className={`flex items-center gap-1.5 rounded px-2 py-1.5 border transition-colors duration-500 ${consulted ? "border-blue-600/50 bg-blue-950/20" : "border-slate-700/40 bg-slate-800/20 opacity-50"}`}>
                  <Database className={`w-2.5 h-2.5 shrink-0 ${consulted ? "text-blue-400" : "text-slate-600"}`} />
                  <span className={`text-[10px] font-mono ${consulted ? "text-blue-300" : "text-slate-500"}`}>{t}</span>
                </div>
              );
            })}
          </div>
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-3 space-y-1.5">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">How it works</p>
            {["Natural language → SQL","Queries governed gold tables","Unity Catalog access enforced","Results in milliseconds"].map((s, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[12px] text-slate-400">
                <span className="text-blue-500 shrink-0 mt-0.5">{i + 1}.</span>{s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Network Architecture Data (Chapter 10) ──────────────────────────────────

type NetNodeId = "hub" | "dev" | "prod" | "staging" | "shared" | "onprem" | "cp";

interface NetNode {
  id: NetNodeId;
  cx: number; cy: number; w: number; h: number;
  label: string; sublabel: string;
  stroke: string; fill: string; textColor: string;
  isExternal?: boolean;
  phase: number;
  components: string[];
  details: {
    description: string;
    items: { label: string; value: string }[];
    recs: string[];
  };
}

const NET_NODES: NetNode[] = [
  {
    id: "hub", cx: 480, cy: 250, w: 175, h: 115,
    label: "Hub VPC / VNet", sublabel: "Centralized Connectivity Hub",
    stroke: "#3b82f6", fill: "#1e3a5f30", textColor: "#93c5fd",
    phase: 1,
    components: ["Transit Gateway", "Network Firewall", "Shared DNS", "NAT Gateway"],
    details: {
      description: "Central network hub through which all spoke traffic routes. Provides shared egress, traffic inspection, DNS, and connectivity via Transit Gateway / VNet Peering.",
      items: [
        { label: "CIDR Block", value: "10.0.0.0/16" },
        { label: "Transit Gateway", value: "AWS TGW / Azure VNet Peering" },
        { label: "Firewall", value: "AWS NWFW / Azure Firewall Premium" },
        { label: "DNS", value: "Route 53 Resolver / Azure Private DNS" },
        { label: "NAT Gateway", value: "Single internet egress — all spokes" },
        { label: "Bastion", value: "AWS SSM / Azure Bastion (no SSH keys)" },
      ],
      recs: [
        "All spoke internet traffic routes through Hub NAT only",
        "Enable VPC Flow Logs → S3 / Log Analytics workspace",
        "Deploy firewall in multi-AZ HA configuration",
        "Centralize DNS — private zones for all workspace endpoints",
        "No internet gateway in spoke VPCs — spoke = no direct egress",
      ],
    },
  },
  {
    id: "dev", cx: 165, cy: 110, w: 148, h: 85,
    label: "Dev Workspace", sublabel: "Databricks (Development)",
    stroke: "#0ea5e9", fill: "#082f4930", textColor: "#7dd3fc",
    phase: 3,
    components: ["VNet Injection", "No Public IP", "Dev Clusters", "Personal Compute"],
    details: {
      description: "Development Databricks workspace with permissive cluster policies. VPC/VNet injected so all traffic routes privately through the Hub.",
      items: [
        { label: "VPC CIDR", value: "10.1.0.0/20" },
        { label: "Cluster Subnet", value: "10.1.0.0/21 (private)" },
        { label: "Container Subnet", value: "10.1.8.0/21 (private)" },
        { label: "No Public IP", value: "✓ Enabled (Secure Cluster Conn.)" },
        { label: "Connectivity", value: "Hub via Transit Gateway" },
      ],
      recs: [
        "No Public IP — all traffic via SCC relay through Hub",
        "Small instance types (i3.xlarge / Standard_DS3_v2)",
        "Auto-termination: 30 min idle to control cost",
        "Unity Catalog dev catalog only — no prod data access",
        "Personal compute policies — single-user clusters",
      ],
    },
  },
  {
    id: "prod", cx: 795, cy: 110, w: 148, h: 85,
    label: "Prod Workspace", sublabel: "Databricks (Production)",
    stroke: "#10b981", fill: "#05291630", textColor: "#6ee7b7",
    phase: 3,
    components: ["VNet Injection", "No Public IP", "Job Clusters Only", "IP Access List"],
    details: {
      description: "Production workspace locked down with strict policies. No interactive clusters, comprehensive Unity Catalog governance, and audit logging to SIEM.",
      items: [
        { label: "VPC CIDR", value: "10.2.0.0/20" },
        { label: "Cluster Subnet", value: "10.2.0.0/21 (private)" },
        { label: "Container Subnet", value: "10.2.8.0/21 (private)" },
        { label: "No Public IP", value: "✓ Enabled" },
        { label: "IP Access List", value: "Restricted to Hub egress IPs only" },
        { label: "Workspace URL", value: "Private Endpoint — public disabled" },
      ],
      recs: [
        "Job clusters only — no interactive clusters in prod",
        "Unity Catalog: row/column-level security per agency",
        "Audit logs → SIEM (Splunk / Microsoft Sentinel)",
        "Separate service principals per pipeline",
        "Enforce Photon + spot instances for cost savings",
      ],
    },
  },
  {
    id: "staging", cx: 165, cy: 390, w: 148, h: 85,
    label: "Staging Workspace", sublabel: "Databricks (Pre-Production)",
    stroke: "#f59e0b", fill: "#3b270230", textColor: "#fcd34d",
    phase: 3,
    components: ["Mirror of Prod", "Anonymized Data", "Perf Tests", "Canary Deploys"],
    details: {
      description: "Pre-production environment mirroring Prod network topology exactly. Used for integration tests, performance validation, and canary deployments.",
      items: [
        { label: "VPC CIDR", value: "10.3.0.0/20" },
        { label: "Cluster Subnet", value: "10.3.0.0/21 (private)" },
        { label: "Config source", value: "Same Terraform modules as Prod" },
        { label: "Data", value: "Anonymized PII subset of prod" },
        { label: "No Public IP", value: "✓ Enabled" },
      ],
      recs: [
        "Provision with identical Terraform as Prod — no drift",
        "Anonymize all PII before loading to staging",
        "Run full regression suite before every Prod deploy",
        "Canary: route 5% of pipeline traffic to staging first",
        "Auto-destroy clusters nightly to control cost",
      ],
    },
  },
  {
    id: "shared", cx: 795, cy: 390, w: 148, h: 85,
    label: "Shared Services", sublabel: "Storage · Secrets · Catalog",
    stroke: "#8b5cf6", fill: "#2e106530", textColor: "#c4b5fd",
    phase: 3,
    components: ["ADLS Gen2 / S3", "Key Vault", "Unity Catalog", "Container Registry"],
    details: {
      description: "Centralized spoke hosting the data lake, secrets, Unity Catalog metastore, and container registry. Accessible to all workspaces via private endpoints.",
      items: [
        { label: "VPC CIDR", value: "10.4.0.0/20" },
        { label: "Storage", value: "Azure ADLS Gen2 / AWS S3 (private endpoint)" },
        { label: "Secrets", value: "Azure Key Vault / AWS Secrets Manager" },
        { label: "Metastore", value: "Unity Catalog account-level metastore" },
        { label: "Container Reg.", value: "ACR / ECR (private endpoint)" },
      ],
      recs: [
        "Private endpoints for all storage — no public access",
        "Managed Identity / IAM roles only (no static keys)",
        "Key Vault: soft-delete + purge protection enabled",
        "Versioned Delta Lake with lifecycle policies (Bronze 7yr)",
        "Cross-region replication for DR (RPO < 1hr target)",
      ],
    },
  },
  {
    id: "onprem", cx: 48, cy: 250, w: 82, h: 58,
    label: "On-Premises", sublabel: "HHS Data Center",
    stroke: "#64748b", fill: "#0f172a30", textColor: "#94a3b8",
    isExternal: true,
    phase: 5,
    components: ["VPN / ExpressRoute", "Active Directory", "Legacy DBs"],
    details: {
      description: "Existing HHS data center. Hybrid connectivity via ExpressRoute (preferred) or site-to-site VPN. AD synced for SSO into Databricks workspaces.",
      items: [
        { label: "Connectivity", value: "S2S VPN (1Gbps) / ExpressRoute" },
        { label: "Latency", value: "<5ms to Hub (ExpressRoute)" },
        { label: "Directory", value: "AD DS → Azure AD (EntraID) sync" },
        { label: "BGP", value: "Enabled — automated route propagation" },
        { label: "Failover", value: "Active-Active dual VPN tunnels" },
      ],
      recs: [
        "ExpressRoute for production — predictable latency, no jitter",
        "Active-Active VPN as failover while ER is provisioned",
        "Azure AD Connect / AWS Directory Service for SSO",
        "BGP for automated route advertisement",
        "Monitor with Network Performance Monitor / Network Watcher",
      ],
    },
  },
  {
    id: "cp", cx: 912, cy: 250, w: 82, h: 58,
    label: "Control Plane", sublabel: "Databricks SaaS",
    stroke: "#6366f1", fill: "#1e1b4b30", textColor: "#a5b4fc",
    isExternal: true,
    phase: 5,
    components: ["Private Link", "REST API", "SCC Relay", "Workspace UI"],
    details: {
      description: "Databricks SaaS control plane. Private Link keeps all control-plane traffic on the Azure/AWS backbone — no public internet traversal.",
      items: [
        { label: "Connectivity", value: "Azure Private Link / AWS PrivateLink" },
        { label: "DNS Override", value: "*.azuredatabricks.net → private IP" },
        { label: "Secure Cluster Conn.", value: "Relay in Databricks control plane" },
        { label: "Public Endpoint", value: "Disabled on workspace" },
        { label: "Region", value: "Same region as Hub VPC" },
      ],
      recs: [
        "Private Link is MANDATORY for HIPAA / FedRAMP workloads",
        "Disable public workspace endpoint after Private Link setup",
        "Private DNS zones: *.azuredatabricks.net / *.cloud.databricks.com",
        "Secure Cluster Connectivity — no port 22 / SSH open",
        "Deploy workspace in same region as storage to avoid egress",
      ],
    },
  },
];

const NET_EDGES: {
  from: NetNodeId; to: NetNodeId; label: string;
  dashed?: boolean; dotted?: boolean; phase: number; color: string;
}[] = [
  { from: "hub", to: "dev",     label: "VPC Peering / TGW", phase: 2, color: "#0ea5e9" },
  { from: "hub", to: "prod",    label: "VPC Peering / TGW", phase: 2, color: "#10b981" },
  { from: "hub", to: "staging", label: "VPC Peering / TGW", phase: 2, color: "#f59e0b" },
  { from: "hub", to: "shared",  label: "VPC Peering / TGW", phase: 2, color: "#8b5cf6" },
  { from: "hub", to: "onprem",  label: "VPN / ExpressRoute", dashed: true,  phase: 5, color: "#64748b" },
  { from: "hub", to: "cp",      label: "Private Link",       dotted: true,  phase: 5, color: "#6366f1" },
];

// ─── Chapter 10 ───────────────────────────────────────────────────────────────

function Chapter10() {
  const [phase, setPhase] = useState(0);
  const [selected, setSelected] = useState<NetNodeId>("hub");
  const [panelTab, setPanelTab] = useState<"detail" | "router" | "dns" | "calc">("detail");
  const [showDataFlow, setShowDataFlow] = useState(false);
  const [calcVpcPrefix, setCalcVpcPrefix] = useState(16);
  const [calcSubnetPrefix, setCalcSubnetPrefix] = useState(21);
  const [calcWorkspaces, setCalcWorkspaces] = useState(4);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      await sleep(300);
      if (cancelled) return; setPhase(1);
      await sleep(700);
      if (cancelled) return; setPhase(2);
      await sleep(900);
      if (cancelled) return; setPhase(3);
      await sleep(600);
      if (cancelled) return; setPhase(4);
      await sleep(500);
      if (cancelled) return; setPhase(5);
      await sleep(400);
      if (cancelled) return; setPhase(6);
    }
    run();
    return () => { cancelled = true; };
  }, []);

  const nodeMap = Object.fromEntries(NET_NODES.map(n => [n.id, n])) as Record<NetNodeId, NetNode>;
  const sel = nodeMap[selected];

  const SPOKE_SUBNETS: Record<string, { label: string; cidr: string }[]> = {
    dev:     [{ label: "Cluster Subnet",   cidr: "10.1.0.0/21" }, { label: "Container Subnet", cidr: "10.1.8.0/21" }],
    prod:    [{ label: "Cluster Subnet",   cidr: "10.2.0.0/21" }, { label: "Container Subnet", cidr: "10.2.8.0/21" }],
    staging: [{ label: "Cluster Subnet",   cidr: "10.3.0.0/21" }, { label: "Container Subnet", cidr: "10.3.8.0/21" }],
    shared:  [{ label: "Storage PE Subnet", cidr: "10.4.0.0/21" }, { label: "Services Subnet", cidr: "10.4.8.0/21" }],
  };

  function handleReplay() {
    setPhase(0);
    setTimeout(() => { setPhase(1); }, 100);
    setTimeout(() => { setPhase(2); }, 800);
    setTimeout(() => { setPhase(3); }, 1700);
    setTimeout(() => { setPhase(4); }, 2300);
    setTimeout(() => { setPhase(5); }, 2800);
    setTimeout(() => { setPhase(6); }, 3200);
  }

  return (
    <div className="h-full flex gap-4">
      {/* Diagram */}
      <div className="flex-1 relative min-h-0 rounded-xl border border-slate-800/60 bg-slate-900/30 overflow-hidden">
        <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
          <span className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Network Architecture</span>
          <span className="text-[13px] text-slate-600">·</span>
          <span className="text-[13px] text-blue-400">Hub-Spoke Topology</span>
        </div>
        <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
          <button
            onClick={() => setShowDataFlow(v => !v)}
            className={`flex items-center gap-1.5 text-[13px] border rounded px-2 py-1 transition-colors ${showDataFlow ? "text-amber-300 border-amber-600 bg-amber-900/30" : "text-slate-400 hover:text-white border-slate-700 hover:border-slate-500"}`}
          >
            ▶ Data Flow
          </button>
          <button
            onClick={handleReplay}
            className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded px-2 py-1 transition-colors"
          >
            <RefreshCw className="w-2.5 h-2.5" /> Replay
          </button>
        </div>

        <svg
          viewBox="0 0 960 500"
          className="w-full h-full"
          style={{ fontFamily: "ui-monospace, monospace" }}
        >
          <defs>
            <filter id="ch10glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#3b82f6" opacity="0.6" />
            </marker>
          </defs>

          {/* background grid */}
          <pattern id="ch10grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          </pattern>
          <rect width="960" height="500" fill="url(#ch10grid)" opacity="0.5" />

          {/* Security zone backgrounds */}
          <motion.rect
            x="68" y="52" width="232" height="418" rx="12"
            fill="#0f172a" stroke="#1e293b" strokeWidth="1" strokeDasharray="5,4"
            initial={{ opacity: 0 }} animate={{ opacity: phase >= 3 ? 0.8 : 0 }} transition={{ duration: 0.5 }}
          />
          <motion.rect
            x="656" y="52" width="232" height="418" rx="12"
            fill="#0f172a" stroke="#1e293b" strokeWidth="1" strokeDasharray="5,4"
            initial={{ opacity: 0 }} animate={{ opacity: phase >= 3 ? 0.8 : 0 }} transition={{ duration: 0.5 }}
          />
          <motion.text
            x="138" y="46" textAnchor="middle" fontSize="8" fontWeight="600" fill="#334155"
            initial={{ opacity: 0 }} animate={{ opacity: phase >= 4 ? 1 : 0 }}
          >
            DEV / STAGING ZONE
          </motion.text>
          <motion.text
            x="772" y="46" textAnchor="middle" fontSize="8" fontWeight="600" fill="#334155"
            initial={{ opacity: 0 }} animate={{ opacity: phase >= 4 ? 1 : 0 }}
          >
            PROD / SHARED ZONE
          </motion.text>

          {/* Edges */}
          {NET_EDGES.map(edge => {
            const from = nodeMap[edge.from];
            const to = nodeMap[edge.to];
            const visible = phase >= edge.phase;
            const strokeDash = edge.dashed ? "7,5" : edge.dotted ? "2,5" : undefined;
            const pathD = `M ${from.cx} ${from.cy} L ${to.cx} ${to.cy}`;
            const midX = (from.cx + to.cx) / 2;
            const midY = (from.cy + to.cy) / 2;
            return (
              <g key={`edge-${edge.from}-${edge.to}`}>
                <motion.path
                  d={pathD}
                  stroke={edge.color}
                  strokeWidth={1.5}
                  strokeDasharray={strokeDash}
                  fill="none"
                  opacity={0.65}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: visible ? 1 : 0, opacity: visible ? 0.65 : 0 }}
                  transition={{ duration: 0.75, ease: "easeInOut" }}
                />
                {phase >= 6 && visible && (
                  <circle r="3.5" fill={edge.color} opacity="0.9">
                    <animateMotion dur={edge.dashed ? "3.5s" : edge.dotted ? "3s" : "2.2s"} repeatCount="indefinite" path={pathD} />
                  </circle>
                )}
                {phase >= 6 && visible && (
                  <circle r="2" fill={edge.color} opacity="0.5">
                    <animateMotion dur={edge.dashed ? "3.5s" : edge.dotted ? "3s" : "2.2s"} repeatCount="indefinite" begin="1s" path={pathD} />
                  </circle>
                )}
                {phase >= 4 && visible && !edge.dashed && !edge.dotted && (
                  <motion.text
                    x={midX} y={midY - 7} textAnchor="middle"
                    fontSize="7" fill={edge.color} opacity={0.7}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
                  >
                    {edge.label}
                  </motion.text>
                )}
                {phase >= 5 && visible && (edge.dashed || edge.dotted) && (
                  <motion.text
                    x={midX} y={midY - 7} textAnchor="middle"
                    fontSize="7" fill={edge.color} opacity={0.7}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
                  >
                    {edge.label}
                  </motion.text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {NET_NODES.map(node => {
            const visible = phase >= node.phase;
            const isSelected = selected === node.id;
            const showComponents = phase >= 4 && !node.isExternal;
            const isSpokeVpc = !node.isExternal && node.id !== "hub";
            const spokeSubnets = SPOKE_SUBNETS[node.id];
            // VPC container geometry: 11px horizontal padding each side, 14px above, 36px below for subnets
            const vpcW = node.w + 22;
            const vpcTopY = node.cy - node.h / 2 - 14;
            const vpcH = node.h + 50;
            const subBoxW = Math.floor((vpcW - 9) / 2);  // 2 boxes with 3px gap each side

            return (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0.75 }}
                animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.75 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                style={{ transformOrigin: `${node.cx}px ${node.cy}px`, cursor: "pointer" }}
                onClick={() => setSelected(node.id)}
              >
                {/* Selection glow — expanded for VPC spokes */}
                {isSelected && (
                  <rect
                    x={isSpokeVpc ? node.cx - vpcW / 2 - 5 : node.cx - node.w / 2 - 5}
                    y={isSpokeVpc ? vpcTopY - 5 : node.cy - node.h / 2 - 5}
                    width={isSpokeVpc ? vpcW + 10 : node.w + 10}
                    height={isSpokeVpc ? vpcH + 10 : node.h + 10}
                    rx="14" fill={node.stroke} opacity="0.12"
                    filter="url(#ch10glow)"
                  />
                )}

                {/* VPC container (dashed outer boundary) */}
                {isSpokeVpc && (
                  <>
                    <rect
                      x={node.cx - vpcW / 2} y={vpcTopY}
                      width={vpcW} height={vpcH}
                      rx="10" fill={node.fill} fillOpacity="0.25"
                      stroke={node.stroke} strokeWidth={isSelected ? 2 : 1.4}
                      strokeDasharray="7,4" opacity={0.85}
                    />
                    {/* "VPC" badge — top left */}
                    <rect
                      x={node.cx - vpcW / 2 + 5} y={vpcTopY + 3}
                      width={20} height={11}
                      rx="3" fill={node.stroke} opacity="0.25"
                    />
                    <text
                      x={node.cx - vpcW / 2 + 15} y={vpcTopY + 11}
                      textAnchor="middle" fontSize="6.5" fill={node.textColor}
                      fontWeight="800" opacity="0.85"
                    >
                      VPC
                    </text>
                    {/* CIDR — top right */}
                    {phase >= 3 && (
                      <text
                        x={node.cx + vpcW / 2 - 6} y={vpcTopY + 11}
                        textAnchor="end" fontSize="6"
                        fill={node.textColor} opacity="0.55"
                        style={{ fontFamily: "ui-monospace, monospace" }}
                      >
                        {node.details.items.find(it => it.label === "VPC CIDR")?.value.split(" ")[0] ?? ""}
                      </text>
                    )}
                  </>
                )}

                {/* Workspace inner box */}
                <rect
                  x={node.cx - node.w / 2} y={node.cy - node.h / 2}
                  width={node.w} height={node.h} rx="8"
                  fill={node.fill} stroke={node.stroke}
                  strokeWidth={isSelected ? 2.5 : 1.2} opacity={isSelected ? 1 : 0.85}
                  strokeDasharray={node.isExternal ? "5,3" : undefined}
                />
                {/* header stripe */}
                <rect
                  x={node.cx - node.w / 2} y={node.cy - node.h / 2}
                  width={node.w} height={18} rx="8"
                  fill={node.stroke} opacity="0.2"
                />
                <rect
                  x={node.cx - node.w / 2} y={node.cy - node.h / 2 + 10}
                  width={node.w} height={8}
                  fill={node.stroke} opacity="0.2"
                />
                {/* label */}
                <text
                  x={node.cx} y={node.cy - node.h / 2 + 13}
                  textAnchor="middle" fontSize={node.isExternal ? "8" : "9"}
                  fontWeight="700" fill={node.textColor}
                >
                  {node.label}
                </text>
                {/* sublabel */}
                {phase >= 4 && (
                  <text
                    x={node.cx} y={node.cy - node.h / 2 + 29}
                    textAnchor="middle" fontSize="7"
                    fill={node.textColor} opacity={0.55}
                  >
                    {node.sublabel}
                  </text>
                )}
                {/* component list */}
                {showComponents && node.components.slice(0, 4).map((comp, i) => (
                  <text
                    key={i}
                    x={node.cx - node.w / 2 + 9}
                    y={node.cy - node.h / 2 + 43 + i * 13}
                    fontSize="7" fill={node.textColor} opacity={0.75}
                  >
                    · {comp}
                  </text>
                ))}
                {/* external badge */}
                {node.isExternal && phase >= 5 && (
                  <text
                    x={node.cx} y={node.cy + 5}
                    textAnchor="middle" fontSize="7"
                    fill={node.textColor} opacity={0.5}
                  >
                    {node.id === "onprem" ? "← VPN / ER" : "Private Link →"}
                  </text>
                )}

                {/* Subnet boxes inside VPC container */}
                {isSpokeVpc && phase >= 4 && spokeSubnets && spokeSubnets.map((sn, i) => {
                  const bx = node.cx - vpcW / 2 + 3 + i * (subBoxW + 3);
                  const by = node.cy + node.h / 2 + 5;
                  return (
                    <g key={i}>
                      <rect x={bx} y={by} width={subBoxW} height={24}
                        rx="3" fill={node.stroke} fillOpacity="0.12"
                        stroke={node.stroke} strokeWidth="0.7" strokeDasharray="3,2"
                      />
                      <text x={bx + subBoxW / 2} y={by + 9}
                        textAnchor="middle" fontSize="6" fill={node.textColor} opacity="0.7" fontWeight="600">
                        {sn.label}
                      </text>
                      <text x={bx + subBoxW / 2} y={by + 18}
                        textAnchor="middle" fontSize="5.5" fill={node.textColor} opacity="0.5"
                        style={{ fontFamily: "ui-monospace, monospace" }}>
                        {sn.cidr}
                      </text>
                    </g>
                  );
                })}
              </motion.g>
            );
          })}

          {/* Tab Context Overlays */}

          {panelTab === "router" && phase >= 2 && (
            <g>
              {/* Hub: BGP ASN + Firewall badge */}
              <rect x={396} y={193} width={168} height={14} rx="3" fill="#050f1f" opacity="0.96" stroke="#3b82f620" strokeWidth="1"/>
              <text x={480} y={203} textAnchor="middle" fontSize="7" fill="#60a5fa" fontWeight="600">BGP ASN 64512 · Network Firewall</text>

              {/* On-prem BGP */}
              <rect x={8} y={216} width={80} height={13} rx="3" fill="#050f1f" opacity="0.96"/>
              <text x={48} y={225} textAnchor="middle" fontSize="7" fill="#94a3b8">BGP ASN 65000</text>

              {/* Route table badges — below VPC container bottom (cy + h/2 + 36) */}
              {[
                { cx: 165, cy: 110, h: 85 },
                { cx: 795, cy: 110, h: 85 },
                { cx: 165, cy: 390, h: 85 },
                { cx: 795, cy: 390, h: 85 },
              ].map((n, i) => (
                <g key={i}>
                  <rect x={n.cx - 70} y={n.cy + n.h / 2 + 39} width={140} height={13} rx="3" fill="#05111f" opacity="0.96" stroke="#1e293b" strokeWidth="0.5"/>
                  <text x={n.cx} y={n.cy + n.h / 2 + 48} textAnchor="middle" fontSize="6.5" fill="#7dd3fc">RT: 0.0.0.0/0 → Hub TGW</text>
                </g>
              ))}

              {/* Firewall policy strip below Hub */}
              <rect x={380} y={313} width={200} height={13} rx="3" fill="#050f1f" opacity="0.94" stroke="#3b82f620" strokeWidth="1"/>
              <text x={480} y={322} textAnchor="middle" fontSize="6.5" fill="#93c5fd">DENY spoke↔spoke · ALLOW spoke → Hub NAT</text>

              {/* Black-hole badge above hub */}
              <rect x={396} y={180} width={168} height={12} rx="3" fill="#0f0505" opacity="0.94" stroke="#ef444420" strokeWidth="0.5"/>
              <text x={480} y={189} textAnchor="middle" fontSize="6.5" fill="#fca5a5">RFC1918 black-hole · no direct spoke-to-spoke</text>
            </g>
          )}

          {panelTab === "dns" && phase >= 2 && (
            <g>
              {/* Dashed DNS query lines from spokes to Hub resolver */}
              {[
                { cx: 165, cy: 110 },
                { cx: 795, cy: 110 },
                { cx: 165, cy: 390 },
                { cx: 795, cy: 390 },
              ].map((sp, i) => (
                <line key={i} x1={sp.cx} y1={sp.cy} x2={480} y2={250}
                  stroke="#6366f1" strokeWidth="1" strokeDasharray="3,5" opacity="0.35"/>
              ))}

              {/* Hub resolver IP */}
              <rect x={394} y={192} width={172} height={14} rx="3" fill="#04040f" opacity="0.97" stroke="#6366f125" strokeWidth="1"/>
              <text x={480} y={202} textAnchor="middle" fontSize="7" fill="#a5b4fc" fontWeight="600">Resolver 10.0.1.10 / .11 · Fwd → 10.0.1.20</text>

              {/* Spoke nodes: DNS server label — below VPC container */}
              {[
                { cx: 165, cy: 110, h: 85 },
                { cx: 795, cy: 110, h: 85 },
                { cx: 165, cy: 390, h: 85 },
              ].map((n, i) => (
                <g key={i}>
                  <rect x={n.cx - 60} y={n.cy + n.h / 2 + 39} width={120} height={12} rx="3" fill="#04040f" opacity="0.96"/>
                  <text x={n.cx} y={n.cy + n.h / 2 + 48} textAnchor="middle" fontSize="6.5" fill="#a5b4fc">DNS → 10.0.1.10 (Hub)</text>
                </g>
              ))}

              {/* Control Plane: private DNS zone override */}
              <rect x={868} y={215} width={88} height={24} rx="3" fill="#04040f" opacity="0.97" stroke="#6366f125" strokeWidth="1"/>
              <text x={912} y={225} textAnchor="middle" fontSize="6" fill="#c4b5fd">*.azuredatabricks.net</text>
              <text x={912} y={234} textAnchor="middle" fontSize="6" fill="#818cf8">→ Private IP (PE)</text>

              {/* Shared: storage + keyvault zones */}
              <rect x={748} y={415} width={94} height={24} rx="3" fill="#04040f" opacity="0.97" stroke="#6366f125" strokeWidth="1"/>
              <text x={795} y={425} textAnchor="middle" fontSize="6" fill="#c4b5fd">*.dfs.core.windows.net</text>
              <text x={795} y={434} textAnchor="middle" fontSize="6" fill="#818cf8">*.vault.azure.net → PE</text>

              {/* On-prem: conditional forwarder */}
              <rect x={8} y={268} width={80} height={12} rx="3" fill="#04040f" opacity="0.96"/>
              <text x={48} y={277} textAnchor="middle" fontSize="6.5" fill="#94a3b8">hhs.internal → fwd</text>
            </g>
          )}

          {panelTab === "calc" && phase >= 3 && (() => {
            const subnetIPs = Math.pow(2, 32 - calcSubnetPrefix);
            const nodesPerSubnet = Math.floor((subnetIPs - 5) / 2);
            const vpcIPsLocal = Math.pow(2, 32 - calcVpcPrefix);
            const subnetsAvail = Math.floor(vpcIPsLocal / subnetIPs);
            const maxWsLocal = Math.floor(subnetsAvail / 2);
            const wsNodes = [
              { id: "dev",     cx: 165, cy: 110, h: 85, idx: 1 },
              { id: "staging", cx: 165, cy: 390, h: 85, idx: 3 },
              { id: "prod",    cx: 795, cy: 110, h: 85, idx: 2 },
            ];
            const barMax = Math.floor((Math.pow(2, 32 - 19) - 5) / 2); // /19 max as reference
            return (
              <g>
                {/* Hub: VPC summary */}
                <rect x={392} y={191} width={176} height={14} rx="3" fill="#050018" opacity="0.97" stroke="#7c3aed25" strokeWidth="1"/>
                <text x={480} y={201} textAnchor="middle" fontSize="7" fill="#c4b5fd" fontWeight="600">
                  {`VPC /${calcVpcPrefix} · ${subnetsAvail} subnets · max ${maxWsLocal} workspaces`}
                </text>

                {/* Per-workspace node overlay */}
                {wsNodes.map(n => {
                  const cidr = `10.${n.idx}.0.0/${calcSubnetPrefix}`;
                  const fillPct = Math.max(4, Math.min(100, Math.round(nodesPerSubnet / barMax * 100)));
                  const barColor = fillPct > 75 ? "#10b981" : fillPct > 40 ? "#f59e0b" : "#ef4444";
                  return (
                    <g key={n.id}>
                      {/* Badge above node */}
                      <rect x={n.cx - 72} y={n.cy - n.h / 2 - 30} width={144} height={28} rx="4"
                        fill="#050018" opacity="0.97" stroke="#7c3aed30" strokeWidth="1"/>
                      <text x={n.cx} y={n.cy - n.h / 2 - 18} textAnchor="middle" fontSize="7" fill="#c4b5fd" fontWeight="600">
                        {`/${calcSubnetPrefix} · ${nodesPerSubnet.toLocaleString()} nodes`}
                      </text>
                      <text x={n.cx} y={n.cy - n.h / 2 - 8} textAnchor="middle" fontSize="6.5" fill="#a78bfa">
                        {cidr}
                      </text>
                      {/* Capacity bar below node */}
                      <rect x={n.cx - 50} y={n.cy + n.h / 2 + 4} width={100} height={5} rx="2" fill="#1a0a30"/>
                      <rect x={n.cx - 50} y={n.cy + n.h / 2 + 4} width={fillPct} height={5} rx="2" fill={barColor} opacity="0.85"/>
                      <text x={n.cx + 54} y={n.cy + n.h / 2 + 9} fontSize="6" fill="#7c3aed" opacity="0.8">{fillPct}%</text>
                    </g>
                  );
                })}
              </g>
            );
          })()}

          {/* Data Flow Animation Overlay */}
          {showDataFlow && (
            <g>
              {/* Pipeline path highlights */}
              <path d="M 48 250 L 165 110" stroke="#f59e0b" strokeWidth="2.5" fill="none" opacity="0.45" strokeDasharray="8,5" />
              <path d="M 165 110 L 480 250 L 795 390" stroke="#0ea5e9" strokeWidth="2.5" fill="none" opacity="0.45" strokeDasharray="8,5" />
              <path d="M 795 390 L 480 250 L 165 390" stroke="#8b5cf6" strokeWidth="2.5" fill="none" opacity="0.45" strokeDasharray="8,5" />
              <path d="M 165 390 L 480 250 L 795 110" stroke="#10b981" strokeWidth="2.5" fill="none" opacity="0.45" strokeDasharray="8,5" />

              {/* Step labels */}
              <rect x="52" y="163" width="72" height="16" rx="3" fill="#1a0e00" opacity="0.85" />
              <text x="88" y="174" textAnchor="middle" fontSize="7.5" fill="#f59e0b" fontWeight="700">1 · Raw Ingest → DEV</text>
              <rect x="260" y="290" width="76" height="16" rx="3" fill="#001220" opacity="0.85" />
              <text x="298" y="301" textAnchor="middle" fontSize="7.5" fill="#0ea5e9" fontWeight="700">2 · Write Delta Lake</text>
              <rect x="388" y="415" width="76" height="16" rx="3" fill="#0d0820" opacity="0.85" />
              <text x="426" y="426" textAnchor="middle" fontSize="7.5" fill="#8b5cf6" fontWeight="700">3 · Staging Validate</text>
              <rect x="575" y="220" width="72" height="16" rx="3" fill="#001a0a" opacity="0.85" />
              <text x="611" y="231" textAnchor="middle" fontSize="7.5" fill="#10b981" fontWeight="700">4 · Promote → Prod</text>

              {/* Animated data packets — stage 1: onprem → dev */}
              <circle r="5.5" fill="#f59e0b" opacity="0.95">
                <animateMotion dur="2.2s" begin="0s" repeatCount="indefinite" path="M 48 250 L 165 110" />
              </circle>
              <circle r="3" fill="#fef3c7" opacity="0.7">
                <animateMotion dur="2.2s" begin="0.4s" repeatCount="indefinite" path="M 48 250 L 165 110" />
              </circle>

              {/* Stage 2: dev → hub → shared */}
              <circle r="5.5" fill="#0ea5e9" opacity="0.95">
                <animateMotion dur="3s" begin="0.7s" repeatCount="indefinite" path="M 165 110 L 480 250 L 795 390" />
              </circle>
              <circle r="3" fill="#bae6fd" opacity="0.7">
                <animateMotion dur="3s" begin="1.1s" repeatCount="indefinite" path="M 165 110 L 480 250 L 795 390" />
              </circle>

              {/* Stage 3: shared → hub → staging */}
              <circle r="5.5" fill="#8b5cf6" opacity="0.95">
                <animateMotion dur="3s" begin="1.4s" repeatCount="indefinite" path="M 795 390 L 480 250 L 165 390" />
              </circle>
              <circle r="3" fill="#ddd6fe" opacity="0.7">
                <animateMotion dur="3s" begin="1.8s" repeatCount="indefinite" path="M 795 390 L 480 250 L 165 390" />
              </circle>

              {/* Stage 4: staging → hub → prod */}
              <circle r="5.5" fill="#10b981" opacity="0.95">
                <animateMotion dur="2.8s" begin="2.1s" repeatCount="indefinite" path="M 165 390 L 480 250 L 795 110" />
              </circle>
              <circle r="3" fill="#a7f3d0" opacity="0.7">
                <animateMotion dur="2.8s" begin="2.5s" repeatCount="indefinite" path="M 165 390 L 480 250 L 795 110" />
              </circle>

              {/* Banner */}
              <rect x="310" y="6" width="340" height="18" rx="4" fill="#1c1000" opacity="0.9" />
              <text x="480" y="18" textAnchor="middle" fontSize="8.5" fill="#fbbf24" fontWeight="700" letterSpacing="1">
                DATA PIPELINE · On-Prem → DEV → Staging → Production
              </text>
            </g>
          )}

          {/* Click hint */}
          {phase >= 6 && (
            <motion.text
              x={480} y={488} textAnchor="middle" fontSize="8" fill="#475569"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            >
              Click any component to see configuration details
            </motion.text>
          )}
        </svg>
      </div>

      {/* Detail panel */}
      <div className="w-[280px] flex flex-col gap-3 overflow-y-auto shrink-0">
        {/* Tab bar */}
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-1 flex gap-1 shrink-0 flex-wrap">
          {(["detail", "router", "dns", "calc"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setPanelTab(tab)}
              className={`flex-1 text-[11px] font-semibold py-1 rounded-lg transition-colors ${panelTab === tab ? "bg-blue-900/50 text-blue-300 border border-blue-700/60" : "text-slate-500 hover:text-slate-300"}`}
            >
              {tab === "detail" ? "Nodes" : tab === "router" ? "Router" : tab === "dns" ? "DNS" : "Capacity"}
            </button>
          ))}
        </div>

        {panelTab === "detail" && (
          <>
            {/* Legend */}
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-3 space-y-2 shrink-0">
              <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Connection Types</p>
              {[
                { label: "VPC Peering / TGW", style: "solid" as const, color: "#3b82f6" },
                { label: "VPN / ExpressRoute", style: "dashed" as const, color: "#64748b" },
                { label: "Private Link (SaaS)", style: "dotted" as const, color: "#6366f1" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <svg width="26" height="8" className="shrink-0">
                    <line x1="0" y1="4" x2="26" y2="4" stroke={l.color} strokeWidth="1.5"
                      strokeDasharray={l.style === "dashed" ? "5,3" : l.style === "dotted" ? "2,4" : undefined} />
                  </svg>
                  <span className="text-[13px] text-slate-400">{l.label}</span>
                </div>
              ))}
            </div>

            {/* Selected node detail */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex-1 rounded-xl border border-slate-800/60 bg-slate-900/30 p-3 space-y-3 overflow-y-auto"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: sel.stroke }} />
                    <p className="text-sm font-bold text-white">{sel.label}</p>
                    {sel.isExternal && <span className="text-[12px] text-slate-500 border border-slate-700 rounded px-1">external</span>}
                  </div>
                  <p className="text-[13px] text-slate-500 pl-4">{sel.sublabel}</p>
                </div>

                <p className="text-[13px] text-slate-400 leading-relaxed">{sel.details.description}</p>

                <div className="space-y-1.5">
                  <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Configuration</p>
                  {sel.details.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-3">
                      <span className="text-[13px] text-slate-500 shrink-0">{item.label}</span>
                      <span className="text-[13px] text-slate-300 text-right leading-relaxed">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Recommendations</p>
                  {sel.details.recs.map((rec, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle className="w-2.5 h-2.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[13px] text-slate-400 leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {panelTab === "router" && (
          <div className="flex-1 rounded-xl border border-slate-800/60 bg-slate-900/30 p-3 space-y-4 overflow-y-auto">
            <div>
              <p className="text-sm font-bold text-white mb-0.5">Router Settings</p>
              <p className="text-[13px] text-slate-500">Transit Gateway / VNet Peering route configuration for Hub-Spoke topology.</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Route Tables</p>
              {[
                { label: "Hub Route Table", value: "Summarized 10.0.0.0/8 → TGW" },
                { label: "Dev Spoke RT", value: "0.0.0.0/0 → Hub TGW attachment" },
                { label: "Staging Spoke RT", value: "0.0.0.0/0 → Hub TGW attachment" },
                { label: "Prod Spoke RT", value: "0.0.0.0/0 → Hub TGW attachment" },
                { label: "Shared Spoke RT", value: "0.0.0.0/0 → Hub TGW attachment" },
                { label: "Black-Hole Route", value: "RFC1918 → Drop (no spoke-to-spoke)" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-start gap-2">
                  <span className="text-[13px] text-slate-500 shrink-0">{row.label}</span>
                  <span className="text-[13px] text-slate-300 text-right font-mono text-[11px] leading-relaxed">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">BGP Settings</p>
              {[
                { label: "ASN (Hub)", value: "64512 (private)" },
                { label: "ASN (On-Prem)", value: "65000" },
                { label: "Keepalive", value: "10s / Hold: 30s" },
                { label: "Route Propagation", value: "Enabled on all TGW attachments" },
                { label: "Communities", value: "65000:100 (on-prem prefixes)" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-start gap-2">
                  <span className="text-[13px] text-slate-500 shrink-0">{row.label}</span>
                  <span className="text-[13px] text-slate-300 text-right font-mono text-[11px]">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Firewall Rules</p>
              {[
                { from: "Dev", to: "Shared", port: "443 HTTPS", color: "#0ea5e9" },
                { from: "Staging", to: "Shared", port: "443 HTTPS", color: "#f59e0b" },
                { from: "Prod", to: "Shared", port: "443 HTTPS", color: "#10b981" },
                { from: "Any Spoke", to: "Internet", port: "DENY (Hub NAT only)", color: "#ef4444" },
                { from: "Spoke", to: "Spoke", port: "DENY (no lateral)", color: "#ef4444" },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px]">
                  <span className="shrink-0 font-mono px-1 rounded" style={{ color: row.color, background: row.color + "22" }}>{row.from}</span>
                  <span className="text-slate-600">→</span>
                  <span className="shrink-0 text-slate-400">{row.to}</span>
                  <span className="text-slate-600 ml-auto text-right shrink-0">{row.port}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {panelTab === "dns" && (
          <div className="flex-1 rounded-xl border border-slate-800/60 bg-slate-900/30 p-3 space-y-4 overflow-y-auto">
            <div>
              <p className="text-sm font-bold text-white mb-0.5">Private DNS Settings</p>
              <p className="text-[13px] text-slate-500">Centralized DNS in Hub resolves all private endpoints — spokes forward all DNS to Hub resolvers.</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Resolver Endpoints</p>
              {[
                { label: "Inbound Resolver", value: "10.0.1.10 / 10.0.1.11" },
                { label: "Outbound Forwarder", value: "10.0.1.20 (→ on-prem DNS)" },
                { label: "Spoke DNS Server", value: "10.0.1.10 (points to Hub)" },
                { label: "On-Prem Fwd Target", value: "10.0.1.20 for *.internal" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-start gap-2">
                  <span className="text-[13px] text-slate-500 shrink-0">{row.label}</span>
                  <span className="text-[13px] text-slate-300 font-mono text-[11px] text-right">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Private DNS Zones</p>
              {[
                { zone: "*.azuredatabricks.net", ip: "10.0.2.x", note: "Databricks CP Private Link" },
                { zone: "*.dfs.core.windows.net", ip: "10.4.1.x", note: "ADLS Gen2 private endpoint" },
                { zone: "*.blob.core.windows.net", ip: "10.4.2.x", note: "Blob storage endpoint" },
                { zone: "*.vault.azure.net", ip: "10.4.3.x", note: "Key Vault private endpoint" },
                { zone: "*.azurecr.io", ip: "10.4.4.x", note: "Container Registry PE" },
                { zone: "hhs.internal", ip: "10.0.1.20 →", note: "Forwarded to on-prem" },
              ].map((row, i) => (
                <div key={i} className="space-y-0.5 border-b border-slate-800/50 pb-1.5 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-blue-400">{row.zone}</span>
                    <span className="text-[11px] font-mono text-slate-400">{row.ip}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{row.note}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">DNS Security</p>
              {[
                "DNSSEC validation enabled on Hub resolver",
                "Block public DNS from spokes — Hub-only egress",
                "DNS query logging → Log Analytics / CloudWatch",
                "Deny wildcard * PTR from spoke subnets",
                "Alert on DNS exfiltration patterns (long labels)",
              ].map((rec, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <CheckCircle className="w-2.5 h-2.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-[13px] text-slate-400 leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {panelTab === "calc" && (() => {
          const vpcIPs = Math.pow(2, 32 - calcVpcPrefix);
          const subnetIPs = Math.pow(2, 32 - calcSubnetPrefix);
          const nodesPerSubnet = Math.floor((subnetIPs - 5) / 2);
          // Each workspace needs 2 same-sized subnets: cluster + container
          const subnetsPerWs = 2;
          const subnetsAvailable = Math.floor(vpcIPs / subnetIPs);
          const maxWorkspacesInVpc = Math.floor(subnetsAvailable / subnetsPerWs);
          const fits = calcWorkspaces <= maxWorkspacesInVpc;
          const vpcUsedPct = Math.min(100, Math.round((calcWorkspaces * subnetsPerWs * subnetIPs) / vpcIPs * 100));
          const ipSpace = (n: number) =>
            n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` :
            n >= 1_000 ? `${(n/1_000).toFixed(0)}k` : String(n);
          const clusterBase = `10.${calcWorkspaces}.0.0/${calcSubnetPrefix}`;
          const containerBase = `10.${calcWorkspaces}.${subnetIPs >>> 8}.0/${calcSubnetPrefix}`;
          return (
            <div className="flex-1 rounded-xl border border-slate-800/60 bg-slate-900/30 p-3 space-y-4 overflow-y-auto">
              <div>
                <p className="text-sm font-bold text-white mb-0.5">Capacity Calculator</p>
                <p className="text-[12px] text-slate-500">Nodes per subnet &amp; workspaces per VPC.</p>
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-slate-400">VPC CIDR Prefix</span>
                    <span className="text-[12px] font-mono text-blue-300">/{calcVpcPrefix} ({ipSpace(vpcIPs)} IPs)</span>
                  </div>
                  <input type="range" min={14} max={22} step={1} value={calcVpcPrefix}
                    onChange={e => setCalcVpcPrefix(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full accent-blue-500 cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                    <span>/14 (256k)</span><span>/22 (1k)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-slate-400">Subnet Prefix</span>
                    <span className="text-[12px] font-mono text-sky-300">/{calcSubnetPrefix} ({ipSpace(subnetIPs)} IPs)</span>
                  </div>
                  <input type="range" min={19} max={26} step={1} value={calcSubnetPrefix}
                    onChange={e => setCalcSubnetPrefix(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full accent-sky-500 cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                    <span>/19 (8k)</span><span>/26 (64)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-slate-400">Workspaces</span>
                    <span className={`text-[12px] font-mono ${fits ? "text-emerald-400" : "text-red-400"}`}>{calcWorkspaces} ws</span>
                  </div>
                  <input type="range" min={1} max={50} step={1} value={calcWorkspaces}
                    onChange={e => setCalcWorkspaces(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full accent-emerald-500 cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                    <span>1</span><span>50</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-1.5">
                <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Results</p>
                {[
                  { label: "Nodes per subnet", value: nodesPerSubnet.toLocaleString(), color: "#7dd3fc" },
                  { label: "Max workspaces in VPC", value: maxWorkspacesInVpc.toString(), color: fits ? "#6ee7b7" : "#fca5a5" },
                  { label: "VPC address usage", value: `${vpcUsedPct}%`, color: vpcUsedPct > 80 ? "#fca5a5" : "#fcd34d" },
                  { label: "Fits in VPC?", value: fits ? "✓ Yes" : "✗ Overflow", color: fits ? "#6ee7b7" : "#fca5a5" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-[13px] text-slate-500">{row.label}</span>
                    <span className="text-[13px] font-semibold font-mono" style={{ color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* VPC usage bar */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] text-slate-500">VPC utilization</span>
                  <span className="text-[12px] text-slate-500">{vpcUsedPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(vpcUsedPct, 100)}%`, background: vpcUsedPct > 90 ? "#ef4444" : vpcUsedPct > 70 ? "#f59e0b" : "#10b981" }}
                  />
                </div>
              </div>

              {/* Subnet layout preview */}
              <div className="space-y-1.5">
                <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Subnet Layout (WS 1)</p>
                {[
                  { label: "Cluster Subnet", cidr: clusterBase, color: "#7dd3fc" },
                  { label: "Container Subnet", cidr: containerBase, color: "#a5b4fc" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-[12px] text-slate-500">{row.label}</span>
                    <span className="text-[11px] font-mono" style={{ color: row.color }}>{row.cidr}</span>
                  </div>
                ))}
                <p className="text-[11px] text-slate-600 pt-0.5">AWS reserves 5 IPs/subnet · 2 IPs/node (host + container)</p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── IAM & Unity Catalog Data (Chapter 11) ───────────────────────────────────

interface Ch11GroupAccess {
  catalog: string;
  privilege: string;
  schemas: string[];
  colMask?: string[];
  rowFilter?: string;
}

interface Ch11Group {
  id: string;
  label: string;
  badge: string;
  badgeColor: string;
  access: Ch11GroupAccess[];
  abacSql?: string;
  platformPowers?: string[];
  crossCatalogQuery?: { sql: string; explanation: string[]; catalogs: string[] };
}

interface Ch11Agency {
  agencyId: string;
  label: string;
  stroke: string;
  textColor: string;
  groups: Ch11Group[];
}

interface Ch11Schema {
  id: string;
  tables: string[];
  hasPII?: boolean;
}

interface Ch11Catalog {
  id: string;
  label: string;
  stroke: string;
  textColor: string;
  bgHex: string;
  workspaces: string[];
  schemas: Ch11Schema[];
  storagePath: string;
  storageSize: string;
}

const CH11_WORKSPACES = [
  { id: "ws-dev",         label: "ws-hhs-dev",      textColor: "#94a3b8", stroke: "#475569" },
  { id: "ws-prod-doh",    label: "ws-prod-doh",      textColor: "#7dd3fc", stroke: "#0ea5e9" },
  { id: "ws-prod-shared", label: "ws-prod-shared",   textColor: "#6ee7b7", stroke: "#10b981" },
];

const CH11_AGENCIES: Ch11Agency[] = [
  {
    agencyId: "DOH", label: "Dept. of Health", stroke: "#0ea5e9", textColor: "#7dd3fc",
    groups: [
      { id: "doh_admins", label: "doh_admins", badge: "Admin",
        badgeColor: "bg-sky-900/50 text-sky-300 border-sky-700",
        access: [{ catalog: "medicaid", privilege: "ALL PRIVILEGES", schemas: ["*"] }] },
      { id: "doh_analysts", label: "doh_analysts", badge: "Analyst",
        badgeColor: "bg-sky-900/50 text-sky-300 border-sky-700",
        access: [{ catalog: "medicaid", privilege: "SELECT", schemas: ["silver", "gold"], colMask: ["ssn", "dob"] }],
        abacSql: `CREATE COLUMN MASK ssn_mask\nRETURN CASE\n  WHEN is_member('doh_admins') THEN ssn\n  ELSE '***-**-' || RIGHT(ssn, 4)\nEND` },
      { id: "doh_readonly", label: "doh_readonly", badge: "Read-Only",
        badgeColor: "bg-sky-900/50 text-sky-300 border-sky-700",
        access: [{ catalog: "medicaid", privilege: "SELECT", schemas: ["gold"], colMask: ["ssn", "dob", "address"] }] },
    ],
  },
  {
    agencyId: "DHS", label: "Dept. of Human Svcs.", stroke: "#10b981", textColor: "#6ee7b7",
    groups: [
      { id: "dhs_admins", label: "dhs_admins", badge: "Admin",
        badgeColor: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
        access: [{ catalog: "snap", privilege: "ALL PRIVILEGES", schemas: ["*"] }] },
      { id: "dhs_analysts", label: "dhs_analysts", badge: "Analyst",
        badgeColor: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
        access: [{ catalog: "snap", privilege: "SELECT", schemas: ["gold"], colMask: ["case_id"] }] },
    ],
  },
  {
    agencyId: "DCFS", label: "Child & Family Svcs.", stroke: "#f59e0b", textColor: "#fcd34d",
    groups: [
      { id: "dcfs_supervisors", label: "dcfs_supervisors", badge: "Supervisor",
        badgeColor: "bg-orange-900/50 text-orange-300 border-orange-700",
        access: [{ catalog: "cps", privilege: "SELECT", schemas: ["*"] }] },
      { id: "dcfs_caseworkers", label: "dcfs_caseworkers", badge: "Caseworker",
        badgeColor: "bg-orange-900/50 text-orange-300 border-orange-700",
        access: [{ catalog: "cps", privilege: "SELECT", schemas: ["*"], rowFilter: "county = current_user_county()" }],
        abacSql: `CREATE ROW FILTER county_filter\nON cps.silver.intakes_silver\nRETURN county = current_user_attribute('county')` },
    ],
  },
  {
    agencyId: "DBHDS", label: "Behavioral Health", stroke: "#8b5cf6", textColor: "#c4b5fd",
    groups: [
      { id: "dbhds_clinicians", label: "dbhds_clinicians", badge: "Clinician",
        badgeColor: "bg-violet-900/50 text-violet-300 border-violet-700",
        access: [{ catalog: "behavioral_health", privilege: "SELECT", schemas: ["*"], rowFilter: "patient_id IN user_patients()" }],
        abacSql: `CREATE ROW FILTER patient_filter\nON bh.silver.clients_silver\nRETURN patient_id IN (\n  SELECT patient_id FROM user_patient_assignments\n  WHERE clinician = current_user()\n)` },
      { id: "dbhds_auditors", label: "dbhds_auditors", badge: "Auditor",
        badgeColor: "bg-violet-900/50 text-violet-300 border-violet-700",
        access: [{ catalog: "behavioral_health", privilege: "SELECT", schemas: ["gold"] }] },
    ],
  },
  {
    agencyId: "Cross", label: "Cross-Agency", stroke: "#6366f1", textColor: "#a5b4fc",
    groups: [
      { id: "hhs_executives", label: "hhs_executives", badge: "Executive",
        badgeColor: "bg-indigo-900/50 text-indigo-300 border-indigo-700",
        access: [{ catalog: "hhs_shared", privilege: "SELECT", schemas: ["gold"] }] },
      { id: "hhs_engineers", label: "hhs_engineers", badge: "Engineer",
        badgeColor: "bg-indigo-900/50 text-indigo-300 border-indigo-700",
        access: [
          { catalog: "medicaid",         privilege: "USE CATALOG", schemas: ["*"] },
          { catalog: "snap",             privilege: "USE CATALOG", schemas: ["*"] },
          { catalog: "cps",              privilege: "USE CATALOG", schemas: ["*"] },
          { catalog: "behavioral_health",privilege: "USE CATALOG", schemas: ["*"] },
          { catalog: "hhs_shared",       privilege: "ALL PRIVILEGES", schemas: ["*"] },
        ] },
      { id: "eligibility_crossmatch", label: "eligibility_crossmatch", badge: "Cross-Catalog Analyst",
        badgeColor: "bg-indigo-900/50 text-indigo-300 border-indigo-700",
        access: [
          { catalog: "medicaid", privilege: "SELECT", schemas: ["silver", "gold"],
            rowFilter: "auto-applied — no additional grants needed" },
          { catalog: "snap",     privilege: "SELECT", schemas: ["silver"],
            colMask: ["ssn → masked", "bank_routing → masked"],
            rowFilter: "WHERE medicaid_eligibility_flag = true" },
          { catalog: "hhs_shared", privilege: "SELECT", schemas: ["gold"] },
        ],
        crossCatalogQuery: {
          catalogs: ["medicaid", "snap", "hhs_shared"],
          sql:
`-- DOH Eligibility Analysts: Medicaid + SNAP cross-catalog join
-- Unity Catalog silently applies row filter on snap.silver.members_silver

SELECT
  m.member_id,
  m.county,
  m.medicaid_plan,
  s.snap_benefit_amt,   -- ssn & bank_routing auto-masked by UC
  h.program_overlap_flag
FROM medicaid.silver.members_silver   m  -- full access (home catalog)
JOIN snap.silver.members_silver        s  -- UC row filter applied here ↓
  ON m.state_id = s.state_id               -- WHERE medicaid_eligibility_flag = true
JOIN hhs_shared.gold.program_overlap_gold h
  ON m.member_id = h.member_id
WHERE m.enrollment_status = 'active'`,
          explanation: [
            "medicaid.silver — SELECT granted, all rows visible (home catalog)",
            "snap.silver — SELECT granted; UC auto-applies row filter: only rows where medicaid_eligibility_flag = true are returned",
            "ssn & bank_routing columns in snap are masked — analyst never sees raw PII",
            "hhs_shared.gold — pre-aggregated overlap view, no PII, open to cross-agency reads",
            "Result: analysts get joined Medicaid + SNAP data without direct storage access or bypassing ABAC",
          ],
        },
      },
    ],
  },
  {
    agencyId: "IT", label: "Central IT", stroke: "#ec4899", textColor: "#f9a8d4",
    groups: [
      { id: "it_admins", label: "it_admins", badge: "Metastore Admin",
        badgeColor: "bg-pink-900/50 text-pink-300 border-pink-700",
        access: [
          { catalog: "medicaid",          privilege: "ALL PRIVILEGES", schemas: ["*"] },
          { catalog: "snap",              privilege: "ALL PRIVILEGES", schemas: ["*"] },
          { catalog: "cps",              privilege: "ALL PRIVILEGES", schemas: ["*"] },
          { catalog: "behavioral_health", privilege: "ALL PRIVILEGES", schemas: ["*"] },
          { catalog: "hhs_shared",        privilege: "ALL PRIVILEGES", schemas: ["*"] },
        ],
        platformPowers: [
          "METASTORE ADMIN — create/drop catalogs, manage workspace bindings",
          "Storage Credentials — register cloud IAM roles / managed identities",
          "External Locations — govern all ADLS / S3 path registrations",
          "Audit Log — system.access.audit_log (all users, all queries)",
          "Cluster Policies — enforce instance types, auto-termination rules",
          "IP Access Lists — restrict workspace access by source IP / VPN CIDR",
          "Workspace SSO/SCIM — manage Entra ID / Okta group sync",
        ] },
      { id: "it_security", label: "it_security", badge: "Security Audit",
        badgeColor: "bg-pink-900/50 text-pink-300 border-pink-700",
        access: [
          { catalog: "medicaid",          privilege: "SELECT", schemas: ["*"] },
          { catalog: "snap",              privilege: "SELECT", schemas: ["*"] },
          { catalog: "cps",              privilege: "SELECT", schemas: ["*"] },
          { catalog: "behavioral_health", privilege: "SELECT", schemas: ["*"] },
          { catalog: "hhs_shared",        privilege: "SELECT", schemas: ["*"] },
        ],
        platformPowers: [
          "Audit Log READ — system.access.audit_log (compliance review)",
          "Column Lineage READ — system.lineage.column_lineage (data flow tracing)",
          "UC Grants READ — SHOW GRANTS on all catalogs, schemas, tables",
          "Workspace Admin READ — view all users, groups, service principals",
          "SIEM Forward — ship audit logs to Splunk / Microsoft Sentinel",
          "Policy Enforcement — review ABAC row filters and column masks",
        ] },
      { id: "it_platform", label: "it_platform", badge: "Platform Eng",
        badgeColor: "bg-pink-900/50 text-pink-300 border-pink-700",
        access: [
          { catalog: "medicaid",          privilege: "USE CATALOG", schemas: ["*"] },
          { catalog: "snap",              privilege: "USE CATALOG", schemas: ["*"] },
          { catalog: "cps",              privilege: "USE CATALOG", schemas: ["*"] },
          { catalog: "behavioral_health", privilege: "USE CATALOG", schemas: ["*"] },
          { catalog: "hhs_shared",        privilege: "ALL PRIVILEGES", schemas: ["*"] },
        ],
        platformPowers: [
          "Workspace Config — manage init scripts, Spark config, env vars",
          "Delta Live Tables — deploy and manage pipeline compute",
          "Job Automation — service principals for all scheduled pipelines",
          "Cost Controls — per-team query attribution, budget alerts",
          "Cluster Policies — spot instance enforcement, max cluster size caps",
          "Unity Catalog CI/CD — Terraform modules for catalog/schema provisioning",
        ] },
    ],
  },
];

const CH11_CATALOGS: Ch11Catalog[] = [
  { id: "medicaid", label: "medicaid", stroke: "#0ea5e9", textColor: "#7dd3fc", bgHex: "#082f4918",
    workspaces: ["ws-prod-doh", "ws-prod-shared"],
    schemas: [
      { id: "bronze", tables: ["claims_bronze", "members_bronze"] },
      { id: "silver", tables: ["claims_silver", "members_silver"], hasPII: true },
      { id: "gold",   tables: ["medicaid_summary_gold"] },
    ],
    storagePath: "abfss://medicaid@hhslake.dfs.core.windows.net/", storageSize: "4.2 TB" },
  { id: "snap", label: "snap", stroke: "#10b981", textColor: "#6ee7b7", bgHex: "#05291618",
    workspaces: ["ws-prod-shared"],
    schemas: [
      { id: "silver", tables: ["cases_silver", "benefits_silver"], hasPII: true },
      { id: "gold",   tables: ["snap_efficiency_gold"] },
    ],
    storagePath: "abfss://snap@hhslake.dfs.core.windows.net/", storageSize: "1.8 TB" },
  { id: "cps", label: "cps", stroke: "#f59e0b", textColor: "#fcd34d", bgHex: "#3b270218",
    workspaces: ["ws-prod-shared"],
    schemas: [
      { id: "silver", tables: ["intakes_silver", "outcomes_silver"], hasPII: true },
    ],
    storagePath: "abfss://cps@hhslake.dfs.core.windows.net/", storageSize: "0.9 TB" },
  { id: "behavioral_health", label: "bh", stroke: "#8b5cf6", textColor: "#c4b5fd", bgHex: "#2e106518",
    workspaces: ["ws-prod-shared"],
    schemas: [
      { id: "silver", tables: ["clients_silver", "tx_plans_silver"], hasPII: true },
      { id: "gold",   tables: ["bh_outcomes_gold"] },
    ],
    storagePath: "abfss://bh@hhslake.dfs.core.windows.net/", storageSize: "2.1 TB" },
  { id: "hhs_shared", label: "hhs_shared", stroke: "#6366f1", textColor: "#a5b4fc", bgHex: "#1e1b4b18",
    workspaces: ["ws-dev", "ws-prod-doh", "ws-prod-shared"],
    schemas: [
      { id: "gold", tables: ["program_overlap_gold", "county_metrics_gold", "snap_efficiency_gold", "child_outcomes_gold"] },
    ],
    storagePath: "abfss://shared@hhslake.dfs.core.windows.net/", storageSize: "0.6 TB" },
];

// ─── Chapter 11 ───────────────────────────────────────────────────────────────

function Chapter11() {
  const [phase, setPhase] = useState(0);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      await sleep(200); if (cancelled) return; setPhase(1);
      await sleep(500); if (cancelled) return; setPhase(2);
      await sleep(700); if (cancelled) return; setPhase(3);
      await sleep(500); if (cancelled) return; setPhase(4);
      await sleep(400); if (cancelled) return; setPhase(5);
    }
    run();
    return () => { cancelled = true; };
  }, []);

  const allGroups = CH11_AGENCIES.flatMap(a => a.groups);
  const selGroup = selectedGroupId ? allGroups.find(g => g.id === selectedGroupId) ?? null : null;
  const accessMap = selGroup ? new Map(selGroup.access.map(a => [a.catalog, a])) : null;
  const wsMap = new Map(CH11_WORKSPACES.map(w => [w.id, w]));

  const schemaColor = (id: string) =>
    id === "bronze" ? "#f97316" : id === "silver" ? "#94a3b8" : "#f59e0b";

  return (
    <div className="h-full flex gap-3 overflow-hidden">

      {/* ── Identity Column ── */}
      <motion.div
        className="w-[190px] shrink-0 flex flex-col gap-2 overflow-y-auto"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: phase >= 3 ? 1 : 0, x: phase >= 3 ? 0 : -16 }}
        transition={{ duration: 0.45 }}
      >
        <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest px-0.5 shrink-0">
          Identities · Groups · Roles
        </p>
        {CH11_AGENCIES.map(agency => (
          <div key={agency.agencyId} className="rounded-lg border border-slate-800/60 bg-slate-900/30 overflow-hidden shrink-0">
            <div className="px-2 py-1.5 flex items-center gap-1.5" style={{ borderBottom: `1px solid ${agency.stroke}25` }}>
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: agency.stroke }} />
              <span className="text-[12px] font-bold truncate" style={{ color: agency.textColor }}>{agency.label}</span>
            </div>
            <div className="divide-y divide-slate-800/40">
              {agency.groups.map(group => {
                const isSelected = selectedGroupId === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroupId(isSelected ? null : group.id)}
                    className={`w-full text-left px-2 py-1.5 transition-all ${isSelected ? "bg-slate-800/70" : "hover:bg-slate-800/30"}`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[12px] font-mono truncate" style={{ color: isSelected ? agency.textColor : "#4b5563" }}>
                        {group.label}
                      </span>
                      <span className={`text-[9px] border rounded px-1 py-0.5 shrink-0 ${group.badgeColor}`}>
                        {group.badge}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="mt-1 space-y-0.5">
                        {group.access.slice(0, 4).map((a, i) => (
                          <div key={i} className="text-[10px]">
                            <span className="text-emerald-400">{a.privilege.split(" ").slice(0,2).join(" ")}</span>
                            <span className="text-slate-500"> on </span>
                            <span style={{ color: agency.textColor }}>{a.catalog}</span>
                          </div>
                        ))}
                        {group.access.length > 4 && <div className="text-[10px] text-slate-600">+{group.access.length - 4} more</div>}
                        {group.abacSql && (
                          <div className="mt-0.5 flex items-center gap-1">
                            <Lock className="w-2 h-2 text-amber-400 shrink-0" />
                            <span className="text-[10px] text-amber-400">
                              {group.access[0]?.rowFilter ? "Row Filter" : "Column Mask"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Unity Catalog Column ── */}
      <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
        {/* Metastore banner */}
        <div className="rounded-lg border border-blue-800/40 bg-blue-950/20 px-3 py-1.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-3 h-3 text-blue-400 shrink-0" />
            <span className="text-[13px] font-bold text-blue-300">HHS Unity Catalog Metastore</span>
          </div>
          <span className="text-[12px] text-blue-600">one metastore · many workspaces · all governed</span>
        </div>

        {/* Workspace binding row */}
        <motion.div
          className="flex gap-2 shrink-0"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : -8 }}
          transition={{ duration: 0.4 }}
        >
          {CH11_WORKSPACES.map(ws => (
            <div key={ws.id} className="flex-1 rounded border border-slate-700/50 bg-slate-900/40 px-2 py-1.5 flex items-center gap-1.5">
              <Server className="w-2.5 h-2.5 shrink-0" style={{ color: ws.stroke }} />
              <div className="min-w-0">
                <div className="text-[10px] font-mono truncate" style={{ color: ws.textColor }}>{ws.label}</div>
                <div className="text-[9px] text-slate-600">
                  {CH11_CATALOGS.filter(c => c.workspaces.includes(ws.id)).length} catalogs bound
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Catalog grid */}
        <div className="grid grid-cols-5 gap-2 flex-1 min-h-0 overflow-hidden">
          {CH11_CATALOGS.map((cat, ci) => {
            const access = accessMap?.get(cat.id) ?? null;
            const isAccessible: boolean | null = accessMap ? accessMap.has(cat.id) : null;
            const isDimmed = isAccessible === false;
            const borderColor = isDimmed ? "#1e293b" : isAccessible ? cat.stroke : `${cat.stroke}50`;
            return (
              <motion.div
                key={cat.id}
                className="rounded-lg border flex flex-col overflow-hidden"
                style={{ borderColor, background: isDimmed ? "#0a0f1a" : cat.bgHex }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: phase < 2 ? 0 : isDimmed ? 0.18 : 1, y: phase >= 2 ? 0 : 16 }}
                transition={{ duration: 0.4, delay: ci * 0.08 }}
              >
                {/* Catalog header */}
                <div className="px-2 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${cat.stroke}25`, background: `${cat.stroke}12` }}>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[12px] font-bold font-mono truncate" style={{ color: isAccessible ? cat.textColor : "#374151" }}>
                      {cat.label}
                    </span>
                    {isAccessible && access && (
                      <span className="text-[9px] bg-emerald-900/50 text-emerald-300 border border-emerald-800 rounded px-1 shrink-0 whitespace-nowrap">
                        {access.privilege === "ALL PRIVILEGES" ? "ALL" : access.privilege === "USE CATALOG" ? "USE" : "SELECT"}
                      </span>
                    )}
                  </div>
                  {/* Workspace badges */}
                  <div className="flex flex-wrap gap-0.5">
                    {cat.workspaces.map(wsId => {
                      const ws = wsMap.get(wsId);
                      return ws ? (
                        <span key={wsId} className="text-[9px] px-0.5 rounded leading-tight" style={{ color: ws.stroke, border: `1px solid ${ws.stroke}40` }}>
                          {ws.label.replace("ws-prod-", "").replace("ws-", "")}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Schemas + tables */}
                <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5 min-h-0">
                  {cat.schemas.map(schema => {
                    const schemaReachable =
                      isAccessible === true &&
                      access !== null &&
                      (access.schemas.includes("*") || access.schemas.includes(schema.id));
                    const sc = schemaColor(schema.id);
                    return (
                      <div
                        key={schema.id}
                        className="rounded p-1"
                        style={{
                          background: schemaReachable ? "#1e293b80" : "#0f172a60",
                          borderLeft: `2px solid ${sc}${schemaReachable ? "cc" : "33"}`,
                        }}
                      >
                        <div className="flex items-center flex-wrap gap-0.5 mb-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: sc }}>{schema.id}</span>
                          {schema.hasPII && <span className="text-[8px] text-red-400 border border-red-900/60 rounded px-0.5">PHI</span>}
                          {schemaReachable && access?.colMask && access.colMask.length > 0 && (
                            <span className="text-[8px] text-amber-400 border border-amber-900/60 rounded px-0.5">col_mask</span>
                          )}
                          {schemaReachable && access?.rowFilter && (
                            <span className="text-[8px] text-orange-400 border border-orange-900/60 rounded px-0.5">row_filter</span>
                          )}
                        </div>
                        {schema.tables.map(t => (
                          <div key={t} className="text-[9px] font-mono truncate leading-tight"
                            style={{ color: schemaReachable ? "#cbd5e1" : "#1e293b" }}>
                            · {t}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ABAC detail panel */}
        <AnimatePresence>
          {selGroup?.abacSql && (
            <motion.div
              key="abac"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-lg border border-amber-800/40 bg-amber-950/20 p-2 shrink-0 overflow-hidden"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span className="text-[12px] font-bold text-amber-400 uppercase tracking-widest">
                  ABAC Policy — {selGroup.access[0]?.rowFilter ? "Row-Level Security Filter" : "Column Masking Function"}
                </span>
              </div>
              <pre className="text-[11px] font-mono text-amber-200/75 leading-relaxed whitespace-pre overflow-x-auto">
                {selGroup.abacSql}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cross-catalog query panel */}
        <AnimatePresence>
          {selGroup?.crossCatalogQuery && (
            <motion.div
              key="cross"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-lg border border-indigo-800/40 bg-indigo-950/20 p-2 shrink-0 overflow-hidden"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <GitMerge className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                <span className="text-[12px] font-bold text-indigo-400 uppercase tracking-widest">
                  Cross-Catalog Query — How it works
                </span>
                <span className="ml-auto text-[10px] text-indigo-600 border border-indigo-900/60 rounded px-1">analyst view</span>
              </div>
              <pre className="text-[10px] font-mono text-indigo-200/70 leading-relaxed whitespace-pre overflow-x-auto mb-2 bg-slate-900/60 rounded p-1.5">
                {selGroup.crossCatalogQuery.sql}
              </pre>
              <div className="space-y-0.5">
                {selGroup.crossCatalogQuery.explanation.map((line, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckCircle className="w-2 h-2 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="text-[10px] text-indigo-200/60 leading-relaxed">{line}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Central IT platform powers panel */}
        <AnimatePresence>
          {selGroup?.platformPowers && (
            <motion.div
              key="platform"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-lg border border-pink-800/40 bg-pink-950/20 p-2 shrink-0 overflow-hidden"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Server className="w-2.5 h-2.5 text-pink-400 shrink-0" />
                <span className="text-[12px] font-bold text-pink-400 uppercase tracking-widest">
                  Central IT — Platform Administration Powers
                </span>
                <span className="ml-auto text-[10px] text-pink-600 border border-pink-900/60 rounded px-1">beyond catalog access</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {selGroup.platformPowers.map((power, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckCircle className="w-2 h-2 text-pink-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-pink-200/70 leading-relaxed">{power}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {phase >= 5 && !selectedGroupId && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center text-[12px] text-slate-600 shrink-0 pb-0.5"
          >
            ← click a group to see access mapping, ABAC rules, and storage paths
          </motion.p>
        )}
      </div>

      {/* ── Storage Column ── */}
      <motion.div
        className="w-[185px] shrink-0 flex flex-col gap-2 overflow-y-auto"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: phase >= 4 ? 1 : 0, x: phase >= 4 ? 0 : 16 }}
        transition={{ duration: 0.45 }}
      >
        <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest px-0.5 shrink-0">
          Cloud Storage Mapping
        </p>

        {/* Credential vending chain */}
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-2 shrink-0">
          <p className="text-[12px] font-bold text-slate-400 mb-2">UC Credential Vending</p>
          {[
            { n: "1", label: "UC Permission Check",        color: "#6366f1" },
            { n: "2", label: "Storage Credential lookup",  color: "#3b82f6" },
            { n: "3", label: "External Location resolved", color: "#0ea5e9" },
            { n: "4", label: "Temp token → ADLS / S3",    color: "#10b981" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white"
                style={{ background: s.color, fontSize: "7px", fontWeight: 700 }}>{s.n}</div>
              <span className="text-[11px] text-slate-400 leading-tight">{s.label}</span>
            </div>
          ))}
          <div className="mt-1.5 flex items-start gap-1.5 border-t border-slate-800/60 pt-1.5">
            <Lock className="w-2.5 h-2.5 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-slate-500 leading-relaxed">
              No storage keys exposed. Users never touch ADLS/S3 directly — UC vends short-lived tokens via the managed identity.
            </p>
          </div>
        </div>

        {/* External locations */}
        <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest px-0.5 shrink-0">External Locations</p>
        {CH11_CATALOGS.map(cat => {
          const isHighlighted = accessMap ? accessMap.has(cat.id) : null;
          const isDimmed = isHighlighted === false;
          return (
            <div
              key={cat.id}
              className="rounded-lg border p-2 transition-all duration-300 shrink-0"
              style={{
                borderColor: isDimmed ? "#1e293b" : isHighlighted ? cat.stroke : `${cat.stroke}35`,
                background: isDimmed ? "transparent" : isHighlighted ? `${cat.bgHex}` : "transparent",
                opacity: isDimmed ? 0.2 : 1,
              }}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[12px] font-bold" style={{ color: isHighlighted ? cat.textColor : "#374151" }}>
                  {cat.label}
                </span>
                <span className="text-[10px] text-slate-600">{cat.storageSize}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-600 break-all leading-relaxed">
                {cat.storagePath}
              </div>
              {isHighlighted && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 flex items-center gap-1">
                  <CheckCircle className="w-2 h-2 text-emerald-500 shrink-0" />
                  <span className="text-[10px] text-emerald-400">credential-vended access</span>
                </motion.div>
              )}
            </div>
          );
        })}
      </motion.div>

    </div>
  );
}

// ─── Chapter 12 ───────────────────────────────────────────────────────────────

interface ShareNode {
  id: string; num: string; label: string; sublabel: string;
  category: "internal" | "external" | "nondb";
  condition: string;
  hhsUseCase: string; hhsPartner: string;
  howItWorks: string[]; techDetails: string[];
  border: string; bg: string; text: string; badge: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const SHARE_NODES: ShareNode[] = [
  {
    id: "1a", num: "1a", label: "UC Grants & Workspace Binding", sublabel: "Same metastore · no data movement",
    category: "internal", condition: "No cross-metastore needed",
    hhsUseCase: "DOH analysts query Medicaid gold tables in ws-prod-doh without any data copy — ABAC row/column filters enforced automatically.",
    hhsPartner: "HHS internal workspaces (ws-hhs-dev, ws-prod-doh, ws-prod-shared)",
    howItWorks: [
      "GRANT SELECT ON TABLE medicaid.gold.* TO doh_analysts — one SQL statement",
      "Workspace binding links ws-prod-doh to the medicaid catalog in the metastore",
      "Users query directly from their workspace — zero data movement, zero ETL",
      "Unity Catalog applies ABAC row/column filters transparently at query time",
    ],
    techDetails: ["Unity Catalog GRANT", "Workspace catalog binding", "ABAC policies (row filter + col mask)"],
    border: "border-blue-600/60", bg: "bg-blue-950/30", text: "text-blue-300", badge: "bg-blue-900/60 text-blue-300 border-blue-700",
    Icon: Lock,
  },
  {
    id: "1c", num: "1c", label: "Cross-Metastore D2D Delta Sharing", sublabel: "Separate metastores · live data · no copy",
    category: "internal", condition: "Data spans metastores or regions",
    hhsUseCase: "HHS shares aggregate population health data with a neighboring state agency running their own Databricks metastore.",
    hhsPartner: "Neighboring state HHS (separate Databricks account, separate metastore)",
    howItWorks: [
      "HHS creates a Delta Share with selected catalog tables and row-level filters",
      "Recipient mounts the share as a read-only shared catalog in their workspace",
      "Data stays in HHS storage — recipient only gets signed, time-limited URLs per query",
      "HHS can revoke the share centrally at any time; changes take effect immediately",
    ],
    techDetails: ["Delta Sharing protocol (open)", "Shared catalog mount on recipient side", "Provider-controlled access and revocation"],
    border: "border-blue-500/50", bg: "bg-blue-950/20", text: "text-blue-300", badge: "bg-blue-900/60 text-blue-300 border-blue-700",
    Icon: GitMerge,
  },
  {
    id: "2a", num: "2a", label: "Direct D2D Delta Sharing", sublabel: "Databricks → Databricks · targeted",
    category: "external", condition: "Direct / Targeted sharing",
    hhsUseCase: "HHS shares Medicaid encounter data with CMS (Centers for Medicare & Medicaid Services) who also run Databricks.",
    hhsPartner: "CMS federal Databricks environment",
    howItWorks: [
      "HHS creates a Delta Share scoped to specific tables with row filters (de-identified only)",
      "CMS receives an invitation link; mounts the share as a live catalog in their workspace",
      "CMS analysts query the mounted catalog — data never leaves HHS's ADLS storage",
      "Access expires automatically; HHS can revoke without any coordination with CMS IT",
    ],
    techDetails: ["Delta Sharing invitation flow", "Recipient mounts as shared catalog", "Zero data replication"],
    border: "border-purple-600/60", bg: "bg-purple-950/30", text: "text-purple-300", badge: "bg-purple-900/60 text-purple-300 border-purple-700",
    Icon: Share2,
  },
  {
    id: "2b", num: "2b", label: "Private Exchange", sublabel: "Controlled partner ecosystem · named recipients",
    category: "external", condition: "Private partner ecosystem",
    hhsUseCase: "HHS shares Medicaid enrollment data with three contracted Managed Care Organizations — each MCO sees only its own enrollees.",
    hhsPartner: "Medicaid MCO partners (Aetna, Centene, Molina Health)",
    howItWorks: [
      "HHS publishes a private Marketplace listing — not discoverable by the public",
      "Each MCO is added as a named recipient and receives scoped access (their enrollees only via row filter)",
      "MCOs mount the share in their Databricks workspace; row filters enforce data separation",
      "Contract ends → HHS removes the recipient in one click, access revoked immediately",
    ],
    techDetails: ["Databricks Marketplace private listing", "Named recipient access", "Per-recipient row filter scoping"],
    border: "border-violet-600/60", bg: "bg-violet-950/30", text: "text-violet-300", badge: "bg-violet-900/60 text-violet-300 border-violet-700",
    Icon: Mail,
  },
  {
    id: "2c", num: "2c", label: "Public Marketplace", sublabel: "Discoverable · monetizable · no PII",
    category: "external", condition: "Public / Monetization",
    hhsUseCase: "HHS publishes de-identified, county-level population health metrics for academic researchers and policy makers.",
    hhsPartner: "Academic institutions, public health researchers, policy organizations",
    howItWorks: [
      "HHS curates aggregate Gold tables — county-level stats, no individual records, no PII",
      "Published to Databricks Marketplace as a public listing discoverable by anyone",
      "Subscribers mount the data product into their own workspace at no cost (or for a fee)",
      "HHS manages the data product lifecycle; updates propagate automatically to all subscribers",
    ],
    techDetails: ["Databricks Marketplace public listing", "Subscriber self-service", "Aggregate & de-identified only"],
    border: "border-teal-600/60", bg: "bg-teal-950/30", text: "text-teal-300", badge: "bg-teal-900/60 text-teal-300 border-teal-700",
    Icon: Globe,
  },
  {
    id: "2d", num: "2d", label: "Clean Rooms", sublabel: "Privacy-preserving joint analysis · no raw data shared",
    category: "external", condition: "Privacy-preserving collaboration",
    hhsUseCase: "HHS + CDC jointly analyze opioid crisis patterns without either party exposing raw patient records to the other.",
    hhsPartner: "CDC, NIH, academic research partners",
    howItWorks: [
      "HHS and CDC each bring their encrypted datasets to a neutral Databricks Clean Room",
      "Analysts write SQL queries; only aggregate results exit the Clean Room — no row-level joins visible",
      "Differential privacy guarantees that no individual can be re-identified from the outputs",
      "Full audit log records every computation for IRB and compliance review",
    ],
    techDetails: ["Databricks Clean Rooms", "Differential privacy engine", "Aggregate-only output with audit log"],
    border: "border-cyan-600/60", bg: "bg-cyan-950/30", text: "text-cyan-300", badge: "bg-cyan-900/60 text-cyan-300 border-cyan-700",
    Icon: Shield,
  },
  {
    id: "3a", num: "3a", label: "Delta Sharing Open Protocol", sublabel: "Python · Spark · any app · no Databricks license",
    category: "nondb", condition: "Direct Open Protocol (Python, Spark, Apps)",
    hhsUseCase: "Federal HHS portal (Python ETL) pulls nightly Medicaid snapshots into a CMS data warehouse — no Databricks license needed on the federal side.",
    hhsPartner: "Federal HHS / ONC systems, CMS data warehouse teams",
    howItWorks: [
      "HHS generates a profile.json credential file for the federal partner (bearer token + endpoint)",
      "Federal system installs the open-source delta-sharing Python client (pip install delta-sharing)",
      "Client fetches data as Parquet files — works with Pandas, Spark, R, or any Parquet reader",
      "HHS controls share lifetime and table visibility centrally; federal system needs no Databricks account",
    ],
    techDetails: ["delta-sharing open-source client", "profile.json bearer token", "Parquet file delivery"],
    border: "border-slate-600/60", bg: "bg-slate-800/30", text: "text-slate-300", badge: "bg-slate-700/60 text-slate-300 border-slate-600",
    Icon: FileCode,
  },
  {
    id: "3b", num: "3b", label: "JDBC/ODBC & Native Connectors", sublabel: "Power BI · Tableau · Excel · live SQL",
    category: "nondb", condition: "BI Tools & Dashboards",
    hhsUseCase: "State legislature's Power BI dashboards connect live to HHS Gold tables via JDBC — row-level security enforced per user token.",
    hhsPartner: "State comptroller office, legislature BI teams, Medicaid reporting staff",
    howItWorks: [
      "Databricks SQL Warehouse exposes a JDBC/ODBC endpoint with standard connection strings",
      "Power BI or Tableau connects using the Databricks native connector (available in both tools)",
      "SQL query runs on Databricks — only results are returned to the BI tool, no data export",
      "Unity Catalog row-level security applies per user's Entra ID token — no separate permission layer needed",
    ],
    techDetails: ["Databricks SQL Warehouse JDBC/ODBC", "Power BI / Tableau native connectors", "UC row-level security per user"],
    border: "border-slate-600/60", bg: "bg-slate-800/30", text: "text-slate-300", badge: "bg-slate-700/60 text-slate-300 border-slate-600",
    Icon: Monitor,
  },
  {
    id: "3c", num: "3c", label: "SQL Execution API / CLI", sublabel: "REST API · programmatic · real-time queries",
    category: "nondb", condition: "Programmatic SQL (APIs/CLI)",
    hhsUseCase: "USDA FNS eligibility verification portal queries HHS SNAP enrollment data in real-time via REST API — no Databricks client needed.",
    hhsPartner: "USDA FNS (Food & Nutrition Service) eligibility portal, federal integration layers",
    howItWorks: [
      "Partner calls the Databricks SQL Execution REST API with a SQL statement and warehouse ID",
      "Statement executes against HHS SQL Warehouse; Unity Catalog applies ABAC filters for the service principal",
      "Results returned as JSON via polling (or streaming for large results)",
      "Service principal auth — no human credentials in the API call; auditable in system.access.audit_log",
    ],
    techDetails: ["Databricks SQL Execution REST API", "Service principal OAuth token", "JSON response + audit log"],
    border: "border-slate-600/60", bg: "bg-slate-800/30", text: "text-slate-300", badge: "bg-slate-700/60 text-slate-300 border-slate-600",
    Icon: Zap,
  },
];

function Chapter12() {
  const [selId, setSelId] = useState<string | null>(null);
  const sel = selId ? SHARE_NODES.find(n => n.id === selId) ?? null : null;

  // Invisible hotspot regions as % of image (1509 × 840)
  // { id, cx: center-x%, cy: center-y%, w%, h% }
  const HOTSPOTS: {id:string; cx:number; cy:number; w:number; h:number}[] = [
    { id:"1a",  cx:11,  cy:80, w:17, h:22 },  // UC Grants & Workspace Binding
    { id:"1c",  cx:28,  cy:85, w:16, h:15 },  // Cross-Metastore D2D Delta Sharing
    { id:"2a",  cx:44,  cy:64, w:13, h:18 },  // Direct D2D Delta Sharing
    { id:"2b",  cx:43,  cy:87, w:10, h:12 },  // Private Exchange
    { id:"2c",  cx:53,  cy:80, w:12, h:20 },  // Public Marketplace
    { id:"2d",  cx:62,  cy:84, w:11, h:16 },  // Clean Rooms
    { id:"3a",  cx:72,  cy:65, w:13, h:28 },  // Delta Sharing Open Protocol
    { id:"3b",  cx:86,  cy:62, w:17, h:27 },  // JDBC/ODBC & Native Connectors
    { id:"3c",  cx:87,  cy:85, w:15, h:16 },  // SQL Execution API / CLI
  ];

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">

      {/* Image with hotspots */}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div
          className="relative rounded-xl overflow-hidden shadow-2xl"
          style={{ aspectRatio:"1509/840", maxWidth:"100%", maxHeight:"100%", height:"100%", width:"auto" }}
        >
          <img
            src="/sharing-decision-tree.png"
            alt="Decision Tree: Sharing Databricks Data Products"
            className="w-full h-full"
            draggable={false}
          />

          {/* Invisible hotspot buttons */}
          {HOTSPOTS.map(hs => {
            const node = SHARE_NODES.find(n => n.id === hs.id);
            if (!node) return null;
            const isSel = selId === hs.id;
            return (
              <button
                key={hs.id}
                onClick={() => setSelId(isSel ? null : hs.id)}
                title={`${node.num}: ${node.label}`}
                className="absolute cursor-pointer focus:outline-none bg-transparent border-0"
                style={{
                  left:   `${hs.cx - hs.w/2}%`,
                  top:    `${hs.cy - hs.h/2}%`,
                  width:  `${hs.w}%`,
                  height: `${hs.h}%`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Hint when nothing selected */}
      {!sel && (
        <p className="shrink-0 text-center text-[11px] text-slate-600">
          Click any sharing method on the diagram to see the HHS use case &amp; implementation details
        </p>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {sel && (
          <motion.div
            key={sel.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className={`shrink-0 rounded-xl border p-3 overflow-hidden ${sel.border} ${sel.bg}`}
          >
            <div className="flex items-start gap-3">
              {/* Left: HHS use case */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg border shrink-0 ${sel.badge}`}>
                    <sel.Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-1 py-0.5 rounded border ${sel.badge}`}>{sel.num}</span>
                  <span className={`text-sm font-black ${sel.text}`}>{sel.label}</span>
                  <button
                    onClick={() => setSelId(null)}
                    className="ml-auto text-slate-600 hover:text-slate-400 text-xs px-1.5 py-0.5 rounded border border-slate-700/50 hover:border-slate-600 transition-colors"
                  >✕</button>
                </div>
                <p className="text-[13px] text-slate-200 mb-2 leading-relaxed">{sel.hhsUseCase}</p>
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                  <span className="text-[12px] text-slate-500">{sel.hhsPartner}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {sel.techDetails.map((t, i) => (
                    <span key={i} className={`text-[11px] border rounded px-1.5 py-0.5 ${sel.badge}`}>{t}</span>
                  ))}
                </div>
              </div>
              {/* Right: How it works */}
              <div className="w-72 shrink-0 border-l border-slate-700/40 pl-3 space-y-1.5">
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">How it works</p>
                {sel.howItWorks.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${sel.badge}`}>{i + 1}</span>
                    <p className="text-[12px] text-slate-300 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}


// ─── Chapter 13 ───────────────────────────────────────────────────────────────

interface BpItem {
  id: string;
  label: string;
  sublabel: string;
  layer: "infra" | "governance" | "workspace" | "operating";
  chapters: number[];
  chapterTitles: string[];
  desc: string;
  bullets: string[];
  Icon: React.ComponentType<{ className?: string }>;
  border: string; bg: string; text: string; badge: string;
}

const BP_ITEMS: BpItem[] = [
  // ── Infrastructure Foundation ──
  {
    id: "network", label: "Hub-and-Spoke Network", sublabel: "VPC / Private Link",
    layer: "infra", chapters: [3], chapterTitles: ["Network Architecture"],
    desc: "A central hub VPC connects to every agency spoke via Private Link. No public internet traversal — all data flows inside the cloud backbone.",
    bullets: [
      "Central hub VPC hosts shared services (DNS, NTP, logging)",
      "Agency spokes connect via AWS PrivateLink / Azure Private Endpoint",
      "Databricks data plane lands in hub — workspaces see it via spoke peering",
      "Compliance-ready: HIPAA, FedRAMP boundary defined at VPC level",
    ],
    Icon: Server, border: "border-cyan-800/50", bg: "bg-cyan-950/20", text: "text-cyan-300", badge: "bg-cyan-900/40 text-cyan-300 border-cyan-700/50",
  },
  {
    id: "storage", label: "Cloud Storage", sublabel: "S3 / ADLS / GCS",
    layer: "infra", chapters: [3, 4], chapterTitles: ["Network Architecture", "Storage Tiers"],
    desc: "Delta Lake tables live in agency-owned cloud storage buckets. Unity Catalog credential vending grants time-limited, scoped access — no standing permissions.",
    bullets: [
      "Each agency owns its storage account/bucket — data never co-mingled",
      "UC issues short-lived credentials via STS / Azure managed identity",
      "Medallion folders: raw/, bronze/, silver/, gold/ per catalog",
      "Storage access logs feed audit trail automatically",
    ],
    Icon: HardDrive, border: "border-cyan-800/50", bg: "bg-cyan-950/20", text: "text-cyan-300", badge: "bg-cyan-900/40 text-cyan-300 border-cyan-700/50",
  },
  {
    id: "identity", label: "Identity & Access", sublabel: "IdP / SCIM / OIDC",
    layer: "infra", chapters: [2, 11], chapterTitles: ["Identity Foundation", "IAM Groups & Catalogs"],
    desc: "State IdP (AD / Okta) is the single source of truth. SCIM syncs groups to Databricks in real time — join a group, get the access; leave, lose it instantly.",
    bullets: [
      "SAML 2.0 / OIDC SSO — no Databricks-local passwords",
      "SCIM provisioning syncs groups within minutes of IdP change",
      "Groups map directly to UC privileges — no manual re-grant",
      "MFA enforced at IdP; Databricks inherits the policy",
    ],
    Icon: Users, border: "border-cyan-800/50", bg: "bg-cyan-950/20", text: "text-cyan-300", badge: "bg-cyan-900/40 text-cyan-300 border-cyan-700/50",
  },
  // ── Unity Catalog & Governance Core ──
  {
    id: "uc_engine", label: "Governance Engine", sublabel: "Unity Catalog Metastore",
    layer: "governance", chapters: [5, 6], chapterTitles: ["Unity Catalog Basics", "Catalog Structure"],
    desc: "The Unity Catalog metastore is the central brain — one governance model across all workspaces, all clouds. Every table, view, and function registered here.",
    bullets: [
      "One metastore per region governs all workspaces",
      "Three-level namespace: catalog → schema → table/view/function",
      "Workspace bindings control which workspaces can read which catalogs",
      "Built-in audit log: every query, every grant, every access attempt",
    ],
    Icon: Database, border: "border-violet-800/50", bg: "bg-violet-950/25", text: "text-violet-300", badge: "bg-violet-900/40 text-violet-300 border-violet-700/50",
  },
  {
    id: "abac", label: "Fine-Grained Security", sublabel: "ABAC — Row Filters & Column Masks",
    layer: "governance", chapters: [8, 9], chapterTitles: ["Row Filters", "Column Masks"],
    desc: "SQL-defined row filters and column masks fire at query time, silently. Analysts write normal SQL — UC rewrites the plan to enforce policy before any data leaves.",
    bullets: [
      "Row filters: WHERE-clause injected at execution; analysts never see it",
      "Column masks: PII replaced with masked value based on caller's group",
      "Policy functions versioned in Git — auditable, testable, rollback-able",
      "ABAC scales: one policy on a table protects all downstream consumers",
    ],
    Icon: Lock, border: "border-violet-800/50", bg: "bg-violet-950/25", text: "text-violet-300", badge: "bg-violet-900/40 text-violet-300 border-violet-700/50",
  },
  {
    id: "lineage", label: "Data Lineage", sublabel: "Column-Level Provenance",
    layer: "governance", chapters: [10], chapterTitles: ["Lineage & Audit"],
    desc: "Automatic lineage tracking shows which upstream columns feed every downstream table — no manual documentation required. Auditors can trace any field to its source.",
    bullets: [
      "Column-level lineage captured automatically for all Delta and SQL workloads",
      "Visual lineage graph in Catalog Explorer — follow data upstream or downstream",
      "System tables expose lineage via SQL for programmatic audit",
      "Lineage + access logs = complete data audit trail for HIPAA / state audits",
    ],
    Icon: History, border: "border-violet-800/50", bg: "bg-violet-950/25", text: "text-violet-300", badge: "bg-violet-900/40 text-violet-300 border-violet-700/50",
  },
  {
    id: "tags", label: "Data Classification", sublabel: "UC Tags & Policies",
    layer: "governance", chapters: [7], chapterTitles: ["Tags & Classification"],
    desc: "Tag tables and columns with sensitivity labels (PII, PHI, Confidential). Tags propagate downstream and can trigger automated masking policies.",
    bullets: [
      "Tags applied at catalog, schema, table, or column level",
      "System-managed tags from automated classifiers (PII detection)",
      "Tag-based policy: 'if PHI tag → apply SSN mask automatically'",
      "Tag inventory queryable via system.information_schema",
    ],
    Icon: FileText, border: "border-violet-800/50", bg: "bg-violet-950/25", text: "text-violet-300", badge: "bg-violet-900/40 text-violet-300 border-violet-700/50",
  },
  // ── Data Management & Workspace Strategy ──
  {
    id: "medallion", label: "Medallion Architecture", sublabel: "Bronze → Silver → Gold",
    layer: "workspace", chapters: [4], chapterTitles: ["Data Tiers"],
    desc: "Three quality tiers in every agency catalog. Raw ingestion lands in Bronze. Cleansed, validated records in Silver. Business-ready, aggregated views in Gold.",
    bullets: [
      "Bronze: exact copy of source — immutable, append-only raw archive",
      "Silver: cleansed, deduped, typed — the 'single version of truth' layer",
      "Gold: aggregated, enriched, report-ready — analysts and dashboards land here",
      "Delta Lake time-travel: audit any historical state of any tier",
    ],
    Icon: Layers, border: "border-amber-800/50", bg: "bg-amber-950/20", text: "text-amber-300", badge: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  },
  {
    id: "envs", label: "Environment Separation", sublabel: "Dev / Staging / Prod",
    layer: "workspace", chapters: [6], chapterTitles: ["Workspace Strategy"],
    desc: "Each agency runs three workspaces mapped to Dev, Staging, and Production. Unity Catalog workspace bindings enforce which workspace reads which catalog tier.",
    bullets: [
      "Dev workspace: full write access to dev catalog — sandbox for analysts",
      "Staging workspace: read prod-bronze, write staging-silver/gold for testing",
      "Prod workspace: read-only to prod gold — no ad-hoc writes allowed",
      "Promotion via CI/CD pipeline — code review gates between environments",
    ],
    Icon: Cpu, border: "border-amber-800/50", bg: "bg-amber-950/20", text: "text-amber-300", badge: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  },
  {
    id: "sharing", label: "Delta Sharing", sublabel: "D2D · Exchange · Open Protocol",
    layer: "workspace", chapters: [12], chapterTitles: ["Data Sharing Decision Tree"],
    desc: "Nine sharing patterns from intra-workspace UC grants to cross-cloud open Delta Sharing. Decision tree guides teams to the right method for every use case.",
    bullets: [
      "Method 1: Unity Catalog grants for same-workspace consumers",
      "Method 2: Delta Sharing for external Databricks workspaces (D2D, Exchange)",
      "Method 3: Open Delta Sharing protocol for non-Databricks consumers",
      "Clean Rooms: privacy-safe analytics between agencies — raw data never shared",
    ],
    Icon: Share2, border: "border-amber-800/50", bg: "bg-amber-950/20", text: "text-amber-300", badge: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  },
  // ── Operating Model ──
  {
    id: "compute_gov", label: "Compute Governance", sublabel: "Cluster Policies & Cost Controls",
    layer: "operating", chapters: [3], chapterTitles: ["Infrastructure Overview"],
    desc: "Central IT defines cluster policies — allowed instance types, auto-termination, max DBUs. Agencies choose within the policy; Central IT controls spend and security.",
    bullets: [
      "Cluster policies enforced via Databricks policy JSON — no overrides",
      "Auto-termination: clusters idle >30 min shut down automatically",
      "Cost attribution tags on every cluster → charge-back per agency",
      "Unity Catalog compute policies: which cluster can access which catalog",
    ],
    Icon: Cpu, border: "border-emerald-800/50", bg: "bg-emerald-950/20", text: "text-emerald-300", badge: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  },
  {
    id: "op_model", label: "Governance as Operating Model", sublabel: "Security Checklist & RACI",
    layer: "operating", chapters: [1, 2], chapterTitles: ["Architecture Overview", "Identity Foundation"],
    desc: "Governance is not an afterthought — it is woven into every team's SDLC. A security checklist gates each promotion. RACI defines who owns each control.",
    bullets: [
      "Security checklist: 12 controls checked before any prod promotion",
      "RACI matrix: Central IT owns network + UC; agencies own data + pipelines",
      "Quarterly access reviews: stale grants auto-flagged for removal",
      "Incident playbook: data breach → who does what in the first 24 hours",
    ],
    Icon: Shield, border: "border-emerald-800/50", bg: "bg-emerald-950/20", text: "text-emerald-300", badge: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  },
];

const SECURITY_CHECKLIST = [
  { id: "sc1", label: "SSO + MFA enforced", done: true },
  { id: "sc2", label: "SCIM group sync active", done: true },
  { id: "sc3", label: "No public storage buckets", done: true },
  { id: "sc4", label: "UC credential vending only", done: true },
  { id: "sc5", label: "Row filters on all PHI tables", done: true },
  { id: "sc6", label: "Column masks on PII columns", done: true },
  { id: "sc7", label: "Lineage enabled (system tables)", done: true },
  { id: "sc8", label: "Audit log retention ≥ 7 years", done: true },
  { id: "sc9", label: "Private Link / no public endpoints", done: true },
  { id: "sc10", label: "Cluster auto-termination ≤ 60 min", done: true },
  { id: "sc11", label: "Dev / Staging / Prod workspace separation", done: true },
  { id: "sc12", label: "Quarterly access review scheduled", done: true },
];

const BP_HOTSPOTS = [
  // ── Infrastructure Foundation ──
  { id: "network",     left: 2,  top: 77, w: 27, h: 19, layer: "infra" as const },
  { id: "storage",     left: 33, top: 77, w: 27, h: 19, layer: "infra" as const },
  { id: "identity",    left: 65, top: 77, w: 31, h: 19, layer: "infra" as const },
  // ── Unity Catalog & Governance Core ──
  { id: "abac",        left: 2,  top: 54, w: 27, h: 22, layer: "governance" as const },
  { id: "uc_engine",   left: 30, top: 52, w: 32, h: 26, layer: "governance" as const },
  { id: "tags",        left: 62, top: 54, w: 20, h: 22, layer: "governance" as const },
  { id: "lineage",     left: 83, top: 54, w: 15, h: 22, layer: "governance" as const },
  // ── Data Management & Workspace Strategy ──
  { id: "envs",        left: 2,  top: 30, w: 29, h: 22, layer: "workspace" as const },
  { id: "medallion",   left: 33, top: 30, w: 27, h: 22, layer: "workspace" as const },
  { id: "sharing",     left: 62, top: 30, w: 34, h: 22, layer: "workspace" as const },
  // ── Operating Model ──
  { id: "compute_gov", left: 2,  top: 8,  w: 29, h: 20, layer: "operating" as const },
  { id: "op_model",    left: 33, top: 8,  w: 36, h: 20, layer: "operating" as const },
  { id: "_checklist",  left: 71, top: 8,  w: 27, h: 20, layer: "operating" as const },
] as const;

function Chapter13() {
  const [selItem, setSelItem] = useState<BpItem | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);

  const itemById = Object.fromEntries(BP_ITEMS.map((b) => [b.id, b]));

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 pt-2 pb-2 border-b border-slate-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-100">Blueprint Summary</h2>
          <p className="text-[11px] text-slate-400">Click any highlighted zone to explore its chapter context</p>
        </div>
        <button
          onClick={() => { setShowChecklist((v) => !v); setSelItem(null); }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11px] font-medium transition-all ${showChecklist ? "border-emerald-500/60 bg-emerald-950/40 text-emerald-300" : "border-slate-700 bg-slate-800/40 text-slate-400 hover:text-slate-200"}`}
        >
          <CheckCircle className="w-3 h-3" />
          Security Checklist
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Blueprint image with hotspot overlays */}
        <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
          <div className="relative" style={{ aspectRatio: "1456/816", maxWidth: "100%", maxHeight: "100%", width: "100%" }}>
            <img
              src="/blueprint.png"
              className="absolute inset-0 w-full h-full select-none rounded-sm"
              style={{ objectFit: "fill" }}
              draggable={false}
            />
            {/* Hotspot overlays */}
            {BP_HOTSPOTS.map((hs) => {
              const item = hs.id !== "_checklist" ? itemById[hs.id] : null;
              return (
                <button
                  key={hs.id}
                  title={item?.label ?? "Security Checklist"}
                  onClick={() => {
                    if (hs.id === "_checklist") {
                      setShowChecklist((v) => !v);
                      setSelItem(null);
                    } else {
                      setSelItem(selItem?.id === hs.id ? null : item!);
                      setShowChecklist(false);
                    }
                  }}
                  className="absolute cursor-pointer group"
                  style={{ left: `${hs.left}%`, top: `${hs.top}%`, width: `${hs.w}%`, height: `${hs.h}%` }}
                >
                </button>
              );
            })}
          </div>
        </div>

        {/* Right detail panel */}
        <div className="w-[260px] shrink-0 border-l border-slate-800/60 overflow-y-auto">
          <AnimatePresence mode="wait">
            {showChecklist ? (
              <motion.div key="checklist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }} className="p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Security Checklist</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-3">12 controls that must be in place before any agency workspace goes to production.</p>
                <div className="space-y-1.5">
                  {SECURITY_CHECKLIST.map((sc) => (
                    <div key={sc.id} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="text-[11px] text-slate-300">{sc.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-md border border-emerald-800/40 bg-emerald-950/20 p-2">
                  <div className="text-[10px] text-emerald-400 font-bold mb-1">12 / 12 Controls</div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full rounded-full bg-emerald-500 w-full" /></div>
                  <div className="text-[10px] text-slate-500 mt-1.5">All controls satisfied — production-ready</div>
                </div>
              </motion.div>
            ) : selItem ? (
              <motion.div key={selItem.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <selItem.Icon className={`w-4 h-4 ${selItem.text}`} />
                  <div>
                    <div className={`text-[12px] font-bold ${selItem.text}`}>{selItem.label}</div>
                    <div className="text-[10px] text-slate-500">{selItem.sublabel}</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">{selItem.desc}</p>
                <div className="space-y-1.5 mb-3">
                  {selItem.bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <ArrowRight className={`w-2.5 h-2.5 mt-0.5 shrink-0 ${selItem.text}`} />
                      <span className="text-[10px] text-slate-400 leading-relaxed">{b}</span>
                    </div>
                  ))}
                </div>
                <div className={`rounded border ${selItem.border} ${selItem.bg} p-2`}>
                  <div className={`text-[10px] font-bold ${selItem.text} mb-1.5 uppercase tracking-wider`}>Covered in</div>
                  <div className="space-y-1">
                    {selItem.chapters.map((ch, i) => (
                      <div key={ch} className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${selItem.badge} font-mono`}>Ch.{ch}</span>
                        <span className="text-[10px] text-slate-400">{selItem.chapterTitles[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center p-6 text-center">
                <Search className="w-6 h-6 text-slate-700 mb-2" />
                <p className="text-[11px] text-slate-600">Click any highlighted zone on the blueprint to explore that component</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Addendum: UC Architecture Across Agencies ────────────────────────────────

type UCPattern = "overview" | "push" | "pull";


function Chapter14() {
  const [pattern, setPattern] = useState<UCPattern>("overview");
  const [step, setStep] = useState(0);

  // Cycle animation steps 0-5 every 1.4s
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 6), 1400);
    return () => clearInterval(id);
  }, [pattern]);

  // Reset step when pattern changes
  useEffect(() => setStep(0), [pattern]);


  const CENTRAL_AGENCY = [
    { id: "cms", label: "CMS", color: "#3b82f6" },
    { id: "cdc", label: "CDC", color: "#10b981" },
    { id: "fda", label: "FDA", color: "#f59e0b" },
    { id: "acf", label: "ACF", color: "#8b5cf6" },
  ];

  return (
    <div className="h-full flex flex-col gap-3 overflow-y-auto">
      {/* Header */}
      <div className="shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Addendum A</span>
        <h2 className="text-xl font-bold text-slate-100 mt-0.5">Unity Catalog — Multi-Agency Architecture</h2>
        <p className="text-slate-400 text-sm mt-1">
          How HHS component agencies share data through Unity Catalog. Two publishing models with different governance tradeoffs.
        </p>
      </div>

      {/* Pattern tabs */}
      <div className="shrink-0 flex gap-2">
        {([["overview","Overview"],["push","PUSH — Agency ETL"],["pull","PULL — Central ETL"]] as [UCPattern,string][]).map(([p, label]) => (
          <button key={p} onClick={() => setPattern(p)}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
              pattern === p ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
            }`}
          >{label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── OVERVIEW ───────────────────────────────────────── */}
        {pattern === "overview" && (
          <motion.div key="overview" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.3}}
            className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0"
          >

            {/* ── Distributed panel — peer mesh ── */}
            {(() => {
              const PEERS = [
                {id:"hhs", label:"HHS", color:"#22c55e", cx:100, cy:22},
                {id:"cms", label:"CMS", color:"#3b82f6", cx:20,  cy:85},
                {id:"cdc", label:"CDC", color:"#10b981", cx:180, cy:85},
                {id:"fda", label:"FDA", color:"#f59e0b", cx:48,  cy:158},
                {id:"acf", label:"ACF", color:"#8b5cf6", cx:152, cy:158},
              ];
              const MESH_EDGES: [number,number][] = [[0,1],[0,2],[1,2],[1,3],[2,4],[3,4],[0,3],[0,4]];
              // each step animates a different consume pair
              const STEP_PAIRS: [number,number][] = [[-1,-1],[0,1],[1,2],[2,4],[3,4],[0,4]];
              const sp = STEP_PAIRS[step] ?? [-1,-1];
              const [sa, sb] = sp;
              const pairActive = sa >= 0 && sb >= 0;
              const allActive  = step === 5;
              return (
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Pattern A — Distributed</span>
                    <h3 className="text-sm font-bold text-slate-100 mt-0.5">Each agency owns &amp; publishes its own catalog — peers consume directly</h3>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center" style={{minHeight:210}}>
                    <div className="relative" style={{width:200, height:185}}>
                      <svg className="absolute inset-0" width="200" height="185" viewBox="0 0 200 185">
                        <defs>
                          <marker id="arr-consume" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                            <path d="M0,0 L5,2.5 L0,5 Z" fill="#94a3b8" opacity="0.7"/>
                          </marker>
                        </defs>
                        {/* Mesh edges */}
                        {MESH_EDGES.map(([a,b],ei) => {
                          const pa = PEERS[a], pb = PEERS[b];
                          const edgeActive = allActive ||
                            (pairActive && ((sa===a&&sb===b)||(sa===b&&sb===a)));
                          const mx = (pa.cx+pb.cx)/2, my = (pa.cy+pb.cy)/2;
                          return (
                            <g key={ei}>
                              <line x1={pa.cx} y1={pa.cy} x2={pb.cx} y2={pb.cy}
                                stroke={edgeActive ? "#94a3b8" : "#1e293b"}
                                strokeWidth={edgeActive ? 1.5 : 1}
                                strokeDasharray={edgeActive ? "none" : "3 3"}
                                opacity={edgeActive ? 0.75 : 0.3}
                                markerEnd={edgeActive ? "url(#arr-consume)" : undefined}
                              />
                              {edgeActive && (
                                <text x={mx} y={my-4} textAnchor="middle" fontSize="6.5" fill="#94a3b8" fontFamily="monospace" opacity="0.9">consume</text>
                              )}
                            </g>
                          );
                        })}
                        {/* Nodes */}
                        {PEERS.map((p,pi) => {
                          const active = allActive || (pairActive && (sa===pi||sb===pi));
                          return (
                            <g key={p.id}>
                              <circle cx={p.cx} cy={p.cy} r="19"
                                fill={active ? p.color+"20" : "#0f172a"}
                                stroke={active ? p.color : p.color+"44"}
                                strokeWidth={active ? 2 : 1}
                              />
                              <text x={p.cx} y={p.cy+1} textAnchor="middle" dominantBaseline="middle"
                                fontSize="8.5" fontWeight="bold" fill={active ? p.color : p.color+"88"}
                                fontFamily="sans-serif">{p.label}</text>
                              <text x={p.cx} y={p.cy+13} textAnchor="middle" fontSize="5.5" fill="#475569" fontFamily="monospace">{p.id}_prd</text>
                            </g>
                          );
                        })}
                      </svg>
                      {/* Animated consume packet */}
                      <AnimatePresence>
                        {pairActive && (() => {
                          const pa = PEERS[sa], pb = PEERS[sb];
                          return (
                            <motion.div key={`dpkt-${step}`}
                              initial={{x: pa.cx-8, y: pa.cy-8, opacity:1, scale:1}}
                              animate={{x: pb.cx-8, y: pb.cy-8, opacity:0, scale:0.5}}
                              exit={{opacity:0}}
                              transition={{duration:1.1, ease:"easeInOut"}}
                              className="absolute w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                              style={{backgroundColor: pa.color, zIndex:10}}
                            >→</motion.div>
                          );
                        })()}
                      </AnimatePresence>
                    </div>
                    <motion.div animate={{opacity: step===0?0:1}} transition={{duration:0.3}}
                      className="text-[9px] text-slate-400 text-center mt-1 px-2"
                    >
                      {allActive
                        ? "Federated — any agency can consume any other's published catalog via UC grants"
                        : pairActive ? `${PEERS[sa].label} consuming ${PEERS[sb].label}'s published catalog...` : ""}
                    </motion.div>
                    <div className="flex gap-1 justify-center mt-2">
                      {Array.from({length:6}).map((_,i) => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${step===i?"w-5 bg-blue-500":"w-1 bg-slate-700"}`}/>
                      ))}
                    </div>
                  </div>
                  <ul className="space-y-1 shrink-0">
                    {["Agency controls its own catalog, quality, and ACLs","Central team provides platform ops and secure blueprints","Best for agencies with mature data engineering","No isolation — any BU can consume any other via UC grants"].map(pt=>(
                      <li key={pt} className="flex gap-2 text-xs text-slate-400"><span className="text-blue-400 shrink-0">·</span>{pt}</li>
                    ))}
                  </ul>
                </div>
              );
            })()}

            {/* ── Centralized panel — hub-spoke with publish ↑ / consume ↓ ── */}
            {(() => {
              const activeIdx    = step >= 1 && step <= 4 ? step - 1 : -1;
              const publishPhase = step >= 1 && step <= 4;
              const consumePhase = step === 5;
              // Agency x-centers in SVG (4 agencies spread 200px wide)
              const AGX = [22, 70, 118, 166];
              const HUB_CX = 100, HUB_CY = 28, AG_CY = 165;
              return (
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">Pattern B — Centralized (PUSH &amp; PULL)</span>
                    <h3 className="text-sm font-bold text-slate-100 mt-0.5">HHS Central is the hub — agencies publish up, consumers pull down</h3>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center" style={{minHeight:210}}>
                    <div className="relative" style={{width:200, height:200}}>
                      <svg className="absolute inset-0" width="200" height="200" viewBox="0 0 200 200">
                        <defs>
                          <marker id="arr-pub" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                            <path d="M0,0 L5,2.5 L0,5 Z" fill="#f59e0b"/>
                          </marker>
                          <marker id="arr-con" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                            <path d="M0,0 L5,2.5 L0,5 Z" fill="#22c55e"/>
                          </marker>
                        </defs>
                        {/* Spokes */}
                        {CENTRAL_AGENCY.map((ag, i) => {
                          const agx = AGX[i];
                          const isActive = i === activeIdx;
                          return (
                            <g key={ag.id}>
                              {/* publish arrow: agency → central */}
                              <line x1={agx} y1={AG_CY-20} x2={HUB_CX-4} y2={HUB_CY+22}
                                stroke={isActive ? "#f59e0b" : "#1e293b"}
                                strokeWidth={isActive ? 2 : 1}
                                strokeDasharray={isActive ? "none" : "3 3"}
                                opacity={isActive ? 0.9 : 0.3}
                                markerEnd={isActive ? "url(#arr-pub)" : undefined}
                              />
                              {/* consume arrow: central → agency */}
                              <line x1={HUB_CX+4} y1={HUB_CY+22} x2={agx+4} y2={AG_CY-20}
                                stroke={consumePhase ? "#22c55e" : "#1e293b"}
                                strokeWidth={consumePhase ? 2 : 1}
                                strokeDasharray={consumePhase ? "none" : "3 3"}
                                opacity={consumePhase ? 0.9 : 0.3}
                                markerEnd={consumePhase ? "url(#arr-con)" : undefined}
                              />
                            </g>
                          );
                        })}
                        {/* publish / consume floating labels */}
                        {publishPhase && activeIdx >= 0 && (
                          <text x={(AGX[activeIdx]+HUB_CX)/2-16} y={(AG_CY+HUB_CY)/2+2}
                            fontSize="7" fill="#f59e0b" fontFamily="monospace" textAnchor="middle">publish ↑</text>
                        )}
                        {consumePhase && (
                          <text x={HUB_CX} y={(AG_CY+HUB_CY)/2}
                            fontSize="7" fill="#22c55e" fontFamily="monospace" textAnchor="middle">consume ↓</text>
                        )}
                        {/* HHS Central hub */}
                        <circle cx={HUB_CX} cy={HUB_CY} r="26"
                          fill={consumePhase ? "#14532d40" : publishPhase ? "#0f271840" : "#0c1f1040"}
                          stroke={consumePhase ? "#22c55e" : publishPhase ? "#16a34a" : "#166534"}
                          strokeWidth={consumePhase || publishPhase ? 2.5 : 1.5}
                        />
                        <text x={HUB_CX} y={HUB_CY-3} textAnchor="middle" dominantBaseline="middle"
                          fontSize="7.5" fontWeight="bold" fill="#4ade80" fontFamily="sans-serif">HHS</text>
                        <text x={HUB_CX} y={HUB_CY+7} textAnchor="middle"
                          fontSize="6" fill="#16a34a" fontFamily="sans-serif">Central</text>
                        {/* Agency nodes */}
                        {CENTRAL_AGENCY.map((ag, i) => {
                          const agx = AGX[i];
                          const isActive = i === activeIdx || consumePhase;
                          return (
                            <g key={ag.id}>
                              <circle cx={agx} cy={AG_CY} r="17"
                                fill={isActive ? ag.color+"20" : "#0f172a"}
                                stroke={isActive ? ag.color : ag.color+"44"}
                                strokeWidth={isActive ? 2 : 1}
                              />
                              <text x={agx} y={AG_CY+1} textAnchor="middle" dominantBaseline="middle"
                                fontSize="8" fontWeight="bold" fill={isActive ? ag.color : ag.color+"88"}
                                fontFamily="sans-serif">{ag.label}</text>
                              <text x={agx} y={AG_CY+12} textAnchor="middle" fontSize="5.5" fill="#475569" fontFamily="monospace">isolated</text>
                            </g>
                          );
                        })}
                      </svg>
                      {/* Animated publish packet (UP) */}
                      <AnimatePresence>
                        {publishPhase && activeIdx >= 0 && (() => {
                          const agx = AGX[activeIdx];
                          return (
                            <motion.div key={`ppkt-${step}`}
                              initial={{x: agx-8, y: AG_CY-28, opacity:1, scale:1}}
                              animate={{x: HUB_CX-8, y: HUB_CY-8, opacity:0, scale:0.5}}
                              exit={{opacity:0}}
                              transition={{duration:1.0, ease:"easeOut"}}
                              className="absolute w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-black"
                              style={{backgroundColor:"#f59e0b", zIndex:10}}
                            >↑</motion.div>
                          );
                        })()}
                      </AnimatePresence>
                      {/* Animated consume packets (DOWN) */}
                      <AnimatePresence>
                        {consumePhase && CENTRAL_AGENCY.map((_ag, i) => (
                          <motion.div key={`cpkt-${i}`}
                            initial={{x: HUB_CX-8, y: HUB_CY-8, opacity:1, scale:1}}
                            animate={{x: AGX[i]-8, y: AG_CY-28, opacity:0, scale:0.5}}
                            exit={{opacity:0}}
                            transition={{duration:1.0, ease:"easeIn", delay:i*0.12}}
                            className="absolute w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-black"
                            style={{backgroundColor:"#22c55e", zIndex:10}}
                          >↓</motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    <motion.div animate={{opacity: step===0?0:1}} transition={{duration:0.3}}
                      className="text-[9px] text-center mt-1 px-2"
                      style={{color: consumePhase ? "#22c55e" : publishPhase ? "#f59e0b" : "#64748b"}}
                    >
                      {consumePhase
                        ? "Central distributes published data — agencies consume ↓"
                        : activeIdx >= 0 ? `${CENTRAL_AGENCY[activeIdx].label} publishes ↑ to HHS Central` : ""}
                    </motion.div>
                    <div className="flex gap-1 justify-center mt-2">
                      {Array.from({length:6}).map((_,i) => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-300 ${step===i?"w-5 bg-green-500":"w-1 bg-slate-700"}`}/>
                      ))}
                    </div>
                  </div>
                  <ul className="space-y-1 shrink-0">
                    {["Agencies network-isolated from each other","Central validates quality before publishing","Central enforces consistent metadata schemas","Two modes: PUSH (agency ETL) and PULL (Central ETL)"].map(pt=>(
                      <li key={pt} className="flex gap-2 text-xs text-slate-400"><span className="text-green-400 shrink-0">·</span>{pt}</li>
                    ))}
                  </ul>
                </div>
              );
            })()}

          </motion.div>
        )}


        {/* ── PUSH ──────────────────────────────────────────── */}
        {pattern === "push" && (
          <motion.div key="push" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.3}}
            className="flex-1 overflow-y-auto"
          >
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">PUSH — Agency-Managed ETL · Metadata Management</span>
                <p className="text-slate-300 text-sm mt-2">
                  Each agency owns its own catalogs. Agencies receive{" "}
                  <code className="text-blue-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">USE CATALOG + CREATE SCHEMA</code>{" "}
                  on the shared central catalog to publish their data products there.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Hierarchy */}
                <div className="flex flex-col gap-2.5">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">UC Catalog Hierarchy</div>
                  <div className="text-xs text-slate-500 font-mono mb-1 flex gap-4">
                    <span className="text-slate-400">catalog</span>
                    <span>→ schema</span>
                    <span>→ asset</span>
                  </div>

                  {/* HHS Central group */}
                  {[
                    { cat:"hhs_dev", env:"dev" }, { cat:"hhs_stg", env:"stg" }, { cat:"hhs_prd", env:"prd" },
                  ].map(row => (
                    <div key={row.cat} className="flex items-center gap-2 flex-wrap">
                      <div className={`flex items-center gap-1.5 rounded px-2.5 py-1 border border-green-700/50 bg-green-900/15 ${row.env==="prd"?"border-green-600":""}`}>
                        <span className="text-xs text-green-300 font-mono">{row.cat}</span>
                        <span className="text-xs text-slate-500">HHS</span>
                      </div>
                      <span className="text-slate-600 text-xs">→</span>
                      <span className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-green-400 font-mono">central_schemas</span>
                      <span className="text-slate-600 text-xs">→</span>
                      <span className="text-xs text-slate-500">table/view/model</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-800 my-1"/>

                  {/* CMS group */}
                  {[
                    { cat:"cms_dev", env:"dev" }, { cat:"cms_stg", env:"stg" }, { cat:"cms_prd", env:"prd" },
                  ].map(row => (
                    <div key={row.cat} className="flex items-center gap-2 flex-wrap">
                      <div className={`flex items-center gap-1.5 rounded px-2.5 py-1 border border-blue-700/50 bg-blue-900/15 ${row.env==="prd"?"border-blue-600":""}`}>
                        <span className="text-xs text-blue-300 font-mono">{row.cat}</span>
                        <span className="text-xs text-slate-500">CMS</span>
                      </div>
                      <span className="text-slate-600 text-xs">→</span>
                      <span className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-blue-400 font-mono">agency_schemas</span>
                      <span className="text-slate-600 text-xs">→</span>
                      <span className="text-xs text-slate-500">table/view/model</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-800 my-1"/>

                  {/* CDC group */}
                  {[
                    { cat:"cdc_dev", env:"dev" }, { cat:"cdc_stg", env:"stg" }, { cat:"cdc_prd", env:"prd" },
                  ].map(row => (
                    <div key={row.cat} className="flex items-center gap-2 flex-wrap">
                      <div className={`flex items-center gap-1.5 rounded px-2.5 py-1 border border-emerald-700/50 bg-emerald-900/15 ${row.env==="prd"?"border-emerald-600":""}`}>
                        <span className="text-xs text-emerald-300 font-mono">{row.cat}</span>
                        <span className="text-xs text-slate-500">CDC</span>
                      </div>
                      <span className="text-slate-600 text-xs">→</span>
                      <span className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-mono">agency_schemas</span>
                      <span className="text-slate-600 text-xs">→</span>
                      <span className="text-xs text-slate-500">table/view/model</span>
                    </div>
                  ))}
                  <div className="mt-2 flex gap-5 text-xs text-slate-500">
                    <span><span className="text-slate-300">_prd</span> = prod</span>
                    <span><span className="text-slate-300">_stg</span> = staging</span>
                    <span><span className="text-slate-300">_dev</span> = dev</span>
                  </div>
                </div>

                {/* Permissions Matrix */}
                <div className="flex flex-col gap-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">Permission Matrix</div>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-400 font-mono py-2 pr-3">Catalog</th>
                        <th className="text-center text-slate-400 py-2 px-2 w-16">Owner</th>
                        <th className="text-center text-green-400 py-2 px-2 w-12">HHS</th>
                        <th className="text-center text-blue-400 py-2 px-2 w-12">CMS</th>
                        <th className="text-center text-emerald-400 py-2 px-2 w-12">CDC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {([
                        { cat:"hhs_dev",  owner:"HHS", oc:"#22c55e", hhs:"own", cms:"—",     cdc:"—"      },
                        { cat:"hhs_stg",  owner:"HHS", oc:"#22c55e", hhs:"own", cms:"—",     cdc:"—"      },
                        { cat:"hhs_prd",  owner:"HHS", oc:"#22c55e", hhs:"own", cms:"UC",    cdc:"UC",    highlight:true },
                        { cat:"cms_dev",  owner:"CMS", oc:"#3b82f6", hhs:"—",   cms:"own",   cdc:"—"      },
                        { cat:"cms_stg",  owner:"CMS", oc:"#3b82f6", hhs:"—",   cms:"own",   cdc:"—"      },
                        { cat:"cms_prd",  owner:"CMS", oc:"#3b82f6", hhs:"—",   cms:"UC+CS", cdc:"—",     highlight:true },
                        { cat:"cdc_dev",  owner:"CDC", oc:"#10b981", hhs:"—",   cms:"—",     cdc:"own"    },
                        { cat:"cdc_stg",  owner:"CDC", oc:"#10b981", hhs:"—",   cms:"—",     cdc:"own"    },
                        { cat:"cdc_prd",  owner:"CDC", oc:"#10b981", hhs:"—",   cms:"—",     cdc:"UC+CS", highlight:true },
                      ] as {cat:string;owner:string;oc:string;hhs:string;cms:string;cdc:string;highlight?:boolean}[]).map(row => {
                        const cell = (v: string, col: string) => v === "own"
                          ? <span className="text-slate-500">own</span>
                          : v === "—" ? <span className="text-slate-700">—</span>
                          : <span className="font-bold" style={{color:col}}>{v}</span>;
                        return (
                          <tr key={row.cat} className={row.highlight ? "bg-slate-800/40" : ""}>
                            <td className="py-1.5 pr-3 font-mono" style={{color:row.oc+"bb"}}>{row.cat}</td>
                            <td className="text-center py-1.5 px-2 font-bold" style={{color:row.oc}}>{row.owner}</td>
                            <td className="text-center py-1.5 px-2">{cell(row.hhs,"#22c55e")}</td>
                            <td className="text-center py-1.5 px-2">{cell(row.cms,"#3b82f6")}</td>
                            <td className="text-center py-1.5 px-2">{cell(row.cdc,"#10b981")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400 border-t border-slate-800 pt-3">
                    <span><span className="font-bold text-slate-200">UC</span> = USE CATALOG</span>
                    <span><span className="font-bold text-slate-200">CS</span> = CREATE SCHEMA</span>
                    <span className="text-slate-500">* Also grant USE SCHEMA + SELECT at table level</span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* ── PULL ──────────────────────────────────────────── */}
        {pattern === "pull" && (
          <motion.div key="pull" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.3}}
            className="flex-1 overflow-y-auto"
          >
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-green-400">PULL — Central-Managed ETL · Metadata Management</span>
                <p className="text-slate-300 text-sm mt-2">
                  Central owns{" "}
                  <code className="text-green-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">cms_published</code> and{" "}
                  <code className="text-green-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">cdc_published</code> with Central schemas.
                  Agencies keep their own workspace catalogs and get{" "}
                  <code className="text-green-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">USE CATALOG</code> to read published data.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Hierarchy */}
                <div className="flex flex-col gap-2.5">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">UC Catalog Hierarchy</div>
                  <div className="text-xs text-slate-500 font-mono mb-1 flex gap-4">
                    <span className="text-slate-400">catalog</span>
                    <span>→ schema</span>
                    <span>→ asset</span>
                  </div>

                  {/* HHS Central group — includes published catalogs */}
                  {[
                    { cat:"hhs_dev", badge:false }, { cat:"hhs_stg", badge:false }, { cat:"hhs_prd", badge:false },
                    { cat:"cms_published", badge:true }, { cat:"cdc_published", badge:true },
                  ].map(row => (
                    <div key={row.cat} className="flex items-center gap-2 flex-wrap">
                      <div className={`flex items-center gap-1.5 rounded px-2.5 py-1 border ${row.badge ? "border-green-500 bg-green-900/30" : "border-green-700/50 bg-green-900/15"}`}>
                        <span className="text-xs text-green-300 font-mono">{row.cat}</span>
                        {row.badge && <span className="text-[10px] text-green-400 bg-green-900 rounded px-1.5">CENTRAL</span>}
                      </div>
                      <span className="text-slate-600 text-xs">→</span>
                      <span className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-green-400 font-mono">central_schemas</span>
                      <span className="text-slate-600 text-xs">→</span>
                      <span className="text-xs text-slate-500">table/view/model</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-800 my-1"/>

                  {/* CMS workspace catalogs */}
                  {[
                    { cat:"cms_dev", env:"dev" }, { cat:"cms_stg", env:"stg" }, { cat:"cms_prd", env:"prd" },
                  ].map(row => (
                    <div key={row.cat} className="flex items-center gap-2 flex-wrap">
                      <div className={`flex items-center gap-1.5 rounded px-2.5 py-1 border border-blue-700/50 bg-blue-900/15 ${row.env==="prd"?"border-blue-600":""}`}>
                        <span className="text-xs text-blue-300 font-mono">{row.cat}</span>
                        <span className="text-xs text-slate-500">CMS</span>
                      </div>
                      <span className="text-slate-600 text-xs">→</span>
                      <span className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-blue-400 font-mono">agency_schemas</span>
                      <span className="text-slate-600 text-xs">→</span>
                      <span className="text-xs text-slate-500">table/view/model</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-800 my-1"/>

                  {/* CDC workspace catalogs */}
                  {[
                    { cat:"cdc_dev", env:"dev" }, { cat:"cdc_stg", env:"stg" }, { cat:"cdc_prd", env:"prd" },
                  ].map(row => (
                    <div key={row.cat} className="flex items-center gap-2 flex-wrap">
                      <div className={`flex items-center gap-1.5 rounded px-2.5 py-1 border border-emerald-700/50 bg-emerald-900/15 ${row.env==="prd"?"border-emerald-600":""}`}>
                        <span className="text-xs text-emerald-300 font-mono">{row.cat}</span>
                        <span className="text-xs text-slate-500">CDC</span>
                      </div>
                      <span className="text-slate-600 text-xs">→</span>
                      <span className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-emerald-400 font-mono">agency_schemas</span>
                      <span className="text-slate-600 text-xs">→</span>
                      <span className="text-xs text-slate-500">table/view/model</span>
                    </div>
                  ))}
                  <div className="mt-2 flex gap-5 text-xs text-slate-500">
                    <span><span className="text-slate-300">_prd</span> = prod</span>
                    <span><span className="text-slate-300">_stg</span> = staging</span>
                    <span><span className="text-slate-300">_dev</span> = dev</span>
                  </div>
                </div>

                {/* Permissions Matrix */}
                <div className="flex flex-col gap-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">Permission Matrix</div>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-400 font-mono py-2 pr-3">Catalog</th>
                        <th className="text-center text-slate-400 py-2 px-2 w-16">Owner</th>
                        <th className="text-center text-green-400 py-2 px-2 w-12">HHS</th>
                        <th className="text-center text-blue-400 py-2 px-2 w-12">CMS</th>
                        <th className="text-center text-emerald-400 py-2 px-2 w-12">CDC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {([
                        { cat:"hhs_dev",       owner:"HHS", oc:"#22c55e", hhs:"own", cms:"—",  cdc:"—"  },
                        { cat:"hhs_stg",       owner:"HHS", oc:"#22c55e", hhs:"own", cms:"—",  cdc:"—"  },
                        { cat:"hhs_prd",       owner:"HHS", oc:"#22c55e", hhs:"own", cms:"UC", cdc:"UC", highlight:true },
                        { cat:"cms_published", owner:"HHS", oc:"#22c55e", hhs:"own", cms:"UC", cdc:"UC", pub:true },
                        { cat:"cdc_published", owner:"HHS", oc:"#22c55e", hhs:"own", cms:"UC", cdc:"UC", pub:true },
                        { cat:"cms_dev",       owner:"CMS", oc:"#3b82f6", hhs:"—",   cms:"own",cdc:"—"  },
                        { cat:"cms_stg",       owner:"CMS", oc:"#3b82f6", hhs:"—",   cms:"own",cdc:"—"  },
                        { cat:"cms_prd",       owner:"CMS", oc:"#3b82f6", hhs:"UC",  cms:"own",cdc:"—",  highlight:true },
                        { cat:"cdc_dev",       owner:"CDC", oc:"#10b981", hhs:"—",   cms:"—",  cdc:"own" },
                        { cat:"cdc_stg",       owner:"CDC", oc:"#10b981", hhs:"—",   cms:"—",  cdc:"own" },
                        { cat:"cdc_prd",       owner:"CDC", oc:"#10b981", hhs:"UC",  cms:"—",  cdc:"own", highlight:true },
                      ] as {cat:string;owner:string;oc:string;hhs:string;cms:string;cdc:string;highlight?:boolean;pub?:boolean}[]).map(row => {
                        const cell = (v: string, col: string) => v === "own"
                          ? <span className="text-slate-500">own</span>
                          : v === "—" ? <span className="text-slate-700">—</span>
                          : <span className="font-bold" style={{color:col}}>{v}</span>;
                        return (
                          <tr key={row.cat} className={row.pub ? "bg-green-900/15" : row.highlight ? "bg-slate-800/40" : ""}>
                            <td className="py-1.5 pr-3 font-mono" style={{color:row.oc+"bb"}}>
                              {row.cat}
                              {row.pub && <span className="ml-1.5 text-[10px] text-green-400 bg-green-900/50 rounded px-1.5">central</span>}
                            </td>
                            <td className="text-center py-1.5 px-2 font-bold" style={{color:row.oc}}>{row.owner}</td>
                            <td className="text-center py-1.5 px-2">{cell(row.hhs,"#22c55e")}</td>
                            <td className="text-center py-1.5 px-2">{cell(row.cms,"#3b82f6")}</td>
                            <td className="text-center py-1.5 px-2">{cell(row.cdc,"#10b981")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400 border-t border-slate-800 pt-3">
                    <span><span className="font-bold text-slate-200">UC</span> = USE CATALOG</span>
                    <span className="text-slate-500">* Also grant USE SCHEMA + SELECT at table level</span>
                    <span className="text-green-500">cms/cdc_published owned entirely by HHS Central</span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}


      </AnimatePresence>
    </div>
  );
}


// ─── Main App ─────────────────────────────────────────────────────────────────

const CHAPTERS = [
  {
    n: 1,
    title: "The Fragmented State",
    desc: "Seven agencies. Fourteen databases. One way to share data: FTP and email.",
  },
  {
    n: 2,
    title: "Building the Foundation",
    desc: "Lift the data off the servers. One cloud store. Open format. Compute separated.",
  },
  {
    n: 3,
    title: "Delta Lake — ACID",
    desc: "A JSON transaction log turns raw object storage into a reliable, auditable lakehouse table.",
  },
  {
    n: 4,
    title: "Bronze Ingestion — Delta on the Foundation",
    desc: "Agency data lands raw into Delta tables inside the unified cloud store · ACID-guaranteed from the start.",
  },
  {
    n: 5,
    title: "Silver Zone — Cleansing & Conforming",
    desc: "Raw bronze cleaned, deduplicated, and PII-masked · First cross-agency join produces a unified client view.",
  },
  {
    n: 6,
    title: "Gold Zone — Analytics-Ready",
    desc: "Pre-aggregated, Photon-accelerated tables purpose-built for dashboards, reports, and ML — queries in milliseconds.",
  },
  {
    n: 7,
    title: "The Complete Architecture",
    desc: "Six chapters. One unified lakehouse. Every layer from foundation to gold — built on Chapter 2's cloud storage.",
  },
  {
    n: 8,
    title: "Unity Catalog — Unified Governance",
    desc: "Discovery, Lineage, Access Control, AI Governance, and more — one catalog governing every asset across every platform.",
  },
  {
    n: 9,
    title: "Genie — Ask Your Data Anything",
    desc: "Natural language queries over governed gold tables — a case worker asks a question and Genie answers in milliseconds.",
  },
  {
    n: 10,
    title: "Network & VPC — Hub-Spoke Architecture",
    desc: "How Databricks workspaces connect in the cloud — hub-spoke topology, private endpoints, and network security zones.",
  },
  {
    n: 11,
    title: "IAM — Groups, Catalogs & Storage Access",
    desc: "Agencies → groups → Unity Catalog privileges → ABAC rules → credential-vended cloud storage. One governance model from identity to bytes.",
  },
  {
    n: 12,
    title: "Data Sharing — Decision Tree",
    desc: "Who needs the data and where do they run? Nine sharing methods — from UC grants to Clean Rooms to open Delta Sharing — mapped to HHS use cases.",
  },
  {
    n: 13,
    title: "Blueprint Summary",
    desc: "All 12 chapters in one view — Infrastructure, Governance, Workspace Strategy, and Operating Model. Click any component to revisit its chapter context.",
  },
  {
    n: 14,
    title: "Addendum A — UC Multi-Agency Architecture",
    desc: "Distributed vs Centralized publishing patterns for Unity Catalog across HHS component agencies — PUSH and PULL governance models.",
  },
];

function HHSChapters() {
  const [chapter, setChapter] = useState(1);
  const [showIntro, setShowIntro] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const goToChapter = useCallback(
    async (n: number) => {
      if (transitioning || n === chapter) return;
      setTransitioning(true);
      setSidebarOpen(false);
      await sleep(200);
      setChapter(n);
      setShowIntro(true);
      setTransitioning(false);
    },
    [chapter, transitioning]
  );

  const info = CHAPTERS[chapter - 1];

  return (
    <div className="h-screen bg-slate-950 text-foreground flex flex-col overflow-hidden">
      {/* ── Cinematic chapter intro overlay ── */}
      <AnimatePresence>
        {showIntro && (
          <ChapterIntro
            chapter={info.n}
            subtitle={info.title}
            description={info.desc}
            onDone={() => setShowIntro(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Collapsible sidebar overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            {/* sidebar panel */}
            <motion.aside
              key="sidebar"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-[260px] z-50 bg-background border-r border-border flex flex-col overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
                <span className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest">Chapters</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {CHAPTERS.map((c) => (
                  <button
                    key={c.n}
                    onClick={() => goToChapter(c.n)}
                    className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${chapter === c.n ? "bg-blue-600/15 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
                  >
                    <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 ${chapter === c.n ? "border-blue-500 bg-blue-600 text-white" : "border-border"}`}>
                      {c.n}
                    </span>
                    <span className="text-[12px] leading-snug">{c.title}</span>
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Top bar ── */}
      <header className="shrink-0 border-b border-border bg-background/95 backdrop-blur px-4 py-2.5 flex items-center gap-3 z-30">
        {/* Hamburger */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors shrink-0"
          title="All chapters"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Server className="w-4 h-4 text-blue-400 shrink-0" />
        <span className="text-sm font-bold text-foreground truncate">Databricks Lakehouse for State HHS</span>
        <span className="text-muted-foreground/40 hidden md:block">·</span>
        <span className="text-[13px] text-muted-foreground hidden md:block truncate">{info.title}</span>

        <div className="ml-auto flex gap-1 items-center shrink-0">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* ── Chapter content ── */}
      <main className="flex-1 overflow-hidden p-4 lg:px-6 lg:py-5 bg-slate-950 text-slate-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={chapter}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            {chapter === 1 ? <Chapter1 /> : chapter === 2 ? <Chapter2 /> : chapter === 3 ? <Chapter3 /> : chapter === 4 ? <Chapter4 /> : chapter === 5 ? <Chapter5 /> : chapter === 6 ? <Chapter6 /> : chapter === 7 ? <Chapter7 /> : chapter === 8 ? <Chapter8 /> : chapter === 9 ? <Chapter9 /> : chapter === 10 ? <Chapter10 /> : chapter === 11 ? <Chapter11 /> : chapter === 12 ? <Chapter12 /> : chapter === 13 ? <Chapter13 /> : <Chapter14 />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Bottom nav: progress dots + prev/next arrows ── */}
      <div className="shrink-0 border-t border-border bg-background px-5 py-2 flex items-center justify-between gap-3">
        {/* Prev */}
        <button
          onClick={() => goToChapter(Math.max(1, chapter - 1))}
          disabled={chapter === 1}
          className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5 items-center">
          {CHAPTERS.map((c) => (
            <button
              key={c.n}
              onClick={() => goToChapter(c.n)}
              className={`h-1.5 rounded-full transition-all ${chapter === c.n ? "w-6 bg-blue-500" : "w-1.5 bg-muted hover:bg-muted-foreground/40"}`}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => goToChapter(Math.min(CHAPTERS.length, chapter + 1))}
          disabled={chapter === CHAPTERS.length}
          className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
