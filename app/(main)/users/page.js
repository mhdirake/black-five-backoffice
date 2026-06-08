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
import { styled } from "@mui/material/styles";
import { usersApi } from "@/store/slices/users/usersApi";
import { Table } from "@/components/ui/Table";

const PAGE_SIZE = 20;

const ROLE_MAP = {
  admin:    { label: "ادمین",   color: "error" },
  staff:    { label: "کارمند", color: "warning" },
  user:     { label: "کاربر",  color: "default" },
};

const COLUMNS = [
  {
    key: "name",
    label: "نام",
    render: (row) => {
      const full = [row.first_name, row.last_name].filter(Boolean).join(" ");
      return (
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "text.primary" }}>
            {full || "—"}
          </Typography>
          {row.username && full !== row.username && (
            <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.25 }}>
              {row.username}
            </Typography>
          )}
        </Box>
      );
    },
  },
  {
    key: "email",
    label: "ایمیل",
    render: (row) => (
      <Typography sx={{ fontSize: 13, color: row.email ? "text.primary" : "text.disabled", direction: "ltr", display: "inline-block" }}>
        {row.email || "—"}
      </Typography>
    ),
  },
  {
    key: "phone",
    label: "شماره",
    render: (row) => (
      <Typography sx={{ fontSize: 13, color: row.phone_number ?? row.phone ? "text.primary" : "text.disabled", direction: "ltr", display: "inline-block" }}>
        {row.phone_number ?? row.phone ?? "—"}
      </Typography>
    ),
  },
  {
    key: "role",
    label: "نقش",
    render: (row) => {
      const role = row.role ?? (row.is_staff ? "staff" : "user");
      const r = ROLE_MAP[role] ?? { label: role, color: "default" };
      return <Chip label={r.label} color={r.color} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22 }} />;
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
  {
    key: "date_joined",
    label: "تاریخ عضویت",
    render: (row) => {
      const date = row.date_joined ?? row.created_at;
      return (
        <Typography sx={{ fontSize: 12, color: date ? "text.primary" : "text.disabled", direction: "ltr", display: "inline-block" }}>
          {date ? new Date(date).toLocaleDateString("en-GB") : "—"}
        </Typography>
      );
    },
  },
];

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.list({ search, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
      setRows(res?.results ?? res?.data ?? []);
      setTotal(res?.count ?? res?.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
          کاربران
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          مدیریت و نمایش همه کاربران پلتفرم
        </Typography>
      </Box>

      <TextField
        placeholder="جستجو در کاربران..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        size="small"
        sx={{ mb: 3, width: { xs: "100%", sm: 340 } }}
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

      <Table columns={COLUMNS} rows={rows} loading={loading} emptyLabel="کاربری یافت نشد" />

      {pageCount > 1 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
        </Box>
      )}
    </Box>
  );
}
