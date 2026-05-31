"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import GavelIcon from "@mui/icons-material/Gavel";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from "@mui/icons-material/People";
import { Avatar, Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/config/authClient";
import { SIDEBAR_WIDTH } from "@/app/(main)/style";
import { useLocalization } from "@/context/LocalizationProvider";

const navItems = [
  { label: "داشبورد", href: "/", icon: DashboardIcon },
  { label: "کاربران", href: "/users", icon: PeopleIcon },
  { label: "حراج‌ها", href: "/auctions", icon: GavelIcon },
];

export default function Sidebar({ userName }) {
  const pathname = usePathname();
  const { isRtl } = useLocalization()

  return (
    <SidebarDrawer variant="permanent" anchor="right">
      <LogoBox>
        <Image
          src="/images/black-five-logo.png"
          alt="Black Five"
          width={110}
          height={72}
          priority
          style={{ width: 70, height: "auto" }}
        />
      </LogoBox>

      <Divider sx={{ borderColor: "secondary.main", opacity: 0.1, mx: 2 }} />

      <List sx={{ flexGrow: 1, pt: 2, px: 1.5 }}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <ListItem key={href} disablePadding sx={{ mb: 0.5 }}>
              <NavButton component={Link} href={href} isActive={isActive}>
                <ListItemIcon sx={{ minWidth: 36, color: isActive ? "secondary.main" : "text.disabled", transition: "color 200ms ease", ...(isActive && { filter: "drop-shadow(0 0 6px rgba(253,197,0,0.5))" }) }}>
                  <Icon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: 13.5,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "text.primary" : "text.disabled",
                        textAlign: isRtl ? "right" : "left"
                      },
                    },
                  }}
                />
              </NavButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ px: 1.5, pb: 2 }}>
        <Divider sx={{ mb: 2, borderColor: "modules.glassBorderLight" }} />

        {userName && (
          <UserBox>
            <Avatar sx={{ width: 30, height: 30, fontSize: 13, fontWeight: 700, bgcolor: "modules.goldGlass", color: "secondary.main", border: "1.5px solid", borderColor: "modules.goldBorder" }}>
              {userName[0]}
            </Avatar>
            <Typography noWrap sx={{ fontSize: 13, color: "text.disabled", fontWeight: 500 }}>
              {userName}
            </Typography>
          </UserBox>
        )}

        <LogoutButton onClick={() => logout("/")}>
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <LogoutIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary="خروج"
            slotProps={{ primary: { sx: { fontSize: 13.5, color: "inherit", fontWeight: 500, textAlign: isRtl ? "right" : "left" } } }}
          />
        </LogoutButton>
      </Box>
    </SidebarDrawer>
  );
}

const SidebarDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: SIDEBAR_WIDTH,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    background: theme.palette.background.default,
    borderLeft: `1px solid ${theme.palette.modules.goldGlass}`,
    borderRight: "none",
  },
}));

const LogoBox = styled(Box)({
  padding: "28px 24px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const NavButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== "isActive",
})(({ theme, isActive }) => ({
  borderRadius: 12,
  paddingInline: 12,
  paddingBlock: 9,
  position: "relative",
  transition: "all 200ms ease",
  ...(isActive
    ? {
      background: theme.palette.modules.goldGlass,
      boxShadow: `inset 0 0 0 1px ${theme.palette.modules.goldGlassStrong}`,
      "&::after": {
        content: '""',
        position: "absolute",
        right: 0,
        top: "18%",
        height: "64%",
        width: 3,
        borderRadius: "4px 0 0 4px",
        background: `linear-gradient(to bottom, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
        boxShadow: `0 0 8px ${theme.palette.modules.backgroundGoldGlow}`,
      },
    }
    : {
      "&:hover": {
        background: theme.palette.modules.glassBorderLight,
      },
    }),
}));

const UserBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  paddingInline: 12,
  paddingBlock: 8,
  marginBottom: 8,
  borderRadius: 12,
  background: theme.palette.modules.glassBorderLight,
  border: `1px solid ${theme.palette.modules.glassBorder}`,
}));

const LogoutButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 12,
  paddingInline: 12,
  paddingBlock: 7,
  color: theme.palette.error.main,
  opacity: 0.7,
  transition: "all 200ms ease",
  "&:hover": {
    background: `${theme.palette.error.main}12`,
    opacity: 1,
  },
}));
