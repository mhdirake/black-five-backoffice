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
  FormControlLabel,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Skeleton,
  Switch,
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
import { categoriesApi } from "@/store/slices/categories/categoriesApi";

const PAGE_SIZE = 20;

const EMPTY_FORM = {
  name: "",
  slug: "",
  parent_id: null,
  is_active: true,
  allow_cash_out: false,
  allow_direct_purchase: true,
  allow_internal_resale: false,
  allow_external_export: false,
};

export default function CategoriesPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
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
      const res = await categoriesApi.list({ search, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
      setRows(res?.results ?? res?.data ?? []);
      setTotal(res?.count ?? res?.total ?? 0);
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
  const openEdit = (row) => { setEditTarget(row); setForm({ name: row.name ?? "", slug: row.slug ?? "", parent_id: row.parent_id ?? null, is_active: row.is_active ?? true, allow_cash_out: row.allow_cash_out ?? false, allow_direct_purchase: row.allow_direct_purchase ?? true, allow_internal_resale: row.allow_internal_resale ?? false, allow_external_export: row.allow_external_export ?? false }); setDialogOpen(true); };
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

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
            دسته‌بندی‌ها
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            مدیریت دسته‌بندی‌های محصولات
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
          دسته‌بندی جدید
        </Button>
      </Box>

      {/* Search */}
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

      {/* Table */}
      <TableContainer component={StyledPaper}>
        <Table>
          <TableHead>
            <TableRow>
              {["نام", "اسلاگ", "وضعیت", "خرید مستقیم", "عملیات"].map((col) => (
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
                      <Typography sx={{ color: "text.disabled", fontSize: 14 }}>دسته‌بندی یافت نشد</Typography>
                    </TableCell>
                  </TableRow>
                )
              : rows.map((row) => (
                  <StyledRow key={row.id}>
                    <TableCell>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "text.primary" }}>{row.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", display: "inline-block" }}>{row.slug}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.is_active ? "فعال" : "غیرفعال"} color={row.is_active ? "success" : "default"} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22 }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={row.allow_direct_purchase ? "بله" : "خیر"} color={row.allow_direct_purchase ? "info" : "default"} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22 }} />
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
                ))}
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
          {editTarget ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="نام"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
            size="small"
          />
          <TextField
            label="اسلاگ"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            fullWidth
            size="small"
            slotProps={{ input: { sx: { direction: "ltr" } } }}
          />
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
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ background: "linear-gradient(135deg, #ffd500, #fdc500)", color: "#00296b", fontWeight: 700, minWidth: 90 }}>
            {saving ? "..." : "ذخیره"}
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Delete Confirm Dialog */}
      <StyledDialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
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
