"use client";

import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import GavelIcon from "@mui/icons-material/Gavel";
import PeopleIcon from "@mui/icons-material/People";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Grid from "@mui/material/Grid2";
import { Box, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSession } from "next-auth/react";

const stats = [
  { label: "کل کاربران", value: "—", icon: PeopleIcon, colorKey: "info" },
  { label: "حراج‌های فعال", value: "—", icon: GavelIcon, colorKey: "secondary" },
  { label: "بلیت‌های فروخته‌شده", value: "—", icon: ConfirmationNumberIcon, colorKey: "success" },
  { label: "تراکنش‌های امروز", value: "—", icon: TrendingUpIcon, colorKey: "warning" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name;

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

      <Grid container spacing={2.5}>
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
    </Box>
  );
}

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
