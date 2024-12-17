import request from '@/utils/request'

// 查询采购发票列表
export function listPurchaseInvoice(query) {
  return request({
    url: '/order/purchaseInvoice/list',
    method: 'get',
    params: query
  })
}

// 查询采购发票详细
export function getPurchaseInvoice(invoiceId) {
  return request({
    url: '/order/purchaseInvoice/' + invoiceId,
    method: 'get'
  })
}

// 新增采购发票
export function addPurchaseInvoice(data) {
  return request({
    url: '/order/purchaseInvoice',
    method: 'post',
    data: data
  })
}

// 修改采购发票
export function updatePurchaseInvoice(data) {
  return request({
    url: '/order/purchaseInvoice',
    method: 'put',
    data: data
  })
}

// 删除采购发票
export function delPurchaseInvoice(invoiceId) {
  return request({
    url: '/order/purchaseInvoice/' + invoiceId,
    method: 'delete'
  })
}

/** 审核 */
export function auditPurchaseInvoice(invoiceId) {
  return request({
    url: '/order/purchaseInvoice/audit/' + invoiceId,
    method: 'get'
  })
}

/** 反审核 */
export function unAuditPurchaseInvoice(invoiceId) {
  return request({
    url: '/order/purchaseInvoice/unAudit/' + invoiceId,
    method: 'get'
  })
}

/** 继续编辑 */
export function continueEditPurchaseInvoice(invoiceId) {
  return request({
    url: '/order/purchaseInvoice/continueEdit/' + invoiceId,
    method: 'get'
  })
}