import axios from 'axios'

const API_URL = "https://digital2fit.com/api/" + 'pricing'

export const getAllPricing = () => {
  return axios.get(API_URL + '/all')
}

export const getPricingList = () => {
  return axios.get(API_URL + '/list')
}
