import { createSlice } from "@reduxjs/toolkit";

const ticketsSlice = createSlice({
  name: "tickets",
  initialState: {
    data: [],
  },
  reducers: {
    setTickets: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setTickets } = ticketsSlice.actions;
export default ticketsSlice.reducer;
