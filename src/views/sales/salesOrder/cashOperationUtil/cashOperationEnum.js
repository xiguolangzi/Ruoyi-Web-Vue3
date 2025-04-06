
/** 
 * 订单详情数据 : salesOrderDetailList
 */
export const initOrderDetailData = () => ({
  detailId: null,
  detailMainSkuId: null,
  skuId: null,
  skuCode: null,
  skuName: null,
  assistName: null,
  skuType: null,
  skuValue: null,
  batchNo: null,
  detailSn: null,
  detailPrice: 0,
  detailQuantity: 1,
  detailAmount: 0,
  detailDiscountRate: 0,
  detailDiscountAmount: 0,
  detailSalesAmount: 0,
  detailBaseAmount: 0,
  detailTaxRate: 0,
  detailTaxAmount: 0,
  detailNetAmount: 0,
  promotionId: null,
  promotionName: null,
  remark: null,
  detailIsRefunded: DetailIsRefundedEnum.NORMAL,
  locationId: null,
  locationWeight: null,
  inTax: 0,
  skuPrice: 0,
  skuPrice2: 0,
  skuPrice3: 0,
  skuPrice4: 0,
  skuPrice5: 0,
  skuPrice6: 0,
})

/** 
 * 正常/禁用状态枚举 :
 * 0-正常, 1-禁用
 */
export const CajaStatusEnum = {
  // 正常
  ENABLE: 0,
  // 禁用
  DISABLE: 1
}

/** 
 * 交班状态枚举:
 * 1-未交班, 2-已交班
 */
export const ShiftStatusEnum = {
  // 未交班
  ACTIVE: 1,
  // 已交班
  DONE: 2
}

/**
 * 销售订单方向
 * 1-销售 2-退货
 */
export const OrderDirectionEnum = {
  // 销售
  SALES: 1,
  // 退货
  RETURN: 2
}

/**
 * 销售订单来源
 * 1-收银台 2-业务员 3-网购
 */
export const orderSourceEnum = {
  CAJA: 1,
  SALESMAN: 2,
  WEB: 3
}

/**
 * 销售订单是否含税：
 * 0-含税 1-不含税
 */
export const OrderInTaxEnum = {
  // 含税
  TAX: 0,
  // 不含税
  NO_TAX: 1
}

/**
 * 销售订单类型：
 * 1-预购订单 2-确认订单 3-已拆订单 4-生成发票
 * (确认支付后 订单类型为确认订单)
 */
export const OrderTypeEnum = {
  // 预购订单
  PRE_ORDER: 1,
  // 确认订单
  CONFIRM_ORDER: 2,
  // 已拆订单
  SPLIT_ORDER: 3,
  // 生成发票
  GENERATE_INVOICE: 4
}

/**
 * 销售订单状态：
 * 1-初始状态 2-拣货状态 3-复核状态 4-确认状态 5-取消状态
 * (库存扣减后，支付之前为确认状态)
 */
export const OrderStatusEnum = {
  // 初始状态
  INIT: 1,
  // 拣货状态
  PICK: 2,
  // 复核状态
  CHECK: 3,
  // 确认状态
  CONFIRM: 4,
  // 取消状态
  CANCEL: 5
}

/**
 * 销售订单是否挂单
 * 0-正常订单 1-挂单订单
 */
export const OrderIsHoldEnum = {
  // 正常订单
  NORMAL: 0,
  // 挂单订单
  HOLD: 1
}

/**
 * 销售订单支付状态
 * 1-结清 2-欠款
 */
export const OrderPayStatusEnum = {
  // 结清
  SETTLE: 1,
  // 欠款
  ARREARS: 2
}



/**
 * 订单明细是否已退货
 * 0-正常 1-已退货
 */
export const DetailIsRefundedEnum = {
  NORMAL: 0,
  REFUNDED: 1
}




