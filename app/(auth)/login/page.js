"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  styled,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { toast } from "react-toastify";

const goldFieldSx = {
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "secondary.main",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "secondary.main",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ username, password }) => {
    setLoading(true);
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error("نام کاربری یا رمز عبور اشتباه است");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <Root>
      <GoldGlow />

      <Card>
        <LogoWrapper>
          <AdminPanelSettingsIcon sx={{ fontSize: 32, color: "secondary.main" }} />
        </LogoWrapper>

        <Typography
          variant="h5"
          fontWeight={800}
          letterSpacing={2}
          mb={0.75}
          sx={{ color: "text.primary", fontFamily: "monospace" }}
        >
          BLACK FIVE
        </Typography>

        <Typography variant="body2" mb={4} sx={{ color: "text.disabled" }}>
          ورود به پنل مدیریت
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            fullWidth
            label="نام کاربری"
            autoComplete="username"
            autoFocus
            error={!!errors.username}
            helperText={errors.username?.message}
            sx={{ mb: 2.5, ...goldFieldSx }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                  </InputAdornment>
                ),
              },
            }}
            {...register("username", { required: "نام کاربری الزامی است" })}
          />

          <TextField
            fullWidth
            label="رمز عبور"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{ mb: 4, ...goldFieldSx }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      size="small"
                      tabIndex={-1}
                      sx={{
                        color: "text.disabled",
                        transition: "color 200ms",
                        "&:hover": { color: "secondary.main" },
                      }}
                    >
                      {showPassword
                        ? <VisibilityOffIcon fontSize="small" />
                        : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            {...register("password", { required: "رمز عبور الزامی است" })}
          />

          <LoginButton
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "ورود"}
          </LoginButton>
        </form>

        <Typography variant="caption" mt={4} display="block" sx={{ color: "text.disabled", opacity: 0.5 }}>
          Black Five © {new Date().getFullYear()}
        </Typography>
      </Card>
    </Root>
  );
}

const Root = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  position: "relative",
  overflow: "hidden",
}));

const GoldGlow = styled(Box)(() => ({
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(253, 197, 0, 0.09) 0%, transparent 70%)",
  pointerEvents: "none",
}));

const Card = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  width: "100%",
  maxWidth: 440,
  padding: theme.spacing(5, 5, 4),
  borderRadius: 24,
  backgroundColor: "rgba(0, 14, 36, 0.72)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: `1px solid ${theme.palette.modules.goldBorder}`,
  boxShadow: [
    "0 32px 80px rgba(0, 0, 0, 0.6)",
    "inset 0 1px 0 rgba(253, 197, 0, 0.12)",
  ].join(", "),
  textAlign: "center",
}));

const LogoWrapper = styled(Box)(({ theme }) => ({
  width: 68,
  height: 68,
  borderRadius: "50%",
  background: theme.palette.modules.goldGlass,
  border: `1px solid ${theme.palette.modules.goldBorderStrong}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  marginBottom: theme.spacing(2.5),
  boxShadow: `0 0 32px ${theme.palette.modules.backgroundGoldGlow}`,
}));

const LoginButton = styled(Button)(({ theme }) => ({
  height: 44,
  fontWeight: 700,
  fontSize: "1rem",
  letterSpacing: 2,
  borderRadius: 12,
  background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.dark} 100%)`,
  color: theme.palette.secondary.contrastText,
  boxShadow: `0 4px 24px rgba(253, 197, 0, 0.25)`,
  transition: "all 250ms ease",
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
    boxShadow: `0 8px 32px rgba(253, 197, 0, 0.35)`,
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
  "&.Mui-disabled": {
    background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.dark} 100%)`,
    opacity: 0.6,
    color: theme.palette.secondary.contrastText,
  },
}));
