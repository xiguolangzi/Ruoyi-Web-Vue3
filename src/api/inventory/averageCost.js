import request from '@/utils/request'

// 查询加权平均成本列表
export function listAverageCost(query) {
  return request({
    url: '/inventory/averageCost/list',
    method: 'get',
    params: query
  })
}

// 查询加权平均成本详细
export function getAverageCost(id) {
  return request({
    url: '/inventory/averageCost/' + id,
    method: 'get'
  })
}

// 新增加权平均成本
export function addAverageCost(data) {
  return request({
    url: '/inventory/averageCost',
    method: 'post',
    data: data
  })
}

// 修改加权平均成本
export function updateAverageCost(data) {
  return request({
    url: '/inventory/averageCost',
    method: 'put',
    data: data
  })
}

// 删除加权平均成本
export function delAverageCost(id) {
  return request({
    url: '/inventory/averageCost/' + id,
    method: 'delete'
  })
}
