/** 凭证类型 */
export const VoucherTypeEnum = {
  // 记账凭证
  VOUCHER_TYPE_ACCOUNTING: 1,
  // 收款凭证
  VOUCHER_TYPE_RECEIVABLE: 2,
  // 付款凭证
  VOUCHER_TYPE_PAYABLE: 3,
  // 转账
  VOUCHER_TYPE_TRANSFER: 4,
  // 存现
  VOUCHER_TYPE_CASH: 5,
  // 采购凭证
  VOUCHER_TYPE_PURCHASE: 6,
  // 日记账凭证
  VOUCHER_TYPE_FUND_FLOW: 7,
  // 销售凭证
  VOUCHER_TYPE_SALES: 8,
  // 费用凭证
  VOUCHER_TYPE_COST: 9,
  // 交班凭证
  VOUCHER_TYPE_SHIFT: 10,
}

/** 凭证状态 */
export const VoucherStatusEnum = {
  // 草稿
  VOUCHER_STATUS_DRAFT: 1,
  // 待审核
  VOUCHER_STATUS_WAIT_AUDITED: 2,
  // 已审核
  VOUCHER_STATUS_AUDITED: 3,
  // 已过账
  VOUCHER_STATUS_POSTED: 4,
  // 已作废
  VOUCHER_STATUS_VOIDED: 5,
}

// 订单操作类型
export const VoucherOperateType = {
  // 保存
  SAVE: 'save',
  // 继续编辑
  CONTINUE_EDIT: 'continueEdit',
  // 审核
  AUDITED: 'audited',
  // 反审核
  UN_AUDITED: 'unAudited',
  // 过账
  POSTED: 'posted',
  // 反过账
  UN_POSTED: 'unPosted',
  // 作废
  VOIDED: 'voided'
}

/** 辅助项类型 */
export const AssistTypeEnum = {
  // 客户
  ASSIST_TYPE_CUSTOMER: 1,
  // 供应商
  ASSIST_TYPE_SUPPLIER: 2,
  // 员工
  ASSIST_TYPE_EMPLOYEE: 3
}