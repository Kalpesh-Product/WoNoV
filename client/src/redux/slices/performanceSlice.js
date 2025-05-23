import { createSlice } from "@reduxjs/toolkit";

const performanceSlice = createSlice({
  name: "performance",
  initialState: {
    selectedDepartment: '',
  },
  reducers: {
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
    },
  },
});

export const { setSelectedDepartment } = performanceSlice.actions;
export default performanceSlice.reducer;
