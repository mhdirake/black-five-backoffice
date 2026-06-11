"use client";

import { useEffect, useState } from "react";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { usersApi } from "@/store/slices/users/usersApi";

const KYC_STATUS_MAP = {
  pending:  { label: "در انتظار",  color: "warning" },
  approved: { label: "تأیید‌شده", color: "success" },
  rejected: { label: "ردشده",     color: "error" },
};

const DEPOSIT_STATUS_MAP = {
  pending:   { label: "در انتظار",  color: "warning" },
  paid:      { label: "پرداخت‌شده", color: "success" },
  failed:    { label: "ناموفق",     color: "error" },
  cancelled: { label: "لغو‌شده",   color: "default" },
};

const WITHDRAWAL_STATUS_MAP = {
  pending:   { label: "در انتظار",  color: "warning" },
  approved:  { label: "تأیید‌شده", color: "info" },
  rejected:  { label: "ردشده",     color: "error" },
  completed: { label: "تکمیل‌شده", color: "success" },
  cancelled: { label: "لغو‌شده",   color: "default" },
};

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.05)", "&:last-child": { borderBottom: "none" } }}>
      <Typography sx={{ fontSize: 12, color: "text.disabled", fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, color: "text.primary", fontWeight: 500, textAlign: "left", direction: "ltr" }}>{value ?? "—"}</Typography>
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", mb: 2.5 }}>
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "secondary.main", mb: 1.5 }}>{title}</Typography>
      {children}
    </Paper>
  );
}

function StatusChip({ map, status }) {
  const s = map[status] ?? { label: status, color: "default" };
  return <Chip label={s.label} color={s.color} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22 }} />;
}

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    usersApi.detail(id).then((res) => {
      setUser(res?.data ?? null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={100} sx={{ mb: 3, bgcolor: "rgba(255,255,255,0.04)", borderRadius: "14px" }} />
        <Skeleton variant="rounded" height={300} sx={{ bgcolor: "rgba(255,255,255,0.04)", borderRadius: "14px" }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography sx={{ color: "text.disabled" }}>کاربر یافت نشد</Typography>
      </Box>
    );
  }

  const wallet = user.wallet;
  const kyc = user.latest_kyc_verification;
  const participations = user.auction_participations ?? [];
  const tickets = user.tickets ?? [];
  const freePasses = user.free_passes ?? [];
  const deposits = user.payment_deposits ?? [];
  const withdrawals = user.withdrawal_requests ?? [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 4 }}>
        <IconButton onClick={() => router.back()} size="small" sx={{ mt: 0.5, color: "text.disabled", "&:hover": { color: "text.primary" } }}>
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <Box sx={{
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(253,197,0,0.12)", border: "1px solid rgba(253,197,0,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <PersonOutlineIcon sx={{ fontSize: 22, color: "secondary.main" }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ color: "text.primary", fontWeight: 700, lineHeight: 1.25 }}>
                {user.username}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.disabled" }}>{user.email}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
            {(user.roles ?? []).map((r) => (
              <Chip key={r.id} label={r.name} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
            ))}
            {kyc && <StatusChip map={KYC_STATUS_MAP} status={kyc.status} />}
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {[
          { label: "اطلاعات پروفایل", icon: <PersonOutlineIcon sx={{ fontSize: 16 }} /> },
          { label: "احراز هویت", icon: <AssignmentIndOutlinedIcon sx={{ fontSize: 16 }} /> },
          { label: "کیف‌پول", icon: <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16 }} /> },
          { label: "مشارکت‌ها", icon: <GavelOutlinedIcon sx={{ fontSize: 16 }} /> },
          { label: "بلیت‌ها", icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 16 }} /> },
          { label: "پرداخت‌ها و برداشت‌ها", icon: <PaymentsOutlinedIcon sx={{ fontSize: 16 }} /> },
        ].map(({ label }, i) => (
          <Tab key={i} label={label} sx={{ fontSize: 12, fontWeight: 600, minHeight: 44 }} />
        ))}
      </Tabs>

      {/* Tab 0: Profile */}
      {tab === 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
          <Section title="اطلاعات پایه">
            <InfoRow label="شناسه" value={user.id} />
            <InfoRow label="نام کاربری" value={user.username} />
            <InfoRow label="ایمیل" value={user.email} />
            <InfoRow label="نام" value={user.first_name} />
            <InfoRow label="نام خانوادگی" value={user.last_name} />
            <InfoRow label="شماره موبایل" value={user.phone} />
          </Section>
          <Section title="فعالیت">
            <InfoRow label="تاریخ ثبت‌نام" value={user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB") : "—"} />
            <InfoRow label="آخرین ورود" value={user.last_login_at ? new Date(user.last_login_at).toLocaleString("en-GB") : "—"} />
            <InfoRow label="وضعیت" value={user.is_active ? "فعال" : "غیرفعال"} />
          </Section>
        </Box>
      )}

      {/* Tab 1: KYC */}
      {tab === 1 && (
        <Box>
          {!kyc ? (
            <Typography sx={{ color: "text.disabled", textAlign: "center", py: 4 }}>احراز هویتی ثبت نشده</Typography>
          ) : (
            <Section title="آخرین احراز هویت">
              <InfoRow label="سطح" value={`سطح ${kyc.level}`} />
              <InfoRow label="وضعیت" value={<StatusChip map={KYC_STATUS_MAP} status={kyc.status} />} />
              <InfoRow label="تاریخ ارسال" value={kyc.submitted_at ? new Date(kyc.submitted_at).toLocaleDateString("en-GB") : "—"} />
              <InfoRow label="تاریخ بررسی" value={kyc.reviewed_at ? new Date(kyc.reviewed_at).toLocaleDateString("en-GB") : "—"} />
            </Section>
          )}
        </Box>
      )}

      {/* Tab 2: Wallet */}
      {tab === 2 && (
        <Box>
          {!wallet ? (
            <Typography sx={{ color: "text.disabled", textAlign: "center", py: 4 }}>کیف‌پولی یافت نشد</Typography>
          ) : (
            <Section title="کیف‌پول اصلی">
              <InfoRow label="شناسه" value={wallet.id} />
              <InfoRow label="ارز" value={wallet.currency} />
              <InfoRow label="موجودی" value={`${Number(wallet.balance).toLocaleString("en-US")} ${wallet.currency}`} />
              <InfoRow label="موجودی مسدود" value={`${Number(wallet.blocked_balance).toLocaleString("en-US")} ${wallet.currency}`} />
              <InfoRow label="وضعیت" value={wallet.is_active ? "فعال" : "غیرفعال"} />
            </Section>
          )}
        </Box>
      )}

      {/* Tab 3: Participations */}
      {tab === 3 && (
        <Paper sx={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["حراج", "وضعیت", "تاریخ شروع", "تاریخ پایان"].map((h) => (
                  <TableCell key={h} align="right" sx={{ fontSize: 11, color: "text.disabled", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {participations.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.disabled", border: 0 }}>مشارکتی ثبت نشده</TableCell></TableRow>
              ) : participations.map((p) => (
                <TableRow key={p.id} sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell align="right" sx={{ fontSize: 12.5, fontWeight: 500, borderColor: "rgba(255,255,255,0.05)" }}>{p.auction?.title ?? "—"}</TableCell>
                  <TableCell align="right" sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <Chip label={p.status} size="small" sx={{ fontSize: 10, height: 20 }} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", borderColor: "rgba(255,255,255,0.05)" }}>
                    {p.joined_at ? new Date(p.joined_at).toLocaleDateString("en-GB") : "—"}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", borderColor: "rgba(255,255,255,0.05)" }}>
                    {p.finished_at ? new Date(p.finished_at).toLocaleDateString("en-GB") : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Tab 4: Tickets */}
      {tab === 4 && (
        <Paper sx={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {["حراج", "تعداد", "قیمت خرید", "منبع", "بلیت‌های ورود رایگان"].map((h) => (
                  <TableCell key={h} align="right" sx={{ fontSize: 11, color: "text.disabled", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...tickets, ...freePasses].length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.disabled", border: 0 }}>بلیتی ثبت نشده</TableCell></TableRow>
              ) : tickets.map((t) => (
                <TableRow key={t.id} sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell align="right" sx={{ fontSize: 12.5, fontWeight: 500, borderColor: "rgba(255,255,255,0.05)" }}>{t.auction?.title ?? "—"}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, borderColor: "rgba(255,255,255,0.05)" }}>{t.quantity}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 12, fontWeight: 600, color: "secondary.main", direction: "ltr", borderColor: "rgba(255,255,255,0.05)" }}>
                    {Number(t.purchase_price).toLocaleString("en-US")}
                  </TableCell>
                  <TableCell align="right" sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <Chip label={t.source ?? "—"} size="small" sx={{ fontSize: 10, height: 20 }} />
                  </TableCell>
                  <TableCell align="right" sx={{ borderColor: "rgba(255,255,255,0.05)" }}>—</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Tab 5: Payments & Withdrawals */}
      {tab === 5 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Section title="واریزها">
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["مبلغ", "وضعیت", "تاریخ"].map((h) => (
                    <TableCell key={h} align="right" sx={{ fontSize: 11, color: "text.disabled", fontWeight: 700, pt: 0, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {deposits.length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.disabled", border: 0 }}>واریزی ثبت نشده</TableCell></TableRow>
                ) : deposits.map((d) => (
                  <TableRow key={d.id} sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600, color: "success.main", direction: "ltr", borderColor: "rgba(255,255,255,0.05)" }}>
                      +{Number(d.amount).toLocaleString("en-US")}
                    </TableCell>
                    <TableCell align="right" sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      <StatusChip map={DEPOSIT_STATUS_MAP} status={d.status} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", borderColor: "rgba(255,255,255,0.05)" }}>
                      {d.created_at ? new Date(d.created_at).toLocaleDateString("en-GB") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>

          <Section title="درخواست‌های برداشت">
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["مبلغ", "وضعیت", "تاریخ"].map((h) => (
                    <TableCell key={h} align="right" sx={{ fontSize: 11, color: "text.disabled", fontWeight: 700, pt: 0, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawals.length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.disabled", border: 0 }}>درخواست برداشتی ثبت نشده</TableCell></TableRow>
                ) : withdrawals.map((w) => (
                  <TableRow key={w.id} sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600, color: "error.main", direction: "ltr", borderColor: "rgba(255,255,255,0.05)" }}>
                      -{Number(w.amount).toLocaleString("en-US")}
                    </TableCell>
                    <TableCell align="right" sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      <StatusChip map={WITHDRAWAL_STATUS_MAP} status={w.status} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", borderColor: "rgba(255,255,255,0.05)" }}>
                      {w.created_at ? new Date(w.created_at).toLocaleDateString("en-GB") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        </Box>
      )}
    </Box>
  );
}
