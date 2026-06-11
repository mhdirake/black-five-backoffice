"use client";

import { useCallback, useEffect, useState } from "react";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Chip,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { usersApi } from "@/store/slices/users/usersApi";
import { Table } from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { DEFAULT_PAGE_LENGTH } from "@/constants/general";

const KYC_STATUS_MAP = {
  pending:  { label: "در انتظار",  color: "warning" },
  approved: { label: "تأیید‌شده", color: "success" },
  rejected: { label: "ردشده",     color: "error" },
};

const COLUMNS = [
  {
    key: "username",
    label: "نام کاربری",
    render: (row) => (
      <Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>{row.username}</Typography>
        <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{row.email}</Typography>
      </Box>
    ),
  },
  {
    key: "name",
    label: "نام و نام خانوادگی",
    render: (row) => (
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
        {[row.first_name, row.last_name].filter(Boolean).join(" ") || "—"}
      </Typography>
    ),
  },
  {
    key: "roles",
    label: "نقش",
    render: (row) => (
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
        {(row.roles ?? []).map((r) => (
          <Chip key={r.id} label={r.name} size="small" sx={{ fontSize: 10, height: 20 }} />
        ))}
        {!(row.roles?.length) && <Typography sx={{ fontSize: 12, color: "text.disabled" }}>—</Typography>}
      </Box>
    ),
  },
  {
    key: "kyc",
    label: "احراز هویت",
    render: (row) => {
      const kyc = row.latest_kyc_verification;
      if (!kyc) return <Typography sx={{ fontSize: 12, color: "text.disabled" }}>ندارد</Typography>;
      const s = KYC_STATUS_MAP[kyc.status] ?? { label: kyc.status, color: "default" };
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip label={s.label} color={s.color} size="small" sx={{ fontSize: 11, fontWeight: 600, height: 22 }} />
          <Typography sx={{ fontSize: 11, color: "text.disabled" }}>سطح {kyc.level}</Typography>
        </Box>
      );
    },
  },
  {
    key: "wallet",
    label: "موجودی کیف‌پول",
    render: (row) => {
      const w = row.wallet;
      if (!w) return <Typography sx={{ fontSize: 12, color: "text.disabled" }}>—</Typography>;
      return (
        <Typography sx={{ fontSize: 13, fontWeight: 600, direction: "ltr", display: "inline-block" }}>
          {Number(w.balance).toLocaleString("en-US")} {w.currency}
        </Typography>
      );
    },
  },
  {
    key: "last_login_at",
    label: "آخرین ورود",
    render: (row) => (
      <Typography sx={{ fontSize: 12, color: "text.disabled", direction: "ltr", display: "inline-block" }}>
        {row.last_login_at ? new Date(row.last_login_at).toLocaleDateString("en-GB") : "—"}
      </Typography>
    ),
  },
];

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = +searchParams.get("page") || 1;
  const pageSize = +searchParams.get("page_size") || DEFAULT_PAGE_LENGTH;
  const [rows, setRows]               = useState([]);
  const [total, setTotal]             = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [kycStatus, setKycStatus]     = useState("");
  const [kycLevel, setKycLevel]       = useState("");
  const [loading, setLoading]         = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: pageSize, page_number: page };
      if (search)    params.search     = search;
      if (kycStatus) params.kyc_status = kycStatus;
      if (kycLevel)  params.kyc_level  = kycLevel;
      const res = await usersApi.list(params);
      setRows(res?.data ?? []);
      setTotal(res?.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, kycStatus, kycLevel]);

  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const actions = [
    {
      type: "icon",
      icon: <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />,
      onClick: (row) => router.push(`/users/${row.id}`),
      sx: { color: "text.disabled", "&:hover": { color: "primary.main" } },
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
          <PersonOutlineIcon sx={{ fontSize: 22, color: "secondary.main" }} />
          <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, lineHeight: 1.25 }}>
            کاربران
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
          مدیریت و مشاهده اطلاعات کاربران پلتفرم
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="جستجو (نام کاربری، ایمیل)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          size="small"
          sx={{ width: { xs: "100%", sm: 300 } }}
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
        <TextField
          select label="وضعیت احراز هویت"
          value={kycStatus}
          onChange={(e) => setKycStatus(e.target.value)}
          size="small"
          sx={{ width: 180 }}
        >
          <MenuItem value="">همه</MenuItem>
          {Object.entries(KYC_STATUS_MAP).map(([k, { label }]) => (
            <MenuItem key={k} value={k}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select label="سطح احراز هویت"
          value={kycLevel}
          onChange={(e) => setKycLevel(e.target.value)}
          size="small"
          sx={{ width: 160 }}
        >
          <MenuItem value="">همه</MenuItem>
          {[1, 2, 3].map((l) => (
            <MenuItem key={l} value={l}>سطح {l}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Table columns={COLUMNS} rows={rows} loading={loading} actions={actions} emptyLabel="کاربری یافت نشد" />

      <Pagination total={total} />
    </Box>
  );
}
