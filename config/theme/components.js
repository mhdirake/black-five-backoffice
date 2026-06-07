import MuiBaseLine from "./components/MuiBaseLine";
import MuiButton from "./components/Button";
import MuiCard from "./components/Card";
import MuiChip from "./components/Chip";
import MuiContainer from "./components/Container";
import MuiDialog from "./components/Dialog";
import MuiDrawer from "./components/Drawer";
import MuiMenu from "./components/Menu";
import MuiSkeleton from "./components/Skeleton";
import MuiTableContainer from "./components/Table";
import MuiTabs from "./components/Tab";
import MuiTextField from "./components/TextField";
import MuiFab from "./components/Fab";

const components = {
  ...MuiBaseLine,
  MuiButton,
  MuiDialog,
  MuiSkeleton,
  MuiMenu,
  MuiTableContainer,
  MuiTextField,
  MuiTabs,
  MuiContainer,
  MuiDrawer,
  MuiCard,
  MuiChip,
  MuiFab,
  MuiSelect: {
    styleOverrides: {
      icon: ({ theme }) => ({
        color: "#ffffff",
        ...(theme.direction === "rtl" && {
          right: "auto",
          left: 7,
        }),
      }),
    },
  },
};

export default components;
