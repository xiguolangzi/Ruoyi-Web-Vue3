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
