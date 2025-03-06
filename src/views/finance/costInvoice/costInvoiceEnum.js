/** 发票类型 */
export const InvoiceTypeEnum = {
  // 采购发票
  INVOICE_TYPE_PURCHASE: '1',
  // 费用发票
  INVOICE_TYPE_COST: '2',
}

/** 发票状态 */
export const InvoiceStatusEnum = {
  // 草稿
  INVOICE_STATUS_DRAFT: '1',
  // 已保存
  INVOICE_STATUS_SAVED: '2',
  // 待审核
  INVOICE_STATUS_WAIT_AUDITED: '3',
  // 已审核
  INVOICE_STATUS_AUDITED: '4',
  // 已过账
  INVOICE_STATUS_POSTED: '5',
  // 已删除
  INVOICE_STATUS_DELETED: '6'
}

/** 辅助项类型 */
export const AssistTypeEnum = {
  // 客户
  ASSIST_TYPE_CUSTOMER: '1',
  // 供应商
  ASSIST_TYPE_SUPPLIER: '2',
  // 员工
  ASSIST_TYPE_EMPLOYEE: '3'
}

// 订单操作类型
export const OperateType = {
  // 保存
  SAVE: 'save',
  // 继续编辑
  CONTINUE_EDIT: 'continueEdit',
  // 提交审核
  SUBMIT_AUDITED: 'submitAudited',
  // 驳回
  REJECT: 'reject',
  // 审核
  AUDITED: 'audited',
  // 反审核
  UN_AUDITED: 'unAudited',
}

/** 固定会计科目编码 */
export const AccountCodeEnum = {
  // 应付账款
  ACCOUNTS_PAYABLE: '2202',


}