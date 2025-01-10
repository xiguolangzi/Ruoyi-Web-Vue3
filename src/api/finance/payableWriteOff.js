import request from '@/utils/request'

// 查询应付核销列表
export function listPayableWriteOff(query) {
  return request({
    url: '/finance/payableWriteOff/list',
    method: 'get',
    params: query
  })
}

// 查询应付核销详细
export function getPayableWriteOff(writeOffId) {
  return request({
    url: '/finance/payableWriteOff/' + writeOffId,
    method: 'get'
  })
}

// 新增应付核销
export function addPayableWriteOff(data) {
  return request({
    url: '/finance/payableWriteOff',
    method: 'post',
    data: data
  })
}

// 修改应付核销
export function updatePayableWriteOff(data) {
  return request({
    url: '/finance/payableWriteOff',
    method: 'put',
    data: data
  })
}

// 删除应付核销
export function delPayableWriteOff(writeOffId) {
  return request({
    url: '/finance/payableWriteOff/' + writeOffId,
    method: 'delete'
  })
}
