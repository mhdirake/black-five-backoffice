"use client";

import MenuIcon from "@mui/icons-material/Menu";
import { Box, IconButton } from "@mui/material";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { DashboardContent, DashboardRoot } from "./style";

export default function DashboardLayoutClient({ children, userName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <DashboardRoot>
      <DashboardContent>
        <Box sx={{ display: { xs: "flex", md: "none" }, mb: 2 }}>
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{
              color: "text.primary",
              border: "1px solid",
              borderColor: "modules.glassBorder",
              borderRadius: 2,
              p: 0.75,
            }}
          >
            <MenuIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
        {children}
      </DashboardContent>
      <Sidebar
        userName={userName}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
    </DashboardRoot>
  );
}
