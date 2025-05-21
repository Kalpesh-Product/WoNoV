import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  leadsData: [],
  clientsData: [],
  unitsData : [],
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
    setUnitData : (state,action)=>{
      state.unitsData = action.payload;
    }
  },
});

export const { setLeadsData, clearLeadsData, setClientData, clearClientData, setUnitData } = salesSlice.actions;
export default salesSlice.reducer;
