import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertTriangle, Users, ChevronRight, Database, Shield } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UCLevel = "account" | "metastore" | "workspace" | "catalog" | "schema" | "table";
type MetastoreMode = "single" | "multi";
type CatalogMode = "env" | "domain" | "hybrid";
type UCTab = "hierarchy" | "environments" | "groups" | "workspaces";

interface NodeMeta {
  id: string; level: UCLevel; label: string; sublabel: string;
  stroke: string; fill: string; textColor: string;
  definition: string; owner: string; ownerNote: string;
  configChoices: string[]; mistake: string; mistakeFix: string;
  permExample?: string;
}

// ─── Node Metadata ────────────────────────────────────────────────────────────

const NODES: Record<string, NodeMeta> = {
  account: {
    id: "account", level: "account", label: "Account", sublabel: "Databricks Account",
    stroke: "#64748b", fill: "#0f172a60", textColor: "#cbd5e1",
    definition: "The top-level Databricks contract entity. All workspaces, users, metastores, and billing belong to a single account. The account is your identity root — your IdP (Entra ID / Okta) syncs here.",
    owner: "Account Admin", ownerNote: "Central platform team. Can create workspaces and grant metastore admin. Does NOT control data permissions — that's the metastore admin.",
    configChoices: ["One account per organization (standard)", "IdP synced at account level (users + account-level groups)", "Account console: accounts.azuredatabricks.net / accounts.cloud.databricks.com"],
    mistake: "Confusing 'account admin' with 'metastore admin'.",
    mistakeFix: "Account admin = manages workspaces and identity. Metastore admin = manages Unity Catalog governance. These should be separate people for least-privilege.",
  },
  metastore: {
    id: "metastore", level: "metastore", label: "Metastore", sublabel: "Unity Catalog · Data Security Boundary",
    stroke: "#6366f1", fill: "#1e1b4b50", textColor: "#a5b4fc",
    definition: "The top-level Unity Catalog container. It owns all catalogs, schemas, tables, grants, lineage, and audit logs. One metastore per region per regulatory boundary. The metastore IS the data security perimeter — not the workspace.",
    owner: "Metastore Admin", ownerNote: "Granted in the account console. Can create catalogs and assign catalog-level owners. Typically your data platform governance team.",
    configChoices: ["One metastore per region (recommended default)", "Separate metastore per compliance boundary (FedRAMP High, HIPAA strict air-gap)", "Storage root: default managed storage for all tables without explicit location"],
    mistake: "Creating multiple metastores for team or environment isolation.",
    mistakeFix: "Catalogs + groups are sufficient for team and environment isolation within one metastore. Multiple metastores only when a hard regulatory wall is required (audit separation, physical air-gap).",
    permExample: "GRANT CREATE CATALOG ON METASTORE TO platform_admins;",
  },
  workspace: {
    id: "workspace", level: "workspace", label: "Workspace", sublabel: "Compute & UX · Not a data boundary",
    stroke: "#0ea5e9", fill: "#082f4950", textColor: "#7dd3fc",
    definition: "A Databricks UI and API endpoint for running notebooks, jobs, clusters, and SQL warehouses. Workspaces attach to a metastore — they do NOT own data or permissions. Two users in different workspaces on the same metastore share the same catalog access rules.",
    owner: "Workspace Admin", ownerNote: "Manages clusters, compute policies, and workspace-level settings. Cannot grant Unity Catalog data permissions — those live on the metastore.",
    configChoices: ["Multiple workspaces per metastore (eng / BI / ML workspaces)", "Workspace isolation = compute + UX isolation, never data isolation", "All workspaces on one metastore see the same catalog permission graph"],
    mistake: "Using workspace separation as a data isolation strategy.",
    mistakeFix: "Two workspaces on the same metastore = same data visibility based on UC grants. Use catalog or schema grants to isolate data access. Workspace only controls what compute users can run.",
  },
  catalog: {
    id: "catalog", level: "catalog", label: "Catalog", sublabel: "Namespace · Isolation Unit",
    stroke: "#f59e0b", fill: "#3b270250", textColor: "#fcd34d",
    definition: "The first-level namespace inside a metastore. Catalogs are the natural unit of environment isolation (dev / qa / prod) or domain isolation (sales / finance / hr). Permissions granted at the catalog level cascade down to all schemas and tables within.",
    owner: "Catalog Owner (account group)", ownerNote: "Ideally an account-level group such as platform_admins. Catalog owners can grant on that catalog. Avoid individual users as owners.",
    configChoices: ["Pattern A: one catalog per environment — dev, qa, prod", "Pattern B: one catalog per domain — medicaid, snap, chip", "Pattern C: hybrid — dev_medicaid, prod_medicaid, dev_snap, prod_snap"],
    mistake: "One giant catalog containing everything.",
    mistakeFix: "Without catalog separation a grant mistake affects all environments simultaneously. At minimum separate dev from prod. Prefer hybrid if you have multiple domains and teams.",
    permExample: "GRANT USE CATALOG, USE SCHEMA ON CATALOG prod TO analysts;\nGRANT CREATE SCHEMA, CREATE TABLE ON CATALOG dev TO data_engineers;",
  },
  schema: {
    id: "schema", level: "schema", label: "Schema", sublabel: "Table Grouping · Data Layer",
    stroke: "#10b981", fill: "#05291650", textColor: "#6ee7b7",
    definition: "The second-level namespace inside a catalog. Schemas group related tables and views. Commonly map to medallion layers (bronze / silver / gold) or team domains. Permissions cascade from schema to all tables within it.",
    owner: "Schema Owner (team group)", ownerNote: "Typically the team that writes to the schema. Pipeline service principals own bronze; analytics teams own gold.",
    configChoices: ["Layer pattern: bronze, silver, gold per catalog", "PII pattern: pii_raw (strict) and pii_masked (exposed via views)", "Team pattern: one schema per source system or agency"],
    mistake: "Granting ALL PRIVILEGES on a schema to all data engineers.",
    mistakeFix: "ALL PRIVILEGES lets users DROP tables and schemas. Grant CREATE TABLE + MODIFY to pipeline accounts, SELECT to analysts, MODIFY only to schema owners.",
    permExample: "GRANT SELECT ON SCHEMA prod.gold TO analysts;\nGRANT MODIFY ON SCHEMA dev.bronze TO pipeline_svc;\nGRANT ALL PRIVILEGES ON SCHEMA dev.bronze TO data_engineers;",
  },
  table: {
    id: "table", level: "table", label: "Table / View", sublabel: "Managed · External · View",
    stroke: "#8b5cf6", fill: "#2e106550", textColor: "#c4b5fd",
    definition: "Leaf objects in the hierarchy. Managed tables store data inside the metastore root. External tables point to storage you manage. Views can enforce column masks (mask SSN for non-admins) and row filters (filter by agency_id) without duplicating data.",
    owner: "Table Owner (service principal or team group)", ownerNote: "The creator of the table. Can GRANT SELECT, MODIFY on it. Prefer service principal ownership for production tables.",
    configChoices: ["Managed: data in metastore root, fully lifecycle-managed by UC", "External: data in your ADLS/S3 path, you manage lifecycle", "Dynamic view: column mask on PII fields + row filter on tenant_id"],
    mistake: "Mixing PII and non-PII columns in the same table, then trying to mask per user at query time.",
    mistakeFix: "Separate PII columns into pii_raw table. Expose a view in pii_masked schema that applies a column mask. Grant analysts only to the view — the underlying table is never directly accessible.",
    permExample: "GRANT SELECT ON VIEW prod.gold.claims_clean TO medicaid_analysts;\n-- claims_clean applies: CASE WHEN is_member('phi_authorized') THEN ssn ELSE '***' END",
  },
};

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

// ─── Hierarchy SVG ────────────────────────────────────────────────────────────

type SelectedNode = keyof typeof NODES | null;

function HierarchySVG({ selected, onSelect }: { selected: SelectedNode; onSelect: (id: SelectedNode) => void }) {
  const ws = [
    { id: "ws1", label: "ws-hhs-eng",  y: 190 },
    { id: "ws2", label: "ws-hhs-bi",   y: 233 },
    { id: "ws3", label: "ws-hhs-ml",   y: 276 },
  ];
  const cats = [
    { id: "cat-dev",  label: "dev",  cx: 345, dim: true  },
    { id: "cat-qa",   label: "qa",   cx: 455, dim: true  },
    { id: "cat-prod", label: "prod", cx: 565, dim: false },
  ];
  const nodeColor = (id: SelectedNode) => id === selected ? "2" : "1.2";

  return (
    <svg viewBox="0 0 720 460" className="w-full h-full" style={{ fontFamily: "ui-monospace, monospace" }}>
      {/* ── connectors ── */}
      {/* Account → Metastore */}
      <line x1="360" y1="52" x2="360" y2="90" stroke="#475569" strokeWidth="1.5" />
      {/* Metastore → workspace branch */}
      <line x1="255" y1="130" x2="108" y2="178" stroke="#0ea5e9" strokeWidth="1.2" strokeDasharray="5,4" opacity="0.5" />
      {/* Workspace vertical bracket */}
      <line x1="108" y1="178" x2="108" y2="291" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
      {ws.map(w => <line key={w.id} x1="108" y1={w.y + 15} x2="132" y2={w.y + 15} stroke="#0ea5e9" strokeWidth="1" opacity="0.4" />)}
      {/* Metastore → catalog bar */}
      <line x1="465" y1="130" x2="565" y2="178" stroke="#f59e0b" strokeWidth="1.2" opacity="0.45" />
      <line x1="345" y1="178" x2="565" y2="178" stroke="#f59e0b" strokeWidth="1" opacity="0.3" />
      <line x1="345" y1="178" x2="345" y2="188" stroke="#f59e0b" strokeWidth="1" opacity="0.4" />
      <line x1="455" y1="178" x2="455" y2="188" stroke="#f59e0b" strokeWidth="1" opacity="0.4" />
      <line x1="565" y1="178" x2="565" y2="188" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
      {/* prod → schemas */}
      <line x1="565" y1="220" x2="565" y2="264" stroke="#10b981" strokeWidth="1" opacity="0.5" />
      <line x1="520" y1="264" x2="620" y2="264" stroke="#10b981" strokeWidth="1" opacity="0.4" />
      <line x1="520" y1="264" x2="520" y2="272" stroke="#10b981" strokeWidth="1" opacity="0.4" />
      <line x1="620" y1="264" x2="620" y2="272" stroke="#10b981" strokeWidth="1" opacity="0.5" />
      {/* gold → tables */}
      <line x1="620" y1="300" x2="620" y2="340" stroke="#8b5cf6" strokeWidth="1" opacity="0.5" />
      <line x1="588" y1="340" x2="652" y2="340" stroke="#8b5cf6" strokeWidth="1" opacity="0.35" />
      <line x1="588" y1="340" x2="588" y2="346" stroke="#8b5cf6" strokeWidth="1" opacity="0.35" />
      <line x1="652" y1="340" x2="652" y2="346" stroke="#8b5cf6" strokeWidth="1" opacity="0.35" />

      {/* ── labels on connectors ── */}
      <text x="78" y="160" fontSize="7" fill="#0ea5e9" opacity="0.6" textAnchor="middle">attached</text>
      <text x="78" y="169" fontSize="7" fill="#0ea5e9" opacity="0.5" textAnchor="middle">(not owned)</text>
      <text x="490" y="175" fontSize="7" fill="#f59e0b" opacity="0.55">owns →</text>

      {/* ── Security boundary label ── */}
      <rect x="216" y="88" width="288" height="46" rx="8" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="1,0" opacity="0.25" />
      <rect x="430" y="82" width="106" height="13" rx="3" fill="#1e1b4b" opacity="0.9" />
      <text x="483" y="91" textAnchor="middle" fontSize="6.5" fill="#818cf8" fontWeight="700" opacity="0.9">DATA SECURITY BOUNDARY</text>

      {/* ── Account node ── */}
      <g onClick={() => onSelect(selected === "account" ? null : "account")} style={{ cursor: "pointer" }}>
        {selected === "account" && <rect x="250" y="8" width="220" height="40" rx="10" fill="#64748b" opacity="0.15" filter="url(#hw15glow)" />}
        <rect x="255" y="12" width="210" height="36" rx="7" fill="#0f172a" stroke={selected === "account" ? "#94a3b8" : "#475569"} strokeWidth={nodeColor("account")} />
        <rect x="255" y="12" width="210" height="16" rx="7" fill="#475569" opacity="0.2" />
        <rect x="255" y="20" width="210" height="8" fill="#475569" opacity="0.2" />
        <text x="360" y="25" textAnchor="middle" fontSize="9" fontWeight="700" fill="#cbd5e1">Account</text>
        <text x="360" y="39" textAnchor="middle" fontSize="7" fill="#94a3b8" opacity="0.6">Databricks Account · Identity Root</text>
      </g>

      {/* ── Metastore node ── */}
      <g onClick={() => onSelect(selected === "metastore" ? null : "metastore")} style={{ cursor: "pointer" }}>
        {selected === "metastore" && <rect x="248" y="87" width="224" height="48" rx="10" fill="#6366f1" opacity="0.12" filter="url(#hw15glow)" />}
        <rect x="253" y="90" width="214" height="42" rx="8" fill="#1e1b4b" stroke={selected === "metastore" ? "#818cf8" : "#6366f1"} strokeWidth={nodeColor("metastore")} />
        <rect x="253" y="90" width="214" height="17" rx="8" fill="#6366f1" opacity="0.2" />
        <rect x="253" y="99" width="214" height="8" fill="#6366f1" opacity="0.2" />
        <text x="360" y="103" textAnchor="middle" fontSize="9" fontWeight="700" fill="#a5b4fc">Metastore</text>
        <text x="360" y="119" textAnchor="middle" fontSize="7" fill="#818cf8" opacity="0.7">Unity Catalog · hhs-metastore-us-east</text>
      </g>

      {/* ── Workspace nodes ── */}
      {ws.map(w => (
        <g key={w.id} onClick={() => onSelect(selected === "workspace" ? null : "workspace")} style={{ cursor: "pointer" }}>
          {selected === "workspace" && <rect x="126" y={w.y - 4} width="163" height="38" rx="8" fill="#0ea5e9" opacity="0.08" />}
          <rect x="130" y={w.y} width="155" height="30" rx="6" fill="#082f49" stroke={selected === "workspace" ? "#38bdf8" : "#0ea5e9"} strokeWidth={nodeColor("workspace")} opacity="0.9" />
          <rect x="130" y={w.y} width="155" height="13" rx="6" fill="#0ea5e9" opacity="0.18" />
          <rect x="130" y={w.y + 8} width="155" height="5" fill="#0ea5e9" opacity="0.18" />
          <text x="207" y={w.y + 11} textAnchor="middle" fontSize="8" fontWeight="600" fill="#7dd3fc">{w.label}</text>
          <text x="207" y={w.y + 24} textAnchor="middle" fontSize="6.5" fill="#38bdf8" opacity="0.55">Workspace</text>
        </g>
      ))}

      {/* ── Catalog nodes ── */}
      {cats.map(c => (
        <g key={c.id} onClick={() => onSelect(selected === "catalog" ? null : "catalog")} style={{ cursor: "pointer" }}>
          {selected === "catalog" && !c.dim && <rect x={c.cx - 53} y="184" width="106" height="38" rx="8" fill="#f59e0b" opacity="0.10" />}
          <rect x={c.cx - 49} y="188" width="98" height="30" rx="6"
            fill={c.dim ? "#1a0d00" : "#3b2702"}
            stroke={selected === "catalog" && !c.dim ? "#fbbf24" : "#f59e0b"}
            strokeWidth={!c.dim ? nodeColor("catalog") : "0.7"}
            opacity={c.dim ? 0.45 : 0.95}
          />
          {!c.dim && <rect x={c.cx - 49} y="188" width="98" height="13" rx="6" fill="#f59e0b" opacity="0.2" />}
          {!c.dim && <rect x={c.cx - 49} y="196" width="98" height="5" fill="#f59e0b" opacity="0.2" />}
          <text x={c.cx} y={c.dim ? "208" : "200"} textAnchor="middle" fontSize="8" fontWeight={c.dim ? "500" : "700"} fill={c.dim ? "#78350f" : "#fcd34d"}>
            {c.label}
          </text>
          {!c.dim && <text x={c.cx} y="214" textAnchor="middle" fontSize="6.5" fill="#f59e0b" opacity="0.6">Catalog</text>}
        </g>
      ))}

      {/* ── Schema nodes ── */}
      {[{ id: "sch1", label: "bronze", cx: 520 }, { id: "sch2", label: "gold", cx: 620 }].map(s => (
        <g key={s.id} onClick={() => onSelect(selected === "schema" ? null : "schema")} style={{ cursor: "pointer" }}>
          {selected === "schema" && s.label === "gold" && <rect x={s.cx - 49} y="268" width="98" height="36" rx="7" fill="#10b981" opacity="0.1" />}
          <rect x={s.cx - 46} y="272" width="92" height="28" rx="5"
            fill="#052916" stroke={selected === "schema" ? "#34d399" : "#10b981"}
            strokeWidth={nodeColor("schema")} opacity="0.9"
          />
          <rect x={s.cx - 46} y="272" width="92" height="12" rx="5" fill="#10b981" opacity="0.18" />
          <text x={s.cx} y="282" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#6ee7b7">{s.label}</text>
          <text x={s.cx} y="294" textAnchor="middle" fontSize="6" fill="#34d399" opacity="0.55">Schema</text>
        </g>
      ))}

      {/* ── Table/View nodes ── */}
      {[
        { id: "t1", label: "claims_final", sub: "managed table", cx: 588, y: 346 },
        { id: "t2", label: "claims_clean", sub: "view + col mask", cx: 652, y: 346 },
      ].map(t => (
        <g key={t.id} onClick={() => onSelect(selected === "table" ? null : "table")} style={{ cursor: "pointer" }}>
          <rect x={t.cx - 60} y={t.y} width="122" height="44" rx="5"
            fill="#1a0a30" stroke={selected === "table" ? "#a78bfa" : "#7c3aed"}
            strokeWidth={nodeColor("table")} opacity="0.9"
          />
          <rect x={t.cx - 60} y={t.y} width="122" height="12" rx="5" fill="#7c3aed" opacity="0.18" />
          <text x={t.cx} y={t.y + 11} textAnchor="middle" fontSize="7" fontWeight="600" fill="#c4b5fd">{t.label}</text>
          <text x={t.cx} y={t.y + 24} textAnchor="middle" fontSize="6" fill="#a78bfa" opacity="0.65">{t.sub}</text>
          <text x={t.cx} y={t.y + 35} textAnchor="middle" fontSize="6" fill="#7c3aed" opacity="0.55">prod.gold.*</text>
        </g>
      ))}

      {/* ── Click hint ── */}
      <text x="360" y="450" textAnchor="middle" fontSize="7.5" fill="#334155">Click any object to see definition · owner · common mistakes</text>

      <defs>
        <filter id="hw15glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
    </svg>
  );
}

// ─── Hierarchy Tab ────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<UCLevel, string> = {
  account: "#64748b", metastore: "#6366f1", workspace: "#0ea5e9",
  catalog: "#f59e0b", schema: "#10b981", table: "#8b5cf6",
};

function HierarchyTab() {
  const [selected, setSelected] = useState<SelectedNode>("metastore");
  const meta = selected ? NODES[selected] : null;

  return (
    <div className="h-full flex gap-4">
      {/* Diagram */}
      <div className="flex-1 rounded-xl border border-slate-800/60 bg-slate-900/30 overflow-hidden p-2 min-h-0">
        <HierarchySVG selected={selected} onSelect={setSelected} />
      </div>

      {/* Detail panel */}
      <div className="w-[280px] flex flex-col gap-3 shrink-0 overflow-y-auto">
        {/* Level legend */}
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-3 space-y-1.5 shrink-0">
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-2">Object Levels</p>
          {(["account","metastore","workspace","catalog","schema","table"] as UCLevel[]).map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelected(lvl === selected ? null : lvl as SelectedNode)}
              className={`w-full flex items-center gap-2 text-left py-0.5 px-1 rounded transition-colors ${selected === lvl ? "bg-slate-800/60" : "hover:bg-slate-800/30"}`}
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: LEVEL_COLORS[lvl] }} />
              <span className="text-[12px] capitalize" style={{ color: LEVEL_COLORS[lvl] }}>{lvl}</span>
            </button>
          ))}
        </div>

        {/* Node detail */}
        <AnimatePresence mode="wait">
          {meta && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="flex-1 rounded-xl border border-slate-800/60 bg-slate-900/30 p-3 space-y-3 overflow-y-auto"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: meta.stroke }} />
                  <p className="text-sm font-bold text-white">{meta.label}</p>
                </div>
                <p className="text-[12px] pl-4" style={{ color: meta.stroke }}>{meta.sublabel}</p>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed">{meta.definition}</p>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Owner</p>
                <p className="text-[13px] text-slate-300 font-semibold">{meta.owner}</p>
                <p className="text-[12px] text-slate-500 leading-relaxed">{meta.ownerNote}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Design Choices</p>
                {meta.configChoices.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                    <span className="text-[12px] text-slate-400 leading-relaxed">{c}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-2.5 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                  <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest">Common Mistake</p>
                </div>
                <p className="text-[12px] text-red-300 leading-relaxed">{meta.mistake}</p>
                <p className="text-[12px] text-slate-400 leading-relaxed">{meta.mistakeFix}</p>
              </div>
              {meta.permExample && (
                <div className="rounded-lg bg-slate-900/60 border border-slate-700/50 p-2">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Example SQL</p>
                  <pre className="text-[11px] text-emerald-400 leading-relaxed whitespace-pre-wrap">{meta.permExample}</pre>
                </div>
              )}
            </motion.div>
          )}
          {!meta && (
            <motion.div
              key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex-1 rounded-xl border border-slate-800/40 bg-slate-900/20 flex items-center justify-center"
            >
              <p className="text-[13px] text-slate-600 text-center px-4">Click any object in the diagram to explore its role in the hierarchy.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Environments Tab ─────────────────────────────────────────────────────────

function EnvironmentsTab() {
  const [msMode, setMsMode] = useState<MetastoreMode>("single");
  const [catMode, setCatMode] = useState<CatalogMode>("env");

  const catLabels: Record<CatalogMode, { catalogs: string[]; note: string }> = {
    env:    { catalogs: ["dev", "qa", "prod"], note: "Separate environment per catalog. Same schema structure in each." },
    domain: { catalogs: ["medicaid", "snap", "chip"], note: "Separate agency / domain per catalog. One metastore governs all." },
    hybrid: { catalogs: ["dev_medicaid", "prod_medicaid", "dev_snap", "prod_snap"], note: "Domain × Environment. Most granular isolation. Best for large multi-agency orgs." },
  };

  const { catalogs, note } = catLabels[catMode];

  const PROS_CONS = {
    single: {
      pros: ["Single governance surface — one set of grants to manage", "Cross-environment lineage works (dev → prod table history)", "Catalog ownership structure is simple", "Adding a new environment = adding a new catalog"],
      cons: ["Metastore admin mistake affects all environments", "No hard regulatory wall between dev and prod data", "A dropped metastore drops everything"],
      when: "Standard enterprise Lakehouse. No regulatory requirement to physically air-gap dev from production PII.",
    },
    multi: {
      pros: ["Hard regulatory boundary — separate audit logs per metastore", "Separate metastore admins (regulated vs non-regulated)", "Physical air-gap: dev never touches prod PII", "Separate storage roots per compliance tier"],
      cons: ["No cross-metastore lineage", "Data must be physically copied to cross boundaries", "Two sets of metastore configs and admins to maintain", "More complex Identity setup"],
      when: "FedRAMP High, HIPAA strict air-gap, or legal requirement to separate PHI from non-PHI with independent audit trails.",
    },
  };

  const pc = PROS_CONS[msMode];

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
          <span className="text-[12px] text-slate-500 font-semibold shrink-0">Metastores:</span>
          {(["single","multi"] as MetastoreMode[]).map(m => (
            <button key={m} onClick={() => setMsMode(m)}
              className={`text-[12px] px-3 py-1 rounded-lg border font-semibold transition-colors ${msMode === m ? "bg-indigo-900/50 text-indigo-300 border-indigo-700" : "text-slate-500 border-slate-700 hover:text-slate-300"}`}>
              {m === "single" ? "1 Metastore" : "Multi-Metastore"}
            </button>
          ))}
        </div>
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
            <motion.div key={`${msMode}-${catMode}`}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {msMode === "single" ? (
                <div className="space-y-3">
                  {/* Account */}
                  <div className="flex justify-center">
                    <div className="rounded-lg border border-slate-600/50 bg-slate-800/40 px-6 py-2 text-center">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Account</p>
                      <p className="text-[12px] text-slate-300 font-semibold">HHS Databricks Account</p>
                    </div>
                  </div>
                  <div className="flex justify-center"><div className="w-px h-4 bg-indigo-700/50" /></div>
                  {/* Single metastore */}
                  <div className="flex justify-center">
                    <div className="rounded-xl border-2 border-indigo-600/60 bg-indigo-950/30 px-8 py-3 text-center min-w-[280px]">
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Metastore · Data Security Boundary</p>
                      <p className="text-[13px] text-indigo-300 font-bold mt-0.5">hhs-metastore-us-east</p>
                      <div className="mt-3 flex gap-2 justify-center flex-wrap">
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
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="rounded-lg border border-slate-600/50 bg-slate-800/40 px-6 py-2 text-center">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Account</p>
                      <p className="text-[12px] text-slate-300 font-semibold">HHS Databricks Account</p>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <div className="flex-1 rounded-xl border-2 border-red-700/50 bg-red-950/20 p-3">
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Metastore · Regulated</p>
                      <p className="text-[12px] text-red-300 font-bold">hhs-ms-fedramp</p>
                      <p className="text-[10px] text-red-400/60 mb-2">PHI · FedRAMP boundary</p>
                      <div className="space-y-1.5">
                        {["prod_phi","prod_non_phi"].map(c => (
                          <div key={c} className="rounded border border-red-800/40 bg-red-900/10 px-2 py-1 text-[11px] text-red-300">{c}</div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 rounded-xl border-2 border-sky-700/50 bg-sky-950/20 p-3">
                      <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1">Metastore · Non-Regulated</p>
                      <p className="text-[12px] text-sky-300 font-bold">hhs-ms-dev</p>
                      <p className="text-[10px] text-sky-400/60 mb-2">Non-PHI · Dev / QA work</p>
                      <div className="space-y-1.5">
                        {["dev","qa","sandbox"].map(c => (
                          <div key={c} className="rounded border border-sky-800/40 bg-sky-900/10 px-2 py-1 text-[11px] text-sky-300">{c}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Catalog strategy note */}
              <div className="rounded-lg border border-amber-800/30 bg-amber-950/15 px-3 py-2">
                <p className="text-[12px] text-amber-300">{note}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pros/cons panel */}
        <div className="w-[260px] shrink-0 flex flex-col gap-3 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={msMode}
              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-3 space-y-1.5">
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">Pros</p>
                {pc.pros.map((p, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-[12px] text-slate-400 leading-relaxed">{p}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-red-900/40 bg-red-950/15 p-3 space-y-1.5">
                <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest">Cons</p>
                {pc.cons.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-[12px] text-slate-400 leading-relaxed">{c}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-indigo-800/40 bg-indigo-950/20 p-3">
                <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">When to use</p>
                <p className="text-[12px] text-slate-400 leading-relaxed">{pc.when}</p>
              </div>
            </motion.div>
          </AnimatePresence>
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
