import request from '@/utils/request'

// 查询入库明细列表
export function listStockInDetail(query) {
  return request({
    url: '/inventory/stockInDetail/list',
    method: 'get',
    params: query
  })
}

// 查询入库明细详细
export function getStockInDetail(id) {
  return request({
    url: '/inventory/stockInDetail/' + id,
    method: 'get'
  })
}

// 新增入库明细
export function addStockInDetail(data) {
  return request({
    url: '/inventory/stockInDetail',
    method: 'post',
    data: data
  })
}

// 修改入库明细
export function updateStockInDetail(data) {
  return request({
    url: '/inventory/stockInDetail',
    method: 'put',
    data: data
  })
}

// 删除入库明细
export function delStockInDetail(id) {
  return request({
    url: '/inventory/stockInDetail/' + id,
    method: 'delete'
  })
}
