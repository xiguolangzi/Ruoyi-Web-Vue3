
// 订单数据
export const initOrderData = () => ({
  orderId: null,
  orderInitNo: null,
  orderNo: null,
  parentOrderId: null,
  orderSource: null,
  orderInTax: '0',
  warehouseId: null,
  cajaId: null,
  shiftId: null,
  salesmanId: null,
  customerId: null,
  activityId: null,
  orderType: '0',
  orderStatus: null,
  orderIsHold: null,
  orderPayStatus: null,
  totalAmount: null,
  totalDiscountAmount: null,
  totalPromotionReduceAmount: null,
  totalSalesAmount: null,
  totalBaseAmount: null,
  totalTaxAmount: null,
  totalNetAmount: null,
  remainAmount: null,
  verifiedAmount: null,
  totalGiftQuantity: null,
  totalZeroAmount: null,
  remark: null,
  createBy: null,
  createTime: null,
  updateBy: null,
  updateTime: null,
  tenantId: null,
  delFlag: null,
  operateLog: null,
  salesOrderDetailList: []
});

export const initOrderDetailData = () => ({
  detailId: null,
  detailType: "",
  detailMainSkuId: "",
  skuId: "",
  skuCode: "",
  skuType: "",
  skuValue: "",
  skuName: "",
  assistName: "",
  batchId: "",
  detailSn: "",
  detailPrice: 0,
  detailQuantity: 0,
  detailAmount: 0,
  detailDiscountRate: 0,
  detailDiscountAmount: 0,
  detailSalesAmount: 0,
  detailBaseAmount: 0,
  detailTaxRate: 0,
  detailTaxAmount: 0,
  detailNetAmount: 0,
  promotionId: "",
  promotionName: "",
  remark: "",
})

export const StatusEnum = {
  // 正常
  ENABLE: '0',
  // 禁用
  DISABLE: '1'
}
