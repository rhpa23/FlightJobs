import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { statisticsApi } from '../../services/api';

interface Statistics {
  id: string;
  bankBalance: number;
  pilotScore: number;
  numberFlights: number;
  flightTimeTotal: string;
  payloadTotal: string;
  lastFlight?: string;
  lastAircraft?: string;
  favoriteAirplane?: string;
  weightUnit?: string;
  user?: any;
  airline?: any;
  logo?: string;
  sendLicenseWarning?: boolean;
  sendAirlineBillsWarning?: boolean;
}

interface LeaderboardEntry {
  user: any;
  statistics: Statistics;
  rank: number;
}

interface CareerSummary {
  user: any;
  bankBalance: number;
  pilotScore: number;
  totalFlights: number;
  totalHours: string;
  totalPayload: string;
  lastFlight?: string;
  lastAircraft?: string;
  favoriteAirplane?: string;
  airline?: any;
  rank: string;
}

interface MonthlyStats {
  currentMonth: {
    flights: number;
    hours: number;
    earnings: number;
  };
  previousMonth: {
    flights: number;
    hours: number;
    earnings: number;
  };
  yearToDate: {
    flights: number;
    hours: string;
    earnings: number;
  };
}

interface MonthlyEarnings {
  labels: string[];
  data: number[];
  totalSixMonths: number;
  monthGoal: number;
}

interface StatisticsState {
  myStats: Statistics | null;
  userStats: Statistics | null;
  scoreLeaderboard: LeaderboardEntry[];
  flightsLeaderboard: LeaderboardEntry[];
  earningsLeaderboard: LeaderboardEntry[];
  airlineRankings: any[];
  careerSummary: CareerSummary | null;
  monthlyStats: MonthlyStats | null;
  monthlyEarnings: MonthlyEarnings | null;
  airlineStats: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: StatisticsState = {
  myStats: null,
  userStats: null,
  scoreLeaderboard: [],
  flightsLeaderboard: [],
  earningsLeaderboard: [],
  airlineRankings: [],
  careerSummary: null,
  monthlyStats: null,
  monthlyEarnings: null,
  airlineStats: null,
  isLoading: false,
  error: null,
};

export const fetchMyStats = createAsyncThunk('statistics/fetchMyStats', async () => {
  const response = await statisticsApi.getMyStats();
  return response;
});

export const fetchUserStats = createAsyncThunk('statistics/fetchUserStats', async (userId: string) => {
  const response = await statisticsApi.getUserStats(userId);
  return response;
});

export const fetchScoreLeaderboard = createAsyncThunk('statistics/fetchScoreLeaderboard', async () => {
  const response = await statisticsApi.getScoreLeaderboard();
  return response;
});

export const fetchFlightsLeaderboard = createAsyncThunk('statistics/fetchFlightsLeaderboard', async () => {
  const response = await statisticsApi.getFlightsLeaderboard();
  return response;
});

export const fetchEarningsLeaderboard = createAsyncThunk('statistics/fetchEarningsLeaderboard', async () => {
  const response = await statisticsApi.getEarningsLeaderboard();
  return response;
});

export const fetchAirlineRankings = createAsyncThunk('statistics/fetchAirlineRankings', async () => {
  const response = await statisticsApi.getAirlineRankings();
  return response;
});

export const fetchCareerSummary = createAsyncThunk('statistics/fetchCareerSummary', async (userId: string) => {
  const response = await statisticsApi.getCareerSummary(userId);
  return response;
});

export const fetchMonthlyStats = createAsyncThunk('statistics/fetchMonthlyStats', async (userId: string) => {
  const response = await statisticsApi.getMonthlyStats(userId);
  return response;
});

export const fetchMonthlyEarnings = createAsyncThunk('statistics/fetchMonthlyEarnings', async () => {
  const response = await statisticsApi.getMonthlyEarnings();
  return response;
});

export const fetchAirlineStats = createAsyncThunk('statistics/fetchAirlineStats', async (airlineId: string) => {
  const response = await statisticsApi.getAirlineStats(airlineId);
  return response;
});

export const updateNotificationPreferences = createAsyncThunk(
  'statistics/updateNotificationPreferences',
  async (data: { sendLicenseWarning: boolean; sendAirlineBillsWarning: boolean }) => {
    const response = await statisticsApi.updateNotificationPreferences(data);
    return response;
  }
);

export const updateWeightUnit = createAsyncThunk(
  'statistics/updateWeightUnit',
  async (weightUnit: string) => {
    const response = await statisticsApi.updateWeightUnit(weightUnit);
    return response;
  }
);

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUserStats: (state) => {
      state.userStats = null;
    },
    clearCareerSummary: (state) => {
      state.careerSummary = null;
    },
    clearMonthlyStats: (state) => {
      state.monthlyStats = null;
    },
    clearMonthlyEarnings: (state) => {
      state.monthlyEarnings = null;
    },
    clearAirlineStats: (state) => {
      state.airlineStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myStats = action.payload;
      })
      .addCase(fetchMyStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch statistics';
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload;
      })
      .addCase(fetchScoreLeaderboard.fulfilled, (state, action) => {
        state.scoreLeaderboard = action.payload;
      })
      .addCase(fetchFlightsLeaderboard.fulfilled, (state, action) => {
        state.flightsLeaderboard = action.payload;
      })
      .addCase(fetchEarningsLeaderboard.fulfilled, (state, action) => {
        state.earningsLeaderboard = action.payload;
      })
      .addCase(fetchAirlineRankings.fulfilled, (state, action) => {
        state.airlineRankings = action.payload;
      })
      .addCase(fetchCareerSummary.fulfilled, (state, action) => {
        state.careerSummary = action.payload;
      })
      .addCase(fetchMonthlyStats.fulfilled, (state, action) => {
        state.monthlyStats = action.payload;
      })
      .addCase(fetchMonthlyEarnings.fulfilled, (state, action) => {
        state.monthlyEarnings = action.payload;
      })
      .addCase(fetchAirlineStats.fulfilled, (state, action) => {
        state.airlineStats = action.payload;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        if (state.myStats) {
          state.myStats.sendLicenseWarning = action.payload.sendLicenseWarning;
          state.myStats.sendAirlineBillsWarning = action.payload.sendAirlineBillsWarning;
        }
      })
      .addCase(updateWeightUnit.fulfilled, (state, action) => {
        if (state.myStats) {
          state.myStats.weightUnit = action.payload.weightUnit;
        }
      });
  },
});

export const {
  clearError,
  clearUserStats,
  clearCareerSummary,
  clearMonthlyStats,
  clearMonthlyEarnings,
  clearAirlineStats
} = statisticsSlice.actions;
export default statisticsSlice.reducer;
