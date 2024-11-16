import request from '@/utils/request'

// 查询采购入库明细列表
export function listReceiptsDetails(query) {
  return request({
    url: '/order/receiptsDetails/list',
    method: 'get',
    params: query
  })
}

// 查询采购入库明细详细
export function getReceiptsDetails(id) {
  return request({
    url: '/order/receiptsDetails/' + id,
    method: 'get'
  })
}

// 新增采购入库明细
export function addReceiptsDetails(data) {
  return request({
    url: '/order/receiptsDetails',
    method: 'post',
    data: data
  })
}

// 修改采购入库明细
export function updateReceiptsDetails(data) {
  return request({
    url: '/order/receiptsDetails',
    method: 'put',
    data: data
  })
}

// 删除采购入库明细
export function delReceiptsDetails(id) {
  return request({
    url: '/order/receiptsDetails/' + id,
    method: 'delete'
  })
}
