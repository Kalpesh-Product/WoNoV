import { createSlice } from "@reduxjs/toolkit";

const performanceSlice = createSlice({
  name: "performance",
  initialState: {
    selectedDepartment: '',
    selectedDepartmentName : ''
  },
  reducers: {
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
    },
    setSelectedDepartmentName: (state, action) => {
      state.selectedDepartmentName = action.payload;
    },
  },
});

export const { setSelectedDepartment, setSelectedDepartmentName } = performanceSlice.actions;
export default performanceSlice.reducer;
