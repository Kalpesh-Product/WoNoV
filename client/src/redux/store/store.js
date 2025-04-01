import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import sessionStorage from "redux-persist/lib/storage/session";
import { encryptTransform } from "redux-persist-transform-encrypt";
import clientReducer from "../slices/clientSlice";
import meetingsReducer from "../slices/meetingSlice";
import salesReducer from '../slices/salesSlice'

const persistConfig = {
  key: "root",
  storage: sessionStorage,
  whitelist: ["client"],
  transforms: [
    encryptTransform({
      secretKey:
        "aasdalkdsjlakwaksdasadsdnmqwoqksdbasdoaoqwdbmasdbkaboqwidhsndiwdpsokcgdkjnv",
      onError: (error) => console.error("Encryption Error : ", error),
    }),
  ],
};

const rootreducer = combineReducers({
  meetings: meetingsReducer,
  client: clientReducer,
  sales : salesReducer
});

const persistedReducer = persistReducer(persistConfig, rootreducer);

const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
export default store;
