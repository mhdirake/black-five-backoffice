export const MuiChip = {
  styleOverrides: {
    root: ({ theme, ownerState }) => {
      const mainColor = theme?.palette?.[ownerState?.color]?.main;
      const isDefault = !mainColor || ownerState?.color === "default";

      const background = isDefault
        ? "rgba(255,255,255,0.08)"
        : mainColor + "26";

      const labelColor = isDefault
        ? theme.palette.text.disabled
        : mainColor;

      return {
        backgroundColor: background,
        color: labelColor,

        "&.MuiChip-sizeMedium": {
          borderRadius: 5,
          fontSize: "10px",
          height: "24px",
          ".MuiChip-label": {
            padding: theme.spacing(0.5, 2),
          },
        },

        "&.MuiChip-sizeLarge": {
          borderRadius: 5,
          fontSize: "14px",
          height: "24px",
          ".MuiChip-label": {
            padding: theme.spacing(0.5, 1),
          },
        },

        "&.MuiChip-sizeSmall": {
          borderRadius: 5,
          fontSize: "10px",
          ".MuiChip-label": {
            padding: theme.spacing(0.5, 1.5),
          },
        },
      };
    },
  },
};

export default MuiChip;
