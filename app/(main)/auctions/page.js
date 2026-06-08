"use client";

import { useCallback, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { auctionsApi } from "@/store/slices/auctions/auctionsApi";
import { productsApi } from "@/store/slices/products/productsApi";
import { ticketLevelsApi } from "@/store/slices/ticketLevels/ticketLevelsApi";
import { Table } from "@/components/ui/Table";
import AuctionFormDialog from "./AuctionFormDialog";

const PAGE_SIZE = 20;

const TYPE_MAP = {
  dutch: { label: "داچ", color: "secondary" },
};

const STATUS_MAP = {
  draft:       { label: "پیش‌نویس",     color: "default" },
  published:   { label: "منتشرشده",    color: "info" },
  ticket_sale: { label: "فروش بلیت",  color: "primary" },
  active:      { label: "فعال",         color: "success" },
  running:     { label: "در حال اجرا", color: "warning" },
  ended:       { label: "پایان‌یافته", color: "error" },
  cancelled:   { label: "لغوشده",      color: "error" },
};

const COLUMNS = [
  {
    key: "title",
    label: "عنوان",
    render: (row) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "text.primary" }}>
        {row.title}
      </Typography>
    ),
  },
  {
    key: "product",
    label: "محصول",
    render: (row) => {
      const product = row.product;
      if (!product) return <Typography sx={{ fontSize: 13, color: "text.disabled" }}>—</Typography>;
      return (
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.primary" }}>{product.title}</Typography>
          {product.category?.name && (
            <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.25 }}>{product.category.name}</Typography>
          )}
        </Box>
      );
    },
  },
  {
    key: "type",
    label: "نوع",
    render: (row) => {
      const t = TYPE_MAP[row.type] ?? { label: row.type, color: "default" };
      return <Chip label={t.label} color={t.color} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22 }} />;
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
    key: "product_price",
    label: "قیمت کالا",
    render: (row) => {
      const val = parseFloat(row.product_price);
      return (
        <Typography sx={{ fontSize: 13, direction: "ltr", display: "inline-block" }}>
          {val ? val.toLocaleString("en-US") + " T" : "—"}
        </Typography>
      );
    },
  },
  {
    key: "runs",
    label: "دوره‌ها",
    render: (row) => (
      <Typography sx={{ fontSize: 13, direction: "ltr", display: "inline-block" }}>
        {row.completed_runs ?? 0}
        <Typography component="span" sx={{ fontSize: 11, color: "text.disabled" }}>
          {" "}/ {row.total_runs ?? "—"}
        </Typography>
      </Typography>
    ),
  },
  {
    key: "starts_at",
    label: "شروع",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: row.starts_at ? "text.primary" : "text.disabled", direction: "ltr", display: "inline-block" }}>
        {row.starts_at ? new Date(row.starts_at).toLocaleDateString("en-GB") : "—"}
      </Typography>
    ),
  },
];

export default function AuctionsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [ticketLevels, setTicketLevels] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auctionsApi.list({ search, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
      setRows(res?.results ?? res?.data ?? []);
      setTotal(res?.count ?? res?.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchAuctions(); }, [fetchAuctions]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadProducts = () => {
    if (products.length > 0) return;
    productsApi.list({ limit: 200 })
      .then((res) => setProducts(res?.results ?? res?.data ?? []))
      .catch(() => {});
  };

  const loadTicketLevels = () => {
    if (ticketLevels.length > 0) return;
    ticketLevelsApi.list({ limit: 20 })
      .then((res) => setTicketLevels(res?.results ?? res?.data ?? []))
      .catch(() => {});
  };

  const openCreate = () => {
    loadProducts();
    loadTicketLevels();
    setEditTarget(null);
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    loadProducts();
    loadTicketLevels();
    setEditTarget(row);
    setDialogOpen(true);
  };

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
            حراج‌ها
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            مدیریت و نمایش همه حراج‌های پلتفرم
          </Typography>
        </Box>
        <AddButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          ایجاد حراج
        </AddButton>
      </Box>

      <TextField
        placeholder="جستجو در حراج‌ها..."
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

      <Table
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        emptyLabel="حراجی یافت نشد"
        actions={[
          {
            type: "icon",
            icon: <EditOutlinedIcon sx={{ fontSize: 17 }} />,
            onClick: openEdit,
            sx: { color: "text.disabled", "&:hover": { color: "primary.main" } },
          },
        ]}
      />

      {pageCount > 1 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
        </Box>
      )}

      <AuctionFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={fetchAuctions}
        editTarget={editTarget}
        products={products}
        ticketLevels={ticketLevels}
      />
    </Box>
  );
}

// ─── Styled Components ────────────────────────────────────────────────────────

const AddButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #ffd500 0%, #fdc500 100%)",
  color: "#00296b",
  fontWeight: 700,
  fontSize: 13,
  paddingLeft: theme.spacing(2.5),
  paddingRight: theme.spacing(2.5),
  paddingTop: theme.spacing(1.1),
  paddingBottom: theme.spacing(1.1),
  borderRadius: 8,
  boxShadow: "0 4px 16px rgba(253,197,0,0.25)",
  "&:hover": { boxShadow: "0 6px 24px rgba(253,197,0,0.35)" },
}));
