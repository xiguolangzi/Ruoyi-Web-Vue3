import request from '@/utils/request';
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询促销活动列表
export function listSalesPromotion(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/sales/salesPromotion/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询促销活动详细
export function getSalesPromotion(promotionId) {
  return request({
    url: '/sales/salesPromotion/' + promotionId,
    method: 'get'
  })
}

// 新增促销活动
export function addSalesPromotion(data) {
  return request({
    url: '/sales/salesPromotion',
    method: 'post',
    data: data
  })
}

// 修改促销活动
export function updateSalesPromotion(data) {
  return request({
    url: '/sales/salesPromotion',
    method: 'put',
    data: data
  })
}

// 删除促销活动
export function delSalesPromotion(promotionId) {
  return request({
    url: '/sales/salesPromotion/' + promotionId,
    method: 'delete'
  })
}
