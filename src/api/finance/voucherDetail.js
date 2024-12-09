import request from '@/utils/request'

// 查询凭证明细表列表
export function listVoucherDetail(query) {
  return request({
    url: '/finance/voucherDetail/list',
    method: 'get',
    params: query
  })
}

// 查询凭证明细表详细
export function getVoucherDetail(detailId) {
  return request({
    url: '/finance/voucherDetail/' + detailId,
    method: 'get'
  })
}

// 新增凭证明细表
export function addVoucherDetail(data) {
  return request({
    url: '/finance/voucherDetail',
    method: 'post',
    data: data
  })
}

// 修改凭证明细表
export function updateVoucherDetail(data) {
  return request({
    url: '/finance/voucherDetail',
    method: 'put',
    data: data
  })
}

// 删除凭证明细表
export function delVoucherDetail(detailId) {
  return request({
    url: '/finance/voucherDetail/' + detailId,
    method: 'delete'
  })
}
