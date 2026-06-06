"use client";

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
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { productsApi } from "@/store/slices/products/productsApi";
import { categoriesApi } from "@/store/slices/categories/categoriesApi";
import { formatPrice } from "@/helpers/general";

const PAGE_SIZE = 20;

const PRODUCT_STATUS_MAP = {
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

export default function ProductsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
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
      const res = await productsApi.list({ search, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
      setRows(res?.results ?? res?.data ?? []);
      setTotal(res?.count ?? res?.total ?? 0);
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

  useEffect(() => {
    categoriesApi.list({ limit: 100 })
      .then((res) => setCategories(res?.results ?? res?.data ?? []))
      .catch(() => {});
  }, []);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (row) => {
    setEditTarget(row);
    setForm({
      category_id: row.category_id ?? "",
      title: row.title ?? "",
      description: row.description ?? "",
      estimated_value: row.estimated_value ?? "",
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

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
            محصولات
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            مدیریت محصولات پلتفرم
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{
            background: "linear-gradient(135deg, #ffd500 0%, #fdc500 100%)",
            color: "#00296b",
            fontWeight: 700,
            fontSize: 13,
            px: 2.5,
            py: 1.1,
            borderRadius: 2,
            boxShadow: "0 4px 16px rgba(253,197,0,0.25)",
            "&:hover": { boxShadow: "0 6px 24px rgba(253,197,0,0.35)" },
          }}
        >
          محصول جدید
        </Button>
      </Box>

      {/* Search */}
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

      {/* Table */}
      <TableContainer component={StyledPaper}>
        <Table>
          <TableHead>
            <TableRow>
              {["عنوان", "دسته‌بندی", "وضعیت", "ارزش تخمینی", "عملیات"].map((col) => (
                <TableCell key={col}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.disabled" }}>{col}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}><Skeleton variant="text" width="70%" height={20} sx={{ bgcolor: "rgba(255,255,255,0.06)" }} /></TableCell>
                    ))}
                  </TableRow>
                ))
              : rows.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography sx={{ color: "text.disabled", fontSize: 14 }}>محصولی یافت نشد</Typography>
                    </TableCell>
                  </TableRow>
                )
              : rows.map((row) => {
                  const statusInfo = PRODUCT_STATUS_MAP[row.status] ?? { label: row.status, color: "default" };
                  const categoryName = categories.find((c) => c.id === row.category_id)?.name ?? "—";
                  return (
                    <StyledRow key={row.id}>
                      <TableCell>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "text.primary" }}>{row.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>{categoryName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={statusInfo.label} color={statusInfo.color} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22 }} />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, color: "text.primary", direction: "ltr", display: "inline-block" }}>
                          {row.estimated_value ? `${formatPrice(row.estimated_value)} ت` : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton size="small" onClick={() => openEdit(row)} sx={{ color: "text.disabled", "&:hover": { color: "secondary.main" } }}>
                            <EditOutlinedIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                          <IconButton size="small" onClick={() => setDeleteTarget(row)} sx={{ color: "text.disabled", "&:hover": { color: "error.main" } }}>
                            <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </StyledRow>
                  );
                })}
          </TableBody>
        </Table>
      </TableContainer>

      {pageCount > 1 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
        </Box>
      )}

      {/* Create / Edit Dialog */}
      <StyledDialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", pb: 1 }}>
          {editTarget ? "ویرایش محصول" : "محصول جدید"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="عنوان"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            fullWidth
            size="small"
          />
          <TextField
            select
            label="دسته‌بندی"
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            fullWidth
            size="small"
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="توضیحات"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            fullWidth
            size="small"
            multiline
            rows={3}
          />
          <TextField
            label="ارزش تخمینی (تومان)"
            value={form.estimated_value}
            onChange={(e) => setForm((f) => ({ ...f, estimated_value: e.target.value }))}
            fullWidth
            size="small"
            slotProps={{ input: { sx: { direction: "ltr" } } }}
          />
          <TextField
            select
            label="وضعیت"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            fullWidth
            size="small"
          >
            <MenuItem value="active">فعال</MenuItem>
            <MenuItem value="inactive">غیرفعال</MenuItem>
            <MenuItem value="archived">آرشیو</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeDialog} disabled={saving} sx={{ color: "text.disabled" }}>انصراف</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ background: "linear-gradient(135deg, #ffd500, #fdc500)", color: "#00296b", fontWeight: 700, minWidth: 90 }}>
            {saving ? "..." : "ذخیره"}
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Delete Confirm Dialog */}
      <StyledDialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
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
      </StyledDialog>
    </Box>
  );
}

// ─── Styled Components ────────────────────────────────────────────────────────

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(145deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
  border: `1px solid ${theme.palette.modules.glassBorder}`,
  borderRadius: 10,
  overflow: "auto",
}));

const StyledRow = styled(TableRow)(() => ({
  transition: "background 150ms ease",
  "&:hover": { background: "rgba(255,255,255,0.03)" },
  "& td": { borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "12px 16px" },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    background: theme.palette.background.default,
    border: `1px solid ${theme.palette.modules.glassBorder}`,
    borderRadius: 12,
    boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
  },
}));
