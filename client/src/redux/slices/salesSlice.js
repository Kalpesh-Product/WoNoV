import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  leadsData: [],
  clientsData: [],
};

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    setLeadsData: (state, action) => {
      state.leadsData = action.payload;
    },
    clearLeadsData: (state) => {
      state.leadsData = [];
    },
    setClientData: (state, action) => {
      state.clientsData = action.payload;
    },
    clearClientData: (state) => {
      state.clientsData = [];
    },
  },
});

export const { setLeadsData, clearLeadsData, setClientData, clearClientData } = salesSlice.actions;
export default salesSlice.reducer;
