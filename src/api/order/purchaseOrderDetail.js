import request from '@/utils/request'

// 查询采购订单明细列表
export function listPurchaseOrderDetail(query) {
  return request({
    url: '/order/purchaseOrderDetail/list',
    method: 'get',
    params: query
  })
}

// 查询采购订单明细详细
export function getPurchaseOrderDetail(detailId) {
  return request({
    url: '/order/purchaseOrderDetail/' + detailId,
    method: 'get'
  })
}

// 新增采购订单明细
export function addPurchaseOrderDetail(data) {
  return request({
    url: '/order/purchaseOrderDetail',
    method: 'post',
    data: data
  })
}

// 修改采购订单明细
export function updatePurchaseOrderDetail(data) {
  return request({
    url: '/order/purchaseOrderDetail',
    method: 'put',
    data: data
  })
}

// 删除采购订单明细
export function delPurchaseOrderDetail(detailId) {
  return request({
    url: '/order/purchaseOrderDetail/' + detailId,
    method: 'delete'
  })
}
