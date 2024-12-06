import request from '@/utils/request'

// 查询 科目余额表列表
export function listAccountBalance(query) {
  return request({
    url: '/finance/accountBalance/list',
    method: 'get',
    params: query
  })
}

// 查询 科目余额表详细
export function getAccountBalance(balanceId) {
  return request({
    url: '/finance/accountBalance/' + balanceId,
    method: 'get'
  })
}

// 新增 科目余额表
export function addAccountBalance(data) {
  return request({
    url: '/finance/accountBalance',
    method: 'post',
    data: data
  })
}

// 修改 科目余额表
export function updateAccountBalance(data) {
  return request({
    url: '/finance/accountBalance',
    method: 'put',
    data: data
  })
}

// 删除 科目余额表
export function delAccountBalance(balanceId) {
  return request({
    url: '/finance/accountBalance/' + balanceId,
    method: 'delete'
  })
}
