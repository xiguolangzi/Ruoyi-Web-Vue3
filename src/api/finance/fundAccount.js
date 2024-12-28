import request from '@/utils/request'

// 查询资金账户列表
export function listFundAccount(query) {
  return request({
    url: '/finance/fundAccount/list',
    method: 'get',
    params: query
  })
}

// 查询资金账户详细
export function getFundAccount(fundAccountId) {
  return request({
    url: '/finance/fundAccount/' + fundAccountId,
    method: 'get'
  })
}

// 新增资金账户
export function addFundAccount(data) {
  return request({
    url: '/finance/fundAccount',
    method: 'post',
    data: data
  })
}

// 修改资金账户
export function updateFundAccount(data) {
  return request({
    url: '/finance/fundAccount',
    method: 'put',
    data: data
  })
}

// 删除资金账户
export function delFundAccount(fundAccountId) {
  return request({
    url: '/finance/fundAccount/' + fundAccountId,
    method: 'delete'
  })
}
