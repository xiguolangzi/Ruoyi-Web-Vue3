import request from '@/utils/request'


/** 入库 */
export function received(data) {
  return request({
    url: '/order/receipts/received',
    method: 'post',
    data: data
  })
}

/** 反入库 */
export function unReceived(data) {
  return request({
    url: '/order/receipts/unReceived',
    method: 'post',
    data: data
  })
}

/** 生成发票 */
export function invoiced(data) {
  return request({
    url: '/order/receipts/invoiced',
    method: 'post',
    data: data
  })
}

/** 反生成发票 */
export function unInvoiced(data) {
  return request({
    url: '/order/receipts/unInvoiced',
    method: 'post',
    data: data
  })
}

/** 修改采购入库单状态 */
export function updateReceiptsStatus(data) {
  return request({
    url: '/order/receipts/updateStatus',
    method: 'put',
    data: data
  })
}


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
