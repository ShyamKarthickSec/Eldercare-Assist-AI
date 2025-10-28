import { api } from '../lib/api'

export const listBudgets = async (period) => {
    const { data } = await api.get('/api/budgets', { params: { period } })
    return data // [{id,name,limitAmount,currency,period,...}]
}
export const createBudget = async ({ name, limitAmount, currency, period }) => {
    const { data } = await api.post('/api/budgets', { name, limitAmount, currency, period })
    return data
}
export const updateBudget = async (id, body) => {
    const { data } = await api.patch(`/api/budgets/${id}`, body) // ex) { limitAmount: 70000 }
    return data
}
export const deleteBudget = async (id) => api.delete(`/api/budgets/${id}`)
export const getUsage = async (id) => {
    const { data } = await api.get(`/api/budgets/${id}/usage`)
    return data // { spent, limitAmount, remaining, percentUsed, exceeded, ...}
}