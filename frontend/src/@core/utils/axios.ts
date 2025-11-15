import axios from 'axios'
import authConfig from 'src/configs/auth'

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000/'
})

instance.interceptors.request.use(config => {
  const token = window.localStorage.getItem(authConfig.storageTokenKeyName)
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

export default instance