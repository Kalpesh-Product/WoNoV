import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedDepartment: null,
};

const assetsSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
    },
  },
});

export const { setSelectedDepartment } = assetsSlice.actions;
export default assetsSlice.reducer;
