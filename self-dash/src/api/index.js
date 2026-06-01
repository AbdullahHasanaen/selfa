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
export const getGroups = (status) =>
  client.get('/api/admin/groups', status ? { params: { status } } : undefined)
export const createGroup = (data) => client.post('/api/admin/groups', data)
export const freezeGroup = (id) => client.patch(`/api/admin/groups/${id}/freeze`)
export const unfreezeGroup = (id) => client.patch(`/api/admin/groups/${id}/unfreeze`)
export const cancelGroup = (id) => client.patch(`/api/admin/groups/${id}/cancel`)
export const runLottery = (id) => client.post(`/api/admin/groups/${id}/run-lottery`)
export const getLotteryVerification = (id) =>
  client.get(`/api/admin/groups/${id}/lottery-verification`)
export const getPaymentsMatrix = (id) => client.get(`/api/admin/groups/${id}/payments`)

// Users (Identity)
export const getUsers = () => client.get('/api/admin/users')
export const createUser = (data) => client.post('/api/admin/users', data)
export const updateUser = (id, data) => client.patch(`/api/admin/users/${id}`, data)
export const deleteUser = (id) => client.delete(`/api/admin/users/${id}`)

// Salfa Users (Business Profiles)
export const getSalfaUsers = () => client.get('/api/admin/salfa-users')
export const createSalfaUser = (data) => client.post('/api/admin/salfa-users', data)

// Defaults
export const getDefaults = (status) =>
  client.get('/api/admin/defaults', status ? { params: { status } } : undefined)
export const resolveDefault = (id, data) =>
  client.patch(`/api/admin/defaults/${id}/resolve`, data)
export const escalateDefault = (id) => client.patch(`/api/admin/defaults/${id}/escalate`)
export const addDefaultAction = (id, data) =>
  client.post(`/api/admin/defaults/${id}/actions`, data)

// Emergency Fund
export const getEmergencyFundBalance = () => client.get('/api/admin/emergency-fund/balance')
export const getEmergencyFundTransactions = (type) =>
  client.get('/api/admin/emergency-fund/transactions', type ? { params: { type } } : undefined)
export const createEmergencyFundTransaction = (data) =>
  client.post('/api/admin/emergency-fund/transactions', data)

// Finance
export const getRevenueLog = (month) =>
  client.get('/api/admin/finance/revenue', month ? { params: { month } } : undefined)
export const getFinanceSummary = () => client.get('/api/admin/finance/summary')
