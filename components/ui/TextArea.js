"use client";

import { Box, FormHelperText, TextareaAutosize, Typography, styled, useTheme } from "@mui/material";
import { useState } from "react";

function TextArea({ label, value, onChange, error, helperText, placeholder, ...props }) {
  const { direction } = useTheme();
  const [focused, setFocused] = useState(false);
  const hasValue = Boolean(value);

  const handleChange = (e) => {
    const val = e.target.value;
    const isRTL = /[؀-ۿ]/.test(val);
    e.target.dir = isRTL ? "rtl" : "ltr";
    if (onChange) onChange(e);
  };

  return (
    <>
      <Wrapper>
        <Label dir={direction} focused={focused || hasValue}>
          {label}
        </Label>

        <StyledTextarea
          minRows={4}
          value={value}
          onChange={handleChange}
          placeholder={focused || hasValue ? placeholder : ""}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          error={error}
          {...props}
        />

        <StyledFieldset focused={focused} dir={direction}>
          <StyledLegend focused={focused || hasValue}>
            <span style={{ paddingLeft: 5, paddingRight: 5, display: "inline-block", opacity: 0 }}>
              {label}
            </span>
          </StyledLegend>
        </StyledFieldset>
      </Wrapper>

      {(error || helperText) && (
        <FormHelperText sx={{ textAlign: direction === "rtl" ? "right" : "left", fontSize: "10px" }} error={error}>
          {helperText}
        </FormHelperText>
      )}
    </>
  );
}

const Wrapper = styled(Box)({
  position: "relative",
  width: "100%",
  borderRadius: 8,
  cursor: "text",
  display: "inline-flex",
  alignItems: "center",
});

const Label = styled(Typography, {
  shouldForwardProp: (p) => p !== "focused",
})(({ theme, focused }) => ({
  color: theme.palette.common.white,
  opacity: focused ? 1 : 0.6,
  fontSize: "12px",
  position: "absolute",
  pointerEvents: "none",
  zIndex: 1,
  top: 0,
  transformOrigin: "top right",
  transition: "transform 200ms cubic-bezier(0.0, 0, 0.2, 1), opacity 200ms",

  '&[dir="rtl"]': {
    right: 0,
    left: "initial",
    transform: focused ? "translate(-14px, -4px) scale(0.75)" : "translate(-14px, 16px) scale(1)",
  },
  '&[dir="ltr"]': {
    left: 0,
    transformOrigin: "top left",
    transform: focused ? "translate(14px, -4px) scale(0.75)" : "translate(14px, 16px) scale(1)",
  },
}));

const StyledFieldset = styled("fieldset", {
  shouldForwardProp: (p) => p !== "focused",
})(({ focused, theme }) => ({
  position: "absolute",
  inset: "-5px 0 0 0",
  margin: 0,
  padding: "0 8px",
  pointerEvents: "none",
  borderRadius: "inherit",
  borderStyle: "solid",
  borderWidth: focused ? 2 : 1,
  overflow: "hidden",
  borderColor: focused ? theme.palette.primary.main : "rgba(255,255,255,0.18)",
  transition: "border-color 200ms ease",
}));

const StyledLegend = styled("legend", {
  shouldForwardProp: (p) => p !== "focused",
})(({ focused }) => ({
  float: "unset",
  width: "auto",
  overflow: "hidden",
  display: "block",
  padding: 0,
  height: 11,
  fontSize: "0.75em",
  visibility: "hidden",
  maxWidth: focused ? "100%" : "0.01px",
  transition: "max-width 50ms cubic-bezier(0.0, 0, 0.2, 1)",
  whiteSpace: "nowrap",
}));

const StyledTextarea = styled(TextareaAutosize)(({ theme }) => ({
  width: "100%",
  border: "none",
  boxSizing: "border-box",
  outline: "none",
  padding: "12px",
  font: "inherit",
  fontSize: "12px",
  color: theme.palette.common.white,
  background: "none",
  resize: "none",
  margin: 0,
  "&::placeholder": {
    color: theme.palette.text.disabled,
  },
}));

export default TextArea;
