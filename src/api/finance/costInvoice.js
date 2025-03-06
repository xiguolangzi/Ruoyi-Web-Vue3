import request from '@/utils/request'

// 查询费用登记列表
export function listCostInvoice(query = {}) {
  const pageSize = query.pageSize || 2000;
  return request({
    url: '/finance/costInvoice/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询费用登记详细
export function getCostInvoice(invoiceId) {
  return request({
    url: '/finance/costInvoice/' + invoiceId,
    method: 'get'
  })
}

// 新增费用登记
export function addCostInvoice(data) {
  return request({
    url: '/finance/costInvoice',
    method: 'post',
    data: data
  })
}

// 修改费用登记
export function updateCostInvoice(data) {
  return request({
    url: '/finance/costInvoice',
    method: 'put',
    data: data
  })
}

// 删除费用登记
export function delCostInvoice(invoiceId) {
  return request({
    url: '/finance/costInvoice/' + invoiceId,
    method: 'delete'
  })
}

/** 提交审核 */
export function submitAuditInvoice(data) {
  return request({
    url: '/finance/costInvoice/submitAudit',
    method: 'put',
    data: data
  })
}

/** 驳回提交审核 */
export function rejectInvoice(data) {
  return request({
    url: '/finance/costInvoice/reject',
    method: 'put',
    data: data
  })
}

/** 继续编辑日记账 */
export function continueEditInvoice(data) {
  return request({
    url: '/finance/costInvoice/continueEdit',
    method: 'put',
    data: data
  })
}

/** 审核日记账 */
export function auditedInvoice(data) {
  return request({
    url: '/finance/costInvoice/audited',
    method: 'put',
    data: data
  })
}

/** 反审核日记账 */
export function unAuditedInvoice(data) {
  return request({
    url: '/finance/costInvoice/unAudited',
    method: 'put',
    data: data
  })
}
