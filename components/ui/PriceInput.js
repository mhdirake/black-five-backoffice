import { TextField } from "@mui/material";
import { NumericFormat } from "react-number-format";

function PriceInput({ value, onChange, allowNegative = false, ...props }) {
  return (
    <NumericFormat
      value={value}
      customInput={TextField}
      allowNegative={allowNegative}
      decimalScale={0}
      valueIsNumericString
      thousandSeparator
      onValueChange={(values) => onChange(values.value)}
      slotProps={{ input: { sx: { direction: "ltr" } } }}
      {...props}
    />
  );
}

export default PriceInput;
