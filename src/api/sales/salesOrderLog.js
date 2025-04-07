import request from '@/utils/request'

// 查询订单操作日志列表
export function listSalesOrderLog(query) {
  return request({
    url: '/sales/salesOrderLog/list',
    method: 'get',
    params: query
  })
}

// 查询订单操作日志详细
export function getSalesOrderLog(logId) {
  return request({
    url: '/sales/salesOrderLog/' + logId,
    method: 'get'
  })
}

// 新增订单操作日志
export function addSalesOrderLog(data) {
  return request({
    url: '/sales/salesOrderLog',
    method: 'post',
    data: data
  })
}

// 修改订单操作日志
export function updateSalesOrderLog(data) {
  return request({
    url: '/sales/salesOrderLog',
    method: 'put',
    data: data
  })
}

// 删除订单操作日志
export function delSalesOrderLog(logId) {
  return request({
    url: '/sales/salesOrderLog/' + logId,
    method: 'delete'
  })
}
