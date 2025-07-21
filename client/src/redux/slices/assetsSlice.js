import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedDepartment: null,
  selectedDepartmentName : "",
};

const assetsSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
    },
    setSelectedDepartmentName: (state, action) => {
      state.selectedDepartmentName = action.payload;
    },
  },
});

export const { setSelectedDepartment,setSelectedDepartmentName } = assetsSlice.actions;
export default assetsSlice.reducer;
