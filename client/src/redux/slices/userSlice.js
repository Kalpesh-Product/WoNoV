import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    hasClockedIn: false,
    clockInTime: null,
    clockOutTime: null,
    breakTimings: [],
    workHours: "0h:0m:0s",
    breakHours: "0h:0m:0s",
  },
  reducers: {
    setHasClockedIn: (state, action) => {
      state.hasClockedIn = action.payload;
    },
    setClockInTime: (state, action) => {
      state.clockInTime = action.payload;
    },
    setClockOutTime: (state, action) => {
      state.clockOutTime = action.payload;
    },
    setBreakTimings: (state, action) => {
      state.breakTimings = action.payload;
    },
    setWorkHours: (state, action) => {
      state.workHours = action.payload;
    },
    setBreakHours: (state, action) => {
      state.breakHours = action.payload;
    },
    resetAttendanceState: (state) => {
      state.clockInTime = null;
      state.clockOutTime = null;
      state.breakTimings = [];
      state.workHours = "0h:0m:0s";
      state.breakHours = "0h:0m:0s";
    },
  },
});

export const {
  setClockInTime,
  setHasClockedIn,
  setClockOutTime,
  setBreakTimings,
  setWorkHours,
  setBreakHours,
  resetAttendanceState,
} = userSlice.actions;

export default userSlice.reducer;
