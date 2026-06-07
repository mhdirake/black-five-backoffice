"use client";

import {
  Box,
  Button,
  IconButton,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Typography,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";

export function Table({
  columns = [],
  rows = [],
  loading = false,
  actions = null,
  emptyLabel = "داده‌ای یافت نشد",
  skeletonRows = 5,
}) {
  const colCount = columns.length + (actions ? 1 : 0);

  return (
    <ContainerStyle component={Paper}>
      <MuiTableStyle>
        <HeadStyle>
          <TableRow>
            {columns.map((col) => (
              <HeadCellStyle key={col.key} align={col.align ?? "right"} width={col.width}>
                {col.label}
              </HeadCellStyle>
            ))}
            {actions && <HeadCellStyle width={88} align="left" />}
          </TableRow>
        </HeadStyle>

        <TableBody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <BodyRowStyle key={i}>
                {Array.from({ length: colCount }).map((__, j) => (
                  <BodyCellStyle key={j}>
                    <Skeleton
                      variant="text"
                      width="55%"
                      height={18}
                      sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: 1, ml: "auto" }}
                    />
                  </BodyCellStyle>
                ))}
              </BodyRowStyle>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <BodyCellStyle colSpan={colCount} align="center" sx={{ py: 9, maxWidth: "unset", borderBottom: "none !important" }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: "50%", border: "1.5px solid", borderColor: "modules.glassBorder", display: "flex", alignItems: "center", justifyContent: "center", mb: 0.5 }}>
                    <Box sx={{ width: 14, height: 2, borderRadius: 1, bgcolor: "modules.glassBorderStrong" }} />
                  </Box>
                  <Typography sx={{ fontSize: 13.5, color: "text.disabled", fontWeight: 500 }}>{emptyLabel}</Typography>
                </Box>
              </BodyCellStyle>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <BodyRowStyle key={row.id ?? i}>
                {columns.map((col) => (
                  <BodyCellStyle key={col.key} align={col.align ?? "right"}>
                    {col.render ? col.render(row) : row[col.key]}
                  </BodyCellStyle>
                ))}
                {actions && (
                  <BodyCellStyle align="left" sx={{ maxWidth: "unset" }}>
                    <Box sx={{ display: "flex", gap: 0.5, direction: "ltr" }}>
                      {actions.map((action, ai) =>
                        action.type === "icon" ? (
                          <IconButton
                            key={ai}
                            size="small"
                            onClick={() => action.onClick(row)}
                            sx={action.sx}
                          >
                            {action.icon}
                          </IconButton>
                        ) : (
                          <Button key={ai} size="small" onClick={() => action.onClick(row)}>
                            {action.label}
                          </Button>
                        )
                      )}
                    </Box>
                  </BodyCellStyle>
                )}
              </BodyRowStyle>
            ))
          )}
        </TableBody>
      </MuiTableStyle>
    </ContainerStyle>
  );
}

// ─── Styled Components ────────────────────────────────────────────────────────

const ContainerStyle = styled(TableContainer)(({ theme }) => ({
  direction: "rtl",
  border: `1px solid ${theme.palette.modules.glassBorder}`,
  borderRadius: 12,
  overflow: "auto",
  background: "rgba(255, 255, 255, 0.04)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 4px 32px rgba(0,0,0,0.22)",
}));

const MuiTableStyle = styled(MuiTable)({
  minWidth: 520,
});

const HeadStyle = styled(TableHead)({
  background: "rgba(0, 0, 0, 0.32)",
});

const HeadCellStyle = styled(TableCell)(({ theme }) => ({
  padding: "13px 18px",
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: "0.04em",
  color: theme.palette.text.disabled,
  borderBottom: `1px solid ${theme.palette.modules.goldBorder} !important`,
  boxShadow: `0 1px 0 ${theme.palette.modules.backgroundGoldGlow}`,
  whiteSpace: "nowrap",
  background: "transparent",
}));

const BodyRowStyle = styled(TableRow)(({ theme }) => ({
  cursor: "default",
  transition: "background 140ms ease, box-shadow 140ms ease",
  boxShadow: "inset 3px 0 0 transparent",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.04)",
    boxShadow: `inset 3px 0 0 ${theme.palette.secondary.main}80`,
  },
  "&:last-child td": {
    borderBottom: "none !important",
  },
}));

const BodyCellStyle = styled(TableCell)(({ theme }) => ({
  padding: "14px 18px",
  fontSize: 13,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.modules.glassBorderLight} !important`,
  whiteSpace: "nowrap",
}));

export default Table;
