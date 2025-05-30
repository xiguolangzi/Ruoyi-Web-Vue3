import request from '@/utils/request';
import { MaxLengthEnum } from '@/api/constants/commonConstants';

// 查询销售订单列表
export function listSalesOrder(query = {}) {
  const pageSize = query.pageSize || MaxLengthEnum.maxQuerySize;
  return request({
    url: '/sales/salesOrder/list',
    method: 'get',
    params: { pageSize, ...query }
  })
}

// 查询销售订单详细
export function getSalesOrder(orderId) {
  return request({
    url: '/sales/salesOrder/' + orderId,
    method: 'get'
  })
}

// 查询销售订单详细
export function getSalesOrderByOrderInitNo(orderInitNo) {
  return request({
    url: '/sales/salesOrder/orderInitNo/' + orderInitNo,
    method: 'get'
  })
}

// 新增销售订单
export function addSalesOrder(data) {
  return request({
    url: '/sales/salesOrder',
    method: 'post',
    data: data
  })
}

// 修改销售订单
export function updateSalesOrder(data) {
  return request({
    url: '/sales/salesOrder',
    method: 'put',
    data: data
  })
}

// 删除销售订单
export function delSalesOrder(orderId) {
  return request({
    url: '/sales/salesOrder/' + orderId,
    method: 'delete'
  })
}

// 完成支付接口
export function completePayment(data) {
  return request({
    url: '/sales/salesOrder/completePayment',
    method: 'post',
    data: data
  })
}

// 退货接口(有票退货、无票退货)
export function refundGoods(data) {
  return request({
    url: '/sales/salesOrder/refundGoods',
    method: 'post',
    data: data
  })
}

// 订单的其他操作(初始化、拣货、复核、打包)
export function updateByOtherOperate(data) {
  return request({
    url: '/sales/salesOrder/updateByOtherOperate',
    method: 'post',
    data: data
  })
}

// 订单生成发票 F1 F2 F3 Q1 Q2 Q3 Q4
export function generateInvoice(data) {
  return request({
    url: '/sales/salesOrder/generateInvoice',
    method: 'post',
    data: data
  })
}
