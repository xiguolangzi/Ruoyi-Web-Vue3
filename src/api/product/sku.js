import request from '@/utils/request'

// 查询sku列表
export function listSku(query) {
  return request({
    url: '/product/sku/list',
    method: 'get',
    params: query
  })
}

// 查询sku详细
export function getSku(skuId) {
  return request({
    url: '/product/sku/' + skuId,
    method: 'get'
  })
}

// 新增sku
export function addSku(data) {
  return request({
    url: '/product/sku',
    method: 'post',
    data: data
  })
}

// 修改sku
export function updateSku(data) {
  return request({
    url: '/product/sku',
    method: 'put',
    data: data
  })
}

// 删除sku
export function delSku(skuId) {
  return request({
    url: '/product/sku/' + skuId,
    method: 'delete'
  })
}
