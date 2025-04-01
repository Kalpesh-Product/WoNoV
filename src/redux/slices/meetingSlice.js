import { createSlice } from "@reduxjs/toolkit";

const meetingSlice = createSlice({
  name: "meetings",
  initialState: {
    data: [],
  },
  reducers: {
    setMeetings: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setMeetings } = meetingSlice.actions;
export default meetingSlice.reducer;
