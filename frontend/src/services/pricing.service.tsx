import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_APP_URL + 'pricing'

export const getAllPricing = () => {
  return axios.get(API_URL + '/all')
}

export const getPricingList = () => {
  return axios.get(API_URL + '/list')
}
