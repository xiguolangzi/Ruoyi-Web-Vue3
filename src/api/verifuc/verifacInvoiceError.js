import request from '@/utils/request'

// 查询失败记录列表
export function listVerifacInvoiceError(query) {
  return request({
    url: '/verifuc/verifacInvoiceError/list',
    method: 'get',
    params: query
  })
}

// 查询失败记录详细
export function getVerifacInvoiceError(invoiceId) {
  return request({
    url: '/verifuc/verifacInvoiceError/' + invoiceId,
    method: 'get'
  })
}

// 新增失败记录
export function addVerifacInvoiceError(data) {
  return request({
    url: '/verifuc/verifacInvoiceError',
    method: 'post',
    data: data
  })
}

// 修改失败记录
export function updateVerifacInvoiceError(data) {
  return request({
    url: '/verifuc/verifacInvoiceError',
    method: 'put',
    data: data
  })
}

// 删除失败记录
export function delVerifacInvoiceError(invoiceId) {
  return request({
    url: '/verifuc/verifacInvoiceError/' + invoiceId,
    method: 'delete'
  })
}

// 重新发送
export function resendApi(id) {
  return request({
    url: '/verifuc/verifacInvoiceError/resendApi/' + id,
    method: 'delete'
  })
}
