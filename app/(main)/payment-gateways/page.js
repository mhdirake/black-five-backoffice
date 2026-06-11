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
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import { paymentGatewaysApi } from "@/store/slices/paymentGateways/paymentGatewaysApi";
import { Table } from "@/components/ui/Table";
import { PaginationBar } from "@/components/ui/PaginationBar";


const EMPTY_FORM = {
  name: "",
  code: "",
  description: "",
  is_active: true,
};

const COLUMNS = [
  {
    key: "name",
    label: "نام",
    render: (row) => (
      <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "text.primary" }}>{row.name}</Typography>
    ),
  },
  {
    key: "code",
    label: "کد",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", display: "inline-block" }}>{row.code}</Typography>
    ),
  },
  {
    key: "description",
    label: "توضیحات",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{row.description ?? "—"}</Typography>
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

export default function PaymentGatewaysPage() {
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

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentGatewaysApi.list({ limit: pageSize, page_number: page });
      setRows(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (row) => {
    setEditTarget(row);
    setForm({ name: row.name ?? "", code: row.code ?? "", description: row.description ?? "", is_active: row.is_active ?? true });
    setDialogOpen(true);
  };
  const closeDialog = () => { if (saving) return; setDialogOpen(false); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("نام درگاه الزامی است"); return; }
    if (!form.code.trim()) { toast.error("کد درگاه الزامی است"); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await paymentGatewaysApi.update(editTarget.id, form);
        toast.success("درگاه ویرایش شد");
      } else {
        await paymentGatewaysApi.create(form);
        toast.success("درگاه ایجاد شد");
      }
      setDialogOpen(false);
      fetchList();
    } catch {
      toast.error("خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await paymentGatewaysApi.delete(deleteTarget.id);
      toast.success("درگاه حذف شد");
      setDeleteTarget(null);
      fetchList();
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
            درگاه‌های پرداخت
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            مدیریت درگاه‌های پرداخت پلتفرم
          </Typography>
        </Box>
        <AddButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          درگاه جدید
        </AddButton>
      </Box>

      <Table columns={COLUMNS} rows={rows} loading={loading} actions={actions} emptyLabel="درگاهی یافت نشد" />

            <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", pb: 1 }}>
          {editTarget ? "ویرایش درگاه" : "درگاه جدید"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField label="نام" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth size="small" />
          <TextField label="کد" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} fullWidth size="small"
            slotProps={{ input: { sx: { direction: "ltr" } } }} />
          <TextField label="توضیحات" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} fullWidth size="small" multiline rows={2} />
          <FormControlLabel
            label={<Typography sx={{ fontSize: 13 }}>فعال</Typography>}
            control={<Switch size="small" checked={!!form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeDialog} disabled={saving} sx={{ color: "text.disabled" }}>انصراف</Button>
          <SaveButton variant="contained" onClick={handleSave} disabled={saving}>{saving ? "..." : "ذخیره"}</SaveButton>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}>حذف درگاه</DialogTitle>
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
