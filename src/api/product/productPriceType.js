import request from '@/utils/request'

// 查询价格类型列表
export function listProductPriceType(query) {
  return request({
    url: '/product/productPriceType/list',
    method: 'get',
    params: query
  })
}

// 查询价格类型详细
export function getProductPriceType(priceTypeId) {
  return request({
    url: '/product/productPriceType/' + priceTypeId,
    method: 'get'
  })
}

// 新增价格类型
export function addProductPriceType(data) {
  return request({
    url: '/product/productPriceType',
    method: 'post',
    data: data
  })
}

// 修改价格类型
export function updateProductPriceType(data) {
  return request({
    url: '/product/productPriceType',
    method: 'put',
    data: data
  })
}

// 删除价格类型
export function delProductPriceType(priceTypeId) {
  return request({
    url: '/product/productPriceType/' + priceTypeId,
    method: 'delete'
  })
}
