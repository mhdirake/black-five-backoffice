"use client";

import { useSearchParams } from "next/navigation";

import { useCallback, useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { ticketsApi } from "@/store/slices/tickets/ticketsApi";
import { ticketSellbacksApi } from "@/store/slices/ticketSellbacks/ticketSellbacksApi";
import { freePassesApi } from "@/store/slices/freePasses/freePassesApi";
import { Table } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { DEFAULT_PAGE_LENGTH } from "@/constants/general";

const SELLBACK_STATUS_MAP = {
  pending:   { label: "در انتظار", color: "warning" },
  approved:  { label: "تأییدشده",  color: "success" },
  rejected:  { label: "ردشده",     color: "error" },
  completed: { label: "تکمیل‌شده", color: "info" },
};

const FREEPASS_STATUS_MAP = {
  active:  { label: "فعال",        color: "success" },
  used:    { label: "استفاده‌شده", color: "default" },
  expired: { label: "منقضی",       color: "error" },
};

const TICKETS_COLUMNS = [
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
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{row.auction?.title ?? "—"}</Typography>
    ),
  },
  {
    key: "ticket_level",
    label: "سطح بلیت",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{row.ticket_level?.title ?? row.ticket_level?.level ?? "—"}</Typography>
    ),
  },
  {
    key: "quantity",
    label: "تعداد",
    render: (row) => (
      <Typography sx={{ fontSize: 13, direction: "ltr", display: "inline-block" }}>{row.quantity ?? "—"}</Typography>
    ),
  },
  {
    key: "purchase_price",
    label: "قیمت خرید",
    render: (row) => {
      const val = parseFloat(row.purchase_price);
      return (
        <Typography sx={{ fontSize: 13, direction: "ltr", display: "inline-block" }}>
          {val ? val.toLocaleString("en-US") + " T" : "—"}
        </Typography>
      );
    },
  },
  {
    key: "source",
    label: "منبع",
    render: (row) => (
      <Chip label={row.source ?? "—"} size="small" sx={{ fontSize: 11, height: 22 }} />
    ),
  },
];

const SELLBACKS_COLUMNS = [
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
    label: "حراج",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{row.ticket?.auction?.title ?? "—"}</Typography>
    ),
  },
  {
    key: "quantity",
    label: "تعداد",
    render: (row) => <Typography sx={{ fontSize: 13 }}>{row.quantity ?? "—"}</Typography>,
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
      const s = SELLBACK_STATUS_MAP[row.status] ?? { label: row.status, color: "default" };
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

const FREEPASSES_COLUMNS = [
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
    key: "quantity",
    label: "تعداد",
    render: (row) => <Typography sx={{ fontSize: 13 }}>{row.quantity ?? 1}</Typography>,
  },
  {
    key: "status",
    label: "وضعیت",
    render: (row) => {
      const s = FREEPASS_STATUS_MAP[row.status] ?? { label: row.status, color: "default" };
      return <Chip label={s.label} color={s.color} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22 }} />;
    },
  },
  {
    key: "note",
    label: "یادداشت",
    render: (row) => <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{row.note ?? "—"}</Typography>,
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

// ─── Generic list tab ──────────────────────────────────────────────────────────

function ListTab({ fetchFn, columns, searchPlaceholder, emptyLabel }) {
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
      const res = await fetchFn(params);
      setRows(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, search, page, pageSize]);

  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <Box>
      <TextField
        placeholder={searchPlaceholder}
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
      <Table columns={columns} rows={rows} loading={loading} emptyLabel={emptyLabel} />
      <Pagination total={total} />
    </Box>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TicketsPage() {
  const [tab, setTab] = useState(0);
  const [visitedTabs, setVisitedTabs] = useState(new Set([0]));

  const handleTab = (_, v) => {
    setTab(v);
    setVisitedTabs((prev) => new Set([...prev, v]));
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
          بلیت‌ها
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          مدیریت بلیت‌ها، بازخریدها و بلیت‌های ورود رایگان
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "modules.glassBorder", mb: 3 }}>
        <Tabs
          value={tab}
          onChange={handleTab}
          sx={{
            "& .MuiTab-root": { fontSize: 13, fontWeight: 500, color: "text.disabled", minHeight: 44, px: 2.5 },
            "& .Mui-selected": { color: "secondary.main !important", fontWeight: 700 },
            "& .MuiTabs-indicator": { backgroundColor: "secondary.main" },
          }}
        >
          <Tab label="بلیت کاربران" />
          <Tab label="بازخرید بلیت‌ها" />
          <Tab label="بلیت‌های ورود رایگان" />
        </Tabs>
      </Box>

      {tab === 0 && visitedTabs.has(0) && (
        <ListTab
          fetchFn={ticketsApi.list}
          columns={TICKETS_COLUMNS}
          searchPlaceholder="جستجو در بلیت‌ها..."
          emptyLabel="بلیتی یافت نشد"
        />
      )}
      {tab === 1 && visitedTabs.has(1) && (
        <ListTab
          fetchFn={ticketSellbacksApi.list}
          columns={SELLBACKS_COLUMNS}
          searchPlaceholder="جستجو در بازخریدها..."
          emptyLabel="بازخریدی یافت نشد"
        />
      )}
      {tab === 2 && visitedTabs.has(2) && (
        <ListTab
          fetchFn={freePassesApi.list}
          columns={FREEPASSES_COLUMNS}
          searchPlaceholder="جستجو در بلیت‌های رایگان..."
          emptyLabel="بلیت رایگانی یافت نشد"
        />
      )}
    </Box>
  );
}
