import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedClient: null,
};

const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    setSelectedClient: (state, action) => {
      state.selectedClient = action.payload;
    },
  },
});

export const { setSelectedClient } = clientSlice.actions;
export default clientSlice.reducer;
