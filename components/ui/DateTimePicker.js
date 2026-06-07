"use client";

import moment from "moment-jalaali";
import { AdapterMomentJalaali } from "@mui/x-date-pickers/AdapterMomentJalaali";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { getTimeFromNow } from "@/helpers/date";

moment.loadPersian({ dialect: "persian-modern" });

export default function DateTimePickerField({ label, value, onChange, minDate, ...props }) {
  const existingTheme = useTheme();
  const theme = useMemo(() => createTheme(existingTheme, { direction: "rtl" }), [existingTheme]);
  const [open, setOpen] = useState(false);

  const handleChange = (newValue) => {
    if (newValue?.isValid()) {
      onChange(newValue.format("YYYY-MM-DD HH:mm"));
    } else {
      onChange(null);
    }
  };

  const formattedValue = value && moment(value).isValid() ? moment(value) : null;
  const helperText = useMemo(() => (formattedValue ? getTimeFromNow(formattedValue) : ""), [formattedValue]);

  const paperBg = theme.palette.background.paper;
  const primary = theme.palette.primary.main;
  const textPrimary = theme.palette.text.primary;
  const textDisabled = theme.palette.text.disabled;
  const divider = theme.palette.divider;

  return (
    <ThemeProvider theme={theme}>
      <div dir="ltr">
        <LocalizationProvider dateAdapter={AdapterMomentJalaali}>
          <DateTimePicker
            label={label}
            value={formattedValue}
            onChange={handleChange}
            minDate={minDate ?? moment()}
            format="jYYYY/jMM/jDD HH:mm"
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            slotProps={{
              actionBar: { actions: ["clear", "accept"] },

              openPickerButton: { sx: { display: "none" } },

              calendarHeader: {
                sx: {
                  direction: "rtl",
                  ".MuiPickersCalendarHeader-labelContainer": {
                    marginLeft: "auto",
                    marginRight: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: textPrimary,
                  },
                  ".MuiPickersCalendarHeader-switchViewButton": { color: textPrimary },
                },
              },

              day: {
                sx: {
                  color: textPrimary,
                  fontSize: 12,
                  "&.MuiPickersDay-today": {
                    border: `1px solid ${primary}`,
                    color: primary,
                    background: "transparent",
                  },
                  "&.Mui-selected": {
                    background: `${primary} !important`,
                    color: "#fff !important",
                  },
                  "&:hover": { background: `${primary}26` },
                  "&.Mui-disabled": { color: `${textDisabled} !important` },
                },
              },

              desktopPaper: {
                dir: "rtl",
                sx: {
                  background: paperBg,
                  border: `1px solid ${divider}`,
                  borderRadius: 3,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
                  ".MuiDayCalendar-weekDayLabel": {
                    color: theme.palette.secondary.main,
                    fontSize: 11,
                    fontWeight: 600,
                  },
                  ".MuiPickersArrowSwitcher-root": { flexDirection: "row-reverse" },
                  ".MuiPickersArrowSwitcher-button, .MuiIconButton-root": {
                    color: textPrimary,
                    "&:hover": { background: `${primary}26` },
                  },
                  ".MuiMultiSectionDigitalClock-root": { borderLeft: `1px solid ${divider}` },
                  ".MuiMultiSectionDigitalClockSection-root": {
                    "&::before": { display: "none" },
                    scrollbarWidth: "none",
                    "&::-webkit-scrollbar": { display: "none" },
                    "&:not(:first-of-type)": { borderLeft: `1px solid ${divider}` },
                  },
                  ".MuiMultiSectionDigitalClockSection-item": {
                    fontSize: 13,
                    color: textDisabled,
                    borderRadius: 1.5,
                    margin: "1px 4px",
                    padding: "4px 8px",
                    minWidth: 48,
                    justifyContent: "center",
                    "&.Mui-selected": {
                      background: `${primary} !important`,
                      color: "#fff !important",
                    },
                    "&:hover": { background: `${primary}26`, color: textPrimary },
                  },
                  ".MuiPickersLayout-actionBar": {
                    padding: "8px 12px",
                    gap: 1,
                    ".MuiButtonBase-root": {
                      fontSize: 12,
                      fontWeight: 600,
                      minHeight: 32,
                      borderRadius: 2,
                      flex: 1,
                    },
                    ".MuiButtonBase-root:first-of-type": {
                      background: "transparent !important",
                      color: textDisabled,
                      border: `1px solid ${divider}`,
                    },
                    ".MuiButtonBase-root:last-of-type": {
                      background: "linear-gradient(135deg, #ffd500, #fdc500)",
                      color: "#00296b",
                    },
                  },
                },
              },

              mobilePaper: { dir: "rtl" },

              textField: {
                helperText,
                fullWidth: true,
                size: "small",
                onClick: () => setOpen(true),
                sx: {
                  cursor: "pointer",
                  ".MuiInputBase-root": { cursor: "pointer" },
                  ".MuiInputBase-input": { cursor: "pointer" },
                  ".MuiFormHelperText-root": {
                    fontSize: "0.65rem",
                    direction: "rtl",
                    textAlign: "right",
                    color: textDisabled,
                  },
                },
              },
            }}
            {...props}
          />
        </LocalizationProvider>
      </div>
    </ThemeProvider>
  );
}
