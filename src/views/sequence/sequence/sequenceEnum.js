// 序列类型 对应字典 order_sequence_type
export const SequenceType = {
  // 采购订单
  PURCHASE_ORDER: '1',
  // 销售订单
  SALES_ORDER: '2',
  // 销售发票
  SALE_INVOICE: '3',
  // 采购入库单
  SALE_RECEIPT: '4',
  // 会计凭证号
  COST_INVOICE: '5',
  // 现金银行日记账编号
  COST_RECEIPT: '6',
  // 费用发票编号
  CONST_INVOICE: '7',
  CONST_RECEIPT: '8',
}

// 序列规则类型 对应字典 order_sequence_rules
export const RulesType = {
  // 年
  YEAR: '1',
  // 年月
  YEAR_MONTH: '2',
  // 随机
  RANDOM: '3'
}

// 时间格式 对应字典 order_sequence_date_type
export const DateType = {
  YEAR: 'yyyy',
  YEAR_MONTH: 'yyyyMM',
  YEAR_MONTH_DAY: 'yyyyMMdd',
  YEAR_MONTH_DAY_HOUR: 'yyyyMMddHH',
  YEAR_MONTH_DAY_HOUR_MINUTE: 'yyyyMMddHHmm',
  YEAR_MONTH_DAY_HOUR_MINUTE_SECOND: 'yyyyMMddHHmmss'
}

// 状态
export const Status = {
  // 启用
  ENABLE: '0',
  // 禁用
  DISABLE: '1'
}

// 默认配置
export const DefaultConfig = {
  // 默认类型
  DEFAULT_TYPE: SequenceType.PURCHASE_ORDER,
  // 默认规则类型
  DEFAULT_RULES: RulesType.YEAR,
  // 默认时间格式
  DEFAULT_DATE_TYPE: DateType.YEAR,
  // 默认起始值序号
  DEFAULT_NUMBER: "000001",
  // 默认状态
  DEFAULT_STATUS: Status.ENABLE
}