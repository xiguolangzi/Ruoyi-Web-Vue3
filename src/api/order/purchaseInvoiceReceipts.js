import request from '@/utils/request';
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询采购发票关联采购入库单列表
export function listPurchaseInvoiceReceipts(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/order/purchaseInvoiceReceipts/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询采购发票关联采购入库单详细
export function getPurchaseInvoiceReceipts(invoiceId) {
  return request({
    url: '/order/purchaseInvoiceReceipts/' + invoiceId,
    method: 'get'
  })
}

// 新增采购发票关联采购入库单
export function addPurchaseInvoiceReceipts(data) {
  return request({
    url: '/order/purchaseInvoiceReceipts',
    method: 'post',
    data: data
  })
}

// 修改采购发票关联采购入库单
export function updatePurchaseInvoiceReceipts(data) {
  return request({
    url: '/order/purchaseInvoiceReceipts',
    method: 'put',
    data: data
  })
}

// 删除采购发票关联采购入库单
export function delPurchaseInvoiceReceipts(invoiceId) {
  return request({
    url: '/order/purchaseInvoiceReceipts/' + invoiceId,
    method: 'delete'
  })
}
