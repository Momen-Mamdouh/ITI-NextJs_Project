import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AdminState {
  selectedUser: string | null;
  isLoading: boolean;
}

const initialState: AdminState = {
  selectedUser: null,
  isLoading: false,
};

export const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<string | null>) => {
      state.selectedUser = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setSelectedUser, setLoading } = adminSlice.actions;
export default adminSlice.reducer;
