import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  totalIncome: 0,
  totalExpense: 0,
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
  },
});

export const { setTotalIncome, setTotalExpense } = financeSlice.actions;
export default financeSlice.reducer;
