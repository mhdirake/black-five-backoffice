"use client";

import { useSearchParams } from "next/navigation";

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
import { toast } from "react-toastify";
import { withdrawalRequestsApi } from "@/store/slices/withdrawalRequests/withdrawalRequestsApi";
import { Table } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { DEFAULT_PAGE_LENGTH } from "@/constants/general";


const STATUS_MAP = {
  pending:   { label: "در انتظار",  color: "warning" },
  approved:  { label: "تأییدشده",   color: "success" },
  rejected:  { label: "ردشده",      color: "error" },
  completed: { label: "تکمیل‌شده", color: "info" },
};

const COLUMNS = [
  {
    key: "user",
    label: "کاربر",
    render: (row) => (
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.primary" }}>
          {row.user?.first_name} {row.user?.last_name}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{row.user?.email}</Typography>
      </Box>
    ),
  },
  {
    key: "amount",
    label: "مبلغ",
    render: (row) => {
      const val = parseFloat(row.amount);
      return (
        <Typography sx={{ fontSize: 13, fontWeight: 600, direction: "ltr", display: "inline-block" }}>
          {val ? val.toLocaleString("en-US") : "0"} {row.currency}
        </Typography>
      );
    },
  },
  {
    key: "bank_account",
    label: "شماره حساب",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.secondary", direction: "ltr", display: "inline-block" }}>
        {row.bank_account_number ?? "—"}
      </Typography>
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
    key: "created_at",
    label: "تاریخ",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", display: "inline-block" }}>
        {row.created_at ? new Date(row.created_at).toLocaleDateString("en-GB") : "—"}
      </Typography>
    ),
  },
];

export default function WithdrawalRequestsPage() {
  const searchParams = useSearchParams();
  const page = +searchParams.get("page") || 1;
  const pageSize = +searchParams.get("page_size") || DEFAULT_PAGE_LENGTH;
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: pageSize, page_number: page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await withdrawalRequestsApi.list(params);
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
    const t = setTimeout(() => { setSearch(searchInput); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleApprove = async (row) => {
    setProcessing(true);
    try {
      await withdrawalRequestsApi.approve(row.id);
      toast.success("درخواست برداشت تأیید شد");
      fetchList();
    } catch {
      toast.error("خطا در تأیید");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await withdrawalRequestsApi.reject(rejectTarget.id, { rejection_note: rejectNote });
      toast.success("درخواست برداشت رد شد");
      setRejectTarget(null);
      setRejectNote("");
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
      onClick: (row) => { setRejectTarget(row); setRejectNote(""); },
      sx: { color: "text.disabled", "&:hover": { color: "error.main" } },
      hidden: (row) => row.status !== "pending",
    },
  ];


  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
          درخواست برداشت
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          بررسی و تأیید درخواست‌های برداشت وجه
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
          onChange={(e) => setStatusFilter(e.target.value)}
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

            <Pagination total={total} />

      <Dialog open={!!rejectTarget} onClose={() => !processing && setRejectTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}>رد درخواست برداشت</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <TextField
            label="توضیحات (اختیاری)"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            fullWidth size="small"
            multiline rows={2}
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
