"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import { auctionsApi } from "@/store/slices/auctions/auctionsApi";
import { productsApi } from "@/store/slices/products/productsApi";
import { Table } from "@/components/ui/Table";
import PriceInput from "@/components/ui/PriceInput";
import DateTimePickerField from "@/components/ui/DateTimePicker";

const PAGE_SIZE = 20;

const TYPE_MAP = {
  dutch: { label: "داچ", color: "secondary" },
};

const STATUS_MAP = {
  draft:       { label: "پیش‌نویس",      color: "default" },
  published:   { label: "منتشرشده",     color: "info" },
  ticket_sale: { label: "فروش بلیت",   color: "primary" },
  active:      { label: "فعال",          color: "success" },
  running:     { label: "در حال اجرا", color: "warning" },
  ended:       { label: "پایان‌یافته",  color: "error" },
  cancelled:   { label: "لغوشده",       color: "error" },
};

const EMPTY_FORM = {
  title: "",
  product_id: "",
  type: "dutch",
  status: "draft",
  currency: "IRR",
  product_price: "",
  starting_price: "",
  discount_rate: "",
  total_runs: 1,
  completed_runs: 0,
  max_tickets_per_user: "",
  published_at: "",
  ticket_sale_starts_at: "",
  lockdown_starts_at: "",
  starts_at: "",
  ends_at: "",
  parent_auction_id: "",
  ticket_levels: [],
};

const EMPTY_TICKET_LEVEL = {
  level: "",
  title: "",
  price: "",
  discount_percent: 0,
  stock_quantity: "",
  max_purchase_per_user: "",
  max_usage_per_user: "",
  is_active: true,
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
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auctionsApi.list({ search, limit: PAGE_SIZE, page_number: page });
      setRows(res?.data ?? []);
      setTotal(res?.total ?? 0);
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
      .then((res) => setProducts(res?.data ?? []))
      .catch(() => {});
  };

  const openCreate = () => {
    loadProducts();
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const closeDialog = () => { if (saving) return; setDialogOpen(false); };

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const setE = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addTicketLevel = () => setForm((f) => {
    const nextLevel = f.ticket_levels.length > 0
      ? Math.max(...f.ticket_levels.map((tl) => Number(tl.level) || 0)) + 1
      : 1;
    return { ...f, ticket_levels: [...f.ticket_levels, { ...EMPTY_TICKET_LEVEL, level: nextLevel }] };
  });
  const removeTicketLevel = (i) => setForm((f) => ({
    ...f,
    ticket_levels: f.ticket_levels.filter((_, idx) => idx !== i),
  }));
  const setTicketLevel = (i, field, val) => setForm((f) => ({
    ...f,
    ticket_levels: f.ticket_levels.map((tl, idx) => idx === i ? { ...tl, [field]: val } : tl),
  }));

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("عنوان حراج الزامی است"); return; }
    if (!form.product_id) { toast.error("محصول الزامی است"); return; }
    if (form.starts_at && form.ends_at && new Date(form.ends_at) <= new Date(form.starts_at)) {
      toast.error("تاریخ پایان باید بعد از تاریخ شروع باشد"); return;
    }
    if (!form.ticket_levels.length) { toast.error("حداقل یک سطح بلیت اضافه کنید"); return; }
    if (form.ticket_levels.some((tl) => !tl.level || Number(tl.level) < 1)) { toast.error("شماره سطح بلیت برای همه ردیف‌ها الزامی است"); return; }
    const levels = form.ticket_levels.map((tl) => Number(tl.level));
    if (new Set(levels).size !== levels.length) { toast.error("شماره سطح‌ها باید منحصربه‌فرد باشند"); return; }
    setSaving(true);
    try {
      await auctionsApi.create({
        product_id: form.product_id,
        title: form.title,
        type: form.type,
        status: form.status,
        currency: form.currency,
        product_price: Number(form.product_price) || 0,
        starting_price: Number(form.starting_price) || 0,
        discount_rate: Number(form.discount_rate) || 0,
        total_runs: Number(form.total_runs) || 1,
        completed_runs: Number(form.completed_runs) || 0,
        max_tickets_per_user: form.max_tickets_per_user ? Number(form.max_tickets_per_user) : null,
        published_at: form.published_at || null,
        ticket_sale_starts_at: form.ticket_sale_starts_at || null,
        lockdown_starts_at: form.lockdown_starts_at || null,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        parent_auction_id: form.parent_auction_id ? Number(form.parent_auction_id) : null,
        ticket_levels: form.ticket_levels.map((tl) => ({
          level: Number(tl.level),
          title: tl.title || null,
          price: Number(tl.price) || 0,
          discount_percent: Number(tl.discount_percent) || 0,
          stock_quantity: Number(tl.stock_quantity) || 1,
          max_purchase_per_user: tl.max_purchase_per_user ? Number(tl.max_purchase_per_user) : null,
          max_usage_per_user: tl.max_usage_per_user ? Number(tl.max_usage_per_user) : null,
          is_active: tl.is_active ?? true,
        })),
      });
      toast.success("حراج ایجاد شد");
      setDialogOpen(false);
      fetchAuctions();
    } catch {
      toast.error("خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
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
            icon: <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />,
            onClick: (row) => router.push(`/auctions/${row.id}`),
            sx: { color: "text.disabled", "&:hover": { color: "secondary.main" } },
          },
        ]}
      />

      {pageCount > 1 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", pb: 1 }}>
          ایجاد حراج جدید
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="عنوان"
            value={form.title}
            onChange={setE("title")}
            fullWidth size="small"
          />
          <TextField
            select label="محصول"
            value={form.product_id}
            onChange={setE("product_id")}
            fullWidth size="small"
          >
            {products.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
            ))}
          </TextField>
          <TextField
            select label="وضعیت"
            value={form.status}
            onChange={setE("status")}
            fullWidth size="small"
          >
            {Object.entries(STATUS_MAP).map(([key, { label }]) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            <TextField
              select label="ارز"
              value={form.currency}
              onChange={setE("currency")}
              size="small"
              fullWidth
            >
              <MenuItem value="IRR">ریال (IRR)</MenuItem>
            </TextField>
            <TextField
              label="تعداد دوره‌ها"
              value={form.total_runs}
              onChange={setE("total_runs")}
              size="small"
              type="number"
              fullWidth
              slotProps={{ input: { inputProps: { min: 1, max: 100 } } }}
            />
            <TextField
              label="حداکثر بلیت هر کاربر"
              value={form.max_tickets_per_user}
              onChange={setE("max_tickets_per_user")}
              size="small"
              type="number"
              fullWidth
              slotProps={{ input: { inputProps: { min: 1 } } }}
            />
          </Box>

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: 12, color: "text.disabled" }}>سطوح بلیت</Typography>
              <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={addTicketLevel} sx={{ fontSize: 11, color: "text.disabled", minWidth: "auto" }}>
                افزودن سطح
              </Button>
            </Box>
            {form.ticket_levels.length === 0 && (
              <Typography sx={{ fontSize: 12, color: "text.disabled", textAlign: "center", py: 1.5, border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 2 }}>
                سطح بلیتی اضافه نشده
              </Typography>
            )}
            {form.ticket_levels.map((tl, i) => (
              <Box key={i} sx={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, p: 1.5, mb: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", bgcolor: "secondary.main", flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#00296b", lineHeight: 1 }}>
                      {tl.level}
                    </Typography>
                  </Box>
                  <TextField
                    label="نام سطح (اختیاری)"
                    value={tl.title}
                    onChange={(e) => setTicketLevel(i, "title", e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <IconButton size="small" onClick={() => removeTicketLevel(i)} sx={{ color: "text.disabled", flexShrink: 0, "&:hover": { color: "error.main" } }}>
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
                  <PriceInput
                    label="قیمت (تومان)"
                    value={tl.price}
                    onChange={(val) => setTicketLevel(i, "price", val)}
                    size="small"
                  />
                  <TextField
                    label="تخفیف ٪"
                    value={tl.discount_percent}
                    onChange={(e) => setTicketLevel(i, "discount_percent", e.target.value)}
                    size="small"
                    type="number"
                    slotProps={{ input: { inputProps: { min: 0, max: 100 } } }}
                  />
                  <TextField
                    label="موجودی"
                    value={tl.stock_quantity}
                    onChange={(e) => setTicketLevel(i, "stock_quantity", e.target.value)}
                    size="small"
                    type="number"
                    slotProps={{ input: { inputProps: { min: 1 } } }}
                  />
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 1, alignItems: "center" }}>
                  <TextField
                    label="حداکثر خرید هر کاربر"
                    value={tl.max_purchase_per_user}
                    onChange={(e) => setTicketLevel(i, "max_purchase_per_user", e.target.value)}
                    size="small"
                    type="number"
                    slotProps={{ input: { inputProps: { min: 1 } } }}
                  />
                  <TextField
                    label="حداکثر استفاده هر کاربر"
                    value={tl.max_usage_per_user}
                    onChange={(e) => setTicketLevel(i, "max_usage_per_user", e.target.value)}
                    size="small"
                    type="number"
                    slotProps={{ input: { inputProps: { min: 1 } } }}
                  />
                  <FormControlLabel
                    label={<Typography sx={{ fontSize: 12 }}>فعال</Typography>}
                    control={
                      <Switch
                        size="small"
                        checked={tl.is_active ?? true}
                        onChange={(e) => setTicketLevel(i, "is_active", e.target.checked)}
                      />
                    }
                    sx={{ m: 0, whiteSpace: "nowrap" }}
                  />
                </Box>
              </Box>
            ))}
          </Box>

          <SectionLabel>قیمت‌گذاری</SectionLabel>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <PriceInput
              label="قیمت کالا (تومان)"
              value={form.product_price}
              onChange={set("product_price")}
              size="small"
            />
            <PriceInput
              label="قیمت شروع (تومان)"
              value={form.starting_price}
              onChange={set("starting_price")}
              size="small"
            />
          </Box>
          <TextField
            label="نرخ تخفیف"
            value={form.discount_rate}
            onChange={setE("discount_rate")}
            size="small"
            type="number"
            helperText="عدد صحیح — مثلاً ۱"
            slotProps={{ input: { inputProps: { min: 0 }, sx: { direction: "ltr" } } }}
          />

          <SectionLabel>زمان‌بندی</SectionLabel>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <DateTimePickerField
              label="تاریخ انتشار"
              value={form.published_at}
              onChange={set("published_at")}
            />
            <DateTimePickerField
              label="شروع فروش بلیت"
              value={form.ticket_sale_starts_at}
              onChange={set("ticket_sale_starts_at")}
            />
            <DateTimePickerField
              label="شروع قفل"
              value={form.lockdown_starts_at}
              onChange={set("lockdown_starts_at")}
            />
            <DateTimePickerField
              label="شروع حراج"
              value={form.starts_at}
              onChange={set("starts_at")}
            />
            <DateTimePickerField
              label="پایان حراج"
              value={form.ends_at}
              onChange={set("ends_at")}
            />
          </Box>
          <TextField
            label="شناسه حراج والد (اختیاری)"
            value={form.parent_auction_id}
            onChange={setE("parent_auction_id")}
            size="small"
            type="number"
            slotProps={{ input: { sx: { direction: "ltr" } } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeDialog} disabled={saving} sx={{ color: "text.disabled" }}>انصراف</Button>
          <SaveButton variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "..." : "ذخیره"}
          </SaveButton>
        </DialogActions>
      </Dialog>
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

const SaveButton = styled(Button)({
  background: "linear-gradient(135deg, #ffd500, #fdc500)",
  color: "#00296b",
  fontWeight: 700,
  minWidth: 90,
});

const SectionLabel = styled(Typography)(({ theme }) => ({
  fontSize: 11,
  fontWeight: 600,
  color: theme.palette.text.disabled,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: -theme.spacing(1),
}));
