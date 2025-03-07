import request from '@/utils/request';
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询物流公司列表
export function listLogisticsCompanies(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/order/logisticsCompanies/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询物流公司详细
export function getLogisticsCompanies(companyId) {
  return request({
    url: '/order/logisticsCompanies/' + companyId,
    method: 'get'
  })
}

// 新增物流公司
export function addLogisticsCompanies(data) {
  return request({
    url: '/order/logisticsCompanies',
    method: 'post',
    data: data
  })
}

// 修改物流公司
export function updateLogisticsCompanies(data) {
  return request({
    url: '/order/logisticsCompanies',
    method: 'put',
    data: data
  })
}

// 删除物流公司
export function delLogisticsCompanies(companyId) {
  return request({
    url: '/order/logisticsCompanies/' + companyId,
    method: 'delete'
  })
}
