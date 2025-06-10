import request from '@/utils/request'

// 查询租户信息列表
export function listTenant(query) {
  return request({
    url: '/system/tenant/list',
    method: 'get',
    params: query
  })
}

// 查询所有租户信息
export function selectAll(query) {
  return request({
    url: '/system/tenant/selectAll',
    method: 'get',
    params: query
  })
}

// 查询租户信息详细
export function getTenant(tenantId) {
  return request({
    url: '/system/tenant/' + tenantId,
    method: 'get'
  })
}

// 新增租户信息
export function addTenant(data) {
  return request({
    url: '/system/tenant',
    method: 'post',
    data: data
  })
}

// 修改租户信息
export function updateTenant(data) {
  return request({
    url: '/system/tenant',
    method: 'put',
    data: data
  })
}

// 删除租户信息
export function delTenant(tenantId) {
  return request({
    url: '/system/tenant/' + tenantId,
    method: 'delete'
  })
}

// 新增租户顶级部门信息
export function addTenantDept(data) {
  return request({
    url: '/system/tenant/dept',
    method: 'post',
    data: data
  })
}

// 新增租户绑定的管理员
export function addTenantAdmin(data) {
  return request({
    url: '/system/tenant/admin',
    method: 'post',
    data: data
  })
}

// verifac 签发Emisor
export function vrifacRegisterEmisor(data) {
  return request({
    url: '/verifuc/emisor/registerEmisor',
    method: 'post',
    data: data
  })
}


// verifac 查询Emisor
export function vrifacSelectEmisorList(data) {
  return request({
    url: '/verifuc/emisor/selectEmisorList',
    method: 'post',
    data: data
  })
}


// verifac 删除Emisor
export function vrifacDeleteEmisor(data) {
  return request({
    url: '/verifuc/emisor/delEmisor',
    method: 'post',
    data: data
  })
}
