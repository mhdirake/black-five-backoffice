"use client";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
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
import { auctionsApi } from "@/store/slices/auctions/auctionsApi";
import { formatPrice } from "@/helpers/general";

const PAGE_SIZE = 20;

const AUCTION_TYPE_MAP = {
  dutch: { label: "داچ", color: "secondary" },
};

const AUCTION_STATUS_MAP = {
  draft:     { label: "پیش‌نویس",  color: "default" },
  published: { label: "منتشرشده", color: "info" },
  active:    { label: "فعال",      color: "success" },
  ended:     { label: "پایان‌یافته", color: "error" },
  cancelled: { label: "لغوشده",   color: "error" },
};

export default function AuctionsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auctionsApi.list({
        search,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      setRows(res?.results ?? res?.data ?? []);
      setTotal(res?.count ?? res?.total ?? 0);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h3" sx={{ color: "text.primary", fontWeight: 700, mb: 0.5, lineHeight: 1.25 }}>
            حراج‌ها
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            مدیریت و نمایش همه حراج‌های پلتفرم
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
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
          ایجاد حراج
        </Button>
      </Box>

      {/* Search */}
      <TextField
        placeholder="جستجو در حراج‌ها..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        size="small"
        sx={{ mb: 3, width: { xs: "100%", sm: 340 } }}
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
              {["عنوان", "نوع", "وضعیت", "قیمت پایه", "قیمت شروع", "تاریخ انتشار"].map((col) => (
                <TableCell key={col}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.disabled" }}>
                    {col}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: "rgba(255,255,255,0.06)" }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography sx={{ color: "text.disabled", fontSize: 14 }}>
                        حراجی یافت نشد
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              : rows.map((row) => {
                  const statusInfo = AUCTION_STATUS_MAP[row.status] ?? { label: row.status, color: "default" };
                  const typeInfo = AUCTION_TYPE_MAP[row.type] ?? { label: row.type, color: "default" };
                  return (
                    <StyledRow key={row.id}>
                      <TableCell>
                        <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "text.primary" }}>
                          {row.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={typeInfo.label}
                          color={typeInfo.color}
                          size="small"
                          sx={{ fontSize: 11, fontWeight: 600, height: 22 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusInfo.label}
                          color={statusInfo.color}
                          size="small"
                          sx={{ fontSize: 11, fontWeight: 600, height: 22 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, color: "text.primary", direction: "ltr", display: "inline-block" }}>
                          {formatPrice(row.product_price)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, color: "text.primary", direction: "ltr", display: "inline-block" }}>
                          {formatPrice(row.starting_price)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 13, color: row.published_at ? "text.primary" : "text.disabled" }}>
                          {row.published_at ? new Date(row.published_at).toLocaleDateString("fa-IR") : "—"}
                        </Typography>
                      </TableCell>
                    </StyledRow>
                  );
                })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
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

const StyledRow = styled(TableRow)(({ theme }) => ({
  transition: "background 150ms ease",
  "&:hover": {
    background: "rgba(255,255,255,0.03)",
  },
  "& td": {
    borderBottom: `1px solid ${theme.palette.modules.glassBorderLight}`,
    padding: "14px 16px",
  },
}));
