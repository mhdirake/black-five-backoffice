"use client";

import { Box, MenuItem, Pagination, TextField, Typography } from "@mui/material";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export function PaginationBar({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const pageCount = Math.ceil(total / pageSize) || 1;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  return (
    <Box
      sx={{
        mt: 3,
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 2,
        direction: "rtl",
      }}
    >
      {/* Right slot (RTL: rightmost) — rows per page selector */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, justifyContent: "flex-start" }}>
        <TextField
          select
          size="small"
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
          sx={{
            width: 100,
            "& .MuiOutlinedInput-root": { fontSize: 12, borderRadius: 2 },
            "& .MuiSelect-select": { py: "6px" },
          }}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <MenuItem key={n} value={n} sx={{ fontSize: 13 }}>{n} ردیف</MenuItem>
          ))}
        </TextField>

        {total > 0 && (
          <Typography sx={{ fontSize: 12, color: "text.disabled", whiteSpace: "nowrap", direction: "ltr" }}>
            {from}–{to} از {total}
          </Typography>
        )}
      </Box>

      {/* Center slot — page numbers */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
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
              direction: "ltr",
              "& .MuiPaginationItem-root": { fontSize: 12, minWidth: 30, height: 30 },
              "& .Mui-selected": { fontWeight: 700 },
            }}
          />
        )}
      </Box>

      {/* Left slot (RTL: leftmost) — intentionally empty to balance the grid */}
      <Box />
    </Box>
  );
}

export default PaginationBar;
