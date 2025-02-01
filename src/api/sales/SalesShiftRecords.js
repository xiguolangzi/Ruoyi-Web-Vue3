import request from '@/utils/request'

// 查询交班记录列表
export function listSalesShiftRecords(query) {
  return request({
    url: '/sales/SalesShiftRecords/list',
    method: 'get',
    params: query
  })
}

// 查询交班记录详细
export function getSalesShiftRecords(shiftId) {
  return request({
    url: '/sales/SalesShiftRecords/' + shiftId,
    method: 'get'
  })
}

// 新增交班记录
export function addSalesShiftRecords(data) {
  return request({
    url: '/sales/SalesShiftRecords',
    method: 'post',
    data: data
  })
}

// 修改交班记录
export function updateSalesShiftRecords(data) {
  return request({
    url: '/sales/SalesShiftRecords',
    method: 'put',
    data: data
  })
}

// 删除交班记录
export function delSalesShiftRecords(shiftId) {
  return request({
    url: '/sales/SalesShiftRecords/' + shiftId,
    method: 'delete'
  })
}
