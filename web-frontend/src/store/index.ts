import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import uiReducer from "./uiSlice";
import walletReducer from "./walletSlice";
import transactionReducer from "./transactionSlice";
import { api } from "./api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    wallet: walletReducer,
    transactions: transactionReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
