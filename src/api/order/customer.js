import request from '@/utils/request'

// 查询客户列表
export function listCustomer(query = {}) {
  const pageSize = query.pageSize || 10000;
  return request({
    url: '/order/customer/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询客户详细
export function getCustomer(customerId) {
  return request({
    url: '/order/customer/' + customerId,
    method: 'get'
  })
}

// 新增客户
export function addCustomer(data) {
  return request({
    url: '/order/customer',
    method: 'post',
    data: data
  })
}

// 修改客户
export function updateCustomer(data) {
  return request({
    url: '/order/customer',
    method: 'put',
    data: data
  })
}

// 删除客户
export function delCustomer(customerId) {
  return request({
    url: '/order/customer/' + customerId,
    method: 'delete'
  })
}
