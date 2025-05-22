import { createSlice } from "@reduxjs/toolkit";
const hrSlice = createSlice({
  name: "hr",
  initialState: {
    selectedMonth: null,
    tasksRawData: [], // ✅ Inject here
    selectedEmployee : null,
  },
  reducers: {
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload;
    },
    setTasksData: (state, action) => {
      state.tasksRawData = action.payload;
    },
    setSelectedEmployee : (state, action)=>{
      state.selectedEmployee = action.payload;
    }
  },
});

export const { setSelectedMonth, setTasksData, setSelectedEmployee } = hrSlice.actions;
export default hrSlice.reducer;
