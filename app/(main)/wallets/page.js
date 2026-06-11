"use client";

import { useCallback, useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  InputAdornment,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import { walletsApi } from "@/store/slices/wallets/walletsApi";
import { Table } from "@/components/ui/Table";

const PAGE_SIZE = 20;

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
    key: "currency",
    label: "ارز",
    render: (row) => (
      <Chip label={row.currency} size="small" sx={{ fontSize: 11, height: 22 }} />
    ),
  },
  {
    key: "balance",
    label: "موجودی",
    render: (row) => {
      const val = parseFloat(row.balance);
      return (
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: val > 0 ? "success.main" : "text.primary", direction: "ltr", display: "inline-block" }}>
          {val ? val.toLocaleString("en-US") : "0"}
        </Typography>
      );
    },
  },
  {
    key: "blocked_balance",
    label: "موجودی بلوک‌شده",
    render: (row) => {
      const val = parseFloat(row.blocked_balance);
      return (
        <Typography sx={{ fontSize: 13, color: val > 0 ? "warning.main" : "text.disabled", direction: "ltr", display: "inline-block" }}>
          {val ? val.toLocaleString("en-US") : "0"}
        </Typography>
      );
    },
  },
  {
    key: "is_active",
    label: "وضعیت",
    render: (row) => (
      <Chip
        label={row.is_active ? "فعال" : "غیرفعال"}
        color={row.is_active ? "success" : "default"}
        size="small"
        sx={{ fontSize: 11, fontWeight: 600, height: 22 }}
      />
    ),
  },
];

export default function WalletsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: PAGE_SIZE, page_number: page };
      if (search) params.search = search;
      const res = await walletsApi.list(params);
      setRows(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

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
          کیف پول‌ها
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          نمایش موجودی کیف پول کاربران
        </Typography>
      </Box>

      <TextField
        placeholder="جستجو..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        size="small"
        sx={{ mb: 3, width: { xs: "100%", sm: 300 } }}
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

      <Table columns={COLUMNS} rows={rows} loading={loading} emptyLabel="کیف پولی یافت نشد" />

      {pageCount > 1 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
        </Box>
      )}
    </Box>
  );
}
