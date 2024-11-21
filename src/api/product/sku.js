import request from '@/utils/request'

/** 订单查询商品 SKU */
export function listSkuByAddOrder() {
  return request({
    url: '/product/sku/listSkuByAddOrder',
    method: 'get',
  })
}

// 修改SKU状态
export function changeSkuStatus(skuId, skuStatus, tenantId) {
  const data = {
    skuId,
    skuStatus,
    tenantId
  }
  return request({
    url: '/product/sku/changeStatus',
    method: 'put',
    data: data
  })
}

// 根据skuID查询库存数量
export function selectStockBySkuId(skuId) {
  return request({
    url: '/product/sku/selectStockBySkuId/' + skuId,
    method: 'get'
  })
}



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
