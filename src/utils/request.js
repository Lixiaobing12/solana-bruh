import axios from 'axios'

export const request = axios.create({
  timeout: 60000
})

request.interceptors.request.use((config) => {
  if (!/login/.test(config.url)) {
    const token = localStorage.getItem('token')
    config.headers['x-token'] = token
  }
  return config
})

request.interceptors.response.use((res) => {
  if (res.data.code === 0) {
    return res.data
  } else {
    return Promise.reject(res.data.msg)
  }
})
