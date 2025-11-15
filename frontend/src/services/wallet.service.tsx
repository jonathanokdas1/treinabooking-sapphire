import axios from 'src/@core/utils/axios'

const API_URL = process.env.NEXT_PUBLIC_APP_URL + 'wallet'

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
