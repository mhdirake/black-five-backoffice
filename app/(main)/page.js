"use client";

import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import GavelIcon from "@mui/icons-material/Gavel";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Grid from "@mui/material/Grid2";
import { Box, Paper, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useSession } from "next-auth/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const stats = [
  { label: "کل کاربران", value: "—", icon: PeopleIcon, colorKey: "info" },
  { label: "حراج‌های فعال", value: "—", icon: GavelIcon, colorKey: "secondary" },
  { label: "بلیت‌های فروخته‌شده", value: "—", icon: ConfirmationNumberIcon, colorKey: "success" },
  { label: "تراکنش‌های امروز", value: "—", icon: TrendingUpIcon, colorKey: "warning" },
];

const weeklyData = [
  { day: "شنبه", amount: 42 },
  { day: "یکشنبه", amount: 68 },
  { day: "دوشنبه", amount: 51 },
  { day: "سه‌شنبه", amount: 92 },
  { day: "چهار‌شنبه", amount: 74 },
  { day: "پنج‌شنبه", amount: 115 },
  { day: "جمعه", amount: 83 },
];

const auctionData = [
  { category: "لوازم خانگی", count: 12 },
  { category: "خودرو", count: 8 },
  { category: "الکترونیک", count: 21 },
  { category: "طلا", count: 6 },
  { category: "ملک", count: 4 },
];

function AreaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <TooltipBox>
      <Typography sx={{ fontSize: 11, color: "text.disabled", mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: "secondary.main" }}>
        {payload[0].value} میلیون
      </Typography>
    </TooltipBox>
  );
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <TooltipBox>
      <Typography sx={{ fontSize: 11, color: "text.disabled", mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: "info.main" }}>
        {payload[0].value} حراج
      </Typography>
    </TooltipBox>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name;
  const theme = useTheme();

  const gold = theme.palette.secondary.main;
  const blue = theme.palette.info.main;
  const gridColor = "rgba(255,255,255,0.05)";
  const axisColor = "rgba(255,255,255,0.25)";

  return (
    <Box>
      <WelcomeSection>
        <Typography component="p" sx={{ fontSize: 11.5, fontWeight: 600, color: "secondary.main", mb: 1.25, opacity: 0.8 }}>
          پنل مدیریت بلک‌فایو
        </Typography>
        <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.75, lineHeight: 1.25 }}>
          {userName ? `خوش آمدید، ${userName}` : "داشبورد"}
        </Typography>
        <Typography sx={{ fontSize: 14, color: "text.disabled" }}>
          نمای کلی پلتفرم بلک فایو
        </Typography>
      </WelcomeSection>

      <SectionLabel>
        <GoldBar />
        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "text.disabled" }}>
          آمار کلی
        </Typography>
      </SectionLabel>

      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {stats.map(({ label, value, icon: Icon, colorKey }) => (
          <Grid key={label} size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatCard colorKey={colorKey}>
              <IconBox colorKey={colorKey}>
                <Icon sx={{ fontSize: 24, color: `${colorKey}.main` }} />
              </IconBox>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 11, color: "text.disabled", fontWeight: 500, mb: 0.75 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontSize: 30, fontWeight: 700, color: "text.primary", lineHeight: 1 }}>
                  {value}
                </Typography>
              </Box>
            </StatCard>
          </Grid>
        ))}
      </Grid>

      <SectionLabel sx={{ mb: 2.5 }}>
        <GoldBar />
        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "text.disabled" }}>
          نمودارها
        </Typography>
      </SectionLabel>

      <Grid container spacing={2.5}>
        {/* Area chart — weekly transactions */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <ChartCard>
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "text.primary", mb: 0.4 }}>
                تراکنش‌های هفتگی
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                مجموع مبلغ تراکنش‌ها (میلیون تومان)
              </Typography>
            </Box>
            <Box sx={{ direction: "ltr" }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={weeklyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={gold} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: axisColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    reversed
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}M`}
                  />
                  <Tooltip content={<AreaTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={gold}
                    strokeWidth={2}
                    fill="url(#goldGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: gold, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>

        {/* Bar chart — auctions by category */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <ChartCard>
            <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "text.primary", mb: 0.4 }}>
                حراج‌ها
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                تعداد حراج فعال به تفکیک دسته
              </Typography>
            </Box>
            <Box sx={{ direction: "ltr" }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={auctionData}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid stroke={gridColor} horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: axisColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fill: axisColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={72}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
                    {auctionData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={blue}
                        fillOpacity={0.55 + i * 0.09}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── Styled Components ────────────────────────────────────────────────────────

const WelcomeSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(5),
  position: "relative",
  paddingBottom: theme.spacing(4),
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    height: 1,
    background: `linear-gradient(to left, ${theme.palette.modules.goldBorder}, transparent 65%)`,
  },
}));

const SectionLabel = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 20,
});

const GoldBar = styled(Box)(({ theme }) => ({
  width: 3,
  height: 16,
  borderRadius: "0 4px 4px 0",
  background: `linear-gradient(to bottom, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
  boxShadow: `0 0 8px ${theme.palette.modules.backgroundGoldGlow}`,
  flexShrink: 0,
}));

const StatCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "colorKey",
})(({ theme, colorKey }) => ({
  padding: theme.spacing(3),
  borderRadius: 10,
  background: `linear-gradient(145deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
  border: `1px solid ${theme.palette.modules.glassBorder}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2.5),
  position: "relative",
  overflow: "hidden",
  cursor: "default",
  transition: "transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease",
  "&:hover": {
    transform: "translateY(-3px)",
    borderColor: theme.palette[colorKey]?.main + "33",
    boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse at top right, ${theme.palette[colorKey]?.main}18 0%, transparent 62%)`,
    pointerEvents: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    height: 2,
    background: `linear-gradient(to left, ${theme.palette[colorKey]?.main}55, transparent 70%)`,
    borderRadius: "0 0 10px 10px",
  },
}));

const IconBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "colorKey",
})(({ theme, colorKey }) => ({
  width: 52,
  height: 52,
  borderRadius: 8,
  background: theme.palette[colorKey]?.main + "18",
  border: `1px solid ${theme.palette[colorKey]?.main}28`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
}));

const ChartCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 10,
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
