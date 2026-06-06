"use client";

import { Box, styled } from "@mui/material";

export const SIDEBAR_WIDTH = 260;

export const DashboardRoot = styled(Box)(({ theme }) => ({
  display: "flex",
  minHeight: "100dvh",
  background: theme.palette.background.default,
}));

export const DashboardContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  marginInlineEnd: 0,
  marginInlineStart: SIDEBAR_WIDTH,
  background: theme.palette.background.default,
  backgroundImage: [
    `radial-gradient(ellipse at 85% 15%, ${theme.palette.modules.backgroundPrimaryGlow} 0%, transparent 52%)`,
    `radial-gradient(ellipse at 15% 85%, ${theme.palette.modules.backgroundGoldGlow} 0%, transparent 48%)`,
  ].join(", "),
  padding: theme.spacing(4),
  minHeight: "100dvh",
  [theme.breakpoints.down("md")]: {
    marginInlineStart: 0,
    padding: theme.spacing(2.5),
  },
}));
