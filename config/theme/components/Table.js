const MuiTableContainer = {
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: "10px",

      ".MuiTable-root": {
        ".MuiTableHead-root": {
          background: "transparent",
          borderBottom: "none",
          fontWeight: "500",
          fontSize: "14px",
          lineHeight: "21px",
          color: theme.palette.text.secondary,
        },
      },

      ".MuiTableCell-root": {
        borderBottom: "none",
        fonWeight: "500",
        fontSize: "14px",
        lineHeight: "21px",
        color: theme.palette.text.primary,
      },

      "thead tr": {
        borderBottom: `3px solid ${theme.palette.colors.purple}`,
      },

      "thead": {
        position: "relative",
        ":before": {
          content: "''",
          width: "calc(100% - 24px)",
          height: "1.8px",
          background: theme.palette.colors.purple,
          position: "absolute",
          bottom: "0",
          transform: "translateX(-50%)",
          left: "50%"
        }
      },
    }),
  },

  defaultProps: {
    variant: "contained",
  },
};

export default MuiTableContainer;
