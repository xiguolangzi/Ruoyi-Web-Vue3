import request from '@/utils/request'

// 查询商品库存列表
export function listProductInventory(query) {
  return request({
    url: '/inventory/productInventory/list',
    method: 'get',
    params: query
  })
}

// 查询商品库存详细
export function getProductInventory(id) {
  return request({
    url: '/inventory/productInventory/' + id,
    method: 'get'
  })
}

// 新增商品库存
export function addProductInventory(data) {
  return request({
    url: '/inventory/productInventory',
    method: 'post',
    data: data
  })
}

// 修改商品库存
export function updateProductInventory(data) {
  return request({
    url: '/inventory/productInventory',
    method: 'put',
    data: data
  })
}

// 删除商品库存
export function delProductInventory(id) {
  return request({
    url: '/inventory/productInventory/' + id,
    method: 'delete'
  })
}
