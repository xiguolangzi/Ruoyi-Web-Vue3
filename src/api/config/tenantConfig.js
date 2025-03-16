import request from '@/utils/request'

// 查询租户配置列表
export function listTenantConfig(query) {
  return request({
    url: '/config/tenantConfig/list',
    method: 'get',
    params: query
  })
}

/**
 * 根据配置编码获取租户配置
 */
export function getTenantConfigByConfigCode(query) {
  return request({
    url: '/config/tenantConfig/configCode',
    method: 'get',
    params: query
  })
}

// 查询租户配置详细
export function getTenantConfig(configId) {
  return request({
    url: '/config/tenantConfig/' + configId,
    method: 'get'
  })
}

// 新增租户配置
export function addTenantConfig(data) {
  return request({
    url: '/config/tenantConfig',
    method: 'post',
    data: data
  })
}

// 修改租户配置
export function updateTenantConfig(data) {
  return request({
    url: '/config/tenantConfig',
    method: 'put',
    data: data
  })
}

// 只修改配置值
export function updateConfigValue(data) {
  return request({
    url: '/config/tenantConfig/updateConfigValue',
    method: 'put',
    data: data
  })
}

// 删除租户配置
export function delTenantConfig(configId) {
  return request({
    url: '/config/tenantConfig/' + configId,
    method: 'delete'
  })
}
