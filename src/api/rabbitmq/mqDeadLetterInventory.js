import request from '@/utils/request'

// 查询库存死信队列登记列表
export function listMqDeadLetterInventory(query) {
  return request({
    url: '/rabbitmq/mqDeadLetterInventory/list',
    method: 'get',
    params: query
  })
}

// 查询库存死信队列登记详细
export function getMqDeadLetterInventory(id) {
  return request({
    url: '/rabbitmq/mqDeadLetterInventory/' + id,
    method: 'get'
  })
}

// 新增库存死信队列登记
export function addMqDeadLetterInventory(data) {
  return request({
    url: '/rabbitmq/mqDeadLetterInventory',
    method: 'post',
    data: data
  })
}

// 修改库存死信队列登记
export function updateMqDeadLetterInventory(data) {
  return request({
    url: '/rabbitmq/mqDeadLetterInventory',
    method: 'put',
    data: data
  })
}

// 删除库存死信队列登记
export function delMqDeadLetterInventory(id) {
  return request({
    url: '/rabbitmq/mqDeadLetterInventory/' + id,
    method: 'delete'
  })
}

// 重新发送
export function reSendMq(id) {
  return request({
    url: '/rabbitmq/mqDeadLetterInventory/reSend/' + id,
    method: 'delete'
  })
}
