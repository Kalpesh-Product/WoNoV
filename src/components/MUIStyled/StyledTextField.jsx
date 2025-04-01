import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

// ✅ Styled Component (inherits everything from TextField)
const StyledTextField = styled(TextField)(({ theme }) => ({
  fontSize: "0.85rem",
  "& .MuiInputBase-input": { fontSize: "0.85rem" }, // Input text size
  "& .MuiFormLabel-root": { fontSize: "0.8rem" }, // Label text size
  "& .MuiSelect-select": { fontSize: "0.85rem" }, // Dropdown text size
}));

export default StyledTextField;
