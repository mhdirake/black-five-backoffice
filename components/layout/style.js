"use client";

import { Box, styled } from "@mui/material";

export const Main = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  minHeight: "100vh",
}));
