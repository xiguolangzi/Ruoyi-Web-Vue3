import request from '@/utils/request'

// 查询产品税率管理列表
export function listProductRate(query) {
  return request({
    url: '/product/productRate/list',
    method: 'get',
    params: query
  })
}

// 查询产品税率管理详细
export function getProductRate(rateId) {
  return request({
    url: '/product/productRate/' + rateId,
    method: 'get'
  })
}

// 新增产品税率管理
export function addProductRate(data) {
  return request({
    url: '/product/productRate',
    method: 'post',
    data: data
  })
}

// 修改产品税率管理
export function updateProductRate(data) {
  return request({
    url: '/product/productRate',
    method: 'put',
    data: data
  })
}

// 删除产品税率管理
export function delProductRate(rateId) {
  return request({
    url: '/product/productRate/' + rateId,
    method: 'delete'
  })
}
