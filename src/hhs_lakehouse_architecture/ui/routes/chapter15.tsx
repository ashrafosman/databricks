import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertTriangle, Users, ChevronRight, Database, Shield } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CatalogMode = "env" | "domain" | "hybrid";
type UCTab = "hierarchy" | "environments" | "groups" | "workspaces";
type PersonaId = "account-admin" | "metastore-admin" | "data-steward" | "workspace-admin";

// ─── Buildup Step Data ──────────────────────────────────────────────────────────────────────────────

const PERSONAS = {
  "account-admin":   { label: "Account Admin",   scope: "Account · Identity Root",      color: "#64748b" },
  "metastore-admin": { label: "Metastore Admin", scope: "Metastore · Data Governance",  color: "#6366f1" },
  "data-steward":    { label: "Data Steward",    scope: "Catalog · Schema Governance",  color: "#f59e0b" },
  "workspace-admin": { label: "Workspace Admin", scope: "Workspace · Compute & UX",     color: "#0ea5e9" },
} as const;

const BUILDUP_STEPS: Array<{
  persona: PersonaId; title: string; action: string; why: string; snippet?: string;
}> = [
  {
    persona: "account-admin",
    title: "Create the Databricks Account",
    action: "Provisions the Databricks account — the global identity root that owns all workspaces, users, metastores, and billing.",
    why: "Your IdP (Entra ID / Okta) syncs at the account level. Every user, group, and service principal is created here before anything else exists.",
  },
  {
    persona: "account-admin",
    title: "Provision Workspaces",
    action: "Creates three workspaces — ws-hhs-eng, ws-hhs-bi, ws-hhs-ml — each scoped to a team’s compute and UX needs.",
    why: "Workspaces are compute boundaries, not data boundaries. Each team gets its own cluster policies, notebooks, and job scheduler without touching data permissions.",
    snippet: "databricks workspaces create \\\n  --name ws-hhs-eng \\\n  --region us-east-1",
  },
  {
    persona: "account-admin",
    title: "Create a Metastore",
    action: "Creates one metastore for the region. The metastore IS the data security perimeter — all catalogs, grants, lineage, and audit logs live here.",
    why: "One metastore per region is the recommended default. Attaching it to all workspaces means every team shares the same catalog permission graph.",
    snippet: "databricks metastores create \\\n  --name hhs-metastore-us-east \\\n  --storage-root s3://hhs-uc-root/",
  },
  {
    persona: "account-admin",
    title: "Appoint a Metastore Admin",
    action: "Grants the Metastore Admin role to the platform governance team and attaches the metastore to all workspaces.",
    why: "Separating account admin (infrastructure) from metastore admin (data governance) enforces least-privilege. One person should not control both.",
    snippet: "databricks metastores assign \\\n  --metastore-id <id> \\\n  --workspace-id <ws-id>",
  },
  {
    persona: "metastore-admin",
    title: "Create Storage Credential & External Location",
    action: "Registers an IAM role (AWS) or managed identity (Azure) as a storage credential, then maps it to an S3/ADLS path as an external location.",
    why: "UC vends short-lived credentials to clusters at query time. Clusters never hold long-lived cloud keys — all external table access flows through this credential.",
    snippet: "CREATE STORAGE CREDENTIAL hhs_s3_cred\n  USING IAM_ROLE \'arn:aws:iam::123:role/uc-role\';\n\nCREATE EXTERNAL LOCATION hhs_data\n  URL \'s3://hhs-data/\'\n  WITH (STORAGE CREDENTIAL hhs_s3_cred);",
  },
  {
    persona: "metastore-admin",
    title: "Create Catalogs",
    action: "Creates dev, qa, and prod catalogs — the first-level isolation boundary inside the metastore.",
    why: "Catalog = environment. A DROP TABLE mistake in dev cannot reach prod because they are separate namespaces with independent grant graphs.",
    snippet: "CREATE CATALOG dev;\nCREATE CATALOG qa;\nCREATE CATALOG prod;",
  },
  {
    persona: "data-steward",
    title: "Create Schemas — Medallion Layers",
    action: "Creates bronze, silver, and gold schemas inside each catalog to reflect the medallion architecture.",
    why: "Schemas are the grant granularity below catalog. Pipeline service principals own bronze; analytics teams own gold. Permissions cascade to all tables within.",
    snippet: "CREATE SCHEMA prod.bronze;\nCREATE SCHEMA prod.silver;\nCREATE SCHEMA prod.gold;",
  },
  {
    persona: "data-steward",
    title: "Assign Account Groups via GRANT",
    action: "Grants account-level groups access to catalogs and schemas. Only account-level groups are UC-native — workspace-local groups are invisible to GRANT statements.",
    why: "GRANT statements are the only path to data access in UC. Account groups scale across every workspace without duplication.",
    snippet: "GRANT USE CATALOG, USE SCHEMA ON CATALOG prod\n  TO data_engineers;\nGRANT SELECT ON SCHEMA prod.gold\n  TO medicaid_analysts;",
  },
  {
    persona: "workspace-admin",
    title: "Bind Catalogs to Workspaces",
    action: "Binds specific catalogs to specific workspaces — controlling which catalogs appear in each workspace’s UI without changing any UC grants.",
    why: "Binding is a visibility filter. An analyst workspace bound only to prod cannot accidentally browse dev tables, even if their grants technically allow it.",
    snippet: "databricks catalogs update prod \\\n  --isolation-mode ISOLATED\ndatabricks workspace-bindings update \\\n  --catalog prod --workspace ws-hhs-bi",
  },
];

// ─── Permission Matrix Data ───────────────────────────────────────────────────

const PERMISSION_GROUPS = [
  {
    id: "platform_admins", label: "platform_admins", level: "account" as const,
    badge: "bg-slate-800 text-slate-200 border-slate-600",
    members: ["admin@hhs.gov", "platform-team@hhs.gov"],
    description: "Central platform governance team. Owns all production catalogs.",
    grants: [
      { obj: "dev", priv: "OWNER", display: "OWNER" },
      { obj: "qa", priv: "OWNER", display: "OWNER" },
      { obj: "prod", priv: "OWNER", display: "OWNER" },
      { obj: "prod.bronze", priv: "ALL", display: "ALL" },
      { obj: "prod.gold", priv: "ALL", display: "ALL" },
    ],
  },
  {
    id: "data_engineers", label: "data_engineers", level: "account" as const,
    badge: "bg-sky-900/50 text-sky-300 border-sky-700",
    members: ["alice@hhs.gov", "bob@hhs.gov", "carol@hhs.gov"],
    description: "Build pipelines from bronze to gold. Full access to dev/qa, read-only on prod.",
    grants: [
      { obj: "dev", priv: "ALL", display: "ALL PRIV" },
      { obj: "qa", priv: "ALL", display: "ALL PRIV" },
      { obj: "prod", priv: "USE", display: "USE only" },
      { obj: "prod.bronze", priv: "SELECT", display: "SELECT" },
      { obj: "prod.gold", priv: "SELECT", display: "SELECT" },
    ],
  },
  {
    id: "ml_engineers", label: "ml_engineers", level: "account" as const,
    badge: "bg-violet-900/50 text-violet-300 border-violet-700",
    members: ["diana@hhs.gov", "evan@hhs.gov"],
    description: "Train models on gold data. Read on prod gold, full access on dev.",
    grants: [
      { obj: "dev", priv: "ALL", display: "ALL PRIV" },
      { obj: "qa", priv: "USE", display: "USE+SEL" },
      { obj: "prod", priv: "USE", display: "USE only" },
      { obj: "prod.bronze", priv: "NONE", display: "—" },
      { obj: "prod.gold", priv: "SELECT", display: "SELECT" },
    ],
  },
  {
    id: "medicaid_analysts", label: "medicaid_analysts", level: "account" as const,
    badge: "bg-amber-900/50 text-amber-300 border-amber-700",
    members: ["frank@doh.gov", "grace@doh.gov", "heidi@doh.gov"],
    description: "Agency analysts. Read-only on prod gold layer. No dev or staging access.",
    grants: [
      { obj: "dev", priv: "NONE", display: "—" },
      { obj: "qa", priv: "NONE", display: "—" },
      { obj: "prod", priv: "USE", display: "USE only" },
      { obj: "prod.bronze", priv: "NONE", display: "—" },
      { obj: "prod.gold", priv: "SELECT", display: "SELECT" },
    ],
  },
  {
    id: "auditors", label: "auditors", level: "account" as const,
    badge: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
    members: ["audit@hhs.gov"],
    description: "Read-only audit access across all prod schemas. No dev access.",
    grants: [
      { obj: "dev", priv: "NONE", display: "—" },
      { obj: "qa", priv: "NONE", display: "—" },
      { obj: "prod", priv: "USE", display: "USE only" },
      { obj: "prod.bronze", priv: "SELECT", display: "SELECT" },
      { obj: "prod.gold", priv: "SELECT", display: "SELECT" },
    ],
  },
  {
    id: "ws_local_group", label: "ws-hhs-eng\\analysts", level: "workspace" as const,
    badge: "bg-red-900/40 text-red-300 border-red-800",
    members: ["legacy-user@hhs.gov"],
    description: "⚠ Workspace-local group. Does NOT appear in Unity Catalog grants. Migrate to account-level group.",
    grants: [
      { obj: "dev", priv: "NONE", display: "invisible" },
      { obj: "qa", priv: "NONE", display: "invisible" },
      { obj: "prod", priv: "NONE", display: "invisible" },
      { obj: "prod.bronze", priv: "NONE", display: "invisible" },
      { obj: "prod.gold", priv: "NONE", display: "invisible" },
    ],
  },
];

const MATRIX_COLS = [
  { id: "dev",         label: "dev",          level: "catalog" as const },
  { id: "qa",          label: "qa",           level: "catalog" as const },
  { id: "prod",        label: "prod",         level: "catalog" as const },
  { id: "prod.bronze", label: "prod.bronze",  level: "schema" as const  },
  { id: "prod.gold",   label: "prod.gold",    level: "schema" as const  },
];

// ─── Buildup SVG ─────────────────────────────────────────────────────────────

function BuildupSVG({ step }: { step: number }) {
  const v  = (n: number) => step >= n ? 1 : 0;
  const fv = (n: number, base = 0.5) => step >= n ? base : 0;

  // Catalog spacing: width=88, gap=20 between boxes
  // dev(300-388) · qa(408-496) · prod(516-604) — no overlap, 20px gaps
  const CATS = [
    { label: "dev",  cx: 344, dim: true,  binds: "eng · ml"     },
    { label: "qa",   cx: 452, dim: true,  binds: "eng"           },
    { label: "prod", cx: 560, dim: false, binds: "eng · bi · ml" },
  ];
  const CAT_W = 88, CAT_H = 32, CAT_Y = 152;

  // Schema: width=60, 10px gap → bronze(485-545) · gold(555-615)
  const SCH = [
    { label: "bronze", cx: 515 },
    { label: "gold",   cx: 585 },
  ];
  const SCH_W = 60, SCH_H = 26, SCH_Y = 214;

  const WS = [
    { label: "ws-hhs-eng", cy: 93  },
    { label: "ws-hhs-bi",  cy: 137 },
    { label: "ws-hhs-ml",  cy: 181 },
  ];

  return (
    <svg viewBox="0 0 630 360" className="w-full h-full" style={{ fontFamily: "ui-monospace, monospace" }}>
      <defs>
        <filter id="bs-glow">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ─── Account (step 1) ─── */}
      <g style={{ opacity: v(1), transition: "opacity 0.4s" }}>
        <rect x="210" y="10" width="200" height="38" rx="7" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
        <rect x="210" y="10" width="200" height="15" rx="7" fill="#475569" opacity="0.2" />
        <rect x="210" y="20" width="200" height="6" fill="#475569" opacity="0.2" />
        <text x="310" y="25" textAnchor="middle" fontSize="9" fontWeight="700" fill="#cbd5e1">Account</text>
        <text x="310" y="40" textAnchor="middle" fontSize="7" fill="#94a3b8" opacity="0.7">HHS Databricks Account · Identity Root</text>
      </g>

      {/* ─── Workspaces (step 2) — x=15-165, left column ─── */}
      <g style={{ opacity: v(2), transition: "opacity 0.4s" }}>
        {WS.map((w, i) => (
          <g key={i}>
            <rect x="15" y={w.cy - 14} width="150" height="28" rx="6"
              fill="#082f49" stroke="#0ea5e9" strokeWidth="1.2" opacity="0.9" />
            <rect x="15" y={w.cy - 14} width="150" height="12" rx="6" fill="#0ea5e9" opacity="0.18" />
            <text x="90" y={w.cy - 1} textAnchor="middle" fontSize="8" fontWeight="600" fill="#7dd3fc">{w.label}</text>
            <text x="90" y={w.cy + 11} textAnchor="middle" fontSize="6.5" fill="#38bdf8" opacity="0.55">Workspace</text>
          </g>
        ))}
      </g>

      {/* ─── Account → Metastore line (step 3) ─── */}
      <line x1="310" y1="48" x2="310" y2="74"
        stroke="#6366f1" strokeWidth="1.2"
        style={{ opacity: fv(3), transition: "opacity 0.4s" }} />

      {/* ─── Metastore (step 3) — x=208-412, y=74-118 ─── */}
      <g style={{ opacity: v(3), transition: "opacity 0.4s" }}>
        <rect x="204" y="70" width="212" height="52" rx="10"
          fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="4,3" opacity="0.2" />
        <rect x="208" y="74" width="204" height="44" rx="8"
          fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
        <rect x="208" y="74" width="204" height="18" rx="8" fill="#6366f1" opacity="0.22" />
        <text x="310" y="89" textAnchor="middle" fontSize="9" fontWeight="700" fill="#a5b4fc">Metastore</text>
        <text x="310" y="108" textAnchor="middle" fontSize="7" fill="#818cf8" opacity="0.65">hhs-metastore-us-east · Data Security Boundary</text>
        <text x="211" y="69" fontSize="5.5" fill="#6366f1" opacity="0.4" letterSpacing="1">DATA SECURITY BOUNDARY</text>
      </g>

      {/* ─── Admin badge + ws attach lines (step 4) ─── */}
      <g style={{ opacity: v(4), transition: "opacity 0.4s" }}>
        <rect x="330" y="61" width="108" height="14" rx="4" fill="#312e81" stroke="#6366f1" strokeWidth="0.8" />
        <text x="384" y="71" textAnchor="middle" fontSize="6.5" fill="#a5b4fc">Admin: platform_team</text>
        <line x1="208" y1="96" x2="171" y2="96" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
        <line x1="171" y1="93" x2="171" y2="181" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
        {WS.map((w, i) => (
          <line key={i} x1="165" y1={w.cy} x2="171" y2={w.cy} stroke="#0ea5e9" strokeWidth="1" opacity="0.45" />
        ))}
        <text x="83" y="65" textAnchor="middle" fontSize="6.5" fill="#0ea5e9" opacity="0.5">attached</text>
        <text x="83" y="74" textAnchor="middle" fontSize="6.5" fill="#0ea5e9" opacity="0.4">(not owned)</text>
      </g>

      {/* ─── Storage Credential (step 5) — x=182-292, right edge=292, dev left=300 → 8px gap ─── */}
      <g style={{ opacity: v(5), transition: "opacity 0.4s" }}>
        <line x1="232" y1="118" x2="232" y2="156" stroke="#10b981" strokeWidth="1" opacity="0.4" />
        <rect x="182" y="156" width="110" height="26" rx="5" fill="#052916" stroke="#10b981" strokeWidth="1.1" />
        <text x="237" y="168" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#6ee7b7">Storage Credential</text>
        <text x="237" y="178" textAnchor="middle" fontSize="6" fill="#34d399" opacity="0.6">+ External Location</text>
      </g>

      {/* ─── Metastore → catalog connector bar at y=146 (step 6) ─── */}
      <g style={{ opacity: fv(6, 0.5), transition: "opacity 0.4s" }}>
        <line x1="370" y1="118" x2="370" y2="146" stroke="#f59e0b" strokeWidth="1" />
        <line x1={CATS[0].cx} y1="146" x2={CATS[2].cx} y2="146" stroke="#f59e0b" strokeWidth="1" opacity="0.65" />
        {CATS.map(c => (
          <line key={c.label} x1={c.cx} y1="146" x2={c.cx} y2={CAT_Y}
            stroke="#f59e0b" strokeWidth="1" opacity="0.7" />
        ))}
      </g>

      {/* ─── Catalogs (step 6) — 88px wide, 20px gaps, no overlap ─── */}
      <g style={{ opacity: v(6), transition: "opacity 0.4s" }}>
        {CATS.map(c => (
          <g key={c.label}>
            <rect x={c.cx - CAT_W/2} y={CAT_Y} width={CAT_W} height={CAT_H} rx="6"
              fill={c.dim ? "#1a0d00" : "#3b2702"}
              stroke={c.dim ? "#78350f" : "#f59e0b"}
              strokeWidth={c.dim ? 0.8 : 1.5}
              opacity={c.dim ? 0.5 : 0.95}
            />
            {!c.dim && <rect x={c.cx - CAT_W/2} y={CAT_Y} width={CAT_W} height="13" rx="6" fill="#f59e0b" opacity="0.2" />}
            <text x={c.cx} y={c.dim ? CAT_Y + 19 : CAT_Y + 11} textAnchor="middle"
              fontSize={c.dim ? 7.5 : 8} fontWeight={c.dim ? 500 : 700}
              fill={c.dim ? "#78350f" : "#fcd34d"}>{c.label}</text>
            {!c.dim && <text x={c.cx} y={CAT_Y + 24} textAnchor="middle" fontSize="6.5" fill="#f59e0b" opacity="0.6">Catalog</text>}
          </g>
        ))}
      </g>

      {/* ─── Binding indicators (step 9) — below catalog, above schema ─── */}
      <g style={{ opacity: v(9), transition: "opacity 0.4s" }}>
        {CATS.map(c => (
          <text key={c.label + "-b"} x={c.cx} y={CAT_Y + CAT_H + 10}
            textAnchor="middle" fontSize="6.5" fill="#06b6d4" opacity="0.75">
            &#9642; {c.binds}
          </text>
        ))}
        <text x={CATS[0].cx} y={CAT_Y + CAT_H + 20} textAnchor="start" fontSize="5.5" fill="#06b6d4" opacity="0.4" letterSpacing="0.5">workspace binding</text>
      </g>

      {/* ─── prod → schema connectors (step 7) ─── */}
      <g style={{ opacity: fv(7, 0.45), transition: "opacity 0.4s" }}>
        <line x1={CATS[2].cx} y1={CAT_Y + CAT_H} x2={CATS[2].cx} y2={SCH_Y - 10}
          stroke="#10b981" strokeWidth="1" />
        <line x1={SCH[0].cx} y1={SCH_Y - 10} x2={SCH[1].cx} y2={SCH_Y - 10}
          stroke="#10b981" strokeWidth="1" opacity="0.6" />
        {SCH.map(s => (
          <line key={s.label} x1={s.cx} y1={SCH_Y - 10} x2={s.cx} y2={SCH_Y}
            stroke="#10b981" strokeWidth="1" opacity="0.7" />
        ))}
      </g>

      {/* ─── Schemas (step 7) — 60px wide, 10px gap: bronze(485-545) gold(555-615) ─── */}
      <g style={{ opacity: v(7), transition: "opacity 0.4s" }}>
        {SCH.map(s => (
          <g key={s.label}>
            <rect x={s.cx - SCH_W/2} y={SCH_Y} width={SCH_W} height={SCH_H} rx="5"
              fill="#052916" stroke="#10b981" strokeWidth="1.2" opacity="0.9" />
            <rect x={s.cx - SCH_W/2} y={SCH_Y} width={SCH_W} height="11" rx="5" fill="#10b981" opacity="0.18" />
            <text x={s.cx} y={SCH_Y + 10} textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#6ee7b7">{s.label}</text>
            <text x={s.cx} y={SCH_Y + 21} textAnchor="middle" fontSize="5.5" fill="#34d399" opacity="0.55">Schema · prod</text>
          </g>
        ))}
      </g>

      {/* ─── Groups + grant arrows (step 8) ─── */}
      <g style={{ opacity: v(8), transition: "opacity 0.4s" }}>
        <text x="15" y="258" fontSize="6.5" fill="#64748b" opacity="0.7">Account groups (UC-native)</text>
        {([
          { label: "data_engineers",    cy: 274, color: "#0ea5e9", tx: CATS[2].cx - CAT_W/2, ty: CAT_Y + CAT_H/2, tag: "GRANT prod" },
          { label: "medicaid_analysts", cy: 304, color: "#f59e0b", tx: SCH[1].cx - SCH_W/2,  ty: SCH_Y + SCH_H/2, tag: "GRANT prod.gold" },
        ] as { label: string; cy: number; color: string; tx: number; ty: number; tag: string }[]).map(g => (
          <g key={g.label}>
            <rect x="15" y={g.cy - 12} width="136" height="24" rx="5"
              fill="#0f172a" stroke={g.color} strokeWidth="1" opacity="0.85" />
            <text x="83" y={g.cy + 4} textAnchor="middle" fontSize="7" fontWeight="600" fill={g.color}>{g.label}</text>
            <line x1="151" y1={g.cy} x2={g.tx} y2={g.ty}
              stroke={g.color} strokeWidth="1" strokeDasharray="6,3" opacity="0.35" />
            <text x={151 + (g.tx - 151) * 0.4} y={g.cy + (g.ty - g.cy) * 0.4 - 5}
              textAnchor="middle" fontSize="6" fill={g.color} opacity="0.5">{g.tag}</text>
          </g>
        ))}
      </g>

      {/* ─── Hint ─── */}
      <text x="310" y="352" textAnchor="middle" fontSize="7" fill="#334155">
        {step < 9 ? "advance to see each step build up →" : "✓ full picture assembled — every piece in place"}
      </text>
    </svg>
  );
}

// ─── Hierarchy Tab ────────────────────────────────────────────────────────────

function HierarchyTab() {
  const [step, setStep] = useState(1);
  const s = BUILDUP_STEPS[step - 1];
  const persona = PERSONAS[s.persona];
  const total = BUILDUP_STEPS.length;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Step nav */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setStep(p => Math.max(1, p - 1))}
          disabled={step === 1}
          className="rounded-lg border border-slate-700 px-3 py-1 text-[12px] text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >&#8592; Prev</button>
        <span className="text-[12px] text-slate-600 px-1">Step {step} of {total}</span>
        <button
          onClick={() => setStep(p => Math.min(total, p + 1))}
          disabled={step === total}
          className="rounded-lg border border-slate-700 px-3 py-1 text-[12px] text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >Next &#8594;</button>
        <div className="flex gap-1.5 ml-3">
          {Array.from({ length: total }, (_, i) => (
            <button key={i} onClick={() => setStep(i + 1)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ background: step === i + 1 ? persona.color : step > i + 1 ? persona.color + "55" : "#1e293b" }}
            />
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left: persona + action card */}
        <div className="w-[248px] shrink-0 flex flex-col gap-3 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              {/* Persona badge */}
              <div className="rounded-xl border p-3 space-y-1"
                style={{ borderColor: persona.color + "60", background: persona.color + "12" }}>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: persona.color }} />
                  <p className="text-[13px] font-bold" style={{ color: persona.color }}>{persona.label}</p>
                </div>
                <p className="text-[11px] pl-[18px] font-medium" style={{ color: persona.color, opacity: 0.6 }}>{persona.scope}</p>
              </div>

              {/* Title + action */}
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-3 space-y-2">
                <p className="text-[13px] font-bold text-white leading-snug">{s.title}</p>
                <p className="text-[12px] text-slate-400 leading-relaxed">{s.action}</p>
              </div>

              {/* Why it matters */}
              <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/15 p-3 space-y-1">
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Why it matters</p>
                <p className="text-[12px] text-slate-400 leading-relaxed">{s.why}</p>
              </div>

              {/* CLI / SQL snippet */}
              {s.snippet && (
                <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-2.5">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">CLI / SQL</p>
                  <pre className="text-[10px] text-emerald-400 leading-relaxed whitespace-pre-wrap">{s.snippet}</pre>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: progressive SVG */}
        <div className="flex-1 rounded-xl border border-slate-800/60 bg-slate-900/20 overflow-hidden p-2 min-h-0">
          <BuildupSVG step={step} />
        </div>
      </div>
    </div>
  );
}

// ─── Environments Tab ─────────────────────────────────────────────────────────

function EnvironmentsTab() {
  const [catMode, setCatMode] = useState<CatalogMode>("env");

  const catLabels: Record<CatalogMode, { catalogs: string[]; note: string }> = {
    env:    { catalogs: ["dev", "qa", "prod"], note: "Separate environment per catalog. Same schema structure in each." },
    domain: { catalogs: ["medicaid", "snap", "chip"], note: "Separate agency / domain per catalog. One metastore governs all." },
    hybrid: { catalogs: ["dev_medicaid", "prod_medicaid", "dev_snap", "prod_snap"], note: "Domain × Environment. Most granular isolation. Best for large multi-agency orgs." },
  };

  const { catalogs, note } = catLabels[catMode];

  const PROS = ["Single governance surface — one set of grants to manage", "Cross-environment lineage works (dev → prod table history)", "Catalog ownership structure is simple", "Adding a new environment = adding a new catalog"];
  const CONS = ["Metastore admin mistake affects all environments", "No hard regulatory wall between dev and prod data"];

  const catColor: Record<string, { stroke: string; text: string; bg: string }> = {
    dev: { stroke: "#0ea5e9", text: "#7dd3fc", bg: "#082f4940" },
    qa: { stroke: "#f59e0b", text: "#fcd34d", bg: "#3b270240" },
    prod: { stroke: "#10b981", text: "#6ee7b7", bg: "#05291640" },
    medicaid: { stroke: "#0ea5e9", text: "#7dd3fc", bg: "#082f4940" },
    snap: { stroke: "#f59e0b", text: "#fcd34d", bg: "#3b270240" },
    chip: { stroke: "#10b981", text: "#6ee7b7", bg: "#05291640" },
    dev_medicaid: { stroke: "#0ea5e9", text: "#7dd3fc", bg: "#082f4940" },
    prod_medicaid: { stroke: "#10b981", text: "#6ee7b7", bg: "#05291640" },
    dev_snap: { stroke: "#8b5cf6", text: "#c4b5fd", bg: "#2e106540" },
    prod_snap: { stroke: "#f59e0b", text: "#fcd34d", bg: "#3b270240" },
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Toggles */}
      <div className="flex gap-3 flex-wrap shrink-0">
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-2 flex items-center gap-2">
          <span className="text-[12px] text-slate-500 font-semibold shrink-0">Catalog strategy:</span>
          {(["env","domain","hybrid"] as CatalogMode[]).map(m => (
            <button key={m} onClick={() => setCatMode(m)}
              className={`text-[12px] px-3 py-1 rounded-lg border font-semibold transition-colors ${catMode === m ? "bg-amber-900/50 text-amber-300 border-amber-700" : "text-slate-500 border-slate-700 hover:text-slate-300"}`}>
              {m === "env" ? "Environment" : m === "domain" ? "Domain" : "Hybrid"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Diagram */}
        <div className="flex-1 rounded-xl border border-slate-800/60 bg-slate-900/30 p-4 overflow-y-auto space-y-4">
          <AnimatePresence mode="wait">
            <motion.div key={catMode}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex gap-2 justify-center flex-wrap">
                {catalogs.map(cat => {
                  const c = catColor[cat] ?? { stroke: "#6366f1", text: "#a5b4fc", bg: "#1e1b4b40" };
                  return (
                    <div key={cat} className="rounded-lg border px-3 py-2 text-center min-w-[80px]"
                      style={{ borderColor: c.stroke + "80", background: c.bg }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c.stroke }}>Catalog</p>
                      <p className="text-[12px] font-bold mt-0.5" style={{ color: c.text }}>{cat}</p>
                      <div className="mt-1.5 space-y-0.5">
                        {["bronze","silver","gold"].map(s => (
                          <div key={s} className="text-[9px] rounded px-1.5 py-0.5 border text-center"
                            style={{ color: "#10b981", borderColor: "#10b98130", background: "#05291620" }}>
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Catalog strategy note */}
              <div className="rounded-lg border border-amber-800/30 bg-amber-950/15 px-3 py-2">
                <p className="text-[12px] text-amber-300">{note}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pros/cons panel */}
        <div className="w-[260px] shrink-0 flex flex-col gap-3 overflow-y-auto">
          <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-3 space-y-1.5">
            <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">Pros</p>
            {PROS.map((p, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-[12px] text-slate-400 leading-relaxed">{p}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-red-900/40 bg-red-950/15 p-3 space-y-1.5">
            <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest">Cons</p>
            {CONS.map((c, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                <span className="text-[12px] text-slate-400 leading-relaxed">{c}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-indigo-800/40 bg-indigo-950/20 p-3">
            <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">When to use</p>
            <p className="text-[12px] text-slate-400 leading-relaxed">Standard enterprise Lakehouse. Catalogs provide sufficient isolation for environments and domains without the operational overhead of multiple metastores.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Groups Tab ───────────────────────────────────────────────────────────────

function privColor(priv: string): string {
  if (priv === "OWNER" || priv === "ALL" || priv === "ALL PRIV") return "bg-indigo-900/60 text-indigo-300 border-indigo-700/50";
  if (priv === "ALL PRIV") return "bg-indigo-900/60 text-indigo-300 border-indigo-700/50";
  if (priv === "USE" || priv === "USE only" || priv === "USE+SEL") return "bg-sky-900/50 text-sky-300 border-sky-800/50";
  if (priv === "SELECT") return "bg-emerald-900/50 text-emerald-300 border-emerald-800/50";
  if (priv === "—") return "bg-transparent text-slate-700 border-transparent";
  if (priv === "invisible") return "bg-red-950/30 text-red-600 border-red-900/30";
  return "bg-slate-800/40 text-slate-400 border-slate-700/40";
}

function GroupsTab() {
  const [selectedGroup, setSelectedGroup] = useState(PERMISSION_GROUPS[1].id);
  const group = PERMISSION_GROUPS.find(g => g.id === selectedGroup)!;

  return (
    <div className="h-full flex gap-4">
      {/* Matrix */}
      <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto">
        {/* Account vs workspace callout */}
        <div className="rounded-xl border border-amber-800/40 bg-amber-950/15 p-3 flex items-start gap-2.5 shrink-0">
          <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-200 leading-relaxed">
            <span className="font-bold">Define all groups at the account level.</span>{" "}
            Account-level groups are the Unity Catalog-native path — grant them on catalogs, schemas, and tables.
            Workspace-level groups are a legacy construct and <span className="text-red-400 font-semibold">do not appear in Unity Catalog grant statements</span>.
          </p>
        </div>

        {/* Permission matrix */}
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 overflow-auto shrink-0">
          <table className="w-full text-left border-collapse min-w-[520px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-[180px]">Group</th>
                {MATRIX_COLS.map(col => (
                  <th key={col.id} className="px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border ${col.level === "catalog" ? "text-amber-400 border-amber-800/50 bg-amber-950/30" : "text-emerald-400 border-emerald-800/50 bg-emerald-950/30"}`}>
                        {col.level}
                      </span>
                      <span className="text-[10px] font-mono">{col.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_GROUPS.map(g => (
                <tr
                  key={g.id}
                  onClick={() => setSelectedGroup(g.id)}
                  className={`border-b border-slate-800/50 cursor-pointer transition-colors ${selectedGroup === g.id ? "bg-slate-800/40" : "hover:bg-slate-800/20"}`}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${g.level === "account" ? "text-blue-400 border-blue-800/50 bg-blue-950/30" : "text-red-400 border-red-800/50 bg-red-950/30"}`}>
                        {g.level}
                      </span>
                      <span className="text-[12px] font-mono text-slate-300">{g.label}</span>
                    </div>
                  </td>
                  {MATRIX_COLS.map(col => {
                    const grant = g.grants.find(gr => gr.obj === col.id);
                    const display = grant?.display ?? "—";
                    return (
                      <td key={col.id} className="px-2 py-2 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${privColor(display)}`}>{display}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {[
            { label: "OWNER / ALL", cls: "bg-indigo-900/60 text-indigo-300 border-indigo-700/50" },
            { label: "USE + namespace", cls: "bg-sky-900/50 text-sky-300 border-sky-800/50" },
            { label: "SELECT (read)", cls: "bg-emerald-900/50 text-emerald-300 border-emerald-800/50" },
            { label: "— no access", cls: "text-slate-600 border-transparent" },
            { label: "invisible to UC", cls: "bg-red-950/30 text-red-600 border-red-900/30" },
          ].map(l => (
            <span key={l.label} className={`text-[10px] px-2 py-0.5 rounded border ${l.cls}`}>{l.label}</span>
          ))}
        </div>
      </div>

      {/* Group detail panel */}
      <div className="w-[260px] shrink-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={selectedGroup}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-3 space-y-3"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3.5 h-3.5 shrink-0" style={{ color: group.level === "account" ? "#3b82f6" : "#ef4444" }} />
                <p className="text-[13px] font-bold text-white font-mono">{group.label}</p>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${group.level === "account" ? "text-blue-400 border-blue-800/50 bg-blue-950/30" : "text-red-400 border-red-800/50 bg-red-950/30"}`}>
                {group.level}-level group
              </span>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed">{group.description}</p>
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Members</p>
              {group.members.map((m, i) => (
                <p key={i} className="text-[11px] font-mono text-slate-400">{m}</p>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Grants</p>
              {group.grants.filter(g => g.priv !== "NONE").map((g, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-500">{g.obj}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${privColor(g.display)}`}>{g.display}</span>
                </div>
              ))}
              {group.grants.every(g => g.priv === "NONE") && (
                <p className="text-[12px] text-red-400 italic">No Unity Catalog grants — workspace-level groups are not visible to UC.</p>
              )}
            </div>
            {group.level === "workspace" && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-2.5">
                <p className="text-[11px] text-red-300 leading-relaxed">
                  Migrate this group to an account-level group. Workspace-level groups cannot receive GRANT statements in Unity Catalog.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Workspaces Tab ───────────────────────────────────────────────────────────

const WORKSPACES_EX = [
  { id: "ws-eng", label: "ws-hhs-eng", purpose: "Data Engineering", items: ["Job clusters", "Delta Live Tables", "Notebooks"], color: "#0ea5e9", fill: "#082f49" },
  { id: "ws-bi",  label: "ws-hhs-bi",  purpose: "Business Intelligence", items: ["SQL Warehouses", "Dashboards", "Genie"], color: "#10b981", fill: "#052916" },
  { id: "ws-ml",  label: "ws-hhs-ml",  purpose: "ML Platform", items: ["GPU clusters", "MLflow", "Feature Store"], color: "#8b5cf6", fill: "#1a0a30" },
];

const CHANGE_TABLE = [
  { action: "Add a new workspace",       workspace: "New workspace only",      metastore: "No — same catalogs immediately visible" },
  { action: "Remove a workspace",        workspace: "That workspace only",      metastore: "No — data and permissions unchanged" },
  { action: "GRANT SELECT on prod.gold", workspace: "All workspaces see it",    metastore: "Yes — UC enforces it across the board" },
  { action: "DROP TABLE prod.gold.t1",   workspace: "Visible from everywhere",  metastore: "Yes — table gone from all workspaces" },
  { action: "Change cluster policy",     workspace: "That workspace only",      metastore: "No — compute only" },
  { action: "Create a new catalog",      workspace: "Visible from all attached", metastore: "Yes — new namespace in the metastore" },
];

function WorkspacesTab() {
  const [selectedWs, setSelectedWs] = useState<string | null>(null);
  const ws = selectedWs ? WORKSPACES_EX.find(w => w.id === selectedWs) : null;

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Callout */}
      <div className="rounded-xl border border-sky-800/40 bg-sky-950/15 p-3 flex items-start gap-2.5 shrink-0">
        <Database className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-sky-200 leading-relaxed">
          <span className="font-bold">A workspace is a compute and UX boundary, not a data boundary.</span>{" "}
          All workspaces attached to the same metastore share the same catalog permission graph. Adding or removing a workspace does not change who can see what data.
        </p>
      </div>

      {/* Workspace cards + metastore diagram */}
      <div className="flex gap-3 shrink-0">
        {WORKSPACES_EX.map(w => (
          <button
            key={w.id}
            onClick={() => setSelectedWs(selectedWs === w.id ? null : w.id)}
            className="flex-1 rounded-xl border text-left p-3 transition-colors"
            style={{ borderColor: selectedWs === w.id ? w.color : w.color + "40", background: selectedWs === w.id ? w.fill + "dd" : w.fill + "40" }}
          >
            <p className="text-[12px] font-bold" style={{ color: w.color }}>{w.label}</p>
            <p className="text-[11px] mt-0.5 mb-2" style={{ color: w.color, opacity: 0.65 }}>{w.purpose}</p>
            {w.items.map((item, i) => (
              <div key={i} className="text-[11px] text-slate-500 leading-loose">· {item}</div>
            ))}
          </button>
        ))}
      </div>

      {/* Connecting lines SVG */}
      <div className="h-10 shrink-0 relative">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <line x1="17%" y1="0" x2="50%" y2="100%" stroke="#334155" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#334155" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1="83%" y1="0" x2="50%" y2="100%" stroke="#334155" strokeWidth="1.5" strokeDasharray="4,3" />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#475569">attach to</text>
        </svg>
      </div>

      {/* Metastore block */}
      <div className="rounded-xl border-2 border-indigo-600/50 bg-indigo-950/20 p-3 shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <p className="text-[12px] font-bold text-indigo-300">Metastore · hhs-metastore-us-east</p>
          <span className="ml-auto text-[10px] text-indigo-500 border border-indigo-800 rounded px-1.5 py-0.5">DATA SECURITY BOUNDARY</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["dev","qa","prod"].map((c, i) => {
            const colors = [["#0ea5e9","#082f49"],["#f59e0b","#3b2702"],["#10b981","#052916"]][i];
            return (
              <div key={c} className="rounded-lg border px-3 py-1.5 text-center min-w-[80px]"
                style={{ borderColor: colors[0] + "60", background: colors[1] + "80" }}>
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: colors[0] }}>Catalog</p>
                <p className="text-[12px] font-bold" style={{ color: colors[0] }}>{c}</p>
                <p className="text-[9px] mt-1" style={{ color: colors[0], opacity: 0.55 }}>bronze · silver · gold</p>
              </div>
            );
          })}
          <div className="rounded-lg border border-slate-700/40 bg-slate-800/20 px-3 py-1.5 text-center min-w-[80px] flex items-center justify-center">
            <p className="text-[10px] text-slate-600">+ lineage<br/>audit logs<br/>grants</p>
          </div>
        </div>
      </div>

      {/* What changes table */}
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 overflow-hidden shrink-0">
        <div className="px-3 py-2 border-b border-slate-800">
          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">What Changes vs What Stays the Same</p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-800/60">
              <th className="px-3 py-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-widest">Action</th>
              <th className="px-3 py-1.5 text-[11px] font-bold text-sky-700 uppercase tracking-widest">Workspaces</th>
              <th className="px-3 py-1.5 text-[11px] font-bold text-indigo-700 uppercase tracking-widest">Metastore / Catalogs</th>
            </tr>
          </thead>
          <tbody>
            {CHANGE_TABLE.map((row, i) => (
              <tr key={i} className="border-b border-slate-800/40 last:border-0">
                <td className="px-3 py-2 text-[12px] text-slate-400">{row.action}</td>
                <td className="px-3 py-2 text-[12px] text-sky-400">{row.workspace}</td>
                <td className="px-3 py-2 text-[12px] text-indigo-400">{row.metastore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Narrative strips ─────────────────────────────────────────────────────────

const NARRATIVES: Record<UCTab, string> = {
  hierarchy: "The metastore is the security perimeter for data. Everything else — workspaces, clusters, notebooks — is just a way to access what the metastore controls.",
  environments: "In most cases, one metastore with three catalogs (dev / qa / prod) is the right answer. Use a second metastore only when a regulatory wall must be physically enforced.",
  groups: "Define all groups at the account level. Grant them on catalogs and schemas. Workspace-level groups are a legacy path that does not integrate with Unity Catalog.",
  workspaces: "Adding a workspace doesn't change who can see what. Permissions live in the metastore, not the workspace. Think of workspaces as different doors into the same data estate.",
};

// ─── Chapter 15 ──────────────────────────────────────────────────────────────

export function Chapter15() {
  const [tab, setTab] = useState<UCTab>("hierarchy");

  const TABS: { id: UCTab; label: string }[] = [
    { id: "hierarchy",    label: "Hierarchy" },
    { id: "environments", label: "Environments" },
    { id: "groups",       label: "Teams & Groups" },
    { id: "workspaces",   label: "Workspaces" },
  ];

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Tab bar */}
      <div className="flex gap-1 shrink-0 rounded-xl border border-slate-800/60 bg-slate-900/30 p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-[13px] font-semibold py-1.5 rounded-lg transition-colors ${tab === t.id ? "bg-indigo-900/50 text-indigo-300 border border-indigo-700/60" : "text-slate-500 hover:text-slate-300"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}
            className="h-full"
          >
            {tab === "hierarchy"    && <HierarchyTab />}
            {tab === "environments" && <EnvironmentsTab />}
            {tab === "groups"       && <GroupsTab />}
            {tab === "workspaces"   && <WorkspacesTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Narrative strip */}
      <div className="shrink-0 rounded-lg border border-indigo-900/40 bg-indigo-950/15 px-4 py-2">
        <p className="text-[12px] text-indigo-300/80 italic leading-relaxed">{NARRATIVES[tab]}</p>
      </div>
    </div>
  );
}
