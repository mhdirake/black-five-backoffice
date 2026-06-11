"use client";

import { useCallback, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";
import { auctionParametersApi } from "@/store/slices/auctionParameters/auctionParametersApi";
import { auctionsApi } from "@/store/slices/auctions/auctionsApi";
import { Table } from "@/components/ui/Table";
import PriceInput from "@/components/ui/PriceInput";

const PAGE_SIZE = 20;

const EMPTY_FORM = {
  auction_id: "",
  run_number: "",
  starting_price: "",
  discount_rate: "",
  note: "",
};

const COLUMNS = [
  {
    key: "auction",
    label: "حراج",
    render: (row) => (
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.primary" }}>{row.auction?.title ?? "—"}</Typography>
        <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{row.auction?.product?.title}</Typography>
      </Box>
    ),
  },
  {
    key: "run_number",
    label: "شماره دوره",
    render: (row) => (
      <Typography sx={{ fontSize: 13, direction: "ltr", display: "inline-block" }}>
        {row.run_number ?? "—"}
      </Typography>
    ),
  },
  {
    key: "starting_price",
    label: "قیمت شروع",
    render: (row) => {
      const val = parseFloat(row.starting_price);
      return (
        <Typography sx={{ fontSize: 13, direction: "ltr", display: "inline-block" }}>
          {val ? val.toLocaleString("en-US") + " T" : "—"}
        </Typography>
      );
    },
  },
  {
    key: "discount_rate",
    label: "نرخ تخفیف",
    render: (row) => (
      <Typography sx={{ fontSize: 13, direction: "ltr", display: "inline-block" }}>
        {row.discount_rate ?? "—"}
      </Typography>
    ),
  },
  {
    key: "created_at",
    label: "تاریخ ثبت",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", display: "inline-block" }}>
        {row.created_at ? new Date(row.created_at).toLocaleDateString("en-GB") : "—"}
      </Typography>
    ),
  },
];

export default function AuctionParametersPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
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
      const params = { limit: PAGE_SIZE, page_number: page };
      if (search) params.search = search;
      const res = await auctionParametersApi.list(params);
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
    auctionsApi.list({ limit: 200 }).then((res) => setAuctions(res?.data ?? [])).catch(() => {});
  };

  const openCreate = () => { loadAuctions(); setForm(EMPTY_FORM); setDialogOpen(true); };
  const closeDialog = () => { if (saving) return; setDialogOpen(false); };

  const handleSave = async () => {
    if (!form.auction_id) { toast.error("حراج الزامی است"); return; }
    setSaving(true);
    try {
      await auctionParametersApi.create({
        ...form,
        starting_price: Number(form.starting_price) || 0,
        discount_rate: Number(form.discount_rate) || 0,
        run_number: form.run_number ? Number(form.run_number) : undefined,
      });
      toast.success("پارامتر ایجاد شد");
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
      await auctionParametersApi.delete(deleteTarget.id);
      toast.success("پارامتر حذف شد");
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
      icon: <DeleteOutlineIcon sx={{ fontSize: 17 }} />,
      onClick: setDeleteTarget,
      sx: { color: "text.disabled", "&:hover": { color: "error.main" } },
    },
  ];

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
            پارامترهای حراج
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            تنظیمات قیمت‌گذاری دوره‌های حراج
          </Typography>
        </Box>
        <AddButton variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          پارامتر جدید
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

      <Table columns={COLUMNS} rows={rows} loading={loading} actions={actions} emptyLabel="پارامتری یافت نشد" />

      {pageCount > 1 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", pb: 1 }}>
          پارامتر جدید
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            select label="حراج"
            value={form.auction_id}
            onChange={(e) => setForm((f) => ({ ...f, auction_id: e.target.value }))}
            fullWidth size="small"
          >
            {auctions.map((a) => <MenuItem key={a.id} value={a.id}>{a.title}</MenuItem>)}
          </TextField>
          <TextField
            label="شماره دوره (اختیاری)"
            value={form.run_number}
            onChange={(e) => setForm((f) => ({ ...f, run_number: e.target.value }))}
            fullWidth size="small"
            type="number"
          />
          <PriceInput
            label="قیمت شروع (تومان)"
            value={form.starting_price}
            onChange={(val) => setForm((f) => ({ ...f, starting_price: val }))}
            size="small"
          />
          <TextField
            label="نرخ تخفیف (۰ تا ۱)"
            value={form.discount_rate}
            onChange={(e) => setForm((f) => ({ ...f, discount_rate: e.target.value }))}
            fullWidth size="small"
            slotProps={{ input: { sx: { direction: "ltr" } } }}
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
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}>حذف پارامتر</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, color: "text.disabled" }}>آیا از حذف این پارامتر مطمئن هستید؟</Typography>
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
