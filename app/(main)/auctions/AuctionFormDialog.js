"use client";

import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import { auctionsApi } from "@/store/slices/auctions/auctionsApi";
import PriceInput from "@/components/ui/PriceInput";
import DateTimePickerField from "@/components/ui/DateTimePicker";

const STATUS_OPTIONS = [
  { value: "draft",       label: "پیش‌نویس" },
  { value: "published",   label: "منتشرشده" },
  { value: "ticket_sale", label: "فروش بلیت" },
  { value: "active",      label: "فعال" },
  { value: "running",     label: "در حال اجرا" },
  { value: "ended",       label: "پایان‌یافته" },
  { value: "cancelled",   label: "لغوشده" },
];

const EMPTY_FORM = {
  title: "",
  product_id: "",
  type: "dutch",
  status: "draft",
  currency: "IRR",
  product_price: "",
  starting_price: "",
  discount_rate: "",
  total_runs: "",
  max_tickets_per_user: "",
  ticket_sale_starts_at: "",
  lockdown_starts_at: "",
  starts_at: "",
  ends_at: "",
  ticket_levels: [],
};

function detailToForm(raw) {
  const d = raw?.data ?? raw ?? {};
  return {
    title: d.title ?? "",
    product_id: d.product?.id ?? d.product_id ?? "",
    type: d.type ?? "dutch",
    status: d.status ?? "draft",
    currency: d.currency ?? "IRR",
    product_price: d.product_price ?? "",
    starting_price: d.starting_price ?? "",
    discount_rate: d.discount_rate ?? "",
    total_runs: d.total_runs ?? "",
    max_tickets_per_user: d.max_tickets_per_user ?? "",
    ticket_sale_starts_at: d.ticket_sale_starts_at ?? "",
    lockdown_starts_at: d.lockdown_starts_at ?? "",
    starts_at: d.starts_at ?? "",
    ends_at: d.ends_at ?? "",
    ticket_levels: (d.ticket_levels ?? []).map((tl) => ({
      level: tl.level?.id ?? tl.level_id ?? tl.level ?? "",
      price: tl.price ?? "",
      discount_percent: tl.discount_percent ?? "",
      stock_quantity: tl.stock_quantity ?? "",
    })),
  };
}

export default function AuctionFormDialog({ open, onClose, onSaved, editTarget, products, ticketLevels }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (!editTarget) {
      setForm(EMPTY_FORM);
      setLoadingDetail(false);
      return;
    }

    let cancelled = false;
    setForm(EMPTY_FORM);
    setLoadingDetail(true);

    auctionsApi
      .detail(editTarget.id)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data ?? res;
        setForm(detailToForm(data));
      })
      .catch(() => {
        if (!cancelled) toast.error("خطا در دریافت اطلاعات حراج");
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editTarget?.id]);

  const handleClose = () => { if (saving) return; onClose(); };

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const setE = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addTicketLevel = () =>
    setForm((f) => ({
      ...f,
      ticket_levels: [...f.ticket_levels, { level: "", price: "", discount_percent: "", stock_quantity: "" }],
    }));

  const removeTicketLevel = (i) =>
    setForm((f) => ({ ...f, ticket_levels: f.ticket_levels.filter((_, idx) => idx !== i) }));

  const setTicketLevel = (i, field, val) =>
    setForm((f) => ({
      ...f,
      ticket_levels: f.ticket_levels.map((tl, idx) => (idx === i ? { ...tl, [field]: val } : tl)),
    }));

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("عنوان حراج الزامی است"); return; }
    if (!form.product_id) { toast.error("محصول الزامی است"); return; }
    if (!form.starts_at || !form.ends_at) { toast.error("تاریخ شروع و پایان الزامی است"); return; }
    if (new Date(form.ends_at) <= new Date(form.starts_at)) { toast.error("تاریخ پایان باید بعد از تاریخ شروع باشد"); return; }
    if (!form.ticket_levels.length) { toast.error("حداقل یک سطح بلیت اضافه کنید"); return; }
    if (form.ticket_levels.some((tl) => !tl.level)) { toast.error("سطح بلیت برای همه ردیف‌ها الزامی است"); return; }

    const payload = {
      ...form,
      product_price: Number(form.product_price) || 0,
      starting_price: Number(form.starting_price) || 0,
      discount_rate: Number(form.discount_rate) || 0,
      total_runs: Number(form.total_runs) || 1,
      max_tickets_per_user: Number(form.max_tickets_per_user) || 1,
      ticket_levels: form.ticket_levels.map((tl) => ({
        level: tl.level,
        price: Number(tl.price) || 0,
        discount_percent: Number(tl.discount_percent) || 0,
        stock_quantity: Number(tl.stock_quantity) || 0,
      })),
    };

    setSaving(true);
    try {
      if (editTarget) {
        await auctionsApi.update(editTarget.id, payload);
        toast.success("حراج ویرایش شد");
      } else {
        await auctionsApi.create(payload);
        toast.success("حراج ایجاد شد");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", pb: 1 }}>
        {editTarget ? "ویرایش حراج" : "ایجاد حراج جدید"}
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
        {loadingDetail ? (
          <LoadingBox>
            <CircularProgress size={28} />
          </LoadingBox>
        ) : (
          <>
            <TextField label="عنوان" value={form.title} onChange={setE("title")} fullWidth size="small" />

            <TextField select label="محصول" value={form.product_id} onChange={setE("product_id")} fullWidth size="small">
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField select label="نوع حراج" value={form.type} onChange={setE("type")} fullWidth size="small">
                <MenuItem value="dutch">داچ</MenuItem>
              </TextField>
              <TextField select label="وضعیت" value={form.status} onChange={setE("status")} fullWidth size="small">
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField select label="ارز" value={form.currency} onChange={setE("currency")} size="small" sx={{ width: "50%" }}>
              <MenuItem value="IRR">ریال (IRR)</MenuItem>
              <MenuItem value="USD">دلار (USD)</MenuItem>
            </TextField>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontSize: 12, color: "text.disabled" }}>سطوح بلیت</Typography>
                <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={addTicketLevel} sx={{ fontSize: 11, color: "text.disabled", minWidth: "auto" }}>
                  افزودن سطح
                </Button>
              </Box>
              {form.ticket_levels.length === 0 && (
                <EmptyTicketPlaceholder>سطح بلیتی اضافه نشده</EmptyTicketPlaceholder>
              )}
              {form.ticket_levels.map((tl, i) => (
                <TicketLevelRow key={i}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                      select label="سطح بلیت"
                      value={tl.level}
                      onChange={(e) => setTicketLevel(i, "level", e.target.value)}
                      fullWidth size="small"
                    >
                      {ticketLevels.map((t) => (
                        <MenuItem key={t.id} value={t.id}>{t.name ?? t.title ?? t.id}</MenuItem>
                      ))}
                    </TextField>
                    <IconButton size="small" onClick={() => removeTicketLevel(i)} sx={{ color: "text.disabled", flexShrink: 0, "&:hover": { color: "error.main" } }}>
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
                    <PriceInput label="قیمت (تومان)" value={tl.price} onChange={(val) => setTicketLevel(i, "price", val)} size="small" />
                    <TextField
                      label="تخفیف ٪" value={tl.discount_percent}
                      onChange={(e) => setTicketLevel(i, "discount_percent", e.target.value)}
                      size="small" type="number"
                      slotProps={{ input: { inputProps: { min: 0, max: 100 } } }}
                    />
                    <TextField
                      label="موجودی" value={tl.stock_quantity}
                      onChange={(e) => setTicketLevel(i, "stock_quantity", e.target.value)}
                      size="small" type="number"
                      slotProps={{ input: { inputProps: { min: 0 } } }}
                    />
                  </Box>
                </TicketLevelRow>
              ))}
            </Box>

            <SectionLabel>قیمت‌گذاری</SectionLabel>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <PriceInput label="قیمت کالا (تومان)" value={form.product_price} onChange={set("product_price")} size="small" />
              <PriceInput label="قیمت شروع (تومان)" value={form.starting_price} onChange={set("starting_price")} size="small" />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="نرخ تخفیف (۰ تا ۱)" value={form.discount_rate} onChange={setE("discount_rate")}
                size="small" slotProps={{ input: { sx: { direction: "ltr" } } }}
              />
              <TextField label="حداکثر بلیت هر کاربر" value={form.max_tickets_per_user} onChange={setE("max_tickets_per_user")} size="small" type="number" />
            </Box>
            <TextField label="تعداد دوره‌ها" value={form.total_runs} onChange={setE("total_runs")} size="small" type="number" />

            <SectionLabel>زمان‌بندی</SectionLabel>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <DateTimePickerField label="شروع فروش بلیت" value={form.ticket_sale_starts_at} onChange={set("ticket_sale_starts_at")} />
              <DateTimePickerField label="شروع قفل" value={form.lockdown_starts_at} onChange={set("lockdown_starts_at")} />
              <DateTimePickerField label="شروع حراج" value={form.starts_at} onChange={set("starts_at")} />
              <DateTimePickerField label="پایان حراج" value={form.ends_at} onChange={set("ends_at")} />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} disabled={saving} sx={{ color: "text.disabled" }}>انصراف</Button>
        <SaveButton variant="contained" onClick={handleSave} disabled={saving || loadingDetail}>
          {saving ? "..." : "ذخیره"}
        </SaveButton>
      </DialogActions>
    </Dialog>
  );
}

// ─── Styled Components ────────────────────────────────────────────────────────

const LoadingBox = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "48px 0",
});

const EmptyTicketPlaceholder = styled(Typography)({
  fontSize: 12,
  color: "text.disabled",
  textAlign: "center",
  padding: "12px 0",
  border: "1px dashed rgba(255,255,255,0.1)",
  borderRadius: 8,
});

const TicketLevelRow = styled(Box)({
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  padding: 12,
  marginBottom: 8,
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

const SectionLabel = styled(Typography)(({ theme }) => ({
  fontSize: 11,
  fontWeight: 600,
  color: theme.palette.text.disabled,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: -theme.spacing(1),
}));

const SaveButton = styled(Button)({
  background: "linear-gradient(135deg, #ffd500, #fdc500)",
  color: "#00296b",
  fontWeight: 700,
  minWidth: 90,
});
