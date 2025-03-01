import request from '@/utils/request'

// 查询销售订单列表
export function listSalesOrder(query) {
  return request({
    url: '/sales/salesOrder/list',
    method: 'get',
    params: query
  })
}

// 查询销售订单详细
export function getSalesOrder(orderId) {
  return request({
    url: '/sales/salesOrder/' + orderId,
    method: 'get'
  })
}

// 新增销售订单
export function addSalesOrder(data) {
  return request({
    url: '/sales/salesOrder',
    method: 'post',
    data: data
  })
}

// 修改销售订单
export function updateSalesOrder(data) {
  return request({
    url: '/sales/salesOrder',
    method: 'put',
    data: data
  })
}

// 删除销售订单
export function delSalesOrder(orderId) {
  return request({
    url: '/sales/salesOrder/' + orderId,
    method: 'delete'
  })
}
