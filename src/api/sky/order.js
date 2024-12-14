import request from '@/utils/request'

// 查询购物车列表
export function listOrder(query) {
  return request({
    url: '/sky/order/list',
    method: 'get',
    params: query
  })
}

// 查询购物车详细
export function getOrder(orderId) {
  return request({
    url: '/sky/order/' + orderId,
    method: 'get'
  })
}

// 新增购物车
export function addOrder(data) {
  return request({
    url: '/sky/order',
    method: 'post',
    data: data
  })
}

// 修改购物车
export function updateOrder(data) {
  return request({
    url: '/sky/order',
    method: 'put',
    data: data
  })
}

// 删除购物车
export function delOrder(orderId) {
  return request({
    url: '/sky/order/' + orderId,
    method: 'delete'
  })
}
