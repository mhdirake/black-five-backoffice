"use client";

import { useCallback, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
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
import { freePassesApi } from "@/store/slices/freePasses/freePassesApi";
import { auctionsApi } from "@/store/slices/auctions/auctionsApi";
import { Table } from "@/components/ui/Table";
import { PaginationBar } from "@/components/ui/PaginationBar";


const STATUS_MAP = {
  active:  { label: "فعال",     color: "success" },
  used:    { label: "استفاده‌شده", color: "default" },
  expired: { label: "منقضی",    color: "error" },
};

const EMPTY_FORM = {
  user_id: "",
  auction_id: "",
  quantity: 1,
  note: "",
};

const COLUMNS = [
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
    render: (row) => (
      <Typography sx={{ fontSize: 13 }}>{row.quantity ?? 1}</Typography>
    ),
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
    key: "created_at",
    label: "تاریخ",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", display: "inline-block" }}>
        {row.created_at ? new Date(row.created_at).toLocaleDateString("en-GB") : "—"}
      </Typography>
    ),
  },
];

export default function FreePassesPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const [auctions, setAuctions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: pageSize, page_number: page };
      if (search) params.search = search;
      const res = await freePassesApi.list(params);
      setRows(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadAuctions = () => {
    if (auctions.length > 0) return;
    auctionsApi.list({ limit: 200 })
      .then((res) => setAuctions(res?.data ?? []))
      .catch(() => {});
  };

  const openCreate = () => {
    loadAuctions();
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const closeDialog = () => { if (saving) return; setDialogOpen(false); };

  const handleSave = async () => {
    if (!form.auction_id) { toast.error("حراج الزامی است"); return; }
    if (!form.user_id) { toast.error("شناسه کاربر الزامی است"); return; }
    setSaving(true);
    try {
      await freePassesApi.create({ ...form, quantity: Number(form.quantity) || 1 });
      toast.success("پاس رایگان ایجاد شد");
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
      await freePassesApi.delete(deleteTarget.id);
      toast.success("پاس رایگان حذف شد");
      setDeleteTarget(null);
      fetchList();
    } catch {
      toast.error("خطا در حذف");
    } finally {
      setDeleting(false);
    }
  };

  const handleAction = async (fn, successMsg, errorMsg) => {
    try {
      await fn();
      toast.success(successMsg);
      fetchList();
    } catch {
      toast.error(errorMsg);
    }
  };

  const actions = [
    {
      type: "icon",
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 17 }} />,
      onClick: (row) => handleAction(() => freePassesApi.markUsed(row.id), "پاس به‌عنوان استفاده‌شده ثبت شد", "خطا"),
      sx: { color: "text.disabled", "&:hover": { color: "success.main" } },
      hidden: (row) => !!row.used_at,
    },
    {
      type: "icon",
      icon: <RefreshIcon sx={{ fontSize: 17 }} />,
      onClick: (row) => handleAction(() => freePassesApi.restore(row.id), "پاس بازیابی شد", "خطا در بازیابی"),
      sx: { color: "text.disabled", "&:hover": { color: "info.main" } },
      hidden: (row) => !row.used_at,
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
            پاس‌های رایگان
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            مدیریت پاس‌های رایگان اعطاشده به کاربران
          </Typography>
        </Box>
        <AddButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          پاس جدید
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

      <Table columns={COLUMNS} rows={rows} loading={loading} actions={actions} emptyLabel="پاس رایگانی یافت نشد" />

            <PaginationBar page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", pb: 1 }}>
          پاس رایگان جدید
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="شناسه کاربر (User ID)"
            value={form.user_id}
            onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
            fullWidth size="small"
            slotProps={{ input: { sx: { direction: "ltr" } } }}
          />
          <TextField
            select label="حراج"
            value={form.auction_id}
            onChange={(e) => setForm((f) => ({ ...f, auction_id: e.target.value }))}
            fullWidth size="small"
          >
            {auctions.map((a) => (
              <MenuItem key={a.id} value={a.id}>{a.title}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="تعداد"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            fullWidth size="small"
            type="number"
            slotProps={{ input: { inputProps: { min: 1 } } }}
          />
          <TextField
            label="یادداشت (اختیاری)"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            fullWidth size="small"
            multiline rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeDialog} disabled={saving} sx={{ color: "text.disabled" }}>انصراف</Button>
          <SaveButton variant="contained" onClick={handleSave} disabled={saving}>{saving ? "..." : "ذخیره"}</SaveButton>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}>حذف پاس رایگان</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, color: "text.disabled" }}>
            آیا از حذف این پاس رایگان مطمئن هستید؟
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
