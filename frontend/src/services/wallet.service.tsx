import axios from 'axios'

const API_URL = "https://digital2fit.com/api/" + 'wallet';

export const getAllWallet = () => {
  return axios.get(API_URL + '/all')
}

export const updateWallet = (reqData: Object) => {
  return axios.put(API_URL + '/', reqData)
}

export const getPurchased = (reqData: Object) => {
  return axios.get(API_URL + '/purchased', { params: reqData })
}

export const checkWallet = (reqData: Object) => {
  return axios.get(API_URL + '/check', { params: reqData })
}
