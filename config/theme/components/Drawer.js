const MuiDrawer = {
  styleOverrides: {
    root: {
      // zIndex intentionally removed — Dialog (modal: 1300) must be above Drawer (drawer: 1200)
    },
  },
};

export default MuiDrawer;
