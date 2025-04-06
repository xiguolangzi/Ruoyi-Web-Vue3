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
 * 订单支付状态：1-已支付 2-未结清
 */
export const OrderPayStatusEnum = {
  PAID: 1,
  NOT_COMPLETED: 2
}