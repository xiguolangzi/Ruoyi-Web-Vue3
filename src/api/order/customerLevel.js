import request from '@/utils/request'

// 查询客户等级列表
export function listCustomerLevel(query) {
  return request({
    url: '/order/customerLevel/list',
    method: 'get',
    params: query
  })
}

// 查询客户等级详细
export function getCustomerLevel(levelId) {
  return request({
    url: '/order/customerLevel/' + levelId,
    method: 'get'
  })
}

// 新增客户等级
export function addCustomerLevel(data) {
  return request({
    url: '/order/customerLevel',
    method: 'post',
    data: data
  })
}

// 修改客户等级
export function updateCustomerLevel(data) {
  return request({
    url: '/order/customerLevel',
    method: 'put',
    data: data
  })
}

// 删除客户等级
export function delCustomerLevel(levelId) {
  return request({
    url: '/order/customerLevel/' + levelId,
    method: 'delete'
  })
}
