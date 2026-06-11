"use client";

import { useCallback, useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { auditLogsApi } from "@/store/slices/auditLogs/auditLogsApi";
import { Table } from "@/components/ui/Table";
import { PaginationBar } from "@/components/ui/PaginationBar";


const COLUMNS = [
  {
    key: "user",
    label: "کاربر",
    render: (row) => (
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.primary" }}>
          {row.user ? `${row.user.first_name} ${row.user.last_name}` : "سیستم"}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{row.user?.email}</Typography>
      </Box>
    ),
  },
  {
    key: "action",
    label: "عملیات",
    render: (row) => (
      <Chip label={row.action ?? "—"} size="small" sx={{ fontSize: 11, height: 22 }} />
    ),
  },
  {
    key: "model_type",
    label: "موجودیت",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.secondary", direction: "ltr", display: "inline-block" }}>
        {row.model_type ?? "—"}
        {row.model_id ? ` #${row.model_id}` : ""}
      </Typography>
    ),
  },
  {
    key: "ip_address",
    label: "IP",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", display: "inline-block" }}>
        {row.ip_address ?? "—"}
      </Typography>
    ),
  },
  {
    key: "created_at",
    label: "تاریخ",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", display: "inline-block" }}>
        {row.created_at ? new Date(row.created_at).toLocaleString("en-GB") : "—"}
      </Typography>
    ),
  },
];

export default function AuditLogsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: pageSize, page_number: page };
      if (search) params.search = search;
      const res = await auditLogsApi.list(params);
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


  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
          لاگ‌های سیستم
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          تاریخچه عملیات و فعالیت‌های سیستم
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

      <Table columns={COLUMNS} rows={rows} loading={loading} emptyLabel="لاگی یافت نشد" />

            <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />
    </Box>
  );
}
