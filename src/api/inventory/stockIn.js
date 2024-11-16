import request from '@/utils/request'

// 查询入库单列表
export function listStockIn(query) {
  return request({
    url: '/inventory/stockIn/list',
    method: 'get',
    params: query
  })
}

// 查询入库单详细
export function getStockIn(inId) {
  return request({
    url: '/inventory/stockIn/' + inId,
    method: 'get'
  })
}

// 新增入库单
export function addStockIn(data) {
  return request({
    url: '/inventory/stockIn',
    method: 'post',
    data: data
  })
}

// 修改入库单
export function updateStockIn(data) {
  return request({
    url: '/inventory/stockIn',
    method: 'put',
    data: data
  })
}

// 删除入库单
export function delStockIn(inId) {
  return request({
    url: '/inventory/stockIn/' + inId,
    method: 'delete'
  })
}
