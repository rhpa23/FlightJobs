import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { airlinesApi } from '../../services/api';

interface Pilot {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName?: string;
  statistics?: any;
}

interface Airline {
  id: number;
  name: string;
  description: string;
  country: string;
  salary: number;
  score: number;
  logo?: string;
  bankBalance: number;
  owner?: any;
  pilots?: Pilot[];
  createdAt: string;
  updatedAt: string;
}

interface AirlinesState {
  airlines: Airline[];
  userAirline: Airline | null;
  selectedAirline: Airline | null;
  airlineStats: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: AirlinesState = {
  airlines: [],
  userAirline: null,
  selectedAirline: null,
  airlineStats: null,
  isLoading: false,
  error: null,
};

export const fetchAirlines = createAsyncThunk('airlines/fetchAirlines', async () => {
  const response = await airlinesApi.getAirlines();
  return response;
});

export const fetchAirline = createAsyncThunk('airlines/fetchAirline', async (id: number) => {
  const response = await airlinesApi.getAirline(id);
  return response;
});

export const createAirline = createAsyncThunk('airlines/createAirline', async (airlineData: Partial<Airline>) => {
  const response = await airlinesApi.createAirline(airlineData);
  return response;
});

export const updateAirline = createAsyncThunk('airlines/updateAirline', async ({ id, data }: { id: number; data: Partial<Airline> }) => {
  const response = await airlinesApi.updateAirline(id, data);
  return response;
});

export const deleteAirline = createAsyncThunk('airlines/deleteAirline', async (id: number) => {
  await airlinesApi.deleteAirline(id);
  return id;
});

export const joinAirline = createAsyncThunk('airlines/joinAirline', async (id: number) => {
  const response = await airlinesApi.joinAirline(id);
  return response;
});

export const leaveAirline = createAsyncThunk('airlines/leaveAirline', async (id: number) => {
  const response = await airlinesApi.leaveAirline(id);
  return response;
});

export const fetchAirlinePilots = createAsyncThunk('airlines/fetchPilots', async (id: number) => {
  const response = await airlinesApi.getPilots(id);
  return response;
});

export const hirePilot = createAsyncThunk('airlines/hirePilot', async ({ id, userId }: { id: number; userId: string }) => {
  const response = await airlinesApi.hirePilot(id, userId);
  return response;
});

export const firePilot = createAsyncThunk('airlines/firePilot', async ({ id, userId }: { id: number; userId: string }) => {
  const response = await airlinesApi.firePilot(id, userId);
  return response;
});

export const fetchAirlineStats = createAsyncThunk('airlines/fetchStats', async (id: number) => {
  const response = await airlinesApi.getStatistics(id);
  return response;
});

export const fetchMyAirline = createAsyncThunk('airlines/fetchMyAirline', async () => {
  const response = await airlinesApi.getMyAirline();
  return response;
});

const airlinesSlice = createSlice({
  name: 'airlines',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedAirline: (state, action: PayloadAction<Airline | null>) => {
      state.selectedAirline = action.payload;
    },
    clearAirlineStats: (state) => {
      state.airlineStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAirlines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAirlines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.airlines = action.payload;
      })
      .addCase(fetchAirlines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch airlines';
      })
      .addCase(fetchAirline.fulfilled, (state, action) => {
        state.selectedAirline = action.payload;
      })
      .addCase(createAirline.fulfilled, (state, action) => {
        state.airlines.push(action.payload);
        state.userAirline = action.payload;
      })
      .addCase(updateAirline.fulfilled, (state, action) => {
        const index = state.airlines.findIndex(airline => airline.id === action.payload.id);
        if (index !== -1) {
          state.airlines[index] = action.payload;
        }
        if (state.userAirline?.id === action.payload.id) {
          state.userAirline = action.payload;
        }
        if (state.selectedAirline?.id === action.payload.id) {
          state.selectedAirline = action.payload;
        }
      })
      .addCase(deleteAirline.fulfilled, (state, action) => {
        state.airlines = state.airlines.filter(airline => airline.id !== action.payload);
        if (state.userAirline?.id === action.payload) {
          state.userAirline = null;
        }
        if (state.selectedAirline?.id === action.payload) {
          state.selectedAirline = null;
        }
      })
      .addCase(joinAirline.fulfilled, (state, action) => {
        state.userAirline = action.payload;
        // Update the airline in the list
        const index = state.airlines.findIndex(airline => airline.id === action.payload.id);
        if (index !== -1) {
          state.airlines[index] = action.payload;
        }
      })
      .addCase(leaveAirline.fulfilled, (state) => {
        state.userAirline = null;
      })
      .addCase(fetchAirlineStats.fulfilled, (state, action) => {
        state.airlineStats = action.payload;
      })
      .addCase(fetchMyAirline.fulfilled, (state, action) => {
        state.userAirline = action.payload;
      });
  },
});

export const { clearError, setSelectedAirline, clearAirlineStats } = airlinesSlice.actions;
export default airlinesSlice.reducer;
