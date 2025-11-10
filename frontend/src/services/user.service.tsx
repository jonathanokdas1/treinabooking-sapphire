import axios from 'axios'

const API_URL = "https://digital2fit.com/api/" + 'user'

export const addUsers = (reqData: Object) => {
  return axios.post(API_URL + '/', reqData)
}

export const updateUser = (reqData: Object) => {
  return axios.put(API_URL + '/', reqData)
}

export const getAllUser = () => {
  return axios.get(API_URL + '/all')
}

export const getOne = (reqData: Object) => {
  return axios.get(API_URL + '/', { params: reqData })
}

export const deleteUsers = (reqData: Object) => {
  return axios.delete(API_URL + '/', { params: reqData })
}

export const getByUserType = (reqData: Object) => {
  return axios.get(API_URL + '/byType', { params: reqData })
}
