"use client";

import {
  Box,
  Grid2,
  MenuItem,
  Pagination as MuiPagination,
  TextField,
  Typography,
  alpha,
  styled,
} from "@mui/material";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import useIsMobileView from "@/hooks/useIsMobileView";
import { DEFAULT_PAGE_LENGTH } from "@/constants/general";

const perPageItems = [5, 10, 20, 50];

function Pagination({ total }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isMobileView = useIsMobileView();

  const page = +searchParams.get("page") || 1;
  const page_size = +searchParams.get("page_size") || DEFAULT_PAGE_LENGTH;
  const totalPages = Math.ceil(total / page_size) || 1;

  const replace = (updates) => {
    const params = { ...Object.fromEntries([...searchParams]), ...updates };
    router.replace(`${pathname}?${new URLSearchParams(params)}`, { scroll: false });
  };

  if (!page_size) return null;

  return (
    <Grid2 container spacing={0.5} mt={3} mb={2} alignItems="center">
      <Grid2 size={{ xs: 6, md: 3 }} order={{ md: 0, xs: 2 }}>
        <PerPageWrapper>
          <SmallSelect
            select
            size="small"
            dir="ltr"
            value={page_size}
            onChange={(e) => replace({ page_size: e.target.value, page: 1 })}
          >
            {perPageItems.map((n) => (
              <MenuItem key={n} value={n} sx={{ fontSize: 12 }}>
                {n}
              </MenuItem>
            ))}
          </SmallSelect>
          <Typography mr={1} variant="subtitle2" color="text.secondary">
            تعداد
          </Typography>
        </PerPageWrapper>
      </Grid2>

      <Grid2
        size={{ xs: 12, md: 6 }}
        order={{ md: 1, xs: 1 }}
        mb={isMobileView ? 2 : 0}
      >
        <MuiPaginationStyle
          page={isNaN(page) ? 1 : page}
          count={isNaN(totalPages) ? 1 : totalPages}
          onChange={(_, value) => replace({ page: value })}
          size="small"
          dir="ltr"
        />
      </Grid2>

      <Grid2 size={{ xs: 6, md: 3 }} textAlign="left" order={{ md: 2, xs: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" dir="rtl">
          <b>{page}</b> از <b>{isNaN(totalPages) ? 1 : totalPages}</b>
        </Typography>
      </Grid2>
    </Grid2>
  );
}

const PerPageWrapper = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

const SmallSelect = styled(TextField)(({ theme }) => ({
  width: "80px",

  ".MuiSelect-select": {
    padding: theme.spacing(0.5, 1),
    paddingLeft: `${theme.spacing(3)} !important`,
    fontSize: "12px",
    textAlign: "right"
  },

  ".MuiButtonBase-root": {
    width: "16px",
    height: "16px",
    top: "50%",
    right: "2px",
    transform: "translateY(-50%)",
    padding: 0,
  },
}));

const MuiPaginationStyle = styled(MuiPagination)(({ theme }) => ({
  ".MuiPagination-ul": {
    justifyContent: "center",

    ".MuiButtonBase-root": {
      background: alpha(theme.palette.background.box, 0.7),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      lineHeight: "0",
      color: theme.palette.text.primary,
      border: `1px solid ${theme.palette.modules.glassBorderStrong}`,
      width: 35,
      height: 35,

      svg: {
        transform: "rotate(180deg)"
      },

      "&.Mui-selected": {
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderColor: theme.palette.primary.main,
      },

      "&:hover:not(.Mui-selected)": {
        background: theme.palette.primary.light,
      },
    },
  },
}));

export default Pagination;
