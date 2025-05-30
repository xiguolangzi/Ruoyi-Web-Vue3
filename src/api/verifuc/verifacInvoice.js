import request from '@/utils/request'

// 查询verifac发票主列表
export function listVerifacInvoice(query) {
  return request({
    url: '/verifuc/verifacInvoice/list',
    method: 'get',
    params: query
  })
}

// 查询verifac发票主详细
export function getVerifacInvoice(invoiceId) {
  return request({
    url: '/verifuc/verifacInvoice/' + invoiceId,
    method: 'get'
  })
}

// 新增verifac发票主
export function addVerifacInvoice(data) {
  return request({
    url: '/verifuc/verifacInvoice',
    method: 'post',
    data: data
  })
}

// 修改verifac发票主
export function updateVerifacInvoice(data) {
  return request({
    url: '/verifuc/verifacInvoice',
    method: 'put',
    data: data
  })
}

// 删除verifac发票主
export function delVerifacInvoice(invoiceId) {
  return request({
    url: '/verifuc/verifacInvoice/' + invoiceId,
    method: 'delete'
  })
}

// 重新发送
export function resendApi(invoiceId) {
  return request({
    url: '/verifuc/verifacInvoice/resendApi/' + invoiceId,
    method: 'delete'
  })
}
