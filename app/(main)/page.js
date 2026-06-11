"use client";

import { useCallback, useEffect, useState } from "react";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import GavelIcon from "@mui/icons-material/Gavel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
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
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " B";
  if (num >= 1_000_000)     return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + " M";
  if (num >= 1_000)         return (num / 1_000).toFixed(1).replace(/\.0$/, "") + " K";
  return num.toLocaleString("en-US");
};

const fmtFull = (n) => n != null ? Number(n).toLocaleString("en-US") + " T" : "—";

// merge daily series by date
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

// ─── Period selector ────────────────────────────────────────────────────────────

const PERIODS = [
  { label: "۷ روز",  value: 7  },
  { label: "۳۰ روز", value: 30 },
  { label: "۹۰ روز", value: 90 },
];

// ─── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, colorKey, loading }) {
  return (
    <StatCardRoot colorKey={colorKey}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
        <IconBox colorKey={colorKey}>
          <Icon sx={{ fontSize: 20, color: `${colorKey}.main` }} />
        </IconBox>
      </Box>
      <Typography sx={{ fontSize: 11, color: "text.disabled", fontWeight: 500, mb: 0.75 }}>
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width={90} height={34} sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: 1 }} />
      ) : (
        <Typography sx={{ fontSize: 26, fontWeight: 800, color: "text.primary", lineHeight: 1, direction: "ltr", textAlign: "left" }}>
          {value}
        </Typography>
      )}
      {sub && !loading && (
        <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.5 }}>{sub}</Typography>
      )}
    </StatCardRoot>
  );
}

// ─── Alert row ─────────────────────────────────────────────────────────────────

function AlertRow({ label, sub, accent }) {
  return (
    <Box sx={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      py: 1.25, px: 1.5, borderRadius: 2,
      background: accent ? "rgba(255,53,71,0.05)" : "rgba(255,255,255,0.025)",
      border: "1px solid", borderColor: accent ? "rgba(255,53,71,0.15)" : "modules.glassBorderLight",
      mb: 1,
    }}>
      <Typography sx={{ fontSize: 12.5, color: accent ? "error.main" : "text.primary", fontWeight: 500 }}>{label}</Typography>
      {sub && <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{sub}</Typography>}
    </Box>
  );
}

// ─── Chart tooltip ─────────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <TooltipBox>
      <Typography sx={{ fontSize: 11, color: "text.disabled", mb: 1, direction: "ltr" }}>{label}</Typography>
      {payload.map((p) => (
        <Box key={p.dataKey} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 12, color: "text.primary", direction: "ltr" }}>
            {SERIES_LABELS[p.dataKey] ?? p.dataKey}: {fmtFull(p.value)}
          </Typography>
        </Box>
      ))}
    </TooltipBox>
  );
}

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
  auction_wins:"#2762c8",
};

// ─── Section heading ────────────────────────────────────────────────────────────

function SectionHeading({ children }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
      <Box sx={{ width: 3, height: 16, borderRadius: 2, background: "linear-gradient(to bottom, #ffd500, #fdc500)", flexShrink: 0 }} />
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.disabled", letterSpacing: "0.04em" }}>
        {children}
      </Typography>
    </Box>
  );
}

// ─── Main dashboard ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name;
  const theme = useTheme();

  const [days, setDays]             = useState(30);
  const [overview, setOverview]     = useState(null);
  const [revenue, setRevenue]       = useState(null);
  const [auctionData, setAuctionData] = useState(null);
  const [operations, setOperations] = useState(null);
  const [loading, setLoading]       = useState(true);

  const gold   = theme.palette.secondary.main;
  const gridColor = "rgba(255,255,255,0.05)";
  const axisColor = "rgba(255,255,255,0.22)";

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

  const cards = overview?.cards ?? {};
  const revenueChartData = revenue?.series ? mergeSeries(revenue.series) : [];

  const auctionStatusData = (auctionData?.status ?? []).map((r) => ({ name: r.status, value: r.count }));

  const alerts = operations?.alerts ?? {};
  const stalePending  = alerts.stale_pending_kyc  ?? [];
  const failedPayments = alerts.failed_payments   ?? [];
  const lowInventory  = alerts.low_ticket_inventory ?? [];
  const activityFeed  = operations?.activity_feed  ?? [];

  return (
    <Box>
      {/* ── Header ── */}
      <WelcomeSection>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography component="p" sx={{ fontSize: 11, fontWeight: 600, color: "secondary.main", mb: 1, opacity: 0.8, letterSpacing: "0.08em" }}>
              پنل مدیریت بلک‌فایو
            </Typography>
            <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 800, mb: 0.75, lineHeight: 1.2 }}>
              {userName ? `خوش آمدید، ${userName}` : "داشبورد"}
            </Typography>
            <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
              نمای کلی عملکرد پلتفرم
            </Typography>
          </Box>

          {/* Period selector */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {PERIODS.map(({ label, value }) => (
              <Chip
                key={value}
                label={label}
                size="small"
                onClick={() => setDays(value)}
                sx={{
                  fontSize: 12, fontWeight: days === value ? 700 : 400, cursor: "pointer",
                  bgcolor: days === value ? "rgba(253,197,0,0.15)" : "rgba(255,255,255,0.05)",
                  border: "1px solid",
                  borderColor: days === value ? "modules.goldBorder" : "modules.glassBorderLight",
                  color: days === value ? "secondary.main" : "text.disabled",
                  "&:hover": { bgcolor: "rgba(253,197,0,0.1)", borderColor: "modules.goldBorder" },
                  transition: "all 200ms",
                }}
              />
            ))}
          </Box>
        </Box>
      </WelcomeSection>

      {/* ── Overview metric cards ── */}
      <SectionHeading>آمار کلی</SectionHeading>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
          <StatCard icon={TrendingUpIcon}                  label="ارزش کل معاملات (GMV)"      value={fmt(cards.gross_merchandise_value)}  colorKey="secondary" loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
          <StatCard icon={PaymentsOutlinedIcon}             label="درآمد واریزها"              value={fmt(cards.deposit_revenue)}          colorKey="info"      loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
          <StatCard icon={ConfirmationNumberOutlinedIcon}   label="درآمد فروش بلیت"           value={fmt(cards.ticket_revenue)}           colorKey="success"   loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
          <StatCard icon={MonetizationOnOutlinedIcon}       label="موجودی خالص"               value={fmt(cards.net_cash_position)}        colorKey="secondary" loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
          <StatCard icon={AccountBalanceWalletOutlinedIcon} label="موجودی کیف‌پول‌های فعال"   value={fmt(cards.active_wallet_balance)}    colorKey="info"      loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
          <StatCard icon={StorefrontOutlinedIcon}           label="برداشت خروجی"              value={fmt(cards.withdrawal_outflow)}       colorKey="error"     loading={loading} />
        </Grid>
      </Grid>

      {/* ── Alert counters ── */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard icon={GavelIcon}              label="حراج‌های در حال اجرا"         value={cards.running_auctions    ?? "—"} colorKey="success" loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard icon={AssignmentIndOutlinedIcon} label="احراز هویت در انتظار"      value={cards.pending_kyc          ?? "—"} colorKey="warning" loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard icon={HourglassEmptyIcon}     label="درخواست برداشت در انتظار"    value={cards.pending_withdrawals  ?? "—"} colorKey="error"   loading={loading} />
        </Grid>
      </Grid>

      {/* ── Revenue trend chart ── */}
      <SectionHeading>روند درآمد و تراکنش‌ها</SectionHeading>
      <ChartCard sx={{ mb: 4 }}>
        <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
          {Object.entries(SERIES_LABELS).map(([key, label]) => (
            <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 10, height: 3, borderRadius: 2, bgcolor: SERIES_COLORS[key] }} />
              <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{label}</Typography>
            </Box>
          ))}
        </Box>
        {loading ? (
          <Skeleton variant="rounded" height={220} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 2 }} />
        ) : (
          <Box sx={{ direction: "ltr" }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  {Object.entries(SERIES_COLORS).map(([key, color]) => (
                    <linearGradient key={key} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke={gridColor} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} width={52} />
                <Tooltip content={<RevenueTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
                {Object.keys(SERIES_COLORS).map((key) => (
                  <Area key={key} type="monotone" dataKey={key} stroke={SERIES_COLORS[key]} strokeWidth={1.5} fill={`url(#grad_${key})`} dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </ChartCard>

      {/* ── Auctions section ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Top auctions table */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <ChartCard>
            <SectionHeading>برترین حراج‌ها</SectionHeading>
            {loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={38} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1.5 }} />
                ))}
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["عنوان حراج", "وضعیت", "دوره‌ها", "بلیت فروخته‌شده", "GMV"].map((h) => (
                      <TableCell key={h} align="right" sx={{ fontSize: 11, color: "text.disabled", fontWeight: 700, borderColor: "modules.goldBorder", pb: 1 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(auctionData?.top_auctions ?? []).map((row) => (
                    <TableRow key={row.id} sx={{ "&:hover": { background: "rgba(255,255,255,0.03)" }, "&:last-child td": { border: 0 } }}>
                      <TableCell align="right" sx={{ fontSize: 12.5, fontWeight: 500, color: "text.primary", borderColor: "modules.glassBorderLight" }}>{row.title}</TableCell>
                      <TableCell align="right" sx={{ borderColor: "modules.glassBorderLight" }}>
                        <Chip label={row.status} size="small" sx={{ fontSize: 10, height: 20 }} />
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: 12, color: "text.secondary", borderColor: "modules.glassBorderLight" }}>{row.runs_count ?? 0}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 12, color: "text.secondary", borderColor: "modules.glassBorderLight" }}>{row.tickets_sold ?? 0}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600, color: "secondary.main", direction: "ltr", borderColor: "modules.glassBorderLight" }}>{fmt(row.gmv)} T</TableCell>
                    </TableRow>
                  ))}
                  {!loading && (auctionData?.top_auctions ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.disabled", fontSize: 13, border: 0 }}>حراجی یافت نشد</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </ChartCard>
        </Grid>

        {/* Auction status bar */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <ChartCard>
            <SectionHeading>وضعیت حراج‌ها</SectionHeading>
            {loading ? (
              <Skeleton variant="rounded" height={200} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 2 }} />
            ) : (
              <Box sx={{ direction: "ltr" }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={auctionStatusData} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke={gridColor} horizontal={false} />
                    <XAxis type="number" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} width={68} />
                    <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "#001533", border: `1px solid ${gold}33`, borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16}>
                      {auctionStatusData.map((_, i) => (
                        <Cell key={i} fill={gold} fillOpacity={0.4 + i * 0.12} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </ChartCard>
        </Grid>
      </Grid>

      {/* ── Operations alerts ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Stale KYC */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard>
            <SectionHeading>احراز هویت معلق</SectionHeading>
            {loading ? <Skeleton variant="rounded" height={160} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 2 }} /> : (
              stalePending.length === 0
                ? <Typography sx={{ fontSize: 12, color: "text.disabled", textAlign: "center", py: 3 }}>موردی وجود ندارد</Typography>
                : stalePending.map((k) => (
                    <AlertRow key={k.id} label={k.username} sub={k.level ? `سطح ${k.level}` : undefined} />
                  ))
            )}
          </ChartCard>
        </Grid>

        {/* Failed payments */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard>
            <SectionHeading>پرداخت‌های ناموفق</SectionHeading>
            {loading ? <Skeleton variant="rounded" height={160} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 2 }} /> : (
              failedPayments.length === 0
                ? <Typography sx={{ fontSize: 12, color: "text.disabled", textAlign: "center", py: 3 }}>موردی وجود ندارد</Typography>
                : failedPayments.map((p) => (
                    <AlertRow key={p.id} label={p.username} sub={fmt(p.amount) + " T"} accent />
                  ))
            )}
          </ChartCard>
        </Grid>

        {/* Low inventory */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard>
            <SectionHeading>موجودی پایین بلیت</SectionHeading>
            {loading ? <Skeleton variant="rounded" height={160} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 2 }} /> : (
              lowInventory.length === 0
                ? <Typography sx={{ fontSize: 12, color: "text.disabled", textAlign: "center", py: 3 }}>موردی وجود ندارد</Typography>
                : lowInventory.map((t, i) => (
                    <AlertRow
                      key={i}
                      label={t.auction_title}
                      sub={`سطح ${t.level} · ${t.sold_quantity}/${t.stock_quantity}`}
                      accent={t.sold_quantity >= t.stock_quantity}
                    />
                  ))
            )}
          </ChartCard>
        </Grid>
      </Grid>

      {/* ── Activity feed ── */}
      <SectionHeading>آخرین فعالیت‌ها</SectionHeading>
      <ChartCard>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={32} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1 }} />
            ))}
          </Box>
        ) : activityFeed.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: "text.disabled", textAlign: "center", py: 3 }}>فعالیتی ثبت نشده</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {activityFeed.map((log) => (
              <Box key={log.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.25, px: 1, borderBottom: "1px solid", borderColor: "modules.glassBorderLight", "&:last-child": { borderBottom: "none" } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "modules.glassBorderStrong", flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 12, color: "text.primary", fontWeight: 500 }}>{log.action}</Typography>
                  <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{log.auditable_type?.replace("App\\Models\\", "")}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {log.actor && <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{log.actor}</Typography>}
                  <Typography sx={{ fontSize: 11, color: "text.disabled", direction: "ltr", display: "inline-block" }}>
                    {new Date(log.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </ChartCard>
    </Box>
  );
}

// ─── Styled components ──────────────────────────────────────────────────────────

const WelcomeSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  paddingBottom: theme.spacing(3.5),
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0, right: 0, left: 0, height: 1,
    background: `linear-gradient(to left, ${theme.palette.modules.goldBorder}, transparent 65%)`,
  },
}));

const StatCardRoot = styled(Paper, {
  shouldForwardProp: (p) => p !== "colorKey",
})(({ theme, colorKey }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 12,
  background: `linear-gradient(145deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
  border: `1px solid ${theme.palette.modules.glassBorder}`,
  height: "100%",
  position: "relative",
  overflow: "hidden",
  transition: "transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
  cursor: "default",
  "&:hover": {
    transform: "translateY(-2px)",
    borderColor: (theme.palette[colorKey]?.main ?? "#fff") + "33",
    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
  },
  "&::before": {
    content: '""', position: "absolute", inset: 0, pointerEvents: "none",
    background: `radial-gradient(ellipse at top right, ${(theme.palette[colorKey]?.main ?? "#fff")}14 0%, transparent 60%)`,
  },
  "&::after": {
    content: '""', position: "absolute",
    bottom: 0, right: 0, left: 0, height: 2,
    borderRadius: "0 0 12px 12px",
    background: `linear-gradient(to left, ${(theme.palette[colorKey]?.main ?? "#fff")}44, transparent 70%)`,
  },
}));

const IconBox = styled(Box, {
  shouldForwardProp: (p) => p !== "colorKey",
})(({ theme, colorKey }) => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  background: (theme.palette[colorKey]?.main ?? "#fff") + "18",
  border: `1px solid ${(theme.palette[colorKey]?.main ?? "#fff")}28`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}));

const ChartCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  background: `linear-gradient(145deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
  border: `1px solid ${theme.palette.modules.glassBorder}`,
  height: "100%",
}));

const TooltipBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  background: "#001533",
  border: `1px solid ${theme.palette.modules.goldBorder}`,
  borderRadius: 8,
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
}));
