"use client";

import { useCallback, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
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
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import { productsApi } from "@/store/slices/products/productsApi";
import { categoriesApi } from "@/store/slices/categories/categoriesApi";
import { Table } from "@/components/ui/Table";
import { PaginationBar } from "@/components/ui/PaginationBar";
import PriceInput from "@/components/ui/PriceInput";
import TextArea from "@/components/ui/TextArea";


const STATUS_MAP = {
  active:   { label: "فعال",     color: "success" },
  inactive: { label: "غیرفعال", color: "default" },
  archived: { label: "آرشیو",   color: "error" },
};

const EMPTY_FORM = {
  category_id: "",
  title: "",
  description: "",
  estimated_value: "",
  status: "active",
  attributes: {},
  images: [],
};

// backend returns category object inline — no state lookup needed
const COLUMNS = [
  {
    key: "title",
    label: "عنوان",
    render: (row) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "text.primary" }}>
        {row.title}
      </Typography>
    ),
  },
  {
    key: "category",
    label: "دسته‌بندی",
    render: (row) => (
      <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
        {row.category?.name ?? "—"}
      </Typography>
    ),
  },
  {
    key: "attributes",
    label: "برند / مدل",
    render: (row) => {
      const brand = row.attributes?.brand;
      const model = row.attributes?.model;
      if (!brand && !model) return <Typography sx={{ fontSize: 13, color: "text.disabled" }}>—</Typography>;
      return (
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.primary" }}>{brand}</Typography>
          {model && <Typography sx={{ fontSize: 11, color: "text.disabled", mt: 0.25 }}>{model}</Typography>}
        </Box>
      );
    },
  },
  {
    key: "estimated_value",
    label: "ارزش تخمینی",
    render: (row) => {
      const val = parseFloat(row.estimated_value);
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
      const s = STATUS_MAP[row.status] ?? { label: row.status, color: "default" };
      return <Chip label={s.label} color={s.color} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22 }} />;
    },
  },
];

export default function ProductsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  // categories only needed for form dropdown
  const [categories, setCategories] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.list({ search, limit: pageSize, page_number: page });
      setRows(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // load categories only when dialog is first opened
  const loadCategories = () => {
    if (categories.length > 0) return;
    categoriesApi.list({ limit: 200 })
      .then((res) => setCategories(res?.data ?? []))
      .catch(() => {});
  };

  const openCreate = () => {
    loadCategories();
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    loadCategories();
    setEditTarget(row);
    setForm({
      category_id: row.category_id ?? "",
      title: row.title ?? "",
      description: row.description ?? "",
      estimated_value: parseFloat(row.estimated_value) || "",
      status: row.status ?? "active",
      attributes: row.attributes ?? {},
      images: row.images ?? [],
    });
    setDialogOpen(true);
  };

  const closeDialog = () => { if (saving) return; setDialogOpen(false); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("عنوان محصول الزامی است"); return; }
    if (!form.category_id) { toast.error("دسته‌بندی الزامی است"); return; }
    setSaving(true);
    try {
      const payload = { ...form, estimated_value: Number(form.estimated_value) || 0 };
      if (editTarget) {
        await productsApi.update(editTarget.id, payload);
        toast.success("محصول ویرایش شد");
      } else {
        await productsApi.create(payload);
        toast.success("محصول ایجاد شد");
      }
      setDialogOpen(false);
      fetchProducts();
    } catch {
      toast.error("خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productsApi.delete(deleteTarget.id);
      toast.success("محصول حذف شد");
      setDeleteTarget(null);
      fetchProducts();
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
            محصولات
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            مدیریت محصولات پلتفرم
          </Typography>
        </Box>
        <AddButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          محصول جدید
        </AddButton>
      </Box>

      <TextField
        placeholder="جستجو در محصولات..."
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
        emptyLabel="محصولی یافت نشد"
      />

            <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", pb: 1 }}>
          {editTarget ? "ویرایش محصول" : "محصول جدید"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="عنوان"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            fullWidth size="small"
          />
          <TextField
            select label="دسته‌بندی"
            value={form.category_id}
            onChange={(e) => {
              const catId = e.target.value;
              const cat = categories.find((c) => c.id === catId);
              setForm((f) => ({ ...f, category_id: catId, attributes: cat?.attributes_schema?.reduce((acc, s) => ({ ...acc, [s.key]: f.attributes?.[s.key] ?? "" }), {}) ?? {} }));
            }}
            fullWidth size="small"
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>

          {(() => {
            const cat = categories.find((c) => c.id === form.category_id);
            const schema = cat?.attributes_schema ?? [];
            if (!schema.length) return null;
            return (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography sx={{ fontSize: 12, color: "text.disabled" }}>ویژگی‌های دسته‌بندی</Typography>
                {schema.map((attr) => (
                  attr.type === "number" ? (
                    <PriceInput
                      key={attr.key}
                      label={attr.label}
                      value={form.attributes?.[attr.key] ?? ""}
                      onChange={(val) => setForm((f) => ({ ...f, attributes: { ...f.attributes, [attr.key]: val } }))}
                      size="small"
                    />
                  ) : (
                    <TextField
                      key={attr.key}
                      label={attr.label}
                      value={form.attributes?.[attr.key] ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, attributes: { ...f.attributes, [attr.key]: e.target.value } }))}
                      fullWidth size="small"
                    />
                  )
                ))}
              </Box>
            );
          })()}

          <TextArea
            label="توضیحات"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <PriceInput
            label="ارزش تخمینی (تومان)"
            value={form.estimated_value}
            onChange={(val) => setForm((f) => ({ ...f, estimated_value: val }))}
            size="small"
          />
          <TextField
            select label="وضعیت"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            fullWidth size="small"
          >
            <MenuItem value="active">فعال</MenuItem>
            <MenuItem value="inactive">غیرفعال</MenuItem>
            <MenuItem value="archived">آرشیو</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeDialog} disabled={saving} sx={{ color: "text.disabled" }}>انصراف</Button>
          <SaveButton variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "..." : "ذخیره"}
          </SaveButton>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}>حذف محصول</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, color: "text.disabled" }}>
            آیا از حذف <b style={{ color: "#fff" }}>{deleteTarget?.title}</b> مطمئن هستید؟
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
