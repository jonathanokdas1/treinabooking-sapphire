import axios from 'src/@core/utils/axios'

const API_URL = process.env.NEXT_PUBLIC_APP_URL + 'attendance/'

export const addAttendance = (reqData: Object) => {
  return axios.post(API_URL + '', reqData)
}

export const updatrAttendance = (reqData: Object) => {
  return axios.put(API_URL + '/', reqData)
}

export const getAllAttendance = () => {
  return axios.get(API_URL + 'all')
}

export const getOneAttendance = (reqData: Object) => {
  return axios.get(API_URL + '/', { params: reqData })
}

export const deleteAttendance = (reqData: Object) => {
  return axios.delete(API_URL + '/', { params: reqData })
}
