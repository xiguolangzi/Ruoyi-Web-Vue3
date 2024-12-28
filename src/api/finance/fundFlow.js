import request from '@/utils/request'

// 查询现金银行日记账列表
export function listFundFlow(query) {
  return request({
    url: '/finance/fundFlow/list',
    method: 'get',
    params: query
  })
}

// 查询现金银行日记账详细
export function getFundFlow(flowId) {
  return request({
    url: '/finance/fundFlow/' + flowId,
    method: 'get'
  })
}

// 新增现金银行日记账
export function addFundFlow(data) {
  return request({
    url: '/finance/fundFlow',
    method: 'post',
    data: data
  })
}

// 修改现金银行日记账
export function updateFundFlow(data) {
  return request({
    url: '/finance/fundFlow',
    method: 'put',
    data: data
  })
}

// 删除现金银行日记账
export function delFundFlow(flowId) {
  return request({
    url: '/finance/fundFlow/' + flowId,
    method: 'delete'
  })
}

/** 继续编辑日记账 */
export function continueEditFundFlow(data) {
  return request({
    url: '/finance/fundFlow/continueEdit',
    method: 'put',
    data: data
  })
}

/** 审核日记账 */
export function auditedFundFlow(data) {
  return request({
    url: '/finance/fundFlow/audited',
    method: 'put',
    data: data
  })
}

/** 反审核日记账 */
export function unAuditedFundFlow(data) {
  return request({
    url: '/finance/fundFlow/unAudited',
    method: 'put',
    data: data
  })
}