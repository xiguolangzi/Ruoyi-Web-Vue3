import request from '@/utils/request'

// 查询租户信息列表
export function listTenant(query) {
  return request({
    url: '/sky/tenant/list',
    method: 'get',
    params: query
  })
}

// 查询租户信息详细
export function getTenant(tenantId) {
  return request({
    url: '/sky/tenant/' + tenantId,
    method: 'get'
  })
}

// 新增租户信息
export function addTenant(data) {
  return request({
    url: '/sky/tenant',
    method: 'post',
    data: data
  })
}

// 修改租户信息
export function updateTenant(data) {
  return request({
    url: '/sky/tenant',
    method: 'put',
    data: data
  })
}

// 删除租户信息
export function delTenant(tenantId) {
  return request({
    url: '/sky/tenant/' + tenantId,
    method: 'delete'
  })
}
