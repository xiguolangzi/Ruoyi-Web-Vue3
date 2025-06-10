import request from '@/utils/request'

// 查询verifac税务制度规则列表
export function listVerifacRule(query) {
  return request({
    url: '/verifuc/verifacRule/list',
    method: 'get',
    params: query
  })
}

// 查询verifac税务制度规则详细
export function getVerifacRule(ruleId) {
  return request({
    url: '/verifuc/verifacRule/' + ruleId,
    method: 'get'
  })
}

// 新增verifac税务制度规则
export function addVerifacRule(data) {
  return request({
    url: '/verifuc/verifacRule',
    method: 'post',
    data: data
  })
}

// 修改verifac税务制度规则
export function updateVerifacRule(data) {
  return request({
    url: '/verifuc/verifacRule',
    method: 'put',
    data: data
  })
}

// 删除verifac税务制度规则
export function delVerifacRule(ruleId) {
  return request({
    url: '/verifuc/verifacRule/' + ruleId,
    method: 'delete'
  })
}
