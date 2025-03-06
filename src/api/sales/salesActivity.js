import request from '@/utils/request'
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询销售活动 列表
export function listSalesActivity(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/sales/salesActivity/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询销售活动 详细
export function getSalesActivity(activityId) {
  return request({
    url: '/sales/salesActivity/' + activityId,
    method: 'get'
  })
}

// 新增销售活动 
export function addSalesActivity(data) {
  return request({
    url: '/sales/salesActivity',
    method: 'post',
    data: data
  })
}

// 修改销售活动 
export function updateSalesActivity(data) {
  return request({
    url: '/sales/salesActivity',
    method: 'put',
    data: data
  })
}

// 删除销售活动 
export function delSalesActivity(activityId) {
  return request({
    url: '/sales/salesActivity/' + activityId,
    method: 'delete'
  })
}
