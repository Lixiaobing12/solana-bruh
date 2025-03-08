
import { request } from '@/utils/request'
import { useWallet } from '../store/wallet'
/** 登录 */
export const login = (data) => {
    return request.post('/web/appUser/login', data)
}

/** 获取用户信息 */
export const get_user_info = () => {
    // const { wallet } = useWallet()
    // if (!wallet.isConnect) return Promise.reject();
    // return request.post('/web/appUser/userInfo')
}

/** 通过code获取用户信息 */
export const get_user_info_by_code = (data) => {
    // return request.post('/web/appUser/userInfoByCode', data)
}

/** 获取预售配置 */
export const get_default_presale_config = () => {
    // return request.post('/web/presaleConfig/findDefaultPresaleConfigs')
}

/**
 * 创建预售订单
 * @param {Object} data 预售订单数据
 * @description data:{
 *  "amount": number,
    "txId": string
    }
 *  */
export const create_presale_order = (data) => {
    // const { wallet } = useWallet()
    // if (!wallet.isConnect) return Promise.reject();
    // return request.post('/web/presaleOrder/createPresaleOrders', data)
}
/** 
 * 获取预售订单列表
 */
export const get_presale_list = (data) => {
    // const { wallet } = useWallet()
    // if (!wallet.isConnect) return Promise.reject();
    // return request.post('/web/presaleOrder/getPresaleOrdersList', data)
}

/** 查询用户预售数量 */
export const get_user_presale_count = (data) => {
    // const { wallet } = useWallet()
    // if (!wallet.isConnect) return Promise.reject();
    // return request.post('/web/presaleOrder/sumPresaleOrders', data)
}

/** 查询下级 */
export const get_subordinate = (data) => {
    // const { wallet } = useWallet()
    // if (!wallet.isConnect) return Promise.reject();
    // return request.post('/web/appUser/getAppUsersList', data)
}

/** 获取团队列表 */
export const get_team_list = (data) => {
    // const { wallet } = useWallet()
    // if (!wallet.isConnect) return Promise.reject();
    // return request.post('/web/appUser/getAllSubordinates', data)
}