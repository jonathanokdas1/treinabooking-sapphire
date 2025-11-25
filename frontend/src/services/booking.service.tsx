import axios from 'src/@core/utils/axios'

const API_URL = process.env.NEXT_PUBLIC_APP_URL + 'booking'

export const addBooking = (reqData: Object) => {
  return axios.post(API_URL + '', reqData)
}
export const updateTheBooking = (reqData: Object) => {
  return axios.put(API_URL + '', reqData)
}

export const getAllBookings = () => {
  return axios.get(API_URL + '/all')
}

export const getOneBooking = (reqData: Object) => {
  return axios.get(API_URL + '', { params: reqData })
}

export const checkToken = () => {
  return axios.get(API_URL + '/checkToken')
}

export const googleAuth = () => {
  return axios.get(API_URL + '/googleAuth')
}
