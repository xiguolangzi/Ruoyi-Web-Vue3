import request from '@/utils/request'

// 查询采购入库单列表
export function listReceipts(query) {
  return request({
    url: '/order/receipts/list',
    method: 'get',
    params: query
  })
}

// 查询采购入库单详细
export function getReceipts(receiptsId) {
  return request({
    url: '/order/receipts/' + receiptsId,
    method: 'get'
  })
}

// 新增采购入库单
export function addReceipts(data) {
  return request({
    url: '/order/receipts',
    method: 'post',
    data: data
  })
}

// 修改采购入库单
export function updateReceipts(data) {
  return request({
    url: '/order/receipts',
    method: 'put',
    data: data
  })
}

// 删除采购入库单
export function delReceipts(receiptsId) {
  return request({
    url: '/order/receipts/' + receiptsId,
    method: 'delete'
  })
}
