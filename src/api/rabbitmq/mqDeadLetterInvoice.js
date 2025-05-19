import request from '@/utils/request'

// 查询发票队列列表
export function listMqDeadLetterInvoice(query) {
  return request({
    url: '/rabbitmq/mqDeadLetterInvoice/list',
    method: 'get',
    params: query
  })
}

// 查询发票队列详细
export function getMqDeadLetterInvoice(id) {
  return request({
    url: '/rabbitmq/mqDeadLetterInvoice/' + id,
    method: 'get'
  })
}

// 新增发票队列
export function addMqDeadLetterInvoice(data) {
  return request({
    url: '/rabbitmq/mqDeadLetterInvoice',
    method: 'post',
    data: data
  })
}

// 修改发票队列
export function updateMqDeadLetterInvoice(data) {
  return request({
    url: '/rabbitmq/mqDeadLetterInvoice',
    method: 'put',
    data: data
  })
}

// 删除发票队列
export function delMqDeadLetterInvoice(id) {
  return request({
    url: '/rabbitmq/mqDeadLetterInvoice/' + id,
    method: 'delete'
  })
}

// 重新发送
export function resendMq(id) {
  return request({
    url: '/rabbitmq/mqDeadLetterInvoice/resendMq/' + id,
    method: 'delete'
  })
}
