import AutoDirInput from "@/components/ui/AutoDirInput";

const MuiTextField = {
  styleOverrides: {
    root: ({ theme }) => ({
      width: "100%",

      '.MuiFormLabel-root': {
        top: '-4px',
        fontSize: '12px',
        color: theme.palette.common.white,

        '&.MuiInputLabel-shrink': {
          top: 0,
        }
      },

      ".MuiInputBase-root": {
        borderRadius: 8,
        fontSize: 12,

        '.MuiInputBase-input': {
          padding: theme.spacing(1.5)
        },

        '&.MuiInputBase-adornedEnd': {
          paddingRight: theme.spacing(0.5)
        }
      },

      ".MuiFormHelperText-root": {
        fontSize: '10px',
        textAlign: "inherit"
      },

      ".MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(255, 255, 255, 0.18)",
        transition: "border-color 200ms ease",
      },

      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(255, 255, 255, 0.35) !important",
      },

      "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },

      ...(theme.direction === 'rtl' && {
        '.MuiFormLabel-root': {
          right: 0,
          left: 'initial',
          transformOrigin: 'right top',
          transform: "translate(-14px, 16px) scale(1)",
          top: '-4px',
          fontSize: '12px',
          color: theme.palette.common.white,

          '&.MuiInputLabel-shrink': {
            top: 0,
            transform: 'translate(-14px, -6px) scale(0.75)',
            color: theme.palette.common.white,
          },
        },

        fieldset: {
          legend: {
            marginLeft: 'auto'
          }
        }
      })
    }),
  },

  defaultProps: {
    variant: "outlined",
     InputProps: {
      inputComponent: AutoDirInput
    }
  },
};

export default MuiTextField;
