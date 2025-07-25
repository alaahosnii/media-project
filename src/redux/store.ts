import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "./features/login/LoginSlice";
import registerSlice from "./features/register/RegisterSlice";

const store = configureStore({
    reducer: {
        login: loginSlice,
        register: registerSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
