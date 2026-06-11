"use client";

import { useSearchParams } from "next/navigation";

import { useCallback, useEffect, useState } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { paymentDepositsApi } from "@/store/slices/paymentDeposits/paymentDepositsApi";
import { Table } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { DEFAULT_PAGE_LENGTH } from "@/constants/general";


const STATUS_MAP = {
  pending:   { label: "در انتظار",  color: "warning" },
  completed: { label: "تکمیل‌شده", color: "success" },
  failed:    { label: "ناموفق",     color: "error" },
  cancelled: { label: "لغوشده",    color: "default" },
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
    key: "gateway",
    label: "درگاه پرداخت",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{row.gateway?.name ?? "—"}</Typography>
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

export default function PaymentDepositsPage() {
  const searchParams = useSearchParams();
  const page = +searchParams.get("page") || 1;
  const pageSize = +searchParams.get("page_size") || DEFAULT_PAGE_LENGTH;
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading]     = useState(true);
  const [processing, setProcessing] = useState(false);

  const handleAction = async (fn, successMsg, errorMsg) => {
    setProcessing(true);
    try {
      await fn();
      toast.success(successMsg);
      fetchList();
    } catch {
      toast.error(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: pageSize, page_number: page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await paymentDepositsApi.list(params);
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

  const actions = [
    {
      type: "icon",
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 17 }} />,
      onClick: (row) => handleAction(() => paymentDepositsApi.markPaid(row.id), "پرداخت تأیید شد", "خطا در تأیید"),
      sx: { color: "text.disabled", "&:hover": { color: "success.main" } },
      hidden: (row) => row.status !== "pending",
    },
    {
      type: "icon",
      icon: <ErrorOutlineIcon sx={{ fontSize: 17 }} />,
      onClick: (row) => handleAction(() => paymentDepositsApi.markFailed(row.id), "پرداخت ناموفق ثبت شد", "خطا"),
      sx: { color: "text.disabled", "&:hover": { color: "warning.main" } },
      hidden: (row) => row.status !== "pending",
    },
    {
      type: "icon",
      icon: <CancelOutlinedIcon sx={{ fontSize: 17 }} />,
      onClick: (row) => handleAction(() => paymentDepositsApi.cancel(row.id), "پرداخت لغو شد", "خطا در لغو"),
      sx: { color: "text.disabled", "&:hover": { color: "error.main" } },
      hidden: (row) => !["pending"].includes(row.status),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
          واریزی‌ها
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          تاریخچه پرداخت و واریز کاربران
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

      <Table columns={COLUMNS} rows={rows} loading={loading} actions={actions} emptyLabel="واریزی یافت نشد" />

            <Pagination total={total} />
    </Box>
  );
}
