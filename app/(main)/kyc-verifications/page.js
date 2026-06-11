"use client";

import { useCallback, useEffect, useState } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import { kycVerificationsApi } from "@/store/slices/kycVerifications/kycVerificationsApi";
import { Table } from "@/components/ui/Table";
import { PaginationBar } from "@/components/ui/PaginationBar";


const STATUS_MAP = {
  pending:  { label: "در انتظار",    color: "warning" },
  approved: { label: "تأییدشده",     color: "success" },
  rejected: { label: "ردشده",        color: "error" },
};

const LEVEL_MAP = {
  1: "سطح ۱",
  2: "سطح ۲",
  3: "سطح ۳",
};

const COLUMNS = [
  {
    key: "user",
    label: "کاربر",
    render: (row) => (
      <Box>
        <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "text.primary" }}>
          {row.user?.first_name} {row.user?.last_name}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{row.user?.email}</Typography>
      </Box>
    ),
  },
  {
    key: "level",
    label: "سطح",
    render: (row) => (
      <Chip label={LEVEL_MAP[row.level] ?? `سطح ${row.level}`} size="small" sx={{ fontSize: 11, height: 22 }} />
    ),
  },
  {
    key: "status",
    label: "وضعیت",
    render: (row) => {
      const s = STATUS_MAP[row.status] ?? { label: row.status, color: "default" };
      return <Chip label={s.label} color={s.color} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22 }} />;
    },
  },
  {
    key: "submitted_at",
    label: "تاریخ ارسال",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.secondary", direction: "ltr", display: "inline-block" }}>
        {row.submitted_at ? new Date(row.submitted_at).toLocaleDateString("en-GB") : "—"}
      </Typography>
    ),
  },
  {
    key: "reviewer",
    label: "بررسی‌کننده",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: row.reviewer ? "text.secondary" : "text.disabled" }}>
        {row.reviewer ? `${row.reviewer.first_name} ${row.reviewer.last_name}` : "—"}
      </Typography>
    ),
  },
];

export default function KycVerificationsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: pageSize, page_number: page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await kycVerificationsApi.list(params);
      setRows(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, page, statusFilter]);

  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleApprove = async (row) => {
    setProcessing(true);
    try {
      await kycVerificationsApi.approve(row.id);
      toast.success("احراز هویت تأیید شد");
      fetchList();
    } catch {
      toast.error("خطا در تأیید");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { toast.error("دلیل رد الزامی است"); return; }
    setProcessing(true);
    try {
      await kycVerificationsApi.reject(rejectTarget.id, { rejection_reason: rejectionReason });
      toast.success("احراز هویت رد شد");
      setRejectTarget(null);
      setRejectionReason("");
      fetchList();
    } catch {
      toast.error("خطا در رد");
    } finally {
      setProcessing(false);
    }
  };

  const actions = [
    {
      type: "icon",
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 17 }} />,
      onClick: handleApprove,
      sx: { color: "text.disabled", "&:hover": { color: "success.main" } },
      hidden: (row) => row.status !== "pending",
    },
    {
      type: "icon",
      icon: <CancelOutlinedIcon sx={{ fontSize: 17 }} />,
      onClick: (row) => { setRejectTarget(row); setRejectionReason(""); },
      sx: { color: "text.disabled", "&:hover": { color: "error.main" } },
      hidden: (row) => row.status !== "pending",
    },
  ];


  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
          احراز هویت
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          بررسی و مدیریت درخواست‌های KYC کاربران
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="جستجو..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          size="small"
          sx={{ width: { xs: "100%", sm: 280 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select label="وضعیت"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          size="small"
          sx={{ width: 150 }}
        >
          <MenuItem value="">همه</MenuItem>
          {Object.entries(STATUS_MAP).map(([k, { label }]) => (
            <MenuItem key={k} value={k}>{label}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Table columns={COLUMNS} rows={rows} loading={loading} actions={actions} emptyLabel="درخواستی یافت نشد" />

            <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Dialog open={!!rejectTarget} onClose={() => !processing && setRejectTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}>رد احراز هویت</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            دلیل رد درخواست <b style={{ color: "#fff" }}>{rejectTarget?.user?.first_name} {rejectTarget?.user?.last_name}</b> را وارد کنید:
          </Typography>
          <TextField
            label="دلیل رد"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setRejectTarget(null)} disabled={processing} sx={{ color: "text.disabled" }}>انصراف</Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={processing} sx={{ fontWeight: 700, minWidth: 80 }}>
            {processing ? "..." : "رد کردن"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
