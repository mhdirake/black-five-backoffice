"use client";

import { useSearchParams } from "next/navigation";

import { useCallback, useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { auctionParticipationsApi } from "@/store/slices/auctionParticipations/auctionParticipationsApi";
import { Table } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { DEFAULT_PAGE_LENGTH } from "@/constants/general";


const STATUS_MAP = {
  active:  { label: "فعال",    color: "success" },
  winner:  { label: "برنده",   color: "warning" },
  lost:    { label: "بازنده",  color: "default" },
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
    key: "auction",
    label: "حراج",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{row.auction?.title ?? "—"}</Typography>
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
    key: "entry_count",
    label: "تعداد ورود",
    render: (row) => (
      <Typography sx={{ fontSize: 13 }}>{row.entry_count ?? "—"}</Typography>
    ),
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

export default function AuctionParticipationsPage() {
  const searchParams = useSearchParams();
  const page = +searchParams.get("page") || 1;
  const pageSize = +searchParams.get("page_size") || DEFAULT_PAGE_LENGTH;
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: pageSize, page_number: page };
      if (search) params.search = search;
      const res = await auctionParticipationsApi.list(params);
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
    const t = setTimeout(() => { setSearch(searchInput); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);


  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
          مشارکت‌های حراج
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          نمایش مشارکت کاربران در حراج‌ها
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

      <Table columns={COLUMNS} rows={rows} loading={loading} emptyLabel="مشارکتی یافت نشد" />

            <Pagination total={total} />
    </Box>
  );
}
