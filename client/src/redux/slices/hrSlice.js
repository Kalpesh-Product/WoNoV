// src/store/slices/hrSlice.js

import { createSlice } from "@reduxjs/toolkit";

const hrSlice = createSlice({
  name: "hr",
  initialState: {
    selectedMonth: null,
    tasksRawData: [],
  },
  reducers: {
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload;
    },
    setTasksData: (state, action) => {
        state.tasksRawData = action.payload;
      },
  },
});

export const { setSelectedMonth, setTasksData  } = hrSlice.actions;
export default hrSlice.reducer;
