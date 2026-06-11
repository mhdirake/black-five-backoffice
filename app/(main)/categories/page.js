"use client";

import { useCallback, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
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
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import { categoriesApi } from "@/store/slices/categories/categoriesApi";
import { Table } from "@/components/ui/Table";
import { PaginationBar } from "@/components/ui/PaginationBar";


const EMPTY_ATTR = { key: "", type: "text", label: "" };

const EMPTY_FORM = {
  name: "",
  slug: "",
  parent_id: null,
  is_active: true,
  allow_cash_out: false,
  allow_direct_purchase: true,
  allow_internal_resale: false,
  allow_external_export: false,
  attributes_schema: [],
};

const PERMISSION_FLAGS = [
  { key: "allow_direct_purchase", label: "خرید مستقیم" },
  { key: "allow_cash_out", label: "برداشت وجه" },
  { key: "allow_internal_resale", label: "فروش داخلی" },
  { key: "allow_external_export", label: "صادرات" },
];

const COLUMNS = [
  {
    key: "name",
    label: "نام",
    render: (row) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "text.primary" }}>
        {row.name}
      </Typography>
    ),
  },
  {
    key: "parent",
    label: "دسته والد",
    render: (row) => (
      <Typography sx={{ fontSize: 12.5, color: row.parent ? "text.secondary" : "text.disabled" }}>
        {row.parent?.name ?? "—"}
      </Typography>
    ),
  },
  {
    key: "slug",
    label: "اسلاگ",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", display: "inline-block" }}>
        {row.slug}
      </Typography>
    ),
  },
  {
    key: "attributes_schema",
    label: "ویژگی‌ها",
    render: (row) => {
      const count = row.attributes_schema?.length ?? 0;
      return (
        <Chip
          label={`${count} ویژگی`}
          size="small"
          sx={{ fontSize: 11, height: 22, bgcolor: count > 0 ? "action.selected" : "transparent", color: count > 0 ? "text.primary" : "text.disabled" }}
        />
      );
    },
  },
  {
    key: "permissions",
    label: "مجوزها",
    render: (row) => (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {PERMISSION_FLAGS.map(({ key, label }) =>
          row[key] ? (
            <Chip key={key} label={label} color="success" size="small" sx={{ fontSize: 10, height: 20, fontWeight: 600 }} />
          ) : null
        )}
        {PERMISSION_FLAGS.every(({ key }) => !row[key]) && (
          <Typography sx={{ fontSize: 12, color: "text.disabled" }}>—</Typography>
        )}
      </Box>
    ),
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

export default function CategoriesPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.list({ search, limit: pageSize, page_number: page });
      setRows(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (row) => {
    setEditTarget(row);
    setForm({
      name: row.name ?? "",
      slug: row.slug ?? "",
      parent_id: row.parent_id ?? null,
      is_active: row.is_active ?? true,
      allow_cash_out: row.allow_cash_out ?? false,
      allow_direct_purchase: row.allow_direct_purchase ?? true,
      allow_internal_resale: row.allow_internal_resale ?? false,
      allow_external_export: row.allow_external_export ?? false,
      attributes_schema: row.attributes_schema ?? [],
    });
    setDialogOpen(true);
  };

  const addAttr = () => setForm((f) => ({ ...f, attributes_schema: [...f.attributes_schema, { ...EMPTY_ATTR }] }));
  const removeAttr = (i) => setForm((f) => ({ ...f, attributes_schema: f.attributes_schema.filter((_, idx) => idx !== i) }));
  const setAttr = (i, field, val) => setForm((f) => {
    const updated = f.attributes_schema.map((a, idx) => idx === i ? { ...a, [field]: val } : a);
    return { ...f, attributes_schema: updated };
  });
  const closeDialog = () => { if (saving) return; setDialogOpen(false); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("نام دسته‌بندی الزامی است"); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await categoriesApi.update(editTarget.id, form);
        toast.success("دسته‌بندی ویرایش شد");
      } else {
        await categoriesApi.create(form);
        toast.success("دسته‌بندی ایجاد شد");
      }
      setDialogOpen(false);
      fetchCategories();
    } catch {
      toast.error("خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await categoriesApi.delete(deleteTarget.id);
      toast.success("دسته‌بندی حذف شد");
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      toast.error("خطا در حذف");
    } finally {
      setDeleting(false);
    }
  };

  const actions = [
    {
      type: "icon",
      icon: <EditOutlinedIcon sx={{ fontSize: 17 }} />,
      onClick: openEdit,
      sx: { color: "text.disabled", "&:hover": { color: "secondary.main" } },
    },
    {
      type: "icon",
      icon: <DeleteOutlineIcon sx={{ fontSize: 17 }} />,
      onClick: setDeleteTarget,
      sx: { color: "text.disabled", "&:hover": { color: "error.main" } },
    },
  ];


  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
            دسته‌بندی‌ها
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            مدیریت دسته‌بندی‌های محصولات
          </Typography>
        </Box>
        <AddButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          دسته‌بندی جدید
        </AddButton>
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

      <Table
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        actions={actions}
        emptyLabel="دسته‌بندی یافت نشد"
      />

            <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", pb: 1 }}>
          {editTarget ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="نام"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth size="small"
          />
          <TextField
            label="اسلاگ"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            fullWidth size="small"
            slotProps={{ input: { sx: { direction: "ltr" } } }}
          />
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              select label="دسته والد"
              value={form.parent_id ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value || null }))}
              fullWidth size="small"
            >
              {rows
                .filter((r) => r.id !== editTarget?.id)
                .map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
            </TextField>
            {form.parent_id && (
              <IconButton size="small" onClick={() => setForm((f) => ({ ...f, parent_id: null }))} sx={{ color: "text.disabled", flexShrink: 0 }}>
                <ClearIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: 12, color: "text.disabled" }}>ویژگی‌های دسته‌بندی</Typography>
              <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={addAttr} sx={{ fontSize: 11, color: "text.disabled", minWidth: "auto" }}>
                افزودن
              </Button>
            </Box>
            {form.attributes_schema.length === 0 && (
              <Typography sx={{ fontSize: 12, color: "text.disabled", textAlign: "center", py: 1.5, border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 2 }}>
                ویژگی‌ای تعریف نشده
              </Typography>
            )}
            {form.attributes_schema.map((attr, i) => (
              <Box key={i} sx={{ display: "grid", gridTemplateColumns: "1fr 100px 1fr auto", gap: 1, mb: 1, alignItems: "center" }}>
                <TextField
                  placeholder="key"
                  value={attr.key}
                  onChange={(e) => setAttr(i, "key", e.target.value)}
                  size="small"
                  slotProps={{ input: { sx: { direction: "ltr", fontSize: 12 } } }}
                />
                <TextField
                  select value={attr.type}
                  onChange={(e) => setAttr(i, "type", e.target.value)}
                  size="small"
                >
                  <MenuItem value="text">text</MenuItem>
                  <MenuItem value="number">number</MenuItem>
                </TextField>
                <TextField
                  placeholder="Label"
                  value={attr.label}
                  onChange={(e) => setAttr(i, "label", e.target.value)}
                  size="small"
                />
                <IconButton size="small" onClick={() => removeAttr(i)} sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}>
                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {[
              { key: "is_active", label: "فعال" },
              { key: "allow_direct_purchase", label: "خرید مستقیم" },
              { key: "allow_cash_out", label: "برداشت وجه" },
              { key: "allow_internal_resale", label: "فروش مجدد داخلی" },
              { key: "allow_external_export", label: "صادرات خارجی" },
            ].map(({ key, label }) => (
              <FormControlLabel
                key={key}
                label={<Typography sx={{ fontSize: 13 }}>{label}</Typography>}
                control={
                  <Switch
                    size="small"
                    checked={!!form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  />
                }
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeDialog} disabled={saving} sx={{ color: "text.disabled" }}>انصراف</Button>
          <SaveButton variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "..." : "ذخیره"}
          </SaveButton>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}>حذف دسته‌بندی</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, color: "text.disabled" }}>
            آیا از حذف <b style={{ color: "#fff" }}>{deleteTarget?.name}</b> مطمئن هستید؟
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} sx={{ color: "text.disabled" }}>انصراف</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting} sx={{ fontWeight: 700, minWidth: 80 }}>
            {deleting ? "..." : "حذف"}
          </Button>
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

