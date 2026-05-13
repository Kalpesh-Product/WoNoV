import { createSlice } from "@reduxjs/toolkit";

const performanceSlice = createSlice({
  name: "performance",
  initialState: {
    selectedDepartment: '',
    selectedDepartmentName : '',
    selectedMember: null,
  },
  reducers: {
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
    },
    setSelectedDepartmentName: (state, action) => {
      state.selectedDepartmentName = action.payload;
    },
      setSelectedMember: (state, action) => {
      state.selectedMember = action.payload;
    },
  },
});

export const { setSelectedDepartment, setSelectedDepartmentName, setSelectedMember } = performanceSlice.actions;
export default performanceSlice.reducer;
