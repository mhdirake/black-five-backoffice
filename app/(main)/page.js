"use client";

import { useCallback, useEffect, useState } from "react";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import GavelIcon from "@mui/icons-material/Gavel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Grid from "@mui/material/Grid2";
import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSession } from "next-auth/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dashboardApi } from "@/store/slices/dashboard/dashboardApi";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) => {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (isNaN(num)) return "—";
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (num >= 1_000_000)     return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000)         return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toLocaleString("en-US");
};

const fmtFull = (n) => n != null ? Number(n).toLocaleString("en-US") + " T" : "—";

function mergeSeries(seriesMap) {
  const map = {};
  for (const [key, arr] of Object.entries(seriesMap)) {
    for (const { date, amount } of arr) {
      if (!map[date]) map[date] = { date };
      map[date][key] = Number(amount);
    }
  }
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const PERIODS = [
  { label: "۷ روز",  value: 7  },
  { label: "۳۰ روز", value: 30 },
  { label: "۹۰ روز", value: 90 },
];

const SERIES_LABELS = {
  deposits:    "واریزها",
  ticket_sales:"فروش بلیت",
  withdrawals: "برداشت‌ها",
  auction_wins:"برندگان حراج",
};

const SERIES_COLORS = {
  deposits:    "#fbbf24",
  ticket_sales:"#22ab94",
  withdrawals: "#f87171",
  auction_wins:"#60a5fa",
};

const STATUS_COLORS = {
  draft:     "#64748b",
  active:    "#22ab94",
  running:   "#60a5fa",
  ended:     "#94a3b8",
  cancelled: "#f87171",
  pending:   "#fb923c",
  finished:  "#4ade80",
};

const STATUS_LABELS = {
  draft:     "پیش‌نویس",
  active:    "فعال",
  running:   "در حال اجرا",
  ended:     "پایان‌یافته",
  cancelled: "لغو‌شده",
  pending:   "در انتظار",
  finished:  "تمام‌شده",
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function CardLabel({ children }) {
  return (
    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.07em", mb: 0.5, textTransform: "uppercase" }}>
      {children}
    </Typography>
  );
}

function CardValue({ children, loading, size = "lg" }) {
  if (loading) return <Skeleton variant="text" width={70} height={size === "lg" ? 40 : 30} sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 1 }} />;
  return (
    <Typography sx={{
      fontSize: size === "lg" ? 30 : 22,
      fontWeight: 800,
      color: "rgba(255,255,255,0.97)",
      lineHeight: 1,
      direction: "ltr",
      letterSpacing: "-0.03em",
      fontFeatureSettings: '"tnum"',
      fontVariantNumeric: "tabular-nums",
    }}>
      {children}
    </Typography>
  );
}

export function SectionLabel({ children, icon: Icon }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2 }}>
      {Icon && <Icon sx={{ fontSize: 15, color: "rgba(255,255,255,0.3)" }} />}
      <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {children}
      </Typography>
    </Box>
  );
}

function EmptyState({ message = "موردی برای نمایش وجود ندارد" }) {
  return (
    <Box sx={{ py: 3.5, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.25 }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: "10px",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <InboxOutlinedIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.2)" }} />
      </Box>
      <Typography sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.25)" }}>{message}</Typography>
    </Box>
  );
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: "#000c1e",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "10px", p: "10px 14px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
    }}>
      <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.35)", mb: 1.25, direction: "ltr" }}>{label}</Typography>
      {payload.map((p) => (
        <Box key={p.dataKey} sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 0.6 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: p.color, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.8)", direction: "ltr" }}>
            <span style={{ color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>{SERIES_LABELS[p.dataKey]}:</span>
            {" "}{fmtFull(p.value)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// Compact metric pill — used for secondary row
function MetricPill({ icon: Icon, label, value, colorKey = "info", loading }) {
  return (
    <MetricPillRoot colorKey={colorKey}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <PillIcon colorKey={colorKey}>
          <Icon sx={{ fontSize: 16, color: `${colorKey}.main` }} />
        </PillIcon>
        <Box>
          <CardLabel>{label}</CardLabel>
          <CardValue loading={loading} size="sm">{value}</CardValue>
        </Box>
      </Box>
    </MetricPillRoot>
  );
}

// Primary KPI card
function PrimaryKpiCard({ icon: Icon, label, value, colorKey = "secondary", loading, accent }) {
  return (
    <PrimaryCardRoot colorKey={colorKey} accent={accent ? 1 : 0}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
        <KpiIcon colorKey={colorKey}>
          <Icon sx={{ fontSize: 20, color: `${colorKey}.main` }} />
        </KpiIcon>
        {accent && (
          <Box sx={{
            px: 1, py: 0.3, borderRadius: "5px",
            background: "rgba(253,197,0,0.1)", border: "1px solid rgba(253,197,0,0.18)",
          }}>
            <Typography sx={{ fontSize: 8.5, fontWeight: 700, color: "#fdc500", letterSpacing: "0.06em" }}>TOP</Typography>
          </Box>
        )}
      </Box>
      <CardLabel>{label}</CardLabel>
      <CardValue loading={loading}>{value}</CardValue>
    </PrimaryCardRoot>
  );
}

// Status badge
function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] ?? "#64748b";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.5,
      px: 0.9, py: 0.3, borderRadius: "5px",
      background: color + "14", border: `1px solid ${color}28`,
    }}>
      <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 10, fontWeight: 600, color, letterSpacing: "0.02em" }}>{label}</Typography>
    </Box>
  );
}

// Auction status bars
function AuctionStatusBars({ data, loading }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={28} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1 }} />
        ))}
      </Box>
    );
  }
  if (!data.length) return <EmptyState />;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {data.map(({ name, value }) => {
        const color = STATUS_COLORS[name] ?? "#64748b";
        const label = STATUS_LABELS[name] ?? name;
        const pct = Math.round((value / total) * 100);
        return (
          <Box key={name}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.7 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 11.5, fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>{label}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>{pct}%</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)", minWidth: 18, textAlign: "right" }}>{value}</Typography>
              </Box>
            </Box>
            <Box sx={{ height: 5, borderRadius: "3px", background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
              <Box sx={{
                height: "100%", borderRadius: "3px",
                width: `${pct}%`,
                background: color,
                opacity: 0.75,
                transition: "width 700ms cubic-bezier(.4,0,.2,1)",
              }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// Compact alert list row
function AlertListRow({ label, sub, variant = "default" }) {
  const dotColor = variant === "danger" ? "#f87171" : variant === "warning" ? "#fb923c" : "rgba(255,255,255,0.2)";
  return (
    <Box sx={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      py: 0.9, gap: 1.5,
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      "&:last-child": { borderBottom: "none" },
      "&:hover": { "& .alert-label": { color: "rgba(255,255,255,0.85)" } },
      transition: "all 150ms",
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: dotColor, flexShrink: 0 }} />
        <Typography className="alert-label" sx={{ fontSize: 12, color: variant === "danger" ? "#f87171" : "rgba(255,255,255,0.65)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</Typography>
      </Box>
      {sub && <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{sub}</Typography>}
    </Box>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name;

  const [days, setDays]               = useState(30);
  const [overview, setOverview]       = useState(null);
  const [revenue, setRevenue]         = useState(null);
  const [auctionData, setAuctionData] = useState(null);
  const [operations, setOperations]   = useState(null);
  const [loading, setLoading]         = useState(true);

  const GRID_COLOR = "rgba(255,255,255,0.06)";
  const AXIS_COLOR = "rgba(255,255,255,0.32)";

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, rev, auc, ops] = await Promise.all([
        dashboardApi.overview({ days }),
        dashboardApi.revenue({ days }),
        dashboardApi.auctions({ days }),
        dashboardApi.operations({ days }),
      ]);
      setOverview(ov);
      setRevenue(rev);
      setAuctionData(auc);
      setOperations(ops);
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const cards             = overview?.cards ?? {};
  const revenueChartData  = revenue?.series ? mergeSeries(revenue.series) : [];
  const auctionStatusData = (auctionData?.status ?? []).map((r) => ({ name: r.status, value: r.count }));

  const alerts         = operations?.alerts ?? {};
  const stalePending   = alerts.stale_pending_kyc    ?? [];
  const failedPayments = alerts.failed_payments       ?? [];
  const lowInventory   = alerts.low_ticket_inventory  ?? [];
  const activityFeed   = operations?.activity_feed    ?? [];

  return (
    <Box sx={{ pb: 5, position: "relative" }}>

      {/* ── Ambient background blobs for glassmorphism depth ── */}
      <Box aria-hidden sx={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", top: "-10%", right: "5%",  width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(39,98,200,0.18) 0%, transparent 65%)", filter: "blur(60px)" }} />
        <Box sx={{ position: "absolute", top: "35%",  left: "-8%",  width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,171,148,0.12) 0%, transparent 65%)", filter: "blur(70px)" }} />
        <Box sx={{ position: "absolute", bottom: "10%", right: "30%", width: 520, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(253,197,0,0.08) 0%, transparent 65%)",  filter: "blur(80px)" }} />
      </Box>

      {/* ── Header ── */}
      <PageHeader sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: "rgba(253,197,0,0.7)", mb: 0.75, letterSpacing: "0.12em" }}>
            BLACK FIVE · پنل مدیریت
          </Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.95)", lineHeight: 1.25, mb: 0.5, letterSpacing: "-0.01em" }}>
            {userName ? `خوش آمدید، ${userName}` : "داشبورد"}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>
            نمای کلی عملکرد پلتفرم در بازه انتخابی
          </Typography>
        </Box>
        <PeriodSelector>
          {PERIODS.map(({ label, value }) => (
            <PeriodButton key={value} active={days === value ? 1 : 0} onClick={() => setDays(value)}>
              {label}
            </PeriodButton>
          ))}
        </PeriodSelector>
      </PageHeader>

      {/* ── Primary KPIs — 4 equal columns ── */}
      <Grid container spacing={1.75} sx={{ mb: 1.75, position: "relative", zIndex: 1 }}>
        {[
          { icon: TrendingUpIcon,                  label: "ارزش کل معاملات (GMV)",   value: fmt(cards.gross_merchandise_value), colorKey: "secondary", accent: true },
          { icon: PaymentsOutlinedIcon,             label: "درآمد واریزها",            value: fmt(cards.deposit_revenue),         colorKey: "info" },
          { icon: ConfirmationNumberOutlinedIcon,   label: "درآمد فروش بلیت",         value: fmt(cards.ticket_revenue),          colorKey: "success" },
          { icon: MonetizationOnOutlinedIcon,       label: "موجودی خالص",             value: fmt(cards.net_cash_position),       colorKey: "secondary" },
        ].map((card, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
            <PrimaryKpiCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* ── Secondary KPIs — 5 compact pills ── */}
      <Grid container spacing={1.75} sx={{ mb: 3, position: "relative", zIndex: 1 }}>
        {[
          { icon: AccountBalanceWalletOutlinedIcon, label: "موجودی کیف‌پول‌های فعال",   value: fmt(cards.active_wallet_balance),  colorKey: "info" },
          { icon: StorefrontOutlinedIcon,           label: "برداشت خروجی",               value: fmt(cards.withdrawal_outflow),     colorKey: "error" },
          { icon: GavelIcon,                        label: "حراج‌های در حال اجرا",       value: cards.running_auctions   ?? "—",   colorKey: "success" },
          { icon: AssignmentIndOutlinedIcon,        label: "احراز هویت در انتظار",       value: cards.pending_kyc         ?? "—",  colorKey: "warning" },
          { icon: HourglassEmptyIcon,               label: "درخواست برداشت در انتظار",  value: cards.pending_withdrawals ?? "—",  colorKey: "error" },
        ].map((card, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: "grow" }}>
            <MetricPill {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* ── Revenue Chart ── */}
      <WidgetCard sx={{ mb: 2.5 }}>
        {/* Header row */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2.5 }}>
          <Box>
            <SectionLabel>روند درآمد و تراکنش‌ها</SectionLabel>
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            {Object.entries(SERIES_LABELS).map(([key, label]) => (
              <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                <Box sx={{ width: 16, height: 2.5, borderRadius: 2, bgcolor: SERIES_COLORS[key] }} />
                <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.38)" }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {loading ? (
          <Skeleton variant="rounded" height={200} sx={{ bgcolor: "rgba(255,255,255,0.03)", borderRadius: 2 }} />
        ) : revenueChartData.length === 0 ? (
          <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <EmptyState message="داده‌ای در این بازه وجود ندارد" />
          </Box>
        ) : (
          <Box sx={{ direction: "ltr" }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueChartData} margin={{ top: 2, right: 2, left: 0, bottom: 0 }}>
                <defs>
                  {Object.entries(SERIES_COLORS).map(([key, color]) => (
                    <linearGradient key={key} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: AXIS_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: AXIS_COLOR, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={44} />
                <Tooltip content={<RevenueTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
                {Object.keys(SERIES_COLORS).map((key) => (
                  <Area
                    key={key} type="monotone" dataKey={key}
                    stroke={SERIES_COLORS[key]} strokeWidth={2}
                    fill={`url(#grad_${key})`} dot={false}
                    activeDot={{ r: 3.5, strokeWidth: 0, fill: SERIES_COLORS[key] }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </WidgetCard>

      {/* ── Auctions ── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {/* Top Auctions */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <WidgetCard>
            <SectionLabel icon={GavelIcon}>برترین حراج‌ها</SectionLabel>
            {loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={38} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1 }} />
                ))}
              </Box>
            ) : (auctionData?.top_auctions ?? []).length === 0 ? (
              <EmptyState message="حراجی ثبت نشده" />
            ) : (
              <Box sx={{ overflow: "auto" }}>
                <Table size="small" sx={{ minWidth: 460 }}>
                  <TableHead>
                    <TableRow>
                      {["عنوان حراج", "وضعیت", "دوره‌ها", "بلیت فروخته‌شده", "GMV"].map((h) => (
                        <TableCell key={h} align="right" sx={{
                          fontSize: 10, color: "rgba(255,255,255,0.3)",
                          fontWeight: 700, letterSpacing: "0.05em",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                          pb: 1, pt: 0,
                        }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(auctionData?.top_auctions ?? []).map((row, idx) => (
                      <TableRow key={row.id} sx={{
                        "&:last-child td": { border: 0 },
                        "&:hover td": { background: "rgba(255,255,255,0.02)" },
                        cursor: "default",
                      }}>
                        <TableCell align="right" sx={{ border: 0, borderBottom: "1px solid rgba(255,255,255,0.04)", py: 1.1, transition: "background 120ms" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                            <Typography sx={{
                              fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)",
                              minWidth: 18, lineHeight: 1,
                            }}>
                              {idx + 1}
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>
                              {row.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ border: 0, borderBottom: "1px solid rgba(255,255,255,0.04)", py: 1.1, transition: "background 120ms" }}>
                          <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", border: 0, borderBottom: "1px solid rgba(255,255,255,0.04)", py: 1.1, transition: "background 120ms" }}>
                          {row.runs_count ?? 0}
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", border: 0, borderBottom: "1px solid rgba(255,255,255,0.04)", py: 1.1, transition: "background 120ms" }}>
                          {row.tickets_sold ?? 0}
                        </TableCell>
                        <TableCell align="right" sx={{ border: 0, borderBottom: "1px solid rgba(255,255,255,0.04)", py: 1.1, transition: "background 120ms" }}>
                          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, justifyContent: "flex-end", direction: "ltr" }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>
                              {fmt(row.gmv)}
                            </Typography>
                            <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>T</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </WidgetCard>
        </Grid>

        {/* Auction Status */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <WidgetCard>
            <SectionLabel>وضعیت حراج‌ها</SectionLabel>
            <AuctionStatusBars data={auctionStatusData} loading={loading} />
          </WidgetCard>
        </Grid>
      </Grid>

      {/* ── Alerts ── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {/* KYC */}
        <Grid size={{ xs: 12, md: 4 }}>
          <WidgetCard>
            <SectionLabel icon={AssignmentIndOutlinedIcon}>احراز هویت معلق</SectionLabel>
            {loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rounded" height={30} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1 }} />)}
              </Box>
            ) : stalePending.length === 0 ? <EmptyState /> : (
              stalePending.map((k) => (
                <AlertListRow key={k.id} label={k.username} sub={k.level ? `سطح ${k.level}` : undefined} variant="warning" />
              ))
            )}
          </WidgetCard>
        </Grid>

        {/* Failed Payments */}
        <Grid size={{ xs: 12, md: 4 }}>
          <WidgetCard>
            <SectionLabel icon={ErrorOutlineIcon}>پرداخت‌های ناموفق</SectionLabel>
            {loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rounded" height={30} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1 }} />)}
              </Box>
            ) : failedPayments.length === 0 ? <EmptyState /> : (
              failedPayments.map((p) => (
                <AlertListRow key={p.id} label={p.username} sub={fmt(p.amount) + " T"} variant="danger" />
              ))
            )}
          </WidgetCard>
        </Grid>

        {/* Low Inventory */}
        <Grid size={{ xs: 12, md: 4 }}>
          <WidgetCard>
            <SectionLabel icon={WarningAmberOutlinedIcon}>موجودی پایین بلیت</SectionLabel>
            {loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rounded" height={30} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1 }} />)}
              </Box>
            ) : lowInventory.length === 0 ? <EmptyState /> : (
              lowInventory.map((t, i) => (
                <AlertListRow
                  key={i}
                  label={t.auction_title}
                  sub={`${t.sold_quantity}/${t.stock_quantity}`}
                  variant={t.sold_quantity >= t.stock_quantity ? "danger" : "warning"}
                />
              ))
            )}
          </WidgetCard>
        </Grid>
      </Grid>

      {/* ── Activity Feed ── */}
      <WidgetCard>
        <SectionLabel>آخرین فعالیت‌ها</SectionLabel>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={34} sx={{ bgcolor: "rgba(255,255,255,0.03)", borderRadius: 1 }} />
            ))}
          </Box>
        ) : activityFeed.length === 0 ? (
          <EmptyState message="فعالیتی ثبت نشده" />
        ) : (
          <Box sx={{ position: "relative" }}>
            {/* Vertical line */}
            <Box sx={{
              position: "absolute",
              right: 8, top: 8, bottom: 8, width: "1px",
              background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.02))",
              zIndex: 0,
            }} />
            {activityFeed.map((log, idx) => {
              const modelName = log.auditable_type?.replace(/^App\\Models\\/, "") ?? "";
              const date = new Date(log.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
              return (
                <Box key={log.id} sx={{ display: "flex", gap: 2.5, position: "relative", py: 0.85,
                  "&:last-child .feed-bottom": { pb: 0 },
                }}>
                  {/* Dot */}
                  <Box sx={{
                    width: 17, height: 17, borderRadius: "50%", flexShrink: 0,
                    background: "#000e24",
                    border: "1.5px solid rgba(96,165,250,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    mt: 0.35, position: "relative", zIndex: 1,
                  }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#60a5fa", opacity: 0.8 }} />
                  </Box>
                  {/* Content */}
                  <Box className="feed-bottom" sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexWrap: "wrap" }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{log.action}</Typography>
                      {modelName && (
                        <Box sx={{
                          px: 0.75, py: 0.15, borderRadius: "4px",
                          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)",
                        }}>
                          <Typography sx={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.04em" }}>{modelName}</Typography>
                        </Box>
                      )}
                      {log.actor && (
                        <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{log.actor}</Typography>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.25)", direction: "ltr", display: "inline-block", whiteSpace: "nowrap" }}>
                      {date}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </WidgetCard>
    </Box>
  );
}

// ─── Styled Components ─────────────────────────────────────────────────────────

const PageHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3.5),
  paddingBottom: theme.spacing(3),
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0, right: 0, left: 0, height: 1,
    background: "linear-gradient(to left, rgba(253,197,0,0.2), transparent 55%)",
  },
}));

const PeriodSelector = styled(Box)(() => ({
  display: "flex",
  background: "rgba(0,14,40,0.5)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
  borderRadius: "12px",
  padding: "3px",
  gap: "2px",
  alignSelf: "flex-start",
}));

const PeriodButton = styled("button", {
  shouldForwardProp: (p) => p !== "active",
})(({ active }) => ({
  border: "none",
  cursor: "pointer",
  padding: "5px 14px",
  borderRadius: "8px",
  fontSize: 11.5,
  fontWeight: active ? 700 : 500,
  fontFamily: "inherit",
  transition: "all 160ms ease",
  background: active ? "rgba(253,197,0,0.15)" : "transparent",
  color: active ? "#fdc500" : "rgba(255,255,255,0.38)",
  "&:hover": {
    color: active ? "#fdc500" : "rgba(255,255,255,0.6)",
    background: active ? "rgba(253,197,0,0.15)" : "rgba(255,255,255,0.05)",
  },
}));

const WidgetCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: "16px",
  background: "rgba(0, 18, 58, 0.48)",
  backdropFilter: "blur(20px) saturate(160%)",
  WebkitBackdropFilter: "blur(20px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)",
  height: "100%",
  position: "relative",
  overflow: "hidden",
  zIndex: 1,
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0, right: 0, left: 0, height: "1px",
    background: "linear-gradient(to left, rgba(253,197,0,0.25), rgba(255,255,255,0.1) 40%, transparent 80%)",
    pointerEvents: "none",
  },
}));

const PrimaryCardRoot = styled(Paper, {
  shouldForwardProp: (p) => !["colorKey", "accent"].includes(p),
})(({ theme, colorKey, accent }) => {
  const c = theme.palette[colorKey]?.main ?? "#fff";
  return {
    padding: theme.spacing(2.5),
    borderRadius: "18px",
    background: [
      `radial-gradient(ellipse at 85% 10%, ${c}20 0%, transparent 52%)`,
      "rgba(0, 14, 46, 0.52)",
    ].join(", "),
    backdropFilter: "blur(28px) saturate(180%)",
    WebkitBackdropFilter: "blur(28px) saturate(180%)",
    border: `1px solid ${accent ? "rgba(253,197,0,0.3)" : "rgba(255,255,255,0.1)"}`,
    boxShadow: accent
      ? "0 4px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(253,197,0,0.14)"
      : `0 4px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
    height: "100%",
    position: "relative",
    overflow: "hidden",
    cursor: "default",
    zIndex: 1,
    transition: "border-color 240ms ease, box-shadow 240ms ease, transform 240ms ease",
    "&:hover": {
      borderColor: `${c}42`,
      boxShadow: `0 22px 60px rgba(0,0,0,0.55), 0 0 0 1px ${c}20, inset 0 1px 0 ${c}18`,
      transform: "translateY(-3px)",
    },
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0, right: 0, left: 0, height: "2px",
      borderRadius: "18px 18px 0 0",
      background: accent
        ? "linear-gradient(90deg, transparent, #fdc50080 20%, #fdc500 50%, #ffd50080 80%, transparent)"
        : `linear-gradient(90deg, transparent, ${c}55 25%, ${c} 50%, ${c}55 75%, transparent)`,
      ...(accent && { animation: "topBarPulse 2.8s ease-in-out infinite" }),
    },
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: -18, left: "50%", transform: "translateX(-50%)",
      width: "65%", height: 36,
      background: `radial-gradient(ellipse, ${c}1e 0%, transparent 70%)`,
      pointerEvents: "none",
      filter: "blur(12px)",
    },
    "@keyframes topBarPulse": {
      "0%, 100%": { opacity: 0.6 },
      "50%": { opacity: 1 },
    },
  };
});

const KpiIcon = styled(Box, {
  shouldForwardProp: (p) => p !== "colorKey",
})(({ theme, colorKey }) => {
  const c = theme.palette[colorKey]?.main ?? "#fff";
  return {
    width: 42, height: 42, borderRadius: "12px",
    background: "rgba(0,0,0,0.28)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: `1px solid ${c}32`,
    boxShadow: `0 0 0 5px ${c}09, inset 0 1px 0 ${c}22`,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    transition: "box-shadow 240ms ease, border-color 240ms ease",
    ".MuiPaper-root:hover &": {
      border: `1px solid ${c}48`,
      boxShadow: `0 0 0 8px ${c}12, 0 6px 18px ${c}35, inset 0 1px 0 ${c}28`,
    },
  };
});

const MetricPillRoot = styled(Paper, {
  shouldForwardProp: (p) => p !== "colorKey",
})(({ theme, colorKey }) => {
  const c = theme.palette[colorKey]?.main ?? "#fff";
  return {
    padding: theme.spacing(1.75, 2),
    borderRadius: "14px",
    background: "rgba(0, 16, 52, 0.44)",
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    border: "1px solid rgba(255,255,255,0.09)",
    boxShadow: "0 2px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.07)",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    zIndex: 1,
    transition: "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
    "&:hover": {
      borderColor: `${c}32`,
      boxShadow: `0 10px 32px rgba(0,0,0,0.45), inset 0 1px 0 ${c}12`,
      transform: "translateY(-1px)",
    },
    "&::before": {
      content: '""',
      position: "absolute",
      top: "18%", right: 0, bottom: "18%", width: "3px",
      borderRadius: "0 14px 14px 0",
      background: `linear-gradient(to bottom, transparent, ${c}90, ${c}cc, ${c}90, transparent)`,
    },
  };
});

const PillIcon = styled(Box, {
  shouldForwardProp: (p) => p !== "colorKey",
})(({ theme, colorKey }) => {
  const c = theme.palette[colorKey]?.main ?? "#fff";
  return {
    width: 36, height: 36, borderRadius: "10px",
    background: "rgba(0,0,0,0.3)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: `1px solid ${c}2a`,
    boxShadow: `inset 0 1px 0 ${c}1e`,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };
});
