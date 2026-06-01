import client from './client'

// Auth
export const login = (username, password) =>
  client.post('/api/auth/admin/login', { username, password })

// Group Templates
export const getGroupTemplates = () => client.get('/api/admin/group-templates')
export const createGroupTemplate = (data) => client.post('/api/admin/group-templates', data)
export const toggleGroupTemplate = (id) =>
  client.patch(`/api/admin/group-templates/${id}/toggle`)

// Groups
export const getGroups = () => client.get('/api/admin/groups')
export const createGroup = (data) => client.post('/api/admin/groups', data)
export const freezeGroup = (id) => client.post(`/api/admin/groups/${id}/freeze`)
export const unfreezeGroup = (id) => client.post(`/api/admin/groups/${id}/unfreeze`)
export const cancelGroup = (id) => client.post(`/api/admin/groups/${id}/cancel`)
export const runLottery = (id) => client.post(`/api/admin/groups/${id}/run-lottery`)
export const getLotteryVerification = (id) => client.get(`/api/admin/groups/${id}/lottery`)
export const getPaymentsMatrix = (id) => client.get(`/api/admin/groups/${id}/payments`)

// Users
export const getUsers = () => client.get('/api/admin/users')
export const createUser = (data) => client.post('/api/admin/users', data)
export const updateUser = (id, data) => client.put(`/api/admin/users/${id}`, data)
export const deleteUser = (id) => client.delete(`/api/admin/users/${id}`)

// Salfa Profiles
export const getSalfaProfiles = () => client.get('/api/admin/salfa-profiles')
export const updateSalfaProfile = (id, data) =>
  client.patch(`/api/admin/salfa-profiles/${id}`, data)

// Defaults
export const getDefaults = () => client.get('/api/admin/defaults')
export const resolveDefault = (id, resolution) =>
  client.post(`/api/admin/defaults/${id}/resolve`, { resolution })
export const escalateDefault = (id) => client.post(`/api/admin/defaults/${id}/escalate`)
export const addDefaultAction = (id, data) =>
  client.post(`/api/admin/defaults/${id}/actions`, data)

// Emergency Fund
export const getEmergencyFund = () => client.get('/api/admin/emergency-fund')
export const getEmergencyFundTransactions = () =>
  client.get('/api/admin/emergency-fund/transactions')
export const depositEmergencyFund = (amount, note) =>
  client.post('/api/admin/emergency-fund/deposit', { amount, note })
export const withdrawEmergencyFund = (amount, note) =>
  client.post('/api/admin/emergency-fund/withdrawal', { amount, note })

// Finance
export const getRevenueLog = () => client.get('/api/admin/finance/revenue')
export const getFinanceSummary = () => client.get('/api/admin/finance/summary')
