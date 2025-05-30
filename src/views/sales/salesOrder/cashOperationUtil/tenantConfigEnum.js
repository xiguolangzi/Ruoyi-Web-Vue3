/**
 * 是否允许编辑单价：0-允许 1-不允许
 */
export const canEditPriceEnum = {
  ALLOW: '0',
  NOT_ALLOW: '1'
}

/**
 * 是否允许编辑折扣：0-允许 1-不允许
 */
export const canEditDiscountRateEnum = {
  ALLOW: '0',
  NOT_ALLOW: '1'
}

/**
 * 是否开启完成支付之后自动打印：0-开启 1-关闭
 */
export const paymentAutoPrintEnum = {
  OPEN: '0',
  CLOSE: '1'
}

/**
 * 是否开启允许欠款支付：0-开启 1-关闭
 */
export const canRemainAmountEnum = {
  OPEN: '0',
  CLOSE: '1'
}

/**
 * 是否开启允许删除订单行数据：0-开启 1-关闭
 */
export const canDeleteOrderDetailEnum = {
  OPEN: '0',
  CLOSE: '1'
}

/**
 * 是否展示触摸键盘：0-展示 1-不展示
 */
export const cajaShowKeyboardEnum = {
  SHOW: '0',
  NOT_SHOW: '1'
}

/**
 *  订单是否函数：0-含税 1-不含税
 */
export const orderInTaxEnum = {
  IN_Tax: '0',
  NOT_IN_TAX: '1'
}
