import request from '@/utils/request';
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询业务员佣金管理列表
export function listSalesCommission(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/sales/salesCommission/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询业务员佣金管理详细
export function getSalesCommission(commissionId) {
  return request({
    url: '/sales/salesCommission/' + commissionId,
    method: 'get'
  })
}

// 新增业务员佣金管理
export function addSalesCommission(data) {
  return request({
    url: '/sales/salesCommission',
    method: 'post',
    data: data
  })
}

// 修改业务员佣金管理
export function updateSalesCommission(data) {
  return request({
    url: '/sales/salesCommission',
    method: 'put',
    data: data
  })
}

// 删除业务员佣金管理
export function delSalesCommission(commissionId) {
  return request({
    url: '/sales/salesCommission/' + commissionId,
    method: 'delete'
  })
}

// 修改状态
export function changeStatus(data) {
  return request({
    url: '/sales/salesCommission/changeStatus',
    method: 'put',
    data: data
  })
}
