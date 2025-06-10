import request from '@/utils/request'

// 查询软件注册信息列表
export function listVerifacSoftwareInfo(query) {
  return request({
    url: '/verifuc/verifacSoftwareInfo/list',
    method: 'get',
    params: query
  })
}

// 查询软件注册信息详细
export function getVerifacSoftwareInfo(nif) {
  return request({
    url: '/verifuc/verifacSoftwareInfo/' + nif,
    method: 'get'
  })
}

// 新增软件注册信息
export function addVerifacSoftwareInfo(data) {
  return request({
    url: '/verifuc/verifacSoftwareInfo',
    method: 'post',
    data: data
  })
}

// 修改软件注册信息
export function updateVerifacSoftwareInfo(data) {
  return request({
    url: '/verifuc/verifacSoftwareInfo',
    method: 'put',
    data: data
  })
}

// 删除软件注册信息
export function delVerifacSoftwareInfo(nif) {
  return request({
    url: '/verifuc/verifacSoftwareInfo/' + nif,
    method: 'delete'
  })
}
