/**
 * 支付方式:
 * 1-现金 2-银行
 */
export const PaymentMethodEnum = {
  CASH: 1,
  BANK: 2
}

/**
 * 初始化订单支付数据
 */
export const initOrderPaymentData = () => ({
  paymentId: null,
  paymentNo: null,
  orderId: null,
  orderInitNo: null,
  orderNo: null,
  payMethod: null,
  payAmount: null,
  payTime: null,
  transactionNo: null,
});

/**
 * 销售订单支付状态
 * 1-欠款单 2-现结单
 */
export const OrderPayStatusEnum = {
  // 欠款单
  UN_PAID: 1,
  // 现结单
  PAID: 2,
  // 部分付款
  PART_PAID: 3,
}
