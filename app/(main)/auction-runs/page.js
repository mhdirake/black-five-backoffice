"use client";

import { useSearchParams } from "next/navigation";

import { useCallback, useEffect, useState } from "react";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import StopOutlinedIcon from "@mui/icons-material/StopOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
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
import { auctionRunsApi } from "@/store/slices/auctionRuns/auctionRunsApi";
import { Table } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { DEFAULT_PAGE_LENGTH } from "@/constants/general";


const STATUS_MAP = {
  pending:   { label: "در انتظار",    color: "default" },
  active:    { label: "فعال",          color: "success" },
  running:   { label: "در حال اجرا", color: "warning" },
  ended:     { label: "پایان‌یافته",  color: "error" },
  cancelled: { label: "لغوشده",       color: "error" },
};

const COLUMNS = [
  {
    key: "run_number",
    label: "شماره دوره",
    render: (row) => (
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", direction: "ltr", display: "inline-block" }}>
        #{row.run_number}
      </Typography>
    ),
  },
  {
    key: "auction",
    label: "حراج",
    render: (row) => (
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.primary" }}>{row.auction?.title ?? "—"}</Typography>
        <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{row.auction?.product?.title}</Typography>
      </Box>
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
    key: "winner",
    label: "برنده",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: row.winner ? "text.secondary" : "text.disabled" }}>
        {row.winner ? `${row.winner.first_name} ${row.winner.last_name}` : "—"}
      </Typography>
    ),
  },
  {
    key: "winning_price",
    label: "قیمت برنده",
    render: (row) => {
      const val = parseFloat(row.winning_price);
      return (
        <Typography sx={{ fontSize: 13, direction: "ltr", display: "inline-block" }}>
          {val ? val.toLocaleString("en-US") + " T" : "—"}
        </Typography>
      );
    },
  },
  {
    key: "started_at",
    label: "شروع",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.secondary", direction: "ltr", display: "inline-block" }}>
        {row.started_at ? new Date(row.started_at).toLocaleDateString("en-GB") : "—"}
      </Typography>
    ),
  },
];

export default function AuctionRunsPage() {
  const searchParams = useSearchParams();
  const page = +searchParams.get("page") || 1;
  const pageSize = +searchParams.get("page_size") || DEFAULT_PAGE_LENGTH;
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: pageSize, page_number: page };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await auctionRunsApi.list(params);
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

  const handleAction = async (fn, successMsg, errorMsg) => {
    try {
      await fn();
      toast.success(successMsg);
      fetchList();
    } catch {
      toast.error(errorMsg);
    }
  };

  const actions = [
    {
      type: "icon",
      icon: <PlayArrowOutlinedIcon sx={{ fontSize: 17 }} />,
      onClick: (row) => handleAction(() => auctionRunsApi.start(row.id), "دوره شروع شد", "خطا در شروع"),
      sx: { color: "text.disabled", "&:hover": { color: "success.main" } },
      hidden: (row) => row.status !== "pending",
    },
    {
      type: "icon",
      icon: <StopOutlinedIcon sx={{ fontSize: 17 }} />,
      onClick: (row) => handleAction(() => auctionRunsApi.finish(row.id), "دوره پایان یافت", "خطا در پایان"),
      sx: { color: "text.disabled", "&:hover": { color: "warning.main" } },
      hidden: (row) => row.status !== "running",
    },
    {
      type: "icon",
      icon: <CancelOutlinedIcon sx={{ fontSize: 17 }} />,
      onClick: (row) => handleAction(() => auctionRunsApi.cancel(row.id), "دوره لغو شد", "خطا در لغو"),
      sx: { color: "text.disabled", "&:hover": { color: "error.main" } },
      hidden: (row) => !["pending", "running"].includes(row.status),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
          دوره‌های حراج
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          مدیریت و نمایش دوره‌های اجرای حراج‌ها
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

      <Table columns={COLUMNS} rows={rows} loading={loading} actions={actions} emptyLabel="دوره‌ای یافت نشد" />

            <Pagination total={total} />
    </Box>
  );
}
