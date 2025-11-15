import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_APP_URL + 'report'
const API_URL1 = process.env.NEXT_PUBLIC_APP_URL + 'user'

export const getAll = (reqData: Object) => {
    return axios.get(API_URL + '/all', { params: reqData })
}

export const getByUserType = (reqData: Object) => {
    return axios.get(API_URL1 + '/byType', { params: reqData })
}