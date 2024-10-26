import request from '@/utils/request'

// 查询单号序列配置列表
export function listOrderSequence(query) {
  return request({
    url: '/system/orderSequence/list',
    method: 'get',
    params: query
  })
}

// 查询单号序列配置详细
export function getOrderSequence(id) {
  return request({
    url: '/system/orderSequence/' + id,
    method: 'get'
  })
}

// 新增单号序列配置
export function addOrderSequence(data) {
  return request({
    url: '/system/orderSequence',
    method: 'post',
    data: data
  })
}

// 修改单号序列配置
export function updateOrderSequence(data) {
  return request({
    url: '/system/orderSequence',
    method: 'put',
    data: data
  })
}

// 删除单号序列配置
export function delOrderSequence(id) {
  return request({
    url: '/system/orderSequence/' + id,
    method: 'delete'
  })
}
