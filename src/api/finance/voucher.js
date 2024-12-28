import request from '@/utils/request'

// 查询会计凭证列表
export function listVoucher(query) {
  return request({
    url: '/finance/voucher/list',
    method: 'get',
    params: query
  })
}

// 查询会计凭证详细
export function getVoucher(voucherId) {
  return request({
    url: '/finance/voucher/' + voucherId,
    method: 'get'
  })
}

// 新增会计凭证
export function addVoucher(data) {
  return request({
    url: '/finance/voucher',
    method: 'post',
    data: data
  })
}

// 修改会计凭证
export function updateVoucher(data) {
  return request({
    url: '/finance/voucher',
    method: 'put',
    data: data
  })
}

// 删除会计凭证
export function delVoucher(voucherId) {
  return request({
    url: '/finance/voucher/' + voucherId,
    method: 'delete'
  })
}

/** 继续编辑凭证 */
export function continueEditVoucher(data) {
  return request({
    url: '/finance/voucher/continueEdit',
    method: 'put',
    data: data
  })
}

/** 审核凭证 */
export function auditedVoucher(data) {
  return request({
    url: '/finance/voucher/audited',
    method: 'put',
    data: data
  })
}

/** 反审核凭证 */
export function unAuditedVoucher(data) {
  return request({
    url: '/finance/voucher/unAudited',
    method: 'put',
    data: data
  })
}

/** 过账凭证 */
export function postedVoucher(data) {
  return request({
    url: '/finance/voucher/posted',
    method: 'put',
    data: data
  })
}

/** 反过账凭证 */
export function unPostedVoucher(data) {
  return request({
    url: '/finance/voucher/unPosted',
    method: 'put',
    data: data
  })
}

/** 作废凭证 */
export function voidedVoucher(data) {
  return request({
    url: '/finance/voucher/voided',
    method: 'put',
    data: data
  })
}

