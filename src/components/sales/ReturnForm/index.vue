<!-- refundGoodsPage.vue -->
<template>
  <div class="return-page">
    <!-- 查询订单 -->
    <el-card class="box-card" shadow="hover" v-if="!form.orderInitNo">
      <template #header>销售订单查询</template>
      <el-input v-model="sourceOrderInitNo" placeholder="请输入或扫描原始订单条码" @keyup.enter="getOriginalOrder" clearable
        style="width: 300px" v-focusSelect>
        <template #append>
          <el-button :icon="Search" @click="getOriginalOrder">查询</el-button>
        </template>
      </el-input>
      <el-button type="warning" @click="noTicketRefund" :loading="submitting" style="margin-left: 20px">
        无票退货
      </el-button>
    </el-card>

    <!-- 有票退货 -->
    <el-card v-if="refundType == refundTypeEnum.HAS_TICKET && form?.orderInitNo" class="box-card" shadow="hover">
      <template #header>有票退货</template>
      <!-- 来源订单信息 -->
      <el-descriptions :column="3" border size="small" :label-width="80" style="margin-bottom: 10px;">
        <el-descriptions-item label="原始初始订单号" :width="100">{{ sourceOrderForm.orderInitNo }}</el-descriptions-item>
        <el-descriptions-item label="下单时间" :width="100">{{ sourceOrderForm.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付状态" :width="100">{{ sourceOrderForm.orderPayStatus }}</el-descriptions-item>
        <el-descriptions-item label="客户" :width="100">{{ sourceOrderForm.customerName }}</el-descriptions-item>
        <el-descriptions-item label="业务员" :width="100">{{ sourceOrderForm.salesmanName }}</el-descriptions-item>
        <el-descriptions-item label="佣金点数" :width="100">{{ sourceOrderForm.baseCommissionRate }}</el-descriptions-item>
        <el-descriptions-item label="当前CAJA" :width="100">{{ form.cajaName }}</el-descriptions-item>
        <el-descriptions-item label="当前收银" :width="100">{{ form.shiftUserName }}</el-descriptions-item>
        <el-descriptions-item label="交班编号" :width="100">{{ form.shiftNo }}</el-descriptions-item>
      </el-descriptions>

      <!-- 原始订单明细 -->
      <SourceOrderTable :tableData=sourceOrderForm.salesOrderDetailList />

    </el-card>

    <!-- 无票退货 -->
    <el-card v-if="refundType == refundTypeEnum.NO_TICKET && form?.orderInitNo" class="box-card" shadow="hover"
      style="margin-top: 10px;">
      <template #header>
        <div class="title">
          <h2>无票退货</h2>
          <dict-tag :options="sales_order_direction" :value="form.orderDirection" />
          <dict-tag :options="sales_order_source" :value="form.orderSource" />
          <dict-tag :options="sales_order_type" :value="form.orderType" />
          <dict-tag :options="sales_order_pay_status" :value="form.orderPayStatus" />
          <dict-tag :options="sales_order_status" :value="form.orderStatus" />
        </div>
      </template>
      <el-descriptions :column="3" border size="small" :label-width="150">
        <el-descriptions-item label="退货初始订单号" :width="150">
          {{ form.orderInitNo }}
        </el-descriptions-item>
        <el-descriptions-item label="退货订单号" :width="150">
          {{ form.orderInitNo }}
        </el-descriptions-item>
        <el-descriptions-item label="当前收银" :width="100">{{ form.shiftUserName }}</el-descriptions-item>
        <el-descriptions-item label="客户" :width="150">
          <CustomerSelect v-model="form.customerName" @selectedData="selectedCustomerData" size="small"
            :disabled=" form.orderStatus && form.orderStatus != OrderStatusEnum.INIT" style="width: 100%;" />
        </el-descriptions-item>
        <el-descriptions-item label="业务员" :width="150">
          <SalesmanSelect v-model="form.salesmanName" @selectedData="selectedSalesmanData" size="small"
            :disabled="form.orderStatus && form.orderStatus != OrderStatusEnum.INIT" style="width: 100%;" />
        </el-descriptions-item>
        <el-descriptions-item label="佣金点数" :width="150">
          <el-input-number v-model="form.baseCommissionRate" :min="0" :max="100" :controls="false" :step="0"
            size="small" style="width: 100%;" v-focusSelect
            :disabled=" form.orderStatus && form.orderStatus != OrderStatusEnum.INIT">
            <template #suffix>
              <span> %</span>
            </template>
          </el-input-number>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 分割线 -->
      <el-divider content-position="left">退货明细</el-divider>
      <!-- 无票退货的订单明细 -->
      <NoTicketRefundTable :tableData="form.salesOrderDetailList" :inTax="form.inTax"
        :customerPriceLevel="form.customerPriceLevel" :customerDiscountRate="form.customerDiscountRate"
        :customerRegimen="form.customerRegimen" :customerCalificacion="form.customerCalificacion" />
    </el-card>

    <!-- 退货订单信息 -->
    <RefundTable ref="refundTableDialog" :orderData="form" @printTicket="handlePrintTicket"
      @payment="handleCompletePayment" />


    <!-- 退货摘要与原因 -->
    <el-card v-if="totalReturnQuantity > 0" class="box-card" shadow="hover" style="margin-top: 10px;">
      <template #header>退货信息</template>
      <div class="summary-row-flex">
        <el-form label-width="100px">
          <el-form-item label="退货原因:">
            <el-select v-model="refundReason" placeholder="请选择退货原因" style="width: 300px" @change="changeReturnReason">
              <el-option v-for="item in erp_refunded_reason" :key="item.value" :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="详细说明:" v-if="refundReason === 'OTHER'">
            <el-input v-model="remark" type="textarea" :rows="2" show-word-limit maxlength="100"
              placeholder="请输入详细的退货原因说明" style="width: 100%" />
          </el-form-item>
        </el-form>

        <div class="summary-right">
          <div>退货总数量 : {{ totalReturnQuantity }} </div>
          <div>退货总金额 : {{ formatTwo(totalReturnAmount) }} €</div>
        </div>
      </div>
    </el-card>

    <!-- 提交操作 -->
    <div class="action-bar">
      <el-button @click="resetForm">重置</el-button>
      <el-button type="primary" @click="generateRefundOrder" :disabled="totalReturnQuantity <= 0 || !remark"
        :loading="submitting">
        {{ buttonTitle }}
      </el-button>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSalesOrderByOrderInitNo, addSalesOrder, generateInvoice, updateByOtherOperate } from '@/api/sales/salesOrder'
import SnowflakeID from '@/utils/SnowflakeID.js';
import useUserStore from "@/store/modules/user";
import {useCajaStore} from "@/store/modules/caja";
import { initOrderDetailData, OrderDirectionEnum, orderSourceEnum, OrderTypeEnum, OrderStatusEnum, OrderIsHoldEnum } from "@/views/sales/salesOrder/cashOperationUtil/cashOperationEnum.js";
import { OrderPayStatusEnum} from "@/views/sales/salesOrderPayments/salesOrderPaymentConstants.js"
import { canEditPriceEnum, canEditDiscountRateEnum, paymentAutoPrintEnum, canRemainAmountEnum, canDeleteOrderDetailEnum, cajaShowKeyboardEnum, orderInTaxEnum } from '@/views/sales/salesOrder/cashOperationUtil/tenantConfigEnum.js';
import SkuSelect from '@/components/Common/SkuSelect.vue';
import SourceOrderTable from '@/components/sales/SourceOrderTable.vue';
import RefundTable from '@/components/sales/RefundTable.vue';
import NoTicketRefundTable from '@/components/sales/NoTicketRefundTable.vue';
import { InvoiceTypeEnum } from '@/views/verifuc/verifacInvoice/invoiceConstants.js';
import { completePayment } from '@/api/sales/salesOrder.js';
import { cloneDeep, get } from 'lodash';
import CustomerSelect from '@/components/Common/CustomerSelect.vue';
import SalesmanSelect from '@/components/Common/SalesmanSelect.vue';
import { CustomerNormalEnum, CustomerRegimenEnum, CustomerCalificacionEnum } from "@/views/order/customer/customerEnum.js"
import { useRoute } from "vue-router";


const userStore = useUserStore();
const cajaStore = useCajaStore();
const route = useRoute();

const { proxy } = getCurrentInstance();
const { erp_refunded_reason } = proxy.useDict('erp_refunded_reason');
const { sales_order_source, sales_order_direction, sales_order_type, sales_order_status, sales_order_pay_status, varifac_invoice_type } = proxy.useDict('sales_order_source', 'sales_order_is_hold', 'sales_order_direction', 'sales_order_type', 'sales_order_status', 'sales_order_pay_status', 'varifac_invoice_type');

const refundTableDialog = ref(null);

function changeReturnReason(){
  if (refundReason.value !== 'OTHER') {
    remark.value = refundReason.value;
  } else {
    remark.value = null;
  }
}

function selectedCustomerData(data){
  data = data || {};
  console.log('收银台获取的客户数据:', data)
  form.value.customerId = data.customerId || null;
  form.value.customerRegimen = data.invoiceRegimen || CustomerNormalEnum.CUSTOMER_REGIMEN_NORMAL;
  form.value.customerCalificacion = data.invoiceCalification || CustomerNormalEnum.CUSTOMER_CALIFICACION_NORMAL;
  form.value.invoiceNombre = data.invoiceNombre || null;
  form.value.invoiceNif = data.invoiceNif || null;
  form.value.invoicePhone = data.invoicePhone || null;
  form.value.invoiceEmail = data.contactEmail || null;
  form.value.invoicePostcode = data.invoicePostcode || null;
  form.value.invoiceAddressCountry = data.invoiceAddressCountry || null;
  form.value.invoiceAddressProvince = data.invoiceAddressProvince || null;
  form.value.invoiceAddressDetail = data.invoiceAddressDetail || null;
  form.value.customerPriceLevel = data.levelPrice || 1;
  form.value.customerDiscountRate = data.levelDiscount || 0;
  form.value.salesmanId = data.salesmanId || null;
  form.value.salesmanName = data.salesmanName || null;
  form.value.baseCommissionRate = data.baseCommissionRate || 0;
  // 更新价格和折扣
  updateDetailPriceAndDiscount();
}

function selectedSalesmanData(data){
  console.log('收银台获取的业务员数据:', data)
  form.value.salesmanId = data?.userId || null;
  form.value.salesmanName = data?.userName || null;
  form.value.baseCommissionRate = data?.commissionRate || 0;

}

// 根据客户信息 折扣/价格 更新明细价格/折扣 根据是否含税计算最终金额
const updateDetailPriceAndDiscount = () => {
  if (form.value.salesOrderDetailList.length > 0) {
    // 更新每个订单明细的价格、折扣和金额
    form.value.salesOrderDetailList.forEach((item) => {
      // 动态构建 priceMap
      const priceMap = {
        1: item.skuPrice,
        2: item.skuPrice2,
        3: item.skuPrice3,
        4: item.skuPrice4,
        5: item.skuPrice5,
        6: item.skuPrice6,
      };

      // 更新价格
      item.detailPrice = priceMap[form.value.customerPriceLevel] || item.skuPrice;
      // 更新折扣率
      item.detailDiscountRate = +form.value.customerDiscountRate || 0;
      // 计算订单金额
      item.detailAmount = item.detailPrice * item.detailQuantity;
      item.detailDiscountAmount = item.detailAmount * (item.detailDiscountRate / 100);
      item.detailSalesAmount = item.detailAmount - item.detailDiscountAmount;

      // 根据是否含税计算净金额、基础金额和税额
      const { detailBaseAmount, detailTaxAmount, detailReAmount, detailNetAmount } = calculateAmounts(item.detailSalesAmount, item.detailTaxRate, item.detailReRate)
      item.detailBaseAmount = detailBaseAmount;
      item.detailNetAmount = detailNetAmount;
      item.detailReAmount = detailReAmount;
      item.detailTaxAmount = detailTaxAmount;
      console.log("订单明细计算结果---：", item);
    });

  }
};

/** 计算含税和不含税的金额 */
function calculateAmounts(detailSalesAmount, detailTaxRate, detailReRate) {
  const rateValue = (detailTaxRate || 0) / 100;
  const reRate = form.value.customerRegimen == CustomerRegimenEnum.CUSTOMER_REGIMEN_RE ? (detailReRate || 0) / 100 : 0;
  let detailBaseAmount, detailTaxAmount, detailReAmount, detailNetAmount;

  if (form.value.inTax == orderInTaxEnum.IN_Tax) {
    // 含税
    detailBaseAmount = detailSalesAmount / (1 + rateValue);
    // 是否免税
    if (form.value.customerCalificacion != CustomerCalificacionEnum.CUSTOMER_CALIFICACION_NORMAL) {
      // 免税
      detailTaxAmount = 0
      detailReAmount = 0
      detailNetAmount = detailBaseAmount;
    } else {
      // 非免税
      detailTaxAmount = detailBaseAmount * rateValue;
      detailReAmount = detailBaseAmount * reRate;
      detailNetAmount = detailBaseAmount + detailTaxAmount + detailReAmount;
    }

  } else {
    // 不含税
    detailBaseAmount = detailSalesAmount;
    // 是否免税
    if (form.value.customerCalificacion != CustomerCalificacionEnum.CUSTOMER_CALIFICACION_NORMAL) {
      // 免税
      detailTaxAmount = 0
      detailReAmount = 0
      detailNetAmount = detailBaseAmount;
    } else {
      // 非免税
      detailTaxAmount = detailBaseAmount * rateValue;
      detailReAmount = detailBaseAmount * reRate;
      detailNetAmount = detailBaseAmount + detailTaxAmount + detailReAmount;
    }
  }

  return { detailBaseAmount, detailTaxAmount, detailReAmount, detailNetAmount };
}

// ------------------ 获取租户配置 start ------------------
const canEditPrice = ref(canEditPriceEnum.NOT_ALLOW);  // 表格子组件编辑单价disable控制
const canEditDiscountRate = ref(canEditDiscountRateEnum.NOT_ALLOW); // 表格子组件编辑折扣disable控制
const paymentAutoPrint = ref(paymentAutoPrintEnum.OPEN);  // 是否开启完成支付自动打印
const canRemainAmount = ref(canRemainAmountEnum.OPEN); // 是否开启欠款支付
const canDeleteOrderDetail = ref(canDeleteOrderDetailEnum.OPEN);  // 是否开启删除订单行
const cajaShowKeyboard = ref(cajaShowKeyboardEnum.SHOW); // 是否展示触摸键盘配置
const orderInTax = ref(orderInTaxEnum.IN_Tax);  // 订单是否含税，默认含税
const refundReason = ref(null);
const remark = ref(null);

/** 异步获取租户配置 */
const loadTenantConfig = async () => {
  try {
    const config = await proxy.getTenantConfig("editPrice");
    canEditPrice.value = (config != null) ? config : canEditPriceEnum.NOT_ALLOW;
    const config2 = await proxy.getTenantConfig("editDiscountRate");
    canEditDiscountRate.value = (config2 != null) ? config2 : canEditDiscountRateEnum.NOT_ALLOW;
    const config3 = await proxy.getTenantConfig("paymentAutoPrint");
    paymentAutoPrint.value = (config3 != null) ? config3 : paymentAutoPrintEnum.OPEN;
    const config4 = await proxy.getTenantConfig("canRemainAmount");
    canRemainAmount.value = (config4 != null) ? config4 : canRemainAmountEnum.OPEN;
    const config5 = await proxy.getTenantConfig("canDeleteOrderDetail");
    canDeleteOrderDetail.value = (config5 != null) ? config5 : canDeleteOrderDetailEnum.OPEN;
    const config6 = await proxy.getTenantConfig("cajaShowKeyboard");
    cajaShowKeyboard.value = (config6 != null) ? config6 : cajaShowKeyboardEnum.SHOW;
    const config7 = await proxy.getTenantConfig("orderInTax");
    orderInTax.value = (config7 != null) ? config7 : orderInTaxEnum.IN_Tax;
  } catch (error) {
    console.error("加载租户配置失败:", error);
    // 设置默认值
    canEditPrice.value = canEditPriceEnum.NOT_ALLOW;
    canEditDiscountRate.value = canEditDiscountRateEnum.NOT_ALLOW;
    paymentAutoPrint.value = paymentAutoPrintEnum.OPEN;
    canRemainAmount.value = canRemainAmountEnum.OPEN;
    canDeleteOrderDetail.value = canDeleteOrderDetailEnum.OPEN;
    cajaShowKeyboard.value = cajaShowKeyboardEnum.SHOW;
    orderInTax.value = orderInTaxEnum.IN_Tax;
  }
}

// 发票类型
const invoiceTipo = ref(InvoiceTypeEnum.SIMPLIFICADA)
const getInvoiceTipo = async () => {
  invoiceTipo.value = route.query.invoiceTipo || InvoiceTypeEnum.SIMPLIFICADA;
}

onMounted(() => {
  loadTenantConfig();
  getInvoiceTipo();
});

// ------------------ 获取租户配置 end ------------------

/** 退货类型 */
const refundTypeEnum = {
  // 有票退货
  HAS_TICKET: true,
  // 无票退货
  NO_TICKET: false
}

const sourceOrderInitNo = ref('')   // 来源订单-初始订单号
const submitting = ref(false) // 提交加载状态
const refundType = ref(refundTypeEnum.HAS_TICKET) // 退货类型：默认有票退货
const buttonTitle = computed(()=>{
  if(form.value){
    if(form.value.orderId){
      return "修改退货"
    }
    return "提交退货"
  }
  return "提交退货"
})



// 表单数据
const data = reactive({
  // 来源订单
  sourceOrderForm: {
    salesOrderDetailList: [],
  },
  // 退货订单
  form: {
    salesOrderDetailList: [], // 初始化为空数组
  },
  rules: {
    orderInitNo: [
      { required: true, message: "初始退货单号不能为空", trigger: "blur" }
    ],
  }
});

const { sourceOrderForm, form, rules } = toRefs(data);


// 初始退货订单
function initForm() {
  const snowflake = new SnowflakeID({ objectId: userStore.id});
  const orderInitNo = "N" + snowflake.nextId();
  form.value = {
    orderId: null,
    orderDirection: OrderDirectionEnum.RETURN,
    orderInitNo: orderInitNo,
    orderNo: null,
    parentOrderId: null,
    orderSource: orderSourceEnum.CAJA,
    warehouseId: null,
    cajaId: cajaStore.caja?.cajaId || null,
    cajaName: cajaStore.caja?.cajaName || null,
    shiftId: cajaStore.shift?.shiftId || null,
    shiftNo: cajaStore.shift?.shiftNo || null,
    shiftUserName: userStore.name,
    salesmanId: null,
    customerId: null,
    activityId: null,
    orderType: OrderTypeEnum.PRE_ORDER,
    //orderStatus: OrderStatusEnum.INIT,
    //orderPayStatus: OrderPayStatusEnum.UN_PAID,
    totalQuantity: 0,
    totalAmount: 0,
    totalDiscountAmount: 0,
    totalSalesAmount: 0,
    totalPromotionReduceAmount: 0,
    totalBaseAmount: 0,
    totalTaxAmount: 0,
    totalNetAmount: 0,
    cashAmount: 0,
    bankAmount: 0,
    changeAmount: 0,
    inTax: orderInTax.value,
    zeroAmount: 0,
    remainAmount: 0,
    verifiedAmount: 0,
    totalGiftQuantity: 0,
    remark: null,
    operateLog: null,
    invoiceTipo: invoiceTipo.value,
    salesOrderDetailList: [
      initOrderDetailData()
    ],
    salesOrderPaymentList: [],
  };
  submitting.value = false;
}

/** 无票退货 */
const noTicketRefund = () => {
  initForm();
  refundType.value = refundTypeEnum.NO_TICKET;
  console.log("无票退货的初始订单表单信息：", form.value)
}

/** 有票退货 获取原始订单数据 初始化表单 */
const getOriginalOrder = async () => {
  if (!sourceOrderInitNo.value) return ElMessage.warning('请输入来源原始订单编号')
  try {
    getSalesOrderByOrderInitNo(sourceOrderInitNo.value).then(res => {
      if (res.data) {
        if  (res.data.orderDirection !== OrderDirectionEnum.SALES) {
          ElMessage.error('来源原始订单非销售订单!不允许退货处理！')
          return;
        }
        if  (res.data.orderStatus !== OrderStatusEnum.CONFIRM) {
          ElMessage.error('来源原始订单非确认订单!不允许退货处理！')
          return;
        }
        initForm();
        sourceOrderForm.value = res.data
        refundType.value = refundTypeEnum.HAS_TICKET;
        console.log("获取的订单数据：", sourceOrderForm.value)
      } else {
        ElMessage.error('查询失败: ' + res.message)
      }
    })
    refundReason.value = null;
    remark.value = null;
    console.log("获取的订单数据：", sourceOrderForm.value)
  } catch (e) {
    ElMessage.error('查询失败: ' + e.message)
  }
}

/** 刷新原始订单信息 */
function fetchOriginalOrder (){
  if (!sourceOrderInitNo.value) return;
  try {
    getSalesOrderByOrderInitNo(sourceOrderInitNo.value).then(res => {
      if (res.data) {
        if (res.data.orderDirection !== OrderDirectionEnum.SALES) {
          ElMessage.error('来源原始订单非销售订单!不允许退货处理！')
          return;
        }
        if (res.data.orderStatus !== OrderStatusEnum.CONFIRM) {
          ElMessage.error('来源原始订单非确认订单!不允许退货处理！')
          return;
        }
        sourceOrderForm.value = res.data
        refundType.value = refundTypeEnum.HAS_TICKET;
        console.log("获取的订单数据：", sourceOrderForm.value)
      } else {
        ElMessage.error('查询失败: ' + res.message)
      }
    })
    refundReason.value = null;
    remark.value = null;
    console.log("获取的订单数据：", sourceOrderForm.value)
  } catch (e) {
    ElMessage.error('查询失败: ' + e.message)
  }

}


/** 计算退货总数量 */
const totalReturnQuantity = computed(() =>{
  if(refundType.value == refundTypeEnum.HAS_TICKET){
    if (!sourceOrderForm?.value?.salesOrderDetailList) return 0;
    return sourceOrderForm.value.salesOrderDetailList.reduce((sum, item) => sum + (item.refundedCurrentQuantity || 0), 0);
  } else{
    if (!form?.value?.salesOrderDetailList) return 0;
    return form.value.salesOrderDetailList.reduce((sum, item) => sum - (item.detailQuantity || 0), 0);
  }
})

/** 计算退货总金额 */
const totalReturnAmount = computed(() => {
  if(refundType.value == refundTypeEnum.HAS_TICKET){
    if (!sourceOrderForm.value.salesOrderDetailList) return 0;
    return sourceOrderForm.value.salesOrderDetailList.reduce((sum, item) => sum + ((item.detailNetAmount / item.detailQuantity ) * (item.refundedCurrentQuantity || 0)), 0);
  } else{
    if (!form.value.salesOrderDetailList) return 0;
    return form.value.salesOrderDetailList.reduce((sum, item) => sum - (item.detailNetAmount || 0), 0);
  }
  
})

/** 检查采购条目的必输项 */
const validateItems = (salesOrderDetailList) => {
  for (const item of salesOrderDetailList) {
    // 数量校验
    if (form.value.orderDirection == OrderDirectionEnum.SALES) {
      ElMessage.error("退货业务，订单方向错误！")
    } else {
      if (item.detailQuantity >= 0) {
        ElMessage.error("退货订单明细 数量必须小于0!");
        return false;
      }
    }
    // 单价校验
    if (item.detailPrice < 0) {
      ElMessage.error("订单明细 单价不能小于0!");
      return false;
    }
    // 税率校验
    if (isNaN(item.detailTaxRate)) {
      ElMessage.error("订单明细 税率异常，请检查!");
      return false;
    }
    if (item.detailTaxRate < 0 || item.detailTaxRate > 100) {
      ElMessage.error("订单明细 税率需要在 0-100% 之间，请检查!");
      return false;
    }
    // 折扣率校验
    if (isNaN(item.detailDiscountRate)) {
      console.log("异常的则扣率：", item.detailDiscountRate)
      ElMessage.error("订单明细 折扣率异常，请检查!");
      return false;
    }
    if (item.detailDiscountRate < 0 || item.detailDiscountRate > 100) {
      ElMessage.error("订单明细 折扣率需要在 0-100% 之间，请检查!");
      return false;
    }
  }
  return true;
};


// 当前订单明细的行数
const salesOrderDetailLength = computed(() => {
  return form.value.salesOrderDetailList.length || 0;
})

function filterAndCheckDetailList(){
  // 1 过滤空数据
  form.value.salesOrderDetailList = form.value.salesOrderDetailList.filter(item => item.skuId)
  if (salesOrderDetailLength.value <= 0) {
    ElMessage.error("订单明细不能为空!");
    if(refundType.value == refundTypeEnum.NO_TICKET){
      addItem()
    }
    return false;
  }
  // 2 检查采购条目的输入项 false不通过
  if (!validateItems(form.value.salesOrderDetailList)) {
    if(refundType.value == refundTypeEnum.NO_TICKET){
      addItem()
    }
    return false;
  }
  // 3 完整发票必须绑定客户信息
  if(form.value.invoiceTipo == InvoiceTypeEnum.COMPLETA){
    if(!form.value.customerId){
      if(refundType.value == refundTypeEnum.NO_TICKET){
        addItem()
      }
      ElMessage.error("完整发票必须绑定客户信息！");
      return false;
    }
  }

  return true;
}

function addItem(){
  if (!form.value.salesOrderDetailList) {
    form.value.salesOrderDetailList = [];
  }
  form.value.salesOrderDetailList.push(initOrderDetailData())
}


/** 生成退货表单 */
function generateRefundOrder(){
  // 1 判断退货数量
  if (totalReturnQuantity.value <= 0){
    ElMessage.warning('退货数量不能小于等于0');
    return;
  }
  // 2 有票退货
  if(refundType.value == refundTypeEnum.HAS_TICKET){
    createFormBySourceOrder();
    // 去除空行数据 + 明细校验
    if(!filterAndCheckDetailList()){
      return;
    }
    // 调用后端退货接口，返回生成的退货订单 form
    addSalesOrder(form.value).then(res => { 
      if  (!res.data) {
        ElMessage.error('退货失败:' + res.message)
        return;
      }
      // 更新退货订单
      form.value = res.data
      // 更新原始订单信息
      fetchOriginalOrder();
      refundTableDialog.value.openDialog()
    })
  }

  // 3 无票退货
  if(refundType.value == refundTypeEnum.NO_TICKET){ 
    // 去除空行数据
    if(!filterAndCheckDetailList()){
      return;
    }
    // 无票退货的业务逻辑
    addSalesOrder(form.value).then(res => {
      if (!res.data) {
        ElMessage.error('退货失败:' + res.message)
        return;
      }
      // 更新退货订单
      form.value = res.data
      refundTableDialog.value.openDialog()
    })
  }
}

function createFormBySourceOrder() {
  // 1. 防御性处理源数据
  if (!sourceOrderForm.value?.salesOrderDetailList) {
    form.value.salesOrderDetailList = [];
    return;
  }

  // 2. 原始订单赋值
  form.value.parentOrderId = sourceOrderForm.value.orderId;
  form.value.parentOrderInitNo =  sourceOrderForm.value.orderInitNo;
  form.value.tenantId = sourceOrderForm.value.tenantId;
  form.value.customerId = sourceOrderForm.value.customerId;
  form.value.salesmanId = sourceOrderForm.value.salesmanId;
  form.value.baseCommissionRate = sourceOrderForm.value.baseCommissionRate;
  form.value.activityId = sourceOrderForm.value.activityId;
  form.value.activityCommissionRate = sourceOrderForm.value.activityCommissionRate;
  form.value.costMethod = sourceOrderForm.value.costMethod;
  form.value.customerRegimen = sourceOrderForm.value.customerRegimen;
  form.value.customerCalificacion = sourceOrderForm.value.customerCalificacion;
  form.value.inTax = sourceOrderForm.value.inTax;
  form.value.refundReason = refundReason.value;
  form.value.remark = remark.value;
  form.value.invoiceTipo = sourceOrderForm.value.invoiceTipo;
  if(!form.value.cajaId){
    form.value.cajaId = cajaStore?.caja?.cajaId || null;
  }
  if(!form.value.shiftId){
    form.value.shiftId = cajaStore?.shift?.shiftId || null;
  }

  // 3. 同步明细
  form.value.salesOrderDetailList =  sourceOrderForm.value.salesOrderDetailList
  // 先用 filter 移除无效项，避免 map 返回 null
  .filter(item => item?.refundedCurrentQuantity > 0)
  .map(item => ({
    ...item,
    detailQuantity: -item.refundedCurrentQuantity, // 明确负数逻辑
  }))

}

/** 完成支付 */
function handleCompletePayment (salesOrderPayment){
  if  (!salesOrderPayment) return;
  if (!form.value.salesOrderPaymentList) form.value.salesOrderPaymentList = []
  // 获取原始支付列表
  const originalPaymentList = cloneDeep(form.value.salesOrderPaymentList);
  form.value.salesOrderPaymentList.push(salesOrderPayment)
  completePayment(form.value).then(res => { 
    if  (res.code == 200) {
      if (res.data) {
        form.value = res.data;
      }
      // 是否自动打印
      if (paymentAutoPrint.value == paymentAutoPrintEnum.OPEN) {
        // 打印功能
        handlePrintTicket()
      }
    }
  }).catch(()=>{
    form.value.salesOrderPaymentList = originalPaymentList;
  })
}


/**
 * 打印发票
 */
const handlePrintTicket = () => {
  console.log('退货主页开始打印小票业务:')
  // 生成发票 - 返回带有QR的订单信息
  generateInvoice(form.value).then((res) => {
    console.log("确认发票响应的结果：", res)
    if (res.data) {
      form.value = res.data;
      if (form.value.verifacInvoice && form.value.verifacInvoice.invoiceQr) {
        if(form.value.invoiceTipo == InvoiceTypeEnum.COMPLETA){
          // 打印完整发票
          printTicket(form.value)
        } else{
          // 打印简易发票
          printTicket80(form.value)
        }
        
      } else {
        ElMessageBox.confirm('发票信息异常，请稍后再试，是否打印临时小票？', '警告提示', {
          confirmButtonText: 'OK',
          showCancelButton: false,
          type: 'error',
        }).then(() => {
          if(form.value.invoiceTipo == InvoiceTypeEnum.COMPLETA){
            // 打印完整订单
            printPedido(form.value)
          } else {
            // 打印临时小票
            printPedido80(form.value)
          }
          
        })
      }
    }
  }).catch((e) => {
    // 错误信息展示
    console.log("确认发票异常：", e)
    ElNotification({
      title: 'Error',
      message: "确认发票异常：" + e,
      type: 'error',
      position: 'bottom-right',
      // appendTo 挂载到 全屏组件上
      appendTo: cashierContainer.value
    })

  })
}

/** 打印简易发票 */
function printTicket80(orderFormData) {
  // TODO: 业务待完成
  console.log("打印的简易发票信息是：", orderFormData)
}

/** 没有QR，打印pedido临时订单 */
function printPedido80(orderFormData) {
  // TODO: 业务待完成
  console.log("打印的临时小票信息是：", orderFormData)
}

/** 打印简易发票 */
function printTicket(orderFormData) {
  // TODO: 业务待完成
  console.log("打印的完整发票信息是：", orderFormData)
}

/** 没有QR，打印pedido临时订单 */
function printPedido(orderFormData) {
  // TODO: 业务待完成
  console.log("打印的完整订单信息是：", orderFormData)
}


/** 重置表单 */
const resetForm = () => {
  form.value = { salesOrderDetailList: [] };
  sourceOrderForm.value = {};
  sourceOrderInitNo.value = null;
  remark.value = null;
  refundReason.value = null;
}
</script>

<style scoped lang="scss">
.return-page {
  padding: 20px;
  height: 100%;
  overflow-y: auto; /* 允许滚动 */
}
.page-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
}
.summary-row-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.form-left {
  flex: 1;
}
.summary-right {
  min-width: 180px;
  font-size: 16px;
}
.action-bar {
  margin-top: 20px;
  text-align: right;
}

.footer-data-container {
  flex-shrink: 0;
  height: 200px;
  /* 固定高度 */
  width: 100%;
  padding: 0px;
  margin: 0px;
  background-color: #f5f7fa;
  /* 浅灰色背景 */
  //overflow-y: auto; /* 允许滚动 */

  .footer-card {
    min-height: 100%;
    width: 100%;
    border-radius: 8px;
    /* 圆角 */
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    /* 阴影 */
    padding: 0px;
    margin: 0px;

    .footer-row {
      height: 100%;
      margin: 0 !important;
      /* 移除默认的外边距 */
    }

    .footer-col {
      height: 100%;
      display: flex;
      align-items: center;
      border-right: 1px solid #d8dce6;
      /* 更细、更浅的分割线 */
      padding-right: 10px;
      /* 分割线与内容的间距 */
      margin-right: 10px;
      /* 区域之间的间距 */

      &:last-child {
        border-right: none;
        /* 去除最后一个区域的分割线 */
        padding-right: 0;
        margin-right: 0;
      }

      .footer-col-content {
        height: 90%;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 5px;
        /* 内边距 */
        margin: 0px;

        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #303133;
          /* 标题颜色 */
          display: flex;
          justify-content: space-between;
          /* 将内容分散对齐 */
          align-items: center;
          /* 垂直居中 */
          padding: 5px;
        }

        .sku-image-container {
          flex: 1;
          margin: 10px;
          text-align: center;
        }

        .highlight-text {
          color: #409eff;
          /* 高亮文本颜色 */
          font-weight: bold;
        }
      }

    }
  }
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;

  h2 {
    margin: 0;
  }
}
</style>
