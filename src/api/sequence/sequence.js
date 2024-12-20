import request from '@/utils/request'

// 查询序列配置管理列表
export function listSequence(query) {
  return request({
    url: '/sequence/sequence/list',
    method: 'get',
    params: query
  })
}

// 查询序列配置管理详细
export function getSequence(sequenceId) {
  return request({
    url: '/sequence/sequence/' + sequenceId,
    method: 'get'
  })
}

// 新增序列配置管理
export function addSequence(data) {
  return request({
    url: '/sequence/sequence',
    method: 'post',
    data: data
  })
}

// 修改序列配置管理
export function updateSequence(data) {
  return request({
    url: '/sequence/sequence',
    method: 'put',
    data: data
  })
}

// 删除序列配置管理
export function delSequence(sequenceId) {
  return request({
    url: '/sequence/sequence/' + sequenceId,
    method: 'delete'
  })
}
