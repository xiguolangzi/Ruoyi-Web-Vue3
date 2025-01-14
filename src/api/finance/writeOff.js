import request from '@/utils/request'

// 查询应付核销列表
export function listWriteOff(query) {
  return request({
    url: '/finance/writeOff/list',
    method: 'get',
    params: query
  })
}

// 查询应付核销详细
export function getWriteOff(writeOffId) {
  return request({
    url: '/finance/writeOff/' + writeOffId,
    method: 'get'
  })
}

// 新增应付核销
export function addWriteOff(data) {
  return request({
    url: '/finance/writeOff',
    method: 'post',
    data: data
  })
}

// 修改应付核销
export function updateWriteOff(data) {
  return request({
    url: '/finance/writeOff',
    method: 'put',
    data: data
  })
}

// 删除应付核销
export function delWriteOff(writeOffId) {
  return request({
    url: '/finance/writeOff/' + writeOffId,
    method: 'delete'
  })
}
