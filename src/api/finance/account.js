import request from '@/utils/request'

// 查询财务 - 科目列表
export function listAccount(query) {
  return request({
    url: '/finance/account/list',
    method: 'get',
    params: query
  })
}

// 查询财务 - 科目详细
export function getAccount(accountId) {
  return request({
    url: '/finance/account/' + accountId,
    method: 'get'
  })
}

// 新增财务 - 科目
export function addAccount(data) {
  return request({
    url: '/finance/account',
    method: 'post',
    data: data
  })
}

// 修改财务 - 科目
export function updateAccount(data) {
  return request({
    url: '/finance/account',
    method: 'put',
    data: data
  })
}

// 删除财务 - 科目
export function delAccount(accountId) {
  return request({
    url: '/finance/account/' + accountId,
    method: 'delete'
  })
}
