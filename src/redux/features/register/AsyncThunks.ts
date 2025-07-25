import type { ErrorResponse, RegisterForm } from "../../../types/Types";
import axiosInstance from "../../../utils/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

export const register = createAsyncThunk(
    "register/register",
    async (registerData: RegisterForm, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/auth/register", registerData);
            return response.data;
        } catch (error: unknown) {
            const errorResponse = error as AxiosError<ErrorResponse>;
            return rejectWithValue(errorResponse.response?.data.message);
        }
    }
);

// export const register = createAsyncThunk(
//     "login/register",
//     async (registerData: RegisterForm, { rejectWithValue }) => {
//         try {
//             const response = await axiosInstance.post("/api/register", registerData);
//             return response.data;
//         } catch (error: unknown) {
//             const errorResponse = error as AxiosError<ErrorResponse>;
//             return rejectWithValue(errorResponse.response?.data.message);
//         }
//     }
// );  