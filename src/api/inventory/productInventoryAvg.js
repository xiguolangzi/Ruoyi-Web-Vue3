import request from '@/utils/request'

// 查询库存查询列表
export function listProductInventoryAvg(query) {
  return request({
    url: '/inventory/productInventoryAvg/list',
    method: 'get',
    params: query
  })
}

// 查询库存查询详细
export function getProductInventoryAvg(mainId) {
  return request({
    url: '/inventory/productInventoryAvg/' + mainId,
    method: 'get'
  })
}

// 新增库存查询
export function addProductInventoryAvg(data) {
  return request({
    url: '/inventory/productInventoryAvg',
    method: 'post',
    data: data
  })
}

// 修改库存查询
export function updateProductInventoryAvg(data) {
  return request({
    url: '/inventory/productInventoryAvg',
    method: 'put',
    data: data
  })
}

// 删除库存查询
export function delProductInventoryAvg(mainId) {
  return request({
    url: '/inventory/productInventoryAvg/' + mainId,
    method: 'delete'
  })
}
