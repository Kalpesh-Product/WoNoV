import { createSlice } from "@reduxjs/toolkit";
const hrSlice = createSlice({
  name: "hr",
  initialState: {
    selectedMonth: null,
    tasksRawData: [], // ✅ Inject here
    selectedEmployee: null,
    selectedEmployeeMongoId: null,
    tasksOverallData : []
  },
  reducers: {
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload;
    },
    setTasksData: (state, action) => {
      state.tasksRawData = action.payload;
    },
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
    setSelectedEmployeeMongoId: (state, action) => {
      state.selectedEmployeeMongoId = action.payload;
    },
        setTasksOverallData: (state, action) => {
      state.tasksOverallData = action.payload;
    },
  },
});

export const {
  setSelectedMonth,
  setTasksData,
  setSelectedEmployee,
  setSelectedEmployeeMongoId,
  setTasksOverallData
} = hrSlice.actions;
export default hrSlice.reducer;
