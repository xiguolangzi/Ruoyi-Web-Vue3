import request from '@/utils/request'

// 查询货柜列表
export function listContainers(query) {
  return request({
    url: '/transportation/containers/list',
    method: 'get',
    params: query
  })
}

// 查询货柜详细
export function getContainers(containerId) {
  return request({
    url: '/transportation/containers/' + containerId,
    method: 'get'
  })
}

// 新增货柜
export function addContainers(data) {
  return request({
    url: '/transportation/containers',
    method: 'post',
    data: data
  })
}

// 修改货柜
export function updateContainers(data) {
  return request({
    url: '/transportation/containers',
    method: 'put',
    data: data
  })
}

// 删除货柜
export function delContainers(containerId) {
  return request({
    url: '/transportation/containers/' + containerId,
    method: 'delete'
  })
}
