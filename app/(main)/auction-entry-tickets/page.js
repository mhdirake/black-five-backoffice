"use client";

import { useSearchParams } from "next/navigation";

import { useCallback, useEffect, useState } from "react";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Box, InputAdornment, TextField, Typography } from "@mui/material";
import { auctionEntryTicketsApi } from "@/store/slices/auctionEntryTickets/auctionEntryTicketsApi";
import { Table } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { DEFAULT_PAGE_LENGTH } from "@/constants/general";

const COLUMNS = [
  {
    key: "user",
    label: "کاربر",
    render: (row) => {
      const u = row.participation?.user;
      return (
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>{u?.username ?? "—"}</Typography>
          <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{u?.email ?? ""}</Typography>
        </Box>
      );
    },
  },
  {
    key: "auction",
    label: "حراج",
    render: (row) => (
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
        {row.participation?.auction?.title ?? "—"}
      </Typography>
    ),
  },
  {
    key: "ticket_level",
    label: "سطح بلیت",
    render: (row) => (
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
        {row.ticket_level ? `سطح ${row.ticket_level.level} — ${row.ticket_level.title}` : "—"}
      </Typography>
    ),
  },
  {
    key: "used_at",
    label: "تاریخ استفاده",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", display: "inline-block" }}>
        {row.used_at ? new Date(row.used_at).toLocaleString("en-GB") : "—"}
      </Typography>
    ),
  },
  {
    key: "created_at",
    label: "تاریخ ایجاد",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", display: "inline-block" }}>
        {row.created_at ? new Date(row.created_at).toLocaleDateString("en-GB") : "—"}
      </Typography>
    ),
  },
];

export default function AuctionEntryTicketsPage() {
  const searchParams = useSearchParams();
  const page = +searchParams.get("page") || 1;
  const pageSize = +searchParams.get("page_size") || DEFAULT_PAGE_LENGTH;
  const [rows, setRows]               = useState([]);
  const [total, setTotal]             = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [loading, setLoading]         = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: pageSize, page_number: page };
      if (search) params.search = search;
      const res = await auctionEntryTicketsApi.list(params);
      setRows(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
          <ConfirmationNumberOutlinedIcon sx={{ fontSize: 22, color: "secondary.main" }} />
          <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, lineHeight: 1.25 }}>
            بلیت‌های ورود حراج
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          گزارش استفاده از بلیت‌های ورود در دوره‌های حراج
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="جستجو..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          size="small"
          sx={{ width: { xs: "100%", sm: 300 } }}
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
      </Box>

      <Table columns={COLUMNS} rows={rows} loading={loading} emptyLabel="رکوردی یافت نشد" />

      <Pagination total={total} />
    </Box>
  );
}
