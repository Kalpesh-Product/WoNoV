import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    hasClockedIn: false,
    hasTakenBreak: false,
    clockInTime: null,
    clockOutTime: null,
    breakTimings: [],
    workHours: "0h:0m:0s",
    breakHours: "0h:0m:0s",
    isToday: true,
    lastUserId: null,
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
    setHasTakenBreak: (state, action) => {
      state.hasTakenBreak = action.payload;
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
    setIsToday: (state, action) => {
      state.isToday = action.payload;
    },
    setLastUserId: (state, action) => {
      state.lastUserId = action.payload;
    },
    resetAttendanceState: (state) => {
      state.clockInTime = null;
      state.clockOutTime = null;
      state.breakTimings = [];
      state.workHours = "0h:0m:0s";
      state.breakHours = "0h:0m:0s";
      (state.isToday = true),
        (state.hasClockedIn = false),
        (state.hasTakenBreak = false);
    },
  },
});

export const {
  setClockInTime,
  setHasClockedIn,
  setHasTakenBreak,
  setClockOutTime,
  setBreakTimings,
  setWorkHours,
  setBreakHours,
  setIsToday,
  setLastUserId,
  resetAttendanceState,
} = userSlice.actions;

export default userSlice.reducer;
