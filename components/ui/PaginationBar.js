"use client";

import { Box, MenuItem, Pagination, TextField, Typography } from "@mui/material";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export function PaginationBar({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const pageCount = Math.ceil(total / pageSize) || 1;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  return (
    <Box sx={{ mt: 3, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>

      {/* Total + range info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <TextField
          select
          size="small"
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
          sx={{
            width: 90,
            "& .MuiOutlinedInput-root": { fontSize: 12, borderRadius: 2 },
            "& .MuiSelect-select": { py: "6px" },
          }}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <MenuItem key={n} value={n} sx={{ fontSize: 13 }}>{n} ردیف</MenuItem>
          ))}
        </TextField>

        {total > 0 && (
          <Typography sx={{ fontSize: 12, color: "text.disabled", whiteSpace: "nowrap" }}>
            {from.toLocaleString("en-US")}–{to.toLocaleString("en-US")} از {total.toLocaleString("en-US")}
          </Typography>
        )}
      </Box>

      {/* Page numbers – centered overall because of space-between + both sides balanced */}
      {pageCount > 1 && (
        <Pagination
          count={pageCount}
          page={page}
          onChange={(_, v) => onPageChange(v)}
          color="primary"
          shape="rounded"
          size="small"
          siblingCount={1}
          sx={{
            "& .MuiPaginationItem-root": { fontSize: 12, minWidth: 30, height: 30 },
            "& .Mui-selected": { fontWeight: 700 },
          }}
        />
      )}

      {/* Right spacer – mirrors the left side so pagination stays centered */}
      <Box sx={{ width: 90, display: { xs: "none", sm: "block" } }} />
    </Box>
  );
}

export default PaginationBar;
