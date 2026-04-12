import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials).then(res => res.data),
  
  register: (userData: { email: string; password: string; userName?: string }) =>
    api.post('/auth/register', userData).then(res => res.data),
  
  refresh: () =>
    api.post('/auth/refresh').then(res => res.data),
  
  getProfile: () =>
    api.get('/auth/profile').then(res => res.data),
  
  logout: () =>
    api.post('/auth/logout').then(res => res.data),
};

export const jobsApi = {
  getJobs: () =>
    api.get('/jobs').then(res => res.data),
  
  getJob: (id: number) =>
    api.get(`/jobs/${id}`).then(res => res.data),
  
  createJob: (jobData: any) =>
    api.post('/jobs', jobData).then(res => res.data),
  
  updateJob: (id: number, jobData: any) =>
    api.patch(`/jobs/${id}`, jobData).then(res => res.data),
  
  deleteJob: (id: number) =>
    api.delete(`/jobs/${id}`).then(res => res.data),
  
  searchJobs: (params: any) =>
    api.get('/jobs/search', { params }).then(res => res.data),
  
  generateJobs: (params: any) =>
    api.post('/jobs/generate', params).then(res => res.data),
  
  activateJob: (id: number) =>
    api.post(`/jobs/${id}/activate`).then(res => res.data),
  
  completeJob: (id: number, data: any) =>
    api.post(`/jobs/${id}/complete`, data).then(res => res.data),
  
  getPendingJobs: () =>
    api.get('/jobs/pending').then(res => res.data),
  
  getActiveJob: () =>
    api.get('/jobs/active').then(res => res.data),
};

export const airlinesApi = {
  getAirlines: () =>
    api.get('/airlines').then(res => res.data),
  
  getAirline: (id: number) =>
    api.get(`/airlines/${id}`).then(res => res.data),
  
  createAirline: (airlineData: any) =>
    api.post('/airlines', airlineData).then(res => res.data),
  
  updateAirline: (id: number, airlineData: any) =>
    api.patch(`/airlines/${id}`, airlineData).then(res => res.data),
  
  deleteAirline: (id: number) =>
    api.delete(`/airlines/${id}`).then(res => res.data),
  
  joinAirline: (id: number) =>
    api.post(`/airlines/${id}/join`).then(res => res.data),
  
  leaveAirline: (id: number) =>
    api.post(`/airlines/${id}/leave`).then(res => res.data),
  
  getPilots: (id: number) =>
    api.get(`/airlines/${id}/pilots`).then(res => res.data),
  
  hirePilot: (id: number, userId: string) =>
    api.post(`/airlines/${id}/hire-pilot`, { userId }).then(res => res.data),
  
  firePilot: (id: number, userId: string) =>
    api.post(`/airlines/${id}/fire-pilot`, { userId }).then(res => res.data),
  
  getStatistics: (id: number) =>
    api.get(`/airlines/${id}/statistics`).then(res => res.data),
  
  getMyAirline: () =>
    api.get('/airlines/my-airline').then(res => res.data),
};

export const statisticsApi = {
  getMyStats: () =>
    api.get('/statistics/my-stats').then(res => res.data),
  
  getUserStats: (userId: string) =>
    api.get(`/statistics/${userId}`).then(res => res.data),
  
  getScoreLeaderboard: () =>
    api.get('/statistics/leaderboard/score').then(res => res.data),
  
  getFlightsLeaderboard: () =>
    api.get('/statistics/leaderboard/flights').then(res => res.data),
  
  getEarningsLeaderboard: () =>
    api.get('/statistics/leaderboard/earnings').then(res => res.data),
  
  getAirlineRankings: () =>
    api.get('/statistics/airline-rankings').then(res => res.data),
  
  getCareerSummary: (userId: string) =>
    api.get(`/statistics/career-summary/${userId}`).then(res => res.data),
  
  getMonthlyStats: (userId: string) =>
    api.get(`/statistics/monthly-stats/${userId}`).then(res => res.data),
  
  getAirlineStats: (airlineId: string) =>
    api.get(`/statistics/airline-stats/${airlineId}`).then(res => res.data),
};

export const searchApi = {
  getMapInfo: (departure: string, arrival: string, alternative?: string) =>
    api.get('/search/map-info', { params: { departure, arrival, alternative } }).then((res) => res.data),

  getArrivalTips: (departure: string) =>
    api.get('/search/arrival-tips', { params: { departure } }).then((res) => res.data),

  getAlternativeTips: (arrival: string, range: number) =>
    api.get('/search/alternative-tips', { params: { arrival, range } }).then((res) => res.data),

  getRandomAirports: (departure?: string, destination?: string) =>
    api.get('/search/random', { params: { departure, destination } }).then((res) => res.data),

  getSimbriefData: (username: string) =>
    api.get('/search/simbrief', { params: { username } }).then((res) => res.data),

  generateConfirmJobs: (params: {
    departure: string;
    arrival: string;
    alternative?: string;
    aviationType: string;
    capacityId?: number;
    passengers?: number;
    paxWeight?: number;
    cargoWeight?: number;
  }) => api.post('/search/generate', params).then((res) => res.data),

  confirmJobs: (jobsIds: number[]) =>
    api.post('/search/confirm', { jobsIds }).then((res) => res.data),

  cloneJob: (jobId: number) =>
    api.post('/search/clone-job', { jobId }).then((res) => res.data),

  calcDistance: (departure: string, arrival: string) =>
    api.get('/search/distance', { params: { departure, arrival } }).then((res) => res.data),
};

export const capacityApi = {
  getCapacities: () =>
    api.get('/users/capacities').then((res) => res.data),

  saveCapacity: (data: {
    name: string;
    passengers: number;
    paxWeight: number;
    cargoWeight: number;
    imagePath?: string;
  }) => api.post('/users/capacities', data).then((res) => res.data),

  updateCapacity: (
    id: number,
    data: { name: string; passengers: number; paxWeight: number; cargoWeight: number; imagePath?: string }
  ) => api.put(`/users/capacities/${id}`, data).then((res) => res.data),

  removeCapacity: (id: number) =>
    api.delete(`/users/capacities/${id}`).then((res) => res.data),

  getCapacityById: (id: number) =>
    api.get(`/users/capacities/${id}`).then((res) => res.data),
};

export default api;
