import request from '@/utils/request'

// 查询客户绑定业务员列表
export function listCustomerSalesman(query) {
  return request({
    url: '/order/customerSalesman/list',
    method: 'get',
    params: query
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
