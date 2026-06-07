const SIDEBAR_WIDTH = 260;

const MuiDialog = {
  styleOverrides: {
    container: ({ theme }) => ({
      // RTL: sidebar is on the right — shift dialog container so it centers in the content area
      [theme.breakpoints.up("md")]: {
        paddingRight: SIDEBAR_WIDTH,
      },
    }),
    paper: ({ theme }) => ({
      background: theme.palette.background.default,
      border: `1px solid ${theme.palette.modules.glassBorder}`,
      borderRadius: 14,
      boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
    }),
  },
};

export default MuiDialog;
