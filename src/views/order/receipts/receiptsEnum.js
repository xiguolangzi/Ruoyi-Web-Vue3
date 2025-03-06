import { InvoiceStatusEnum } from "../../finance/costInvoice/costInvoiceEnum.js"

export const CostInvoiceSelectStatusList = [InvoiceStatusEnum.INVOICE_STATUS_AUDITED]

// 订单状态枚举
export const OrderStatusEnum = {
  // 编辑
  EDIT: '1',
  // 已保存
  SAVE: '2',
  // 待入库
  WAIT_FOR_RECEIVED: '3',
  // 已入库
  RECEIVED: '4',
  // 待绑定发票
  WAIT_FOR_BIND_INVOICED: '5',
  // 解绑发票
  BIND_INVOICED: '6',
  // 已归档
  ARCHIVED: '7',
}

// 订单状态颜色
export const OrderStatusColor = {
  '1': 'info',
  '2': 'primary',
  '3': 'warning',
  '4': 'success',
  '5': 'warning',
  '6': 'success',
  '7': 'danger',
}

// 订单状态描述
export const OrderStatusName = {
  '1': '草稿',
  '2': '保存',
  '3': '待入库',
  '4': '已入库',
  '5': '待生成发票',
  '6': '已生成发票',
  '7': '已作废',
}

// 订单操作类型
export const OrderOperateType = {
  EDIT: 'edit',
  SAVE: 'save',
  SUBMIT: 'submit',
  REJECT: 'reject',
  RECEIVED: 'received',
  UN_RECEIVED: 'unReceived',
  BIND_INVOICED: 'bindInvoiced',
  UN_BIND_INVOICED: 'unBindInvoiced',
  DELETE: 'delete'
}
