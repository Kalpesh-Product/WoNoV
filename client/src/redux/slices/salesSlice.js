import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  leadsData: [],
  clientsData: [],
  sqftData : 0,
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
    setSqftData : (state)=>{
      state.sqftData
    }
  },
});

export const { setLeadsData, clearLeadsData, setClientData, clearClientData, setSqftData } = salesSlice.actions;
export default salesSlice.reducer;
