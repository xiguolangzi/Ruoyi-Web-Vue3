import request from '@/utils/request'

// 查询会计项目列表
export function listFinanceProject(query) {
  return request({
    url: '/finance/financeProject/list',
    method: 'get',
    params: query
  })
}

// 查询会计项目详细
export function getFinanceProject(projectId) {
  return request({
    url: '/finance/financeProject/' + projectId,
    method: 'get'
  })
}

// 新增会计项目
export function addFinanceProject(data) {
  return request({
    url: '/finance/financeProject',
    method: 'post',
    data: data
  })
}

// 修改会计项目
export function updateFinanceProject(data) {
  return request({
    url: '/finance/financeProject',
    method: 'put',
    data: data
  })
}

// 删除会计项目
export function delFinanceProject(projectId) {
  return request({
    url: '/finance/financeProject/' + projectId,
    method: 'delete'
  })
}
