<!-- Detail.vue -->
<template>
  <div class="app-container">
    <el-card class="card-data" size="small">
      <template #header>
        <div class="header-content">
          <div class="title">
            <h2>订单详情</h2>
            <dict-tag :options="sales_order_direction" :value="form.orderDirection" />
            <dict-tag :options="sales_order_source" :value="form.orderSource" />
            <dict-tag :options="sales_order_type" :value="form.orderType" />
            <dict-tag :options="sales_order_pay_status" :value="form.orderPayStatus" />
            <dict-tag :options="sales_order_status" :value="form.orderStatus" />
          </div>
          <div class="actions">
            <!-- 根据不同状态显示不同的操作按钮 - 开启库位 -->
            <el-button-group class="ml-4" v-if="openLocation == OpenLocationEnum.ENABLE">
              <!-- 初始状态 -->
              <el-button type="primary" v-if="form.orderStatus == OrderStatusEnum.INIT" :disabled="canEditStatus"
                @click="handleEdit" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                继续编辑
              </el-button>
              <el-button type="success" v-if="form.orderStatus == OrderStatusEnum.INIT" :disabled="!canEditStatus"
                @click="handleSave" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                保存
              </el-button>
              <el-button type="warning" v-if="form.orderStatus === OrderStatusEnum.INIT" :disabled="canEditStatus"
                @click="handlePick" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                提交拣货
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.INIT" :disabled="canEditStatus"
                @click="handleDelete" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                删除
              </el-button>

              <!-- 拣货状态 -->
              <el-button type="warning" v-if="form.orderStatus === OrderStatusEnum.PICK" :disabled="canEditStatus"
                @click="handleCheck" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                提交复核
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.PICK" :disabled="canEditStatus"
                @click="handleUnPick" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                反拣货
              </el-button>
              <el-button type="primary" v-if="form.orderStatus == OrderStatusEnum.PICK" :disabled="canEditStatus"
                @click="handleEdit" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                继续编辑
              </el-button>
              <el-button type="success" v-if="form.orderStatus == OrderStatusEnum.PICK" :disabled="!canEditStatus"
                @click="handleSaveEdit" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                保存修改
              </el-button>

              <!-- 复核状态 -->
              <el-button type="warning" v-if="form.orderStatus === OrderStatusEnum.CHECK" :disabled="canEditStatus"
                @click="handlePack" v-hasPermi="['sales:salesOrder:approve']">
                提交打包
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.CHECK" :disabled="canEditStatus"
                @click="handleUnCheck" v-hasPermi="['sales:salesOrder:approve']">
                反复核
              </el-button>
              <el-button type="primary" v-if="form.orderStatus == OrderStatusEnum.CHECK" :disabled="canEditStatus"
                @click="handleEdit" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                继续编辑
              </el-button>
              <el-button type="success" v-if="form.orderStatus == OrderStatusEnum.CHECK" :disabled="!canEditStatus"
                @click="handleSaveEdit" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                保存修改
              </el-button>

              <!-- 打包状态 -->
              <el-button type="warning" v-if="form.orderStatus == OrderStatusEnum.PACK" @click="handleConfirm"
                v-hasPermi="['sales:salesOrder:approve']">
                确认订单
              </el-button>
              <el-button type="danger" v-if="form.orderStatus == OrderStatusEnum.PACK" @click="handleUnPack"
                v-hasPermi="['sales:salesOrder:approve']">
                反打包
              </el-button>

              <!-- 确认状态 -->
              <el-button type="warning"
                v-if="form.orderStatus == OrderStatusEnum.CONFIRM && form.orderType == OrderTypeEnum.PRE_ORDER"
                @click="handleGenerateInvoice" v-hasPermi="['sales:salesOrder:approve']">
                生成发票
              </el-button>
              <el-button type="danger"
                v-if="form.orderStatus == OrderStatusEnum.CONFIRM && form.orderType == OrderTypeEnum.PRE_ORDER"
                @click="handleUnConfirm" v-hasPermi="['sales:salesOrder:approve']">
                反确认
              </el-button>

              <!-- 确认状态 -->
              <el-button type="danger"
                v-if="form.orderStatus == OrderStatusEnum.CONFIRM && form.orderType == OrderTypeEnum.PRE_ORDER"
                @click="handleVoided" v-hasPermi="['sales:salesOrder:approve']">
                作废
              </el-button>
            </el-button-group>

            <!-- 根据不同状态显示不同的操作按钮 - 不开启库位 -->
            <el-button-group class="ml-4" v-else>
              <!-- 初始状态 -->
              <el-button type="primary" v-if="form.orderStatus == OrderStatusEnum.INIT" :disabled="canEditStatus"
                @click="handleEdit" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                继续编辑
              </el-button>
              <el-button type="success" v-if="form.orderStatus == OrderStatusEnum.INIT" :disabled="!canEditStatus"
                @click="handleSave" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                保存
              </el-button>
              <el-button type="primary" v-if="form.orderStatus == OrderStatusEnum.INIT" :disabled="canEditStatus"
                @click="handleCompletePayment" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                确认订单
              </el-button>
              <!-- 确认状态 -->
              <el-button type="primary"
                v-if="form.orderStatus === OrderStatusEnum.CONFIRM && form.orderType == OrderTypeEnum.PRE_ORDER"
                :disabled="canEditStatus" @click="handleUnCompletePayment"
                v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                反确认
              </el-button>
              <el-button type="danger"
                v-if="form.orderStatus === OrderStatusEnum.CONFIRM && form.orderType == OrderTypeEnum.PRE_ORDER"
                :disabled="canEditStatus" @click="handleGenerateInvoice" v-hasPermi="['sales:salesOrder:approve']">
                生成发票
              </el-button>
            </el-button-group>

            <!-- 通用操作按钮 -->
            <el-button-group>
              <el-button @click="handlePrint">打印</el-button>
              <el-button @click="handleExport">导出</el-button>
              <el-tooltip content="退出编辑" effect="dark" placement="bottom">
                <el-button icon="Close" type="danger" @click="goBack"> 退出编辑 </el-button>
              </el-tooltip>
            </el-button-group>
          </div>
        </div>
      </template>

      <el-form ref="salesOrderRef" :model="form" :rules="rules" label-width="120px" size="small"
        :disabled="!canEditStatus">

        <!-- 基本信息 -->
        <el-row>
          <el-form-item label="初始单号:" prop="orderInitNo">
            <el-input v-model="form.orderInitNo" placeholder="系统自动生成" disabled size="small" />
          </el-form-item>
          <el-form-item label="订单号:" prop="orderNo">
            <el-input v-model="form.orderNo" placeholder="系统自动生成" disabled size="small" />
          </el-form-item>
          <el-form-item label="原始单号:" prop="parentOrderInitNo" v-if="form.orderDirection == OrderDirectionEnum.RETURN">
            <el-input v-model="form.parentOrderInitNo" placeholder="系统自动生成" disabled size="small" />
          </el-form-item>
          <el-form-item label="订单方向:" prop="orderDirection">
            <el-select v-model="form.orderDirection" placeholder="请选择订单方向" clearable :disabled="!!form.orderId">
              <el-option v-for="dict in sales_order_direction" :key="dict.value" :label="dict.label"
                :value="Number(dict.value)" />
            </el-select>
          </el-form-item>
          <!-- 业务员信息 -->
          <el-form-item label=" 业务员:" prop="salesmanID">
            <SalesmanSelect v-model="form.salesmanName" @selectedData="selectedSalesmanData" size="small"
              :disabled="form.orderStatus != OrderStatusEnum.INIT" />
          </el-form-item>
          <!-- 客户信息 -->
          <el-form-item label="客户信息:" prop="customerId">
            <CustomerSelect v-model="form.customerName" @selectedData="selectedCustomerData" size="small"
              :disabled="form.orderStatus != OrderStatusEnum.INIT" />
          </el-form-item>
          <!-- 仓库信息 -->
          <el-form-item label="仓库信息:" prop="warehouseId">
            <WarehouseSelect v-model="form.warehouseName" @selectedData="selectedWarehouseData" size="small"
              :disabled="form.orderStatus != OrderStatusEnum.INIT" />
          </el-form-item>
          <!-- 业务活动信息 -->
          <el-form-item label="业务活动:" prop="warehouseId">
            <SalesActivitySelect v-model="form.activityName" @selectedData="selectedSalesActivityData" size="small"
              :disabled="form.orderStatus != OrderStatusEnum.INIT" />
          </el-form-item>
          <el-form-item label="备注信息:" prop="remark">
            <el-input v-model="form.remark" placeholder="请输入备注" size="small" type="text" maxlength="200" show-word-limit
              :rows="1" />
          </el-form-item>
        </el-row>

        <!-- 商品明细 -->
        <RefundEditTable :tableData="form.salesOrderDetailList" :inTax="form.inTax"
          :customerPriceLevel="form.customerPriceLevel" :customerDiscountRate="form.customerDiscountRate"
          :customerRegimen="form.customerRegimen" :customerCalificacion="form.customerCalificacion" />
      </el-form>

      <!-- 合计信息 -->
      <template #footer>
        <div class="fixed-footer">
          <el-row class="footer-row">
            <!-- 第1个区域：订单配置数据 -->
            <el-col class="footer-col" :span="5">
              <div class="footer-content">
                <el-descriptions :column="1" size="small">
                  <el-descriptions-item label="客户名称:">
                    <span class="highlight-text">{{form.customerName || '--'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="税号:">
                    <span class="highlight-text">{{ form.invoiceNif || '--' }}</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <dict-tag :options="invoice_regimen" :value="form.customerRegimen" />
                      <dict-tag :options="invoice_calificacion" :value="form.customerCalificacion" />
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item label="公司名称:">
                    <span class="highlight-text">{{form.customerNombre || '--'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="手机:">
                    <span class="highlight-text">{{form.invoicePhone || '--'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="地址:">
                    <span class="highlight-text">{{form.invoiceAddressCountry + ' ' + form.invoiceAddressProvince + ' '
                      + form.invoicePostcode + ' ' + form.invoiceAddressDetail }}</span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-col>

            <!-- 分割线 -->
            <div class="divider vertical"></div>

            <!-- 第2个区域：税率明细 -->
            <el-col class="footer-col" :span="8">
              <div class="footer-content">
                <el-table class="table-container" :data="form.verifacInvoice?.verifacInvoiceDetailList" size="small"
                  style="margin-bottom: 20px;">
                  <el-table-column prop="detailBase" label="Base" sortable align="center" min-width="80">
                    <template #default="scope">
                      <span>{{ formatTwo(scope.row.detailBase) + ' €' }} </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="detailTipoIva" label="IVA%" align="center" min-width="50">
                    <template #default="scope">
                      <span>{{ (scope.row.detailTipoIva || 0 )+ ' %' }} </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="detailCuotaIva" label="IVA" align="center" min-width="80">
                    <template #default="scope">
                      <span>{{ formatTwo(scope.row.detailCuotaIva) + ' €' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="detailTipoRe" label="RE%" align="center" min-width="50">
                    <template #default="scope">
                      <span>{{ (scope.row.detailTipoRe || 0 ) + ' %' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="detailCuotaRe" label="RE" align="center" min-width="80">
                    <template #default="scope">
                      <span>{{ formatTwo(scope.row.detailCuotaRe) + ' €' }}</span>
                    </template>
                  </el-table-column>
                </el-table>
                <el-switch v-model="form.inTax" :active-value="orderInTaxEnum.IN_Tax"
                  :inactive-value="orderInTaxEnum.NOT_IN_TAX" active-text="含税" inactive-text="不含税" inline-prompt
                  :disabled="!canEditStatus"
                  style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949; margin: 0px;padding: 0px;"
                  v-hasPermi="['sales:salesCaja:edit']" size="small" @change="updateDetailPriceAndDiscount()" />
              </div>
            </el-col>

            <!-- 分割线 -->
            <div class="divider vertical"></div>

            <!-- 第3个区域：订单统计数据 -->
            <el-col class="footer-col" :span="6">
              <div class="footer-content">
                <el-descriptions :column="2" size="small" style="margin-top: 10px;">
                  <el-descriptions-item label="销售金额:">
                    <span class="highlight-text">{{ formatTwo(form.totalAmount) + ' €'}} </span>
                  </el-descriptions-item>
                  <el-descriptions-item label="折扣金额:">
                    <span class="highlight-text">{{ formatTwo(form.totalDiscountAmount) + ' €' }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="活动减免:">
                    <span class="highlight-text">{{ formatTwo(form.totalPromotionReduceAmount) + ' €' }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="减免数量:">
                    <span class="highlight-text">{{ form.totalPromotionReduceQuantity ?? 0}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="基础金额:" :span="2">
                    <span class="highlight-text">{{ formatTwo(form.totalBaseAmount) + ' €'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="基础税金额:">
                    <span class="highlight-text">{{ formatTwo(form.totalTaxAmount) + ' €'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="附加税金额:">
                    <span class="highlight-text">{{ formatTwo(form.totalReAmount) + ' €'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="应收金额:" :span="2" class-name="total-label"
                    label-class-name="total-content2">
                    <span>{{ formatTwo(form.totalNetAmount) + ' €'}}</span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-col>

            <!-- 分割线 -->
            <div class="divider vertical"></div>
            <!-- 第4个区域：二维码 -->
            <el-col class="footer-col" :span="2">
              <div class="qrcode">
                <a v-if="form.verifacInvoice?.invoiceQr" :href="form.verifacInvoice.invoiceQr" target="_blank">
                  <qrcode-vue :value="form.verifacInvoice?.invoiceQr || null" :size="120" level="H" />
                </a>
                <el-empty v-else :image-size="40" style="padding: 0px;margin: 0px;" />
                <dict-tag :options="varifac_invoice_type" :value="form.verifacInvoice?.invoiceTipo" />
              </div>
            </el-col>

          </el-row>
        </div>
      </template>
    </el-card>

    <!-- 订单操作记录 -->
    <el-collapse class="card-operation-log">
      <el-collapse-item name="1">
        <template #title>
          <h3 style="margin-left: 20px;">订单操作记录</h3>
        </template>
        <div>
          <el-timeline>
            <el-timeline-item v-for="(activity, index) in operateLog" :key="index"
              :type="getTimelineItemType(activity.actionValue)" :timestamp="activity.time" placement="top">
              {{ activity.operator }} - {{ activity.action }}
              <span v-if="activity.remark"> - - 描述 : </span>
              <span class="remark">{{ activity.remark }}</span>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- 操作意见弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <!-- 强制填写备注 -->
      <el-form :model="approvalForm" label-width="80px">
        <el-form-item :label="getRemarkMessage(currentAction) + ':'"
          v-if="actionRequiresRemark.includes(currentAction)">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="20"
            :placeholder="'请输入' + getRemarkMessage(currentAction)" />
        </el-form-item>
      </el-form>
      <!-- 不强制填写备注 -->
      <span v-if="actionRequiresNoRemark.includes(currentAction)"> 您确认要 {{ dialogTitle }} 吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitOperate">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { onMounted, ref  } from 'vue'
import { ElMessage } from 'element-plus'
import { listSalesOrder, addSalesOrder, updateSalesOrder, getSalesOrder, delSalesOrder, updateByOtherOperate, refundGoods, generateInvoice } from "@/api/sales/salesOrder";
import useUserStore from "@/store/modules/user"
import { useRouter, useRoute } from "vue-router";
import { initOrderDetailData, OrderDirectionEnum, orderSourceEnum, OrderTypeEnum, OrderStatusEnum } from './cashOperationUtil/cashOperationEnum.js';
import { CustomerNormalEnum, CustomerRegimenEnum,  CustomerCalificacionEnum} from "@/views/order/customer/customerEnum.js"
import { InvoiceTypeEnum } from '@/views/verifuc/verifacInvoice/invoiceConstants.js';
import {OpenLocationEnum} from "@/views/product/warehouseLocation/warehouseLocation.js"
import { OrderPayStatusEnum} from "@/views/sales/salesOrderPayments/salesOrderPaymentConstants.js"
import { orderInTaxEnum} from './cashOperationUtil/tenantConfigEnum.js';
import SnowflakeID from '@/utils/SnowflakeID.js';
import CustomerSelect from '@/components/Common/CustomerSelect.vue';
import SalesmanSelect from '@/components/Common/SalesmanSelect.vue';
import SalesActivitySelect from '@/components/Common/SalesActivitySelect.vue';
import WarehouseSelect from '@/components/Common/WarehouseSelect.vue';
import RefundEditTable from "./refundEditTable"
import { computed } from 'vue';
import QrcodeVue from 'qrcode.vue';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const { proxy } = getCurrentInstance();
const { sales_order_source, sales_order_direction, sales_order_type, sales_order_status, sales_order_pay_status, varifac_invoice_type } = proxy.useDict('sales_order_source', 'sales_order_is_hold', 'sales_order_direction', 'sales_order_type', 'sales_order_status', 'sales_order_pay_status', 'varifac_invoice_type');
const {invoice_regimen, invoice_calificacion} = proxy.useDict('invoice_regimen', 'invoice_calificacion');

// ------------------------------ 获取租户配置 start ------------------------------
/** 是否允许编辑 */
const canEditStatus = ref(false)
const orderInTax = ref(orderInTaxEnum.IN_Tax);  // 订单是否含税，默认含税
const openLocation = ref(OpenLocationEnum.DISABLE);  // 开启库位的状态
/** 异步获取租户配置 */
const loadTenantConfig = async () => {
  try {
    const config1 = await proxy.getTenantConfig("orderInTax");
    orderInTax.value = (config1 != null) ? config1 : orderInTaxEnum.IN_Tax;
    const config2 = await proxy.getTenantConfig("openLocation");
    openLocation.value = (config2 != null) ? config2 : OpenLocationEnum.DISABLE;
  } catch (error) {
    console.error("加载租户配置失败:", error);
    // 设置默认值
    orderInTax.value = orderInTaxEnum.IN_Tax;
    openLocation.value = OpenLocationEnum.DISABLE;
  }
}

loadTenantConfig();
// ------------------------------ 获取租户配置 end ------------------------------

const data = reactive({
  form:{
    salesOrderDetailList: [],
  },
  rules:{
    orderInitNo: [
    { required: true, message: '初始订单号不能为空！' , trigger: ['blur','change'] }
    ],
  }
})

const {form, rules} = toRefs(data)

function reset() {
  const snowflake = new SnowflakeID({ objectId: userStore.id});
  const orderInitNo = snowflake.nextId();
  const inTaxConfig = orderInTax || orderInTaxEnum.IN_Tax;
  form.value = {
    orderId: null,
    orderDirection: OrderDirectionEnum.SALES,
    orderInitNo: orderInitNo,
    orderNo: null,
    parentOrderId: null,
    orderSource: orderSourceEnum.SALESMAN,
    warehouseId: null,
    cajaId: null,
    shiftId: null,
    salesmanId: null,
    salesmanName: null,
    customerId: null,
    customerName: null,
    customerRegimen: CustomerNormalEnum.CUSTOMER_REGIMEN_NORMAL,
    customerCalificacion: CustomerNormalEnum.CUSTOMER_CALIFICACION_NORMAL,
    customerPriceLevel: 1,
    customerDiscountRate: 0,
    activityId: null,
    orderType: OrderTypeEnum.PRE_ORDER,
    orderStatus: OrderStatusEnum.INIT,
    orderPayStatus: OrderPayStatusEnum.UN_PAID,
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
    zeroAmount: 0,
    remainAmount: 0,
    verifiedAmount: 0,
    totalGiftQuantity: 0,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    tenantId: null,
    delFlag: null,
    inTax: inTaxConfig,
    operateLog: null,
    salesOrderDetailList: [],
    salesOrderPaymentList: [],
  };
  proxy.resetForm("salesOrderRef");
  canEditStatus.value = true;

}


// 当前订单明细的行数
const salesOrderDetailLength = computed(()=>{
  return form.value.salesOrderDetailList.length || 0;
})

/** 获取选中的客户数据 */
const selectedCustomerData = (data) => {
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
  // 更新价格和折扣
  updateDetailPriceAndDiscount();

}

// 根据客户信息 折扣/价格 更新明细价格/折扣 根据是否含税计算最终金额
const updateDetailPriceAndDiscount = () => {
  if (form.value.salesOrderDetailList.length > 0 ) {
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

/** 获取选中的业务员数据 */
const selectedSalesmanData = (data) => {
  console.log('收银台获取的业务员数据:', data)
  form.value.salesmanId = data?.userId || null;
  form.value.salesmanName = data?.userName || null;
}

/** 获取选中的业务活动数据 */
const selectedSalesActivityData = (data) => {
  console.log('收银台获取的业务活动数据:', data)
  form.value.activityId = data?.activityId || null;
  form.value.activityName = data?.activityName || null;
}

/** 获取选中的仓库 */
const selectedWarehouseData = (data) => {
  console.log('收银台获取的仓库数据:', data)
  form.value.warehouseId = data?.warehouseId || null;
  form.value.warehouseName = data?.warehouseName || null;
}

// -------------------------------- 1 添加明细 start --------------------------------
const onceAddItemLength = 1;  // 每次添加新增的条数
/** 添加商品行 */ 
const addItem = () => {
  // 创建一个空数组来存储n条新记录
  const newItems = Array.from({ length: onceAddItemLength }, () => (
    initOrderDetailData()
  ))
  // 将新记录数组添加到现有数组中
  form.value.salesOrderDetailList.push(...newItems)
}

// -------------------------------- 1 添加明细 end --------------------------------

// -------------------------------- 2 枚举数据 start  ---------------------------------

// 订单操作类型
const OperateType = {
  SAVE: 1,
  SAVE_EDIT: 2,
  PICK: 3,
  UN_PICK: 13,
  CHECK: 4,
  UN_CHECK: 14,
  PACK: 5,
  UN_PACK: 15,
  // 开启库位的确认操作
  CONFIRM: 6,
  UN_CONFIRM: 16,
  // 未开启库位的确认操作
  COMPLETE_PAYMENT: 7,
  UN_COMPLETE_PAYMENT: 17,
  // 生成发票
  GENERATE_INVOICE: 8,
  // 作废
  VOIDED: 9
}

/** 获取时间线项目类型 */ 
const getTimelineItemType = (actionValue) => {
  const typeMap = {
    1: 'info',
    2: 'warning',
    3: 'primary',
    4: 'primary',
    5: 'primary',
    6: 'success',
    7: 'success',
    8: 'info',
    9: 'danger',
    13: 'danger',
    14: 'danger',
    15: 'danger',
    16: 'danger',
    17: 'danger',

  }
  return typeMap[actionValue] || 'info'
}

/** 根据操作返回提示信息 */
function getRemarkMessage(action) {
  const messages = {
    [OperateType.SAVE]: '保存',
    [OperateType.SAVE_EDIT]: '保存修改',
    [OperateType.PICK]: '拣货确认',
    [OperateType.UN_PICK]: '反拣货确认',
    [OperateType.CHECK]: '复核确认',
    [OperateType.UN_CHECK]: '反复核确认',
    [OperateType.PACK]: '打包确认',
    [OperateType.UN_PACK]: '反打包确认',
    [OperateType.CONFIRM]: '确认完成订单',
    [OperateType.UN_CONFIRM]: '反确认完成',
    [OperateType.COMPLETE_PAYMENT]: '确认订单',
    [OperateType.UN_COMPLETE_PAYMENT]: '反确认',
    [OperateType.GENERATE_INVOICE]: '生成发票',
    [OperateType.VOIDED]: '作废订单',
    
  };
  return messages[action] || '备注';
}

// -------------------------------- 2 枚举数据 end  ---------------------------------


// --------------------------------  3 操作部分 start ---------------------------------

// 继续编辑订单
const handleEdit = () => {
 if(form.value.orderSource == orderSourceEnum.CAJA){
  ElMessage.warning("收银台的订单不允许修改！")
 } else {
  canEditStatus.value = true
  addItem();
 }
}

// 保存修改
const handleSaveEdit = () => {
 openApprovalDialog('保存修改', OperateType.SAVE_EDIT)
}

// 删除订单
const handleDelete = () => {
  proxy.$modal.confirm('是否确认删除采购订单初始编号为"' + form.value.orderInitNo + '"的数据项？').then(function() {
    return delSalesOrder(form.value.orderId);
  }).then(() => {
    ElMessage.success("删除成功");
    goBack();
  }).catch((e) => {
    ElMessage.error("删除失败：",e);
  });
}

/** 保存订单 */ 
const handleSave = () => {
  // 与校验表单提交校验一致，此处只做提交之前的预校验 */
  proxy.$refs["salesOrderRef"].validate().then(() => {
    // 必须选择客户
    if(!form.value.customerId){
      ElMessage.error("请选择客户信息！");
      return;
    }
    // 1 过滤空数据
    form.value.salesOrderDetailList = form.value.salesOrderDetailList.filter(item => item.skuId)
    if(salesOrderDetailLength.value <= 0){
      ElMessage.error("订单明细不能为空!");
      addItem();
      return;
    }
    // 2 检查采购条目的输入项 false不通过
    if (!validateItems(form.value.salesOrderDetailList)) {
      return;
    }

    // 3 提交表单
    openApprovalDialog('保存订单', OperateType.SAVE)
    canEditStatus.value = false;
  }) 
}

/** 检查采购条目的必输项 */
const validateItems = (salesOrderDetailList) => {
  for (const item of salesOrderDetailList){
    // 数量校验
    if(form.value.orderDirection == OrderDirectionEnum.SALES){
      if (item.detailQuantity <= 0) {
        ElMessage.error("销售订单明细 数量必须大于0!");
        return false;
      }
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
    if(item.detailTaxRate < 0 || item.detailTaxRate > 100){
      ElMessage.error("订单明细 税率需要在 0-100% 之间，请检查!");
      return false;
    }
    // 折扣率校验
    if (isNaN(item.detailDiscountRate)) {
      console.log("异常的则扣率：",item.detailDiscountRate)
      ElMessage.error("订单明细 折扣率异常，请检查!");
      return false;
    }
    if(item.detailDiscountRate < 0 || item.detailDiscountRate > 100){
      ElMessage.error("订单明细 折扣率需要在 0-100% 之间，请检查!");
      return false;
    }
  }
  return true;
};

/** 拣货 */ 
const handlePick = () => {
  openApprovalDialog('拣货', OperateType.PICK)
}

/** 反拣货 */ 
const handleUnPick = () => {
  openApprovalDialog('反拣货', OperateType.UN_PICK)
}

/** 复核 */ 
const handleCheck = () => {
   openApprovalDialog('复核', OperateType.CHECK)
}

/** 反复核 */ 
const handleUnCheck = () => {
   openApprovalDialog('反复核', OperateType.UN_CHECK)
}

/** 打包 */ 
const handlePack = () => {
  openApprovalDialog('打包', OperateType.PACK)
}

/** 反打包 */ 
const handleUnPack = () => {
  openApprovalDialog('反打包', OperateType.UN_PACK)
}

/** 确认 */ 
const handleConfirm = () => {
  openApprovalDialog('确认完成', OperateType.CONFIRM)
}

/** 反确认 */ 
const handleUnConfirm = () => {
  openApprovalDialog('反确认完成', OperateType.UN_CONFIRM)
}

/** 非库位 - 确认 */ 
const handleCompletePayment = () => {
  openApprovalDialog('确认', OperateType.COMPLETE_PAYMENT)
}

/** 非库位 - 反确认 */ 
const handleUnCompletePayment = () => {
  openApprovalDialog('反确认', OperateType.UN_COMPLETE_PAYMENT)
}

/** 生成发票 */ 
const handleGenerateInvoice = () => {
  openApprovalDialog('生成发票', OperateType.GENERATE_INVOICE)
}

/** 作废 */ 
const handleVoided = () => {
  openApprovalDialog('作废', OperateType.VOIDED)
}

/** 打印 */
const handlePrint = () => {
  console.log("************* 当前的form值 ",form.value)
}

/** 导出 */
const handleExport = () => {
  console.log("************* 点击导出 ")
}

// --------------------------------  3 操作部分 start ---------------------------------

// -------------------------------- 5 审核记录 + 提示弹窗 start ---------------------------------
const dialogVisible = ref(false)  // 提交弹窗状态
const dialogTitle = ref('')       // 提交弹窗标题
const currentAction = ref('')     // 当前操作类型

/** 提交弹窗参数 */ 
const approvalForm = ref({
  remark: ''
})

/** 打开提交操作的弹窗 */ 
const openApprovalDialog = (title, action) => {
  dialogTitle.value = title
  currentAction.value = action
  approvalForm.value.remark = ''
  dialogVisible.value = true
}


// 订单操作记录
const operateLog = ref([])

/** 添加订单操作记录 */ 
const addApprovalLog = (action, status, remark, actionValue) => {
  const newLog = {
    time: new Date().toLocaleString(),
    operator: userStore.name,
    action,
    status,
    remark,
    actionValue: actionValue || ''
  }
  // 1 查找是否存在相同 operator 的记录
  const existingIndex = operateLog.value.findIndex(
    log => log.action === action
  )
  if (existingIndex !== -1) {
    // 2 如果存在，先删除原有记录
    operateLog.value.splice(existingIndex, 1)
  }
  
  // 3 添加新记录（无论是否存在都会添加到最后）
  operateLog.value.push(newLog)
}

/** 恢复预处理数据 */
const parseJson = () => {
  // 恢复json数据
  form.value.operateLog = operateLog.value
}

 /** 提交数据预处理 */ 
const prepareData = () => {
  form.value.operateLog = JSON.stringify(operateLog.value);
  form.value.invoiceTipo = InvoiceTypeEnum.COMPLETA
};

/** 提交数据错误处理函数 */ 
const handleError = (message = "操作失败") => {
  // 恢复 operateLog 的Json格式
  parseJson();
  ElMessage.error(message);
  // 关闭对话框和加载状态
  dialogVisible.value = false;
  RefreshTab()
};

// 是否需要填写原因
const actionRequiresNoRemark = [OperateType.SAVE, OperateType.PICK, OperateType.CHECK, OperateType.PACK, OperateType.CONFIRM, OperateType.COMPLETE_PAYMENT, OperateType.GENERATE_INVOICE];
const actionRequiresRemark = [OperateType.SAVE_EDIT, OperateType.UN_PICK, OperateType.UN_PACK, OperateType.UN_CHECK, OperateType.UN_CONFIRM, OperateType.UN_COMPLETE_PAYMENT, OperateType.VOIDED];

/** 采购订单提交操作 */ 
const submitOperate = async () => {
  // 1 强制输入描述信息 检查
  if (actionRequiresRemark.includes(currentAction.value) && !approvalForm.value.remark) {
    ElMessage.warning(`请输入${getRemarkMessage(currentAction.value)}`);
    return;
  }

  // 3 定义动作及相应状态
  const actions = {
    [OperateType.SAVE]: {
      status: OrderStatusEnum.INIT,
      message: '保存成功',
      actionValue: OperateType.SAVE
    },
    [OperateType.SAVE_EDIT]: {
      status: null,
      message: '保存修改',
      actionValue: OperateType.SAVE_EDIT
    },
    [OperateType.PICK]: {
      status: OrderStatusEnum.PICK,
      message: '拣货',
      actionValue: OperateType.PICK
    },
    [OperateType.UN_PICK]: {
      status: OrderStatusEnum.INIT,
      message: '反拣货',
      actionValue: OperateType.UN_PICK
    },
    [OperateType.CHECK]: {
      status: OrderStatusEnum.CHECK,
      message: '复核',
      actionValue: OperateType.CHECK
    },
    [OperateType.UN_CHECK]: {
      status: OrderStatusEnum.PICK,
      message: '反复核',
      actionValue: OperateType.UN_CHECK
    },
    [OperateType.PACK]: {
      status: OrderStatusEnum.PACK,
      message: '打包',
      actionValue: OperateType.PACK
    },
    [OperateType.UN_PACK]: {
      status: OrderStatusEnum.CHECK,
      message: '反打包',
      actionValue: OperateType.UN_PACK
    },
    [OperateType.CONFIRM]: {
      status: OrderStatusEnum.CONFIRM,
      message: '确认完成',
      actionValue: OperateType.CONFIRM
    },
    [OperateType.UN_CONFIRM]: {
      status: OrderStatusEnum.PACK,
      message: '反确认完成',
      actionValue: OperateType.UN_CONFIRM
    },
    [OperateType.COMPLETE_PAYMENT]: {
      status: OrderStatusEnum.CONFIRM,
      message: '确认',
      actionValue: OperateType.COMPLETE_PAYMENT
    },
    [OperateType.UN_COMPLETE_PAYMENT]: {
      status: OrderStatusEnum.INIT,
      message: '确认',
      actionValue: OperateType.UN_COMPLETE_PAYMENT
    },
    [OperateType.GENERATE_INVOICE]: {
      status: OrderStatusEnum.CONFIRM,
      message: '确认',
      actionValue: OperateType.GENERATE_INVOICE
    },
    [OperateType.VOIDED]: {
      status: OrderStatusEnum.VOIDED,
      message: '作废',
      actionValue: OperateType.VOIDED
    },
  }

  const currentActionConfig = actions[currentAction.value]

  addApprovalLog(dialogTitle.value, currentActionConfig.status, approvalForm.value.remark, currentActionConfig.actionValue);
  form.value.operateType = currentActionConfig.actionValue;
  // 保存编辑不修改状态
  if(currentActionConfig.status){
    form.value.orderStatus = currentActionConfig.status;
  }
  form.value.operateLog = JSON.stringify(operateLog.value);

  try {
    // 1 数据预处理 转json格式
    prepareData();

    // 4 后端 API调用
    if (currentAction.value === OperateType.SAVE) {
      if (!form.value.orderId) {
        // 新增操作
        await addSalesOrder(form.value)
          .then( (res) => {
            if(res.code === 200){
              form.value = res.data
            }
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => handleError("新增操作失败"));
      } else {
        // 修改操作
        await updateSalesOrder(form.value)
          // 修改状态更新操作日志
          .then( () => {
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => handleError("修改操作失败"));
      }
    } else {
      // 非保存操作
      await updateByOtherOperate(form.value)
        // 修改状态更新操作日志
        .then( () => {
          parseJson();
          ElMessage.success(currentActionConfig.message)
          RefreshTab()
        })
        .catch(() => handleError("修改操作失败"));
    }
  } catch (error) {
    console.log("API 调用异常:", error);
    ElMessage.error("API 调用异常，请重试");
  } finally {
    // 关闭对话框和加载状态
    dialogVisible.value = false;
  }
    
}

// -------------------------------- 5 审核记录 + 提示弹窗 end ---------------------------------

// -------------------------------- 6 页面跳转 初始化数据 start ---------------------------------
// 当前要关闭的 tabs
const view = {
  path: route.path,
  name: route.name,
  meta: route.meta,
};

/** 返回上一页 */
const goBack = () => {
  // 关闭当前 tab
  proxy.$tab.closePage(view).then(() => {
    // 跳转页面
    router.push({path: "/salesManager/salesOrder",});
  })
  
};

const RefreshTab = () => {
  // 刷新当前页
  getInfoById()
}

/** 通过传递的 orderId 获取订单信息 */
const getInfoById = async () => {
  // 获取修改传递的参数 productId
  const _orderId = route.query.orderId || form.value.orderId;
  console.log("获取到传递过来的orderId", _orderId)
  if (!_orderId) {
    console.log("传递的参数orderId为空");
    if(!form.value.orderInitNo){
      reset()
    }
    return;
  }

  try {
    // 获取订单信息
    const response = await getSalesOrder(_orderId);
    form.value = response?.data ;

    // 处理 operateLog
    if (form.value.operateLog) {
      try {
        const parsedLog = JSON.parse(form.value.operateLog);
        operateLog.value = parsedLog;
      } catch (error) {
        console.error("operateLog 解析失败:", error);
        operateLog.value = [];
      }
    }
    console.log("初始化数据正常：", form.value);
  } catch (error) {
    console.error("获取订单信息失败:", error);
  }
}

onMounted(() => {
  getInfoById()
  addItem()
});
getInfoById()
// -------------------------------- 6 页面跳转 初始化数据 end ---------------------------------

</script>

<style scoped lang="scss">
.app-container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 允许滚动 */
  padding: 0px;
  margin: 0px;

  .card-data{
    width: 100%;
    height: 100%;
    flex: 1;
    overflow-y: auto; /* 允许滚动 */

    /* 固定底部样式 */
    .fixed-footer {
      position: sticky;
      background: #fff;

      /* 底部列样式 */
      .footer-row {
        display: flex;
        align-items: stretch;

        .footer-col {
          position: relative;

          /* 内容区域样式 */
          .footer-content {
            height: 100%;
            padding: 10px;
            border-radius: 4px;
          }
        }

        /* 分割线样式 */
        .divider {
          &.vertical {
            width: 1.5px;
            background: #ebeef5;
            margin: 0 8px;
          }
        }
      }
    }
  }

  .card-operation-log{
    width: 100%;
    flex-shrink: 0;
    overflow-y: auto; /* 允许滚动 */
  }
}


/* 头部样式 */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .title {
    display: flex;
    align-items: center;
    gap: 10px;
    h2 {
      margin: 0;
    }
  }
  .actions {
    display: flex;
    gap: 10px;
  }
}

.supplier-item{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 金额合计
.total-net-amount {
  font-size: 24px;
  color: #f56c6c;
  font-weight: bold;
}

.operation-card{
  margin: 0px 10px 0px 10px;
  .remark {
    color: #909399;
    font-size: 13px;
    margin: 4px 0 0;
  }
}

:deep(.total-label){
  font-size: 16px;
  color: #f30909;
}

:deep(.total-content2) {
  font-size: 20px;
}

/* 调整描述项样式 */
:deep(.el-descriptions__body) {
  background: transparent;
}

:deep(.el-descriptions__cell) {
  padding-bottom: 8px;
}

.highlight-text {
  color: #409eff;
  /* 高亮文本颜色 */
  font-weight: bold;
}

.qrcode{
  display: grid;
  place-items: center; /* 水平和垂直居中 */
  width: 100%;
  height: 100%;
}



</style>
