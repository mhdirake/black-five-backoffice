"use client";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CategoryIcon from "@mui/icons-material/Category";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GavelIcon from "@mui/icons-material/Gavel";
import HistoryIcon from "@mui/icons-material/History";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import PaymentsIcon from "@mui/icons-material/Payments";
import PeopleIcon from "@mui/icons-material/People";
import { Avatar, Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/config/authClient";
import { SIDEBAR_WIDTH } from "@/app/(main)/style";
import { useLocalization } from "@/context/LocalizationProvider";
import { useSelector } from "react-redux";

const navGroups = [
  {
    items: [
      { label: "داشبورد", href: "/", icon: DashboardIcon },
    ],
  },
  {
    group: "مدیریت حراج",
    items: [
      { label: "حراج‌ها", href: "/auctions", icon: GavelIcon },
      { label: "بلیت‌ها", href: "/tickets", icon: ConfirmationNumberIcon },
      { label: "بلیت‌های ورود حراج", href: "/auction-entry-tickets", icon: ConfirmationNumberIcon },
      { label: "استفاده از بلیت تخفیف", href: "/auction-discount-ticket-usages", icon: LocalOfferOutlinedIcon },
    ],
  },
  {
    group: "محصولات و دسته‌بندی‌ها",
    items: [
      { label: "محصولات", href: "/products", icon: Inventory2Icon },
      { label: "دسته‌بندی‌ها", href: "/categories", icon: CategoryIcon },
    ],
  },
  {
    group: "مدیریت کاربران",
    items: [
      { label: "کاربران", href: "/users", icon: PeopleIcon },
      { label: "احراز هویت کاربران", href: "/kyc-verifications", icon: AssignmentIndIcon },
    ],
  },
  {
    group: "مدیریت مالی",
    items: [
      { label: "کیف پول کاربران", href: "/wallets", icon: AccountBalanceWalletIcon },
      { label: "تراکنش‌های کیف پول", href: "/wallet-transactions", icon: PaymentsIcon },
      { label: "پرداخت‌های کاربران", href: "/payment-deposits", icon: PaymentsIcon },
      { label: "درخواست‌های برداشت", href: "/withdrawal-requests", icon: PaymentsIcon },
      { label: "درگاه‌های پرداخت", href: "/payment-gateways", icon: PaymentsIcon },
    ],
  },
  {
    group: "مدیریت سیستم",
    items: [
      { label: "گزارش فعالیت‌ها", href: "/audit-logs", icon: HistoryIcon },
    ],
  },
];

export default function Sidebar({ userName, mobileOpen, onMobileClose }) {
  const pathname = usePathname();
  const { isRtl } = useLocalization();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const user = useSelector((state) => state.auth.userInformation)

  const drawerContent = (
    <>
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

      <List sx={{ flexGrow: 1, pt: 2, px: 1.5, overflowY: "auto" }}>
        {navGroups.map(({ group, items }, gi) => (
          <Box key={gi}>
            {group && (
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: "text.disabled", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase", px: 1.5, pt: gi === 0 ? 0 : 1.5, pb: 0.75 }}>
                {group}
              </Typography>
            )}
            {items.map(({ label, href, icon: Icon }) => {
              const isActive = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
              return (
                <ListItem key={href} disablePadding sx={{ mb: 0.5 }}>
                  <NavButton
                    component={Link}
                    href={href}
                    isActive={isActive}
                    onClick={isMobile ? onMobileClose : undefined}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: isActive ? "secondary.main" : "text.disabled",
                        transition: "color 200ms ease",
                        ...(isActive && { filter: "drop-shadow(0 0 6px rgba(253,197,0,0.5))" }),
                      }}
                    >
                      <Icon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={label}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: 13,
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? "text.primary" : "text.disabled",
                            textAlign: isRtl ? "right" : "left",
                          },
                        },
                      }}
                    />
                  </NavButton>
                </ListItem>
              );
            })}
          </Box>
        ))}
      </List>

      <Box sx={{ px: 1.5, pb: 2 }}>
        <Divider sx={{ mb: 2, borderColor: "modules.glassBorderLight" }} />

        {user && (
          <UserBox>
            <Avatar
              sx={{
                width: 30,
                height: 30,
                fontSize: 13,
                fontWeight: 700,
                bgcolor: "modules.goldGlass",
                color: "secondary.main",
                border: "1.5px solid",
                borderColor: "modules.goldBorder",
              }}
            >
              {user?.first_name?.[0]}
            </Avatar>
            <Typography noWrap sx={{ fontSize: 13, color: "text.disabled", fontWeight: 500 }}>
              {user?.first_name} {user?.last_name}
            </Typography>
          </UserBox>
        )}

        <LogoutButton onClick={() => logout("/")}>
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <LogoutIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary="خروج"
            slotProps={{
              primary: {
                sx: {
                  fontSize: 13.5,
                  color: "inherit",
                  fontWeight: 500,
                  textAlign: isRtl ? "right" : "left",
                },
              },
            }}
          />
        </LogoutButton>
      </Box>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        anchor={"right"}
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            background: theme.palette.background.default,
            borderLeft: `1px solid ${theme.palette.modules.goldGlass}`,
            borderRight: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <SidebarDrawer variant="permanent" anchor="right">
      {drawerContent}
    </SidebarDrawer>
  );
}

// ─── Styled Components ────────────────────────────────────────────────────────

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
          left: 0,
          top: "18%",
          height: "64%",
          width: 3,
          borderRadius: "0 4px 4px 0",
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
