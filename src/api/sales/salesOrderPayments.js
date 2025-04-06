import request from '@/utils/request'

// 查询支付记录列表
export function listSalesOrderPayments(query) {
  return request({
    url: '/sales/salesOrderPayments/list',
    method: 'get',
    params: query
  })
}

// 查询支付记录详细
export function getSalesOrderPayments(pamentId) {
  return request({
    url: '/sales/salesOrderPayments/' + pamentId,
    method: 'get'
  })
}

// 新增支付记录
export function addSalesOrderPayments(data) {
  return request({
    url: '/sales/salesOrderPayments',
    method: 'post',
    data: data
  })
}

// 修改支付记录
export function updateSalesOrderPayments(data) {
  return request({
    url: '/sales/salesOrderPayments',
    method: 'put',
    data: data
  })
}

// 删除支付记录
export function delSalesOrderPayments(pamentId) {
  return request({
    url: '/sales/salesOrderPayments/' + pamentId,
    method: 'delete'
  })
}
