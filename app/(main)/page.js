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
  Chip,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useSession } from "next-auth/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  deposits:    "#fdc500",
  ticket_sales:"#22ab94",
  withdrawals: "#ff3547",
  auction_wins:"#4d8ef8",
};

const STATUS_COLORS = {
  draft:     "#8da9d0",
  active:    "#22ab94",
  running:   "#4d8ef8",
  ended:     "#fdc500",
  cancelled: "#ff3547",
  pending:   "#f59e0b",
  finished:  "#22ab94",
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

function SectionHeading({ children, icon: Icon, action }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {Icon && (
          <Box sx={{
            width: 30, height: 30, borderRadius: "8px",
            background: "rgba(253,197,0,0.12)", border: "1px solid rgba(253,197,0,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon sx={{ fontSize: 16, color: "secondary.main" }} />
          </Box>
        )}
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary", letterSpacing: "0.01em" }}>
          {children}
        </Typography>
      </Box>
      {action}
    </Box>
  );
}

function EmptyState({ message = "موردی برای نمایش وجود ندارد" }) {
  return (
    <Box sx={{ py: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: "12px",
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <InboxOutlinedIcon sx={{ fontSize: 22, color: "text.disabled" }} />
      </Box>
      <Typography sx={{ fontSize: 12, color: "text.disabled" }}>{message}</Typography>
    </Box>
  );
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      background: "#000e24", border: "1px solid rgba(253,197,0,0.25)",
      borderRadius: "10px", p: "12px 16px", boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
      backdropFilter: "blur(12px)",
    }}>
      <Typography sx={{ fontSize: 10, color: "text.disabled", mb: 1.5, direction: "ltr", letterSpacing: "0.03em" }}>{label}</Typography>
      {payload.map((p) => (
        <Box key={p.dataKey} sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 0.75 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color, flexShrink: 0, boxShadow: `0 0 6px ${p.color}80` }} />
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.85)", direction: "ltr", fontWeight: 500 }}>
            <span style={{ color: "rgba(255,255,255,0.45)", marginLeft: 4 }}>{SERIES_LABELS[p.dataKey]}:</span>
            {" "}{fmtFull(p.value)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// Primary KPI card — large emphasis
function PrimaryKpiCard({ icon: Icon, label, value, colorKey = "secondary", loading, accent }) {
  return (
    <PrimaryCardRoot colorKey={colorKey} accent={accent ? 1 : 0}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3 }}>
        <IconBadge colorKey={colorKey}>
          <Icon sx={{ fontSize: 22, color: `${colorKey}.main` }} />
        </IconBadge>
        {accent && (
          <Box sx={{
            px: 1.25, py: 0.4, borderRadius: "6px",
            background: "rgba(253,197,0,0.12)", border: "1px solid rgba(253,197,0,0.2)",
          }}>
            <Typography sx={{ fontSize: 9, fontWeight: 700, color: "secondary.main", letterSpacing: "0.06em" }}>PRIME</Typography>
          </Box>
        )}
      </Box>
      <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: "text.disabled", mb: 1, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width={80} height={42} sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 1 }} />
      ) : (
        <Typography sx={{ fontSize: 32, fontWeight: 800, color: "text.primary", lineHeight: 1, direction: "ltr", letterSpacing: "-0.02em" }}>
          {value}
        </Typography>
      )}
    </PrimaryCardRoot>
  );
}

// Secondary KPI card — compact
function SecondaryKpiCard({ icon: Icon, label, value, colorKey = "info", loading }) {
  return (
    <SecondaryCardRoot colorKey={colorKey}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <SmallIconBadge colorKey={colorKey}>
          <Icon sx={{ fontSize: 18, color: `${colorKey}.main` }} />
        </SmallIconBadge>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 500, color: "text.disabled", mb: 0.5, letterSpacing: "0.04em" }}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={60} height={28} sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 1 }} />
          ) : (
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: "text.primary", lineHeight: 1, direction: "ltr", letterSpacing: "-0.01em" }}>
              {value}
            </Typography>
          )}
        </Box>
      </Box>
    </SecondaryCardRoot>
  );
}

// Operational counter card — smallest
function CounterCard({ icon: Icon, label, value, colorKey, loading }) {
  return (
    <CounterCardRoot colorKey={colorKey}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 10, color: "text.disabled", mb: 0.75, fontWeight: 500 }}>{label}</Typography>
          {loading ? (
            <Skeleton variant="text" width={44} height={32} sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 1 }} />
          ) : (
            <Typography sx={{ fontSize: 26, fontWeight: 800, color: "text.primary", lineHeight: 1 }}>{value}</Typography>
          )}
        </Box>
        <TinyIcon colorKey={colorKey}>
          <Icon sx={{ fontSize: 16, color: `${colorKey}.main` }} />
        </TinyIcon>
      </Box>
    </CounterCardRoot>
  );
}

// Alert row for operational widgets
function AlertRow({ label, sub, accent, warning }) {
  const bg = accent
    ? "rgba(255,53,71,0.06)"
    : warning
    ? "rgba(245,158,11,0.06)"
    : "rgba(255,255,255,0.025)";
  const border = accent
    ? "rgba(255,53,71,0.18)"
    : warning
    ? "rgba(245,158,11,0.18)"
    : "rgba(255,255,255,0.07)";
  const textColor = accent ? "#ff3547" : warning ? "#f59e0b" : "text.primary";
  return (
    <Box sx={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      py: 1.1, px: 1.5, borderRadius: "8px",
      background: bg, border: "1px solid", borderColor: border, mb: 0.75,
      transition: "background 180ms",
      "&:hover": { background: accent ? "rgba(255,53,71,0.09)" : "rgba(255,255,255,0.04)" },
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {(accent || warning) && (
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: accent ? "error.main" : "#f59e0b", flexShrink: 0 }} />
        )}
        <Typography sx={{ fontSize: 12, color: textColor, fontWeight: 500 }}>{label}</Typography>
      </Box>
      {sub && <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{sub}</Typography>}
    </Box>
  );
}

// Status badge
function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] ?? "#8da9d0";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.6,
      px: 1, py: 0.35, borderRadius: "6px",
      background: color + "16", border: `1px solid ${color}30`,
    }}>
      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 10.5, fontWeight: 600, color, letterSpacing: "0.02em" }}>{label}</Typography>
    </Box>
  );
}

// Auction status horizontal bar widget
function AuctionStatusBars({ data, loading }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={36} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1 }} />
        ))}
      </Box>
    );
  }
  if (!data.length) return <EmptyState />;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      {data.map(({ name, value }) => {
        const color = STATUS_COLORS[name] ?? "#8da9d0";
        const label = STATUS_LABELS[name] ?? name;
        const pct = Math.round((value / total) * 100);
        return (
          <Box key={name}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "text.secondary" }}>{label}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{pct}%</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "text.primary", minWidth: 20, textAlign: "right" }}>{value}</Typography>
              </Box>
            </Box>
            <Box sx={{ height: 6, borderRadius: "4px", background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
              <Box sx={{
                height: "100%", borderRadius: "4px",
                width: `${pct}%`,
                background: `linear-gradient(to left, ${color}, ${color}88)`,
                transition: "width 600ms cubic-bezier(.4,0,.2,1)",
                boxShadow: `0 0 8px ${color}40`,
              }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name;
  const theme = useTheme();

  const [days, setDays]               = useState(30);
  const [overview, setOverview]       = useState(null);
  const [revenue, setRevenue]         = useState(null);
  const [auctionData, setAuctionData] = useState(null);
  const [operations, setOperations]   = useState(null);
  const [loading, setLoading]         = useState(true);

  const gridColor = "rgba(255,255,255,0.04)";
  const axisColor = "rgba(255,255,255,0.2)";

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

  const cards          = overview?.cards ?? {};
  const revenueChartData = revenue?.series ? mergeSeries(revenue.series) : [];
  const auctionStatusData = (auctionData?.status ?? []).map((r) => ({ name: r.status, value: r.count }));

  const alerts        = operations?.alerts ?? {};
  const stalePending  = alerts.stale_pending_kyc     ?? [];
  const failedPayments = alerts.failed_payments      ?? [];
  const lowInventory  = alerts.low_ticket_inventory  ?? [];
  const activityFeed  = operations?.activity_feed    ?? [];

  return (
    <Box sx={{ pb: 6 }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <PageHeader>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "secondary.main", mb: 1, letterSpacing: "0.1em", opacity: 0.9 }}>
            BLACK FIVE · پنل مدیریت
          </Typography>
          <Typography sx={{ fontSize: 26, fontWeight: 800, color: "text.primary", lineHeight: 1.25, mb: 0.75, letterSpacing: "-0.01em" }}>
            {userName ? `خوش آمدید، ${userName}` : "داشبورد"}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.disabled", fontWeight: 400 }}>
            نمای کلی عملکرد پلتفرم در بازه انتخابی
          </Typography>
        </Box>

        {/* Period selector */}
        <PeriodSelector>
          {PERIODS.map(({ label, value }) => (
            <PeriodButton key={value} active={days === value ? 1 : 0} onClick={() => setDays(value)}>
              {label}
            </PeriodButton>
          ))}
        </PeriodSelector>
      </PageHeader>

      {/* ── Primary KPI Row ────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <PrimaryKpiCard
            icon={TrendingUpIcon}
            label="ارزش کل معاملات (GMV)"
            value={fmt(cards.gross_merchandise_value)}
            colorKey="secondary"
            loading={loading}
            accent
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <PrimaryKpiCard
            icon={PaymentsOutlinedIcon}
            label="درآمد واریزها"
            value={fmt(cards.deposit_revenue)}
            colorKey="info"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <PrimaryKpiCard
            icon={ConfirmationNumberOutlinedIcon}
            label="درآمد فروش بلیت"
            value={fmt(cards.ticket_revenue)}
            colorKey="success"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <PrimaryKpiCard
            icon={MonetizationOnOutlinedIcon}
            label="موجودی خالص"
            value={fmt(cards.net_cash_position)}
            colorKey="secondary"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* ── Secondary KPI Row ──────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SecondaryKpiCard
            icon={AccountBalanceWalletOutlinedIcon}
            label="موجودی کیف‌پول‌های فعال"
            value={fmt(cards.active_wallet_balance)}
            colorKey="info"
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SecondaryKpiCard
            icon={StorefrontOutlinedIcon}
            label="برداشت خروجی"
            value={fmt(cards.withdrawal_outflow)}
            colorKey="error"
            loading={loading}
          />
        </Grid>
        {/* Operational counters side by side in remaining column */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, height: "100%" }}>
            <CounterCard icon={GavelIcon}              label="حراج‌های در حال اجرا"      value={cards.running_auctions   ?? "—"} colorKey="success" loading={loading} />
            <CounterCard icon={AssignmentIndOutlinedIcon} label="احراز هویت در انتظار"   value={cards.pending_kyc         ?? "—"} colorKey="warning" loading={loading} />
            <CounterCard icon={HourglassEmptyIcon}     label="درخواست برداشت در انتظار" value={cards.pending_withdrawals ?? "—"} colorKey="error"   loading={loading} />
          </Box>
        </Grid>
      </Grid>

      {/* ── Revenue Trend Chart ────────────────────────────────────────── */}
      <WidgetCard sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <SectionHeading>روند درآمد و تراکنش‌ها</SectionHeading>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {Object.entries(SERIES_LABELS).map(([key, label]) => (
              <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box sx={{ width: 20, height: 3, borderRadius: 2, bgcolor: SERIES_COLORS[key], boxShadow: `0 0 6px ${SERIES_COLORS[key]}60` }} />
                <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {loading ? (
          <Skeleton variant="rounded" height={240} sx={{ bgcolor: "rgba(255,255,255,0.03)", borderRadius: 2 }} />
        ) : (
          <Box sx={{ direction: "ltr" }}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  {Object.entries(SERIES_COLORS).map(([key, color]) => (
                    <linearGradient key={key} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                      <stop offset="85%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke={gridColor} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} width={48} />
                <Tooltip content={<RevenueTooltip />} cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 1 }} />
                {Object.keys(SERIES_COLORS).map((key) => (
                  <Area
                    key={key} type="monotone" dataKey={key}
                    stroke={SERIES_COLORS[key]} strokeWidth={1.8}
                    fill={`url(#grad_${key})`} dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: SERIES_COLORS[key] }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </WidgetCard>

      {/* ── Auctions Section ───────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Top Auctions Table */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <WidgetCard>
            <SectionHeading icon={GavelIcon}>برترین حراج‌ها</SectionHeading>
            {loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={42} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: "8px" }} />
                ))}
              </Box>
            ) : (auctionData?.top_auctions ?? []).length === 0 ? (
              <EmptyState message="حراجی ثبت نشده" />
            ) : (
              <Box sx={{ overflow: "auto" }}>
                <Table size="small" sx={{ minWidth: 480 }}>
                  <TableHead>
                    <TableRow>
                      {["عنوان حراج", "وضعیت", "دوره‌ها", "بلیت فروخته‌شده", "GMV"].map((h) => (
                        <TableCell key={h} align="right" sx={{
                          fontSize: 10.5, color: "text.disabled", fontWeight: 700,
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                          pb: 1.25, pt: 0, letterSpacing: "0.04em",
                        }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(auctionData?.top_auctions ?? []).map((row, idx) => (
                      <TableRow key={row.id} sx={{
                        borderRadius: "8px",
                        "&:hover td": { background: "rgba(255,255,255,0.025)" },
                        "&:hover td:first-of-type": { borderRadius: "8px 0 0 8px" },
                        "&:hover td:last-of-type": { borderRadius: "0 8px 8px 0" },
                        "&:last-child td": { border: 0 },
                        cursor: "pointer",
                      }}>
                        <TableCell align="right" sx={{ fontSize: 12.5, fontWeight: 600, color: "text.primary", border: 0, borderBottom: "1px solid rgba(255,255,255,0.04)", py: 1.35, transition: "background 150ms" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{
                              width: 24, height: 24, borderRadius: "6px", flexShrink: 0,
                              background: "rgba(253,197,0,0.1)", border: "1px solid rgba(253,197,0,0.15)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 10, fontWeight: 700, color: "secondary.main",
                            }}>
                              {idx + 1}
                            </Box>
                            {row.title}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ border: 0, borderBottom: "1px solid rgba(255,255,255,0.04)", py: 1.35, transition: "background 150ms" }}>
                          <StatusBadge status={row.status} />
                        </TableCell>
                        <TableCell align="right" sx={{ fontSize: 12.5, fontWeight: 500, color: "text.secondary", border: 0, borderBottom: "1px solid rgba(255,255,255,0.04)", py: 1.35, transition: "background 150ms" }}>{row.runs_count ?? 0}</TableCell>
                        <TableCell align="right" sx={{ fontSize: 12.5, fontWeight: 500, color: "text.secondary", border: 0, borderBottom: "1px solid rgba(255,255,255,0.04)", py: 1.35, transition: "background 150ms" }}>{row.tickets_sold ?? 0}</TableCell>
                        <TableCell align="right" sx={{ border: 0, borderBottom: "1px solid rgba(255,255,255,0.04)", py: 1.35, transition: "background 150ms" }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "secondary.main", direction: "ltr", display: "inline-block" }}>
                            {fmt(row.gmv)}
                            <span style={{ fontSize: 10, fontWeight: 400, color: "rgba(255,255,255,0.35)", marginLeft: 3 }}>T</span>
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </WidgetCard>
        </Grid>

        {/* Auction Status Bars */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <WidgetCard>
            <SectionHeading>وضعیت حراج‌ها</SectionHeading>
            <AuctionStatusBars data={auctionStatusData} loading={loading} />
          </WidgetCard>
        </Grid>
      </Grid>

      {/* ── Operational Alerts ─────────────────────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Stale KYC */}
        <Grid size={{ xs: 12, md: 4 }}>
          <WidgetCard>
            <SectionHeading icon={AssignmentIndOutlinedIcon}>احراز هویت معلق</SectionHeading>
            {loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rounded" height={36} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: "8px" }} />)}
              </Box>
            ) : stalePending.length === 0 ? (
              <EmptyState />
            ) : (
              stalePending.map((k) => (
                <AlertRow key={k.id} label={k.username} sub={k.level ? `سطح ${k.level}` : undefined} warning />
              ))
            )}
          </WidgetCard>
        </Grid>

        {/* Failed payments */}
        <Grid size={{ xs: 12, md: 4 }}>
          <WidgetCard>
            <SectionHeading icon={ErrorOutlineIcon}>پرداخت‌های ناموفق</SectionHeading>
            {loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rounded" height={36} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: "8px" }} />)}
              </Box>
            ) : failedPayments.length === 0 ? (
              <EmptyState />
            ) : (
              failedPayments.map((p) => (
                <AlertRow key={p.id} label={p.username} sub={fmt(p.amount) + " T"} accent />
              ))
            )}
          </WidgetCard>
        </Grid>

        {/* Low inventory */}
        <Grid size={{ xs: 12, md: 4 }}>
          <WidgetCard>
            <SectionHeading icon={WarningAmberOutlinedIcon}>موجودی پایین بلیت</SectionHeading>
            {loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rounded" height={36} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: "8px" }} />)}
              </Box>
            ) : lowInventory.length === 0 ? (
              <EmptyState />
            ) : (
              lowInventory.map((t, i) => (
                <AlertRow
                  key={i}
                  label={t.auction_title}
                  sub={`سطح ${t.level} · ${t.sold_quantity}/${t.stock_quantity}`}
                  warning={t.sold_quantity < t.stock_quantity}
                  accent={t.sold_quantity >= t.stock_quantity}
                />
              ))
            )}
          </WidgetCard>
        </Grid>
      </Grid>

      {/* ── Activity Feed ──────────────────────────────────────────────── */}
      <WidgetCard>
        <SectionHeading>آخرین فعالیت‌ها</SectionHeading>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={44} sx={{ bgcolor: "rgba(255,255,255,0.03)", borderRadius: "8px" }} />
            ))}
          </Box>
        ) : activityFeed.length === 0 ? (
          <EmptyState message="فعالیتی ثبت نشده" />
        ) : (
          <Box>
            {activityFeed.map((log, idx) => {
              const modelName = log.auditable_type?.replace(/^App\\Models\\/, "") ?? "";
              const date = new Date(log.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
              const isLast = idx === activityFeed.length - 1;
              return (
                <Box key={log.id} sx={{ display: "flex", gap: 2, position: "relative" }}>
                  {/* Timeline line */}
                  {!isLast && (
                    <Box sx={{ position: "absolute", right: 11, top: 28, bottom: 0, width: 1, background: "rgba(255,255,255,0.06)", zIndex: 0 }} />
                  )}
                  {/* Dot */}
                  <Box sx={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: "rgba(77,142,248,0.12)", border: "1.5px solid rgba(77,142,248,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    mt: 1.25, position: "relative", zIndex: 1,
                  }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#4d8ef8" }} />
                  </Box>
                  {/* Content */}
                  <Box sx={{
                    flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                    py: 1.25, pb: isLast ? 0 : 1.75, gap: 2, flexWrap: "wrap",
                  }}>
                    <Box>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "text.primary", mb: 0.25 }}>{log.action}</Typography>
                      {modelName && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{
                            px: 0.85, py: 0.2, borderRadius: "4px",
                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                          }}>
                            <Typography sx={{ fontSize: 9.5, color: "text.disabled", fontWeight: 600, letterSpacing: "0.04em" }}>{modelName}</Typography>
                          </Box>
                          {log.actor && (
                            <Typography sx={{ fontSize: 11, color: "text.disabled" }}>توسط {log.actor}</Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: 10.5, color: "text.disabled", direction: "ltr", display: "inline-block", whiteSpace: "nowrap", mt: 0.5 }}>
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
  marginBottom: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0, right: 0, left: 0, height: 1,
    background: "linear-gradient(to left, rgba(253,197,0,0.25), transparent 60%)",
  },
}));

const PeriodSelector = styled(Box)(({ theme }) => ({
  display: "flex",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "4px",
  gap: "2px",
  alignSelf: "flex-start",
}));

const PeriodButton = styled("button", {
  shouldForwardProp: (p) => p !== "active",
})(({ theme, active }) => ({
  border: "none",
  cursor: "pointer",
  padding: "6px 16px",
  borderRadius: "9px",
  fontSize: 12,
  fontWeight: active ? 700 : 500,
  fontFamily: "inherit",
  transition: "all 180ms ease",
  background: active ? "rgba(253,197,0,0.18)" : "transparent",
  color: active ? theme.palette.secondary.main : "rgba(255,255,255,0.4)",
  boxShadow: active ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 4px rgba(0,0,0,0.2)" : "none",
  "&:hover": {
    color: active ? theme.palette.secondary.main : "rgba(255,255,255,0.7)",
    background: active ? "rgba(253,197,0,0.18)" : "rgba(255,255,255,0.06)",
  },
}));

const WidgetCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "14px",
  background: `linear-gradient(160deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  border: "1px solid rgba(255,255,255,0.07)",
  height: "100%",
  transition: "border-color 200ms",
  "&:hover": {
    borderColor: "rgba(255,255,255,0.11)",
  },
}));

const PrimaryCardRoot = styled(Paper, {
  shouldForwardProp: (p) => !["colorKey", "accent"].includes(p),
})(({ theme, colorKey, accent }) => {
  const c = theme.palette[colorKey]?.main ?? "#fff";
  return {
    padding: theme.spacing(2.5),
    borderRadius: "14px",
    background: `linear-gradient(145deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
    border: `1px solid ${accent ? "rgba(253,197,0,0.18)" : "rgba(255,255,255,0.07)"}`,
    height: "100%",
    position: "relative",
    overflow: "hidden",
    transition: "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
    cursor: "default",
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: `0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px ${c}20`,
    },
    "&::before": {
      content: '""', position: "absolute", inset: 0, pointerEvents: "none",
      background: `radial-gradient(ellipse at top right, ${c}12 0%, transparent 65%)`,
    },
    "&::after": {
      content: '""', position: "absolute",
      bottom: 0, right: 0, left: 0, height: 2, borderRadius: "0 0 14px 14px",
      background: `linear-gradient(to right, transparent, ${c}50, transparent)`,
    },
  };
});

const IconBadge = styled(Box, {
  shouldForwardProp: (p) => p !== "colorKey",
})(({ theme, colorKey }) => {
  const c = theme.palette[colorKey]?.main ?? "#fff";
  return {
    width: 44, height: 44, borderRadius: "10px",
    background: c + "18",
    border: `1px solid ${c}28`,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };
});

const SecondaryCardRoot = styled(Paper, {
  shouldForwardProp: (p) => p !== "colorKey",
})(({ theme, colorKey }) => {
  const c = theme.palette[colorKey]?.main ?? "#fff";
  return {
    padding: theme.spacing(2),
    borderRadius: "12px",
    background: `linear-gradient(145deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
    border: "1px solid rgba(255,255,255,0.07)",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    transition: "transform 200ms ease, border-color 200ms ease",
    "&:hover": {
      transform: "translateY(-2px)",
      borderColor: c + "28",
    },
    "&::before": {
      content: '""', position: "absolute", inset: 0, pointerEvents: "none",
      background: `radial-gradient(ellipse at top right, ${c}0e 0%, transparent 70%)`,
    },
  };
});

const SmallIconBadge = styled(Box, {
  shouldForwardProp: (p) => p !== "colorKey",
})(({ theme, colorKey }) => {
  const c = theme.palette[colorKey]?.main ?? "#fff";
  return {
    width: 40, height: 40, borderRadius: "10px",
    background: c + "14",
    border: `1px solid ${c}22`,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };
});

const CounterCardRoot = styled(Paper, {
  shouldForwardProp: (p) => p !== "colorKey",
})(({ theme, colorKey }) => {
  const c = theme.palette[colorKey]?.main ?? "#fff";
  return {
    padding: theme.spacing(1.5, 2),
    borderRadius: "10px",
    background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
    border: "1px solid rgba(255,255,255,0.06)",
    position: "relative",
    overflow: "hidden",
    transition: "border-color 180ms",
    "&:hover": { borderColor: c + "25" },
    "&::before": {
      content: '""', position: "absolute",
      top: 0, right: 0, bottom: 0, width: 3, borderRadius: "0 10px 10px 0",
      background: `linear-gradient(to bottom, ${c}70, ${c}30)`,
    },
  };
});

const TinyIcon = styled(Box, {
  shouldForwardProp: (p) => p !== "colorKey",
})(({ theme, colorKey }) => {
  const c = theme.palette[colorKey]?.main ?? "#fff";
  return {
    width: 34, height: 34, borderRadius: "8px",
    background: c + "12", border: `1px solid ${c}1e`,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };
});
