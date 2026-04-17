import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { airlinesApi } from '../../services/api';

export interface Pilot {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName?: string;
  pilotScore?: number;
}

export interface Airline {
  id: number;
  name: string;
  description: string;
  country: string;
  salary: number;
  score: number;
  logo?: string;
  bankBalance: number;
  bankDebt: number;
  debtMaturityDate?: string;
  owner?: {
    id: string;
    userName: string;
  };
  pilots?: Pilot[];
  fboCount?: number;
  requireCertificates?: boolean;
  alowEdit?: boolean;
  alowExit?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AirlineStats {
  monthlyEarnings: {
    labels: string[];
    data: number[];
    total: number;
  };
  totalPilots: number;
  totalFbos: number;
}

export interface Fbo {
  id: number;
  icao: string;
  name: string;
  availability: number;
  fuelPriceDiscount: number;
  groundCrewDiscount: number;
  price: number;
}

interface AirlinesState {
  airlines: Airline[];
  userAirline: Airline | null;
  selectedAirline: Airline | null;
  airlineStats: AirlineStats | null;
  pilots: Pilot[];
  fbos: Fbo[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AirlinesState = {
  airlines: [],
  userAirline: null,
  selectedAirline: null,
  airlineStats: null,
  pilots: [],
  fbos: [],
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

export const fetchAirlinePilots = createAsyncThunk('airlines/fetchAirlinePilots', async (id: number) => {
  const response = await airlinesApi.getPilots(id);
  return response;
});

export const fetchAirlineFbos = createAsyncThunk('airlines/fetchAirlineFbos', async (id: number) => {
  const response = await airlinesApi.getFbos(id);
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

export const fetchAirlineStats = createAsyncThunk('airlines/fetchAirlineStats', async (id: number) => {
  const response = await airlinesApi.getStatistics(id);
  return response;
});

export const fetchMyAirline = createAsyncThunk('airlines/fetchMyAirline', async () => {
  const response = await airlinesApi.getMyAirline();
  return response;
});

export const payDebt = createAsyncThunk('airlines/payDebt', async ({ id, amount }: { id: number; amount: number }) => {
  const response = await airlinesApi.payDebt(id, amount);
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
    setPilots: (state, action: PayloadAction<Pilot[]>) => {
      state.pilots = action.payload;
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
      .addCase(fetchAirline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAirline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedAirline = action.payload;
      })
      .addCase(fetchAirline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch airline';
      })
      .addCase(createAirline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAirline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.airlines.push(action.payload);
        state.userAirline = action.payload;
      })
      .addCase(createAirline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create airline';
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
        const index = state.airlines.findIndex(airline => airline.id === action.payload.id);
        if (index !== -1) {
          state.airlines[index] = action.payload;
        }
      })
      .addCase(leaveAirline.fulfilled, (state) => {
        state.userAirline = null;
      })
      .addCase(fetchAirlinePilots.fulfilled, (state, action) => {
        state.pilots = action.payload;
      })
      .addCase(fetchAirlineFbos.fulfilled, (state, action) => {
        state.fbos = action.payload;
      })
      .addCase(fetchAirlineStats.fulfilled, (state, action) => {
        state.airlineStats = action.payload;
      })
      .addCase(fetchMyAirline.fulfilled, (state, action) => {
        state.userAirline = action.payload;
      })
      .addCase(payDebt.fulfilled, (state, action) => {
        // Debt paid successfully, will be refreshed by fetchMyAirline
      });
  },
});

export const { clearError, setSelectedAirline, clearAirlineStats, setPilots } = airlinesSlice.actions;
export default airlinesSlice.reducer;
