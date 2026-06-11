"use client";

import { useCallback, useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  InputAdornment,
  MenuItem,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import { ticketSellbacksApi } from "@/store/slices/ticketSellbacks/ticketSellbacksApi";
import { Table } from "@/components/ui/Table";

const PAGE_SIZE = 20;

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
    key: "ticket",
    label: "بلیت / حراج",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
        {row.ticket?.auction?.title ?? "—"}
      </Typography>
    ),
  },
  {
    key: "quantity",
    label: "تعداد",
    render: (row) => (
      <Typography sx={{ fontSize: 13 }}>{row.quantity ?? "—"}</Typography>
    ),
  },
  {
    key: "refund_amount",
    label: "مبلغ بازپرداخت",
    render: (row) => {
      const val = parseFloat(row.refund_amount);
      return (
        <Typography sx={{ fontSize: 13, direction: "ltr", display: "inline-block" }}>
          {val ? val.toLocaleString("en-US") + " T" : "—"}
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

export default function TicketSellbacksPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: PAGE_SIZE, page_number: page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await ticketSellbacksApi.list(params);
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

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
          بازپس‌فروش بلیت
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          درخواست‌های بازپس‌فروش بلیت کاربران
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

      <Table columns={COLUMNS} rows={rows} loading={loading} emptyLabel="درخواستی یافت نشد" />

      {pageCount > 1 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
        </Box>
      )}
    </Box>
  );
}
