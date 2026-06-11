"use client";

import { useCallback, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import { ticketLevelsApi } from "@/store/slices/ticketLevels/ticketLevelsApi";
import { Table } from "@/components/ui/Table";
import { PaginationBar } from "@/components/ui/PaginationBar";
import PriceInput from "@/components/ui/PriceInput";
import TextArea from "@/components/ui/TextArea";


const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
};

const COLUMNS = [
  {
    key: "name",
    label: "نام",
    render: (row) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "text.primary" }}>
        {row.name ?? row.title ?? "—"}
      </Typography>
    ),
  },
  {
    key: "price",
    label: "قیمت",
    render: (row) => {
      const val = parseFloat(row.price ?? row.amount ?? 0);
      return (
        <Typography sx={{ fontSize: 13, direction: "ltr", display: "inline-block" }}>
          {val ? val.toLocaleString("en-US") + " T" : "—"}
        </Typography>
      );
    },
  },
  {
    key: "description",
    label: "توضیحات",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
        {row.description || "—"}
      </Typography>
    ),
  },
  {
    key: "is_active",
    label: "وضعیت",
    render: (row) => row.is_active !== undefined ? (
      <Chip
        label={row.is_active ? "فعال" : "غیرفعال"}
        color={row.is_active ? "success" : "default"}
        size="small"
        sx={{ fontSize: 11, fontWeight: 600, height: 22 }}
      />
    ) : null,
  },
];

export default function TicketLevelsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ticketLevelsApi.list({ limit: pageSize, page_number: page });
      setRows(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLevels(); }, [fetchLevels]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (row) => {
    setEditTarget(row);
    setForm({
      name: row.name ?? row.title ?? "",
      description: row.description ?? "",
      price: parseFloat(row.price ?? row.amount ?? "") || "",
    });
    setDialogOpen(true);
  };
  const closeDialog = () => { if (saving) return; setDialogOpen(false); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("نام سطح بلیت الزامی است"); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) || 0 };
      if (editTarget) {
        await ticketLevelsApi.update(editTarget.id, payload);
        toast.success("سطح بلیت ویرایش شد");
      } else {
        await ticketLevelsApi.create(payload);
        toast.success("سطح بلیت ایجاد شد");
      }
      setDialogOpen(false);
      fetchLevels();
    } catch {
      toast.error("خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await ticketLevelsApi.delete(deleteTarget.id);
      toast.success("سطح بلیت حذف شد");
      setDeleteTarget(null);
      fetchLevels();
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
            سطوح بلیت
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            مدیریت سطوح بلیت حراج‌ها
          </Typography>
        </Box>
        <AddButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          سطح جدید
        </AddButton>
      </Box>

      <Table
        columns={COLUMNS}
        rows={rows}
        loading={loading}
        actions={actions}
        emptyLabel="سطح بلیتی یافت نشد"
      />

            <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", pb: 1 }}>
          {editTarget ? "ویرایش سطح بلیت" : "سطح بلیت جدید"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="نام"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth size="small"
          />
          <PriceInput
            label="قیمت (تومان)"
            value={form.price}
            onChange={(val) => setForm((f) => ({ ...f, price: val }))}
            size="small"
          />
          <TextArea
            label="توضیحات"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeDialog} disabled={saving} sx={{ color: "text.disabled" }}>انصراف</Button>
          <SaveButton variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "..." : "ذخیره"}
          </SaveButton>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}>حذف سطح بلیت</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, color: "text.disabled" }}>
            آیا از حذف <b style={{ color: "#fff" }}>{deleteTarget?.name ?? deleteTarget?.title}</b> مطمئن هستید؟
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

