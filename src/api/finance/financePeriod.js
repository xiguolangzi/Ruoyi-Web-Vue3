import request from '@/utils/request'

// 查询会计期间列表
export function listFinancePeriod(query) {
  return request({
    url: '/finance/financePeriod/list',
    method: 'get',
    params: query
  })
}

// 查询会计期间详细
export function getFinancePeriod(periodId) {
  return request({
    url: '/finance/financePeriod/' + periodId,
    method: 'get'
  })
}

// 新增会计期间
export function addFinancePeriod(data) {
  return request({
    url: '/finance/financePeriod',
    method: 'post',
    data: data
  })
}

// 修改会计期间
export function updateFinancePeriod(data) {
  return request({
    url: '/finance/financePeriod',
    method: 'put',
    data: data
  })
}

// 删除会计期间
export function delFinancePeriod(periodId) {
  return request({
    url: '/finance/financePeriod/' + periodId,
    method: 'delete'
  })
}
