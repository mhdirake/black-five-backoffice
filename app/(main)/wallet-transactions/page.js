"use client";

import { useCallback, useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { walletTransactionsApi } from "@/store/slices/walletTransactions/walletTransactionsApi";
import { Table } from "@/components/ui/Table";
import { PaginationBar } from "@/components/ui/PaginationBar";


const STATUS_MAP = {
  pending:   { label: "در انتظار",  color: "warning" },
  completed: { label: "تکمیل‌شده", color: "success" },
  failed:    { label: "ناموفق",     color: "error" },
  cancelled: { label: "لغوشده",    color: "default" },
};

const DIRECTION_MAP = {
  credit: { label: "واریز", color: "success" },
  debit:  { label: "برداشت", color: "error" },
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
    key: "type",
    label: "نوع",
    render: (row) => (
      <Chip label={row.type ?? "—"} size="small" sx={{ fontSize: 11, height: 22 }} />
    ),
  },
  {
    key: "direction",
    label: "جهت",
    render: (row) => {
      const d = DIRECTION_MAP[row.direction] ?? { label: row.direction, color: "default" };
      return <Chip label={d.label} color={d.color} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22 }} />;
    },
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

export default function WalletTransactionsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: pageSize, page_number: page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (directionFilter) params.direction = directionFilter;
      const res = await walletTransactionsApi.list(params);
      setRows(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, page, statusFilter, typeFilter, directionFilter, pageSize]);

  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);


  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
          تراکنش‌های کیف پول
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          تاریخچه تمام تراکنش‌های مالی
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
          sx={{ width: 140 }}
        >
          <MenuItem value="">همه وضعیت‌ها</MenuItem>
          {Object.entries(STATUS_MAP).map(([k, { label }]) => (
            <MenuItem key={k} value={k}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select label="نوع"
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          size="small"
          sx={{ width: 130 }}
        >
          <MenuItem value="">همه انواع</MenuItem>
          <MenuItem value="deposit">واریز</MenuItem>
          <MenuItem value="withdrawal">برداشت</MenuItem>
          <MenuItem value="refund">استرداد</MenuItem>
          <MenuItem value="transfer">انتقال</MenuItem>
          <MenuItem value="freeze">انجماد</MenuItem>
          <MenuItem value="unfreeze">رفع انجماد</MenuItem>
        </TextField>
        <TextField
          select label="جهت"
          value={directionFilter}
          onChange={(e) => { setDirectionFilter(e.target.value); setPage(1); }}
          size="small"
          sx={{ width: 110 }}
        >
          <MenuItem value="">همه</MenuItem>
          <MenuItem value="credit">واریز</MenuItem>
          <MenuItem value="debit">برداشت</MenuItem>
        </TextField>
      </Box>

      <Table columns={COLUMNS} rows={rows} loading={loading} emptyLabel="تراکنشی یافت نشد" />

            <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
    </Box>
  );
}
