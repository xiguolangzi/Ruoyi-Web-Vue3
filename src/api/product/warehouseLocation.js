import request from '@/utils/request'

// 查询库位管理列表
export function listWarehouseLocation(query) {
  return request({
    url: '/product/warehouseLocation/list',
    method: 'get',
    params: query
  })
}

// 查询库位管理详细
export function getWarehouseLocation(locationId) {
  return request({
    url: '/product/warehouseLocation/' + locationId,
    method: 'get'
  })
}

// 新增库位管理
export function addWarehouseLocation(data) {
  return request({
    url: '/product/warehouseLocation',
    method: 'post',
    data: data
  })
}

// 修改库位管理
export function updateWarehouseLocation(data) {
  return request({
    url: '/product/warehouseLocation',
    method: 'put',
    data: data
  })
}

// 删除库位管理
export function delWarehouseLocation(locationId) {
  return request({
    url: '/product/warehouseLocation/' + locationId,
    method: 'delete'
  })
}
