import request from '@/utils/request';
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询caja注册列表
export function listSalesCaja(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/sales/salesCaja/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询caja注册详细
export function getSalesCaja(cajaId) {
  return request({
    url: '/sales/salesCaja/' + cajaId,
    method: 'get'
  })
}

// 通过caja地址查询caja注册详细
export function getSalesCajaByMacAddress(macAddress) {
  const query = { macAddress };
  return request({
    url: '/sales/salesCaja/check',
    method: 'get',
    params: query
  })
}

// 新增caja注册
export function addSalesCaja(data) {
  return request({
    url: '/sales/salesCaja',
    method: 'post',
    data: data
  })
}

// 修改caja注册
export function updateSalesCaja(data) {
  return request({
    url: '/sales/salesCaja',
    method: 'put',
    data: data
  })
}

// 删除caja注册
export function delSalesCaja(cajaId) {
  return request({
    url: '/sales/salesCaja/' + cajaId,
    method: 'delete'
  })
}

// 修改状态
export function changeStatus(data) {
  return request({
    url: '/sales/salesCaja/changeStatus',
    method: 'put',
    data: data
  })
}
