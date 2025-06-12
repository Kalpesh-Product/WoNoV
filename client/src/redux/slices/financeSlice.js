import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  totalIncome: 0,
  totalExpense: 0,
  voucherDetails: null, // <-- Add this
};

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    setTotalIncome: (state, action) => {
      state.totalIncome = action.payload;
    },
    setTotalExpense: (state, action) => {
      state.totalExpense = action.payload;
    },
    setVoucherDetails: (state, action) => {
      state.voucherDetails = action.payload; // <-- Set the voucher data
    },
  },
});

export const { setTotalIncome, setTotalExpense, setVoucherDetails } = financeSlice.actions;
export default financeSlice.reducer;
