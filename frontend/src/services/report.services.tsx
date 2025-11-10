import axios from 'axios'

const API_URL = "https://digital2fit.com/api/" + 'report';
const API_URL1 = "https://digital2fit.com/api/" + 'user';

export const getAll = (reqData: Object) => {
    return axios.get(API_URL + '/all', { params: reqData })
}

export const getByUserType = (reqData: Object) => {
    return axios.get(API_URL1 + '/byType', { params: reqData })
}