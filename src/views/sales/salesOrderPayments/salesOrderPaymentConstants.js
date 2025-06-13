/**
 * 支付方式:
 * CASH-现金, BANK-银行, CHEQUE-支票, VOUCHER-代金券
 */
export const PaymentMethodEnum = {
  CASH: 1,
  BANK: 2,
  CHEQUE: 3,
  VOUCHER: 4
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
 * UN_PAID-欠款单 PAID-现结单 PART_PAID-部分付款
 */
export const OrderPayStatusEnum = {
  // 欠款单
  UN_PAID: 1,
  // 现结单
  PAID: 2,
  // 部分付款
  PART_PAID: 3,
}
