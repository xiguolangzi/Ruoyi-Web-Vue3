import request from '@/utils/request';
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询交班记录列表
export function listSalesShiftRecords(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/sales/SalesShiftRecords/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询交班记录详细
export function getSalesShiftRecords(shiftId) {
  return request({
    url: '/sales/SalesShiftRecords/' + shiftId,
    method: 'get'
  })
}

// 查询当前收银台交班状态是存在否进行中
export function getShiftRecordsIsActive(cajaId) {
  const query = { cajaId }
  return request({
    url: '/sales/SalesShiftRecords/active',
    method: 'get',
    params: query
  })

}

// 获取最后一次已完成的交班记录
export function getLastShiftRecords(cajaId) {
  const query = { cajaId }
  return request({
    url: '/sales/SalesShiftRecords/lastTime',
    method: 'get',
    params: query
  })
}

// 开始值班
export function addSalesShiftRecords(data) {
  return request({
    url: '/sales/SalesShiftRecords',
    method: 'post',
    data: data
  })
}

// 继续值班
export function continueSalesShiftRecords(data) {
  return request({
    url: '/sales/SalesShiftRecords/continue',
    method: 'put',
    data: data
  })
}


// 完成交班
export function finishSalesShiftRecords(data) {
  return request({
    url: '/sales/SalesShiftRecords/finish',
    method: 'put',
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
