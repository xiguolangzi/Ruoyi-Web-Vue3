import request from '@/utils/request';
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询客户绑定业务员列表
export function listCustomerSalesman(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/order/customerSalesman/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询客户绑定业务员详细
export function getCustomerSalesman(bindId) {
  return request({
    url: '/order/customerSalesman/' + bindId,
    method: 'get'
  })
}

// 新增客户绑定业务员
export function addCustomerSalesman(data) {
  return request({
    url: '/order/customerSalesman',
    method: 'post',
    data: data
  })
}

// 修改客户绑定业务员
export function updateCustomerSalesman(data) {
  return request({
    url: '/order/customerSalesman',
    method: 'put',
    data: data
  })
}

// 删除客户绑定业务员
export function delCustomerSalesman(bindId) {
  return request({
    url: '/order/customerSalesman/' + bindId,
    method: 'delete'
  })
}
