import axios from 'axios'
import authConfig from 'src/configs/auth'

const instance = axios.create({
  // MUDANÇA AQUI: Link direto da API para corrigir o erro de build
  baseURL: 'https://api.digital2fit.com/'
})

instance.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(authConfig.storageTokenKeyName)
    if (token) {
      config.headers.Authorization = token
    }
  }
  return config
})

export default instance
