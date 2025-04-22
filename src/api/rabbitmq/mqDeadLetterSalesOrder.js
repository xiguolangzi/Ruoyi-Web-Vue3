import request from '@/utils/request'

// 查询库存死信队列列表
export function listMqDeadLetterSalesOrder(query) {
  return request({
    url: '/rabbitmq/mqDeadLetterSalesOrder/list',
    method: 'get',
    params: query
  })
}

// 查询库存死信队列详细
export function getMqDeadLetterSalesOrder(id) {
  return request({
    url: '/rabbitmq/mqDeadLetterSalesOrder/' + id,
    method: 'get'
  })
}

// 新增库存死信队列
export function addMqDeadLetterSalesOrder(data) {
  return request({
    url: '/rabbitmq/mqDeadLetterSalesOrder',
    method: 'post',
    data: data
  })
}

// 修改库存死信队列
export function updateMqDeadLetterSalesOrder(data) {
  return request({
    url: '/rabbitmq/mqDeadLetterSalesOrder',
    method: 'put',
    data: data
  })
}

// 删除库存死信队列
export function delMqDeadLetterSalesOrder(id) {
  return request({
    url: '/rabbitmq/mqDeadLetterSalesOrder/' + id,
    method: 'delete'
  })
}
