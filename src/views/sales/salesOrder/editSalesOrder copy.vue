<!-- Detail.vue -->
<template>
  <div class="app-container">
    <el-card class="card-data" size="small">
      <template #header>
        <div class="header-content">
          <div class="title">
            <h2>订单详情</h2>
            <dict-tag :options="sales_order_direction" :value="form.orderDirection"/>
          </div>
          <div class="actions">
            <!-- 根据不同状态显示不同的操作按钮 -->
            <el-button-group class="ml-4" >
              <!-- 草稿状态 -->
              <el-button type="primary" v-if="form.orderStatus === OptionStatusEnum.INIT" @click="handleSave" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']" >
                保存
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OptionStatusEnum.INIT" @click="handleDelete" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']" >
                删除
              </el-button>
              
              <!-- 已保存状态 -->
              <el-button type="primary" v-if="form.orderStatus === OptionStatusEnum.SAVE" @click="handleSubmitApproval"  v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                提交审核
              </el-button>
              <el-button type="warning" v-if="form.orderStatus === OptionStatusEnum.SAVE" @click="handleEdit"  v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']" >
                继续编辑
              </el-button>

              <!-- 待审核状态 -->
              <el-button type="success" v-if="form.orderStatus === OptionStatusEnum.SUBMIT_APPROVAL" @click="handleApprove"  v-hasPermi="['sales:salesOrder:approve']" >
                审核通过
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OptionStatusEnum.SUBMIT_APPROVAL" @click="handleReject"  v-hasPermi="['sales:salesOrder:approve']" >
                驳回
              </el-button>

              <!-- 已审核状态 -->
              <el-button type="warning" v-if="form.orderStatus === OptionStatusEnum.APPROVE" @click="handleUnApprove"  v-hasPermi="['sales:salesOrder:approve']" >
                反审核
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OptionStatusEnum.APPROVE" @click="handleCloseForStop"  v-hasPermi="['sales:salesOrder:close']" >
                关闭订单
              </el-button>

              <!-- 进行中状态，生成对应的入库单 -->
               <el-button type="warning" v-if="form.orderStatus === OptionStatusEnum.IN_PROGRESS" @click="handleUnApprove"  v-hasPermi="['sales:salesOrder:approve']" >
                反审核
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OptionStatusEnum.IN_PROGRESS" @click="handleCloseForStop"  v-hasPermi="['sales:salesOrder:close']" >
                关闭订单
              </el-button>

              <!-- 关闭状态，重启启用 -->
              <el-button type="info" v-if="form.orderStatus === OptionStatusEnum.CLOSE_FOR_STOP" @click="handleReStart"  v-hasPermi="['sales:salesOrder:close']" >
                重新启用
              </el-button>

            </el-button-group>

            <!-- 通用操作按钮 -->
            <el-button-group>
              <el-button @click="handlePrint">打印</el-button>
              <el-button @click="handleExport">导出</el-button>
              <el-tooltip content="退出编辑" effect="dark" placement="bottom">
                <el-button icon="Close" type="info" @click="goBack" > 退出编辑 </el-button>
              </el-tooltip>
            </el-button-group>
          </div>
        </div>
      </template>

      <el-form ref="salesOrderRef" :model="form" :rules="rules" label-width="120px" :disabled="form.orderStatus != OrderStatusEnum.INIT"  size="small">

        <!-- 基本信息 -->
        <el-row >
          <el-form-item label="原始订单编号:" prop="orderInitNo" >
            <el-input v-model="form.orderInitNo" placeholder="系统自动生成" disabled size="small"/>
          </el-form-item>
          <el-form-item label=" 业务员:" prop="salesmanName">
            <SalesmanSelect v-model="form.salesmanName"   @selectedData="selectedSalesmanData" size="small"/>
          </el-form-item>
          <!-- 客户信息 -->
          <el-form-item label="客户信息:" prop="customerName">
            <CustomerSelect v-model="form.customerName"  @selectedData="selectedCustomerData" size="small"/>
          </el-form-item>
          <!-- 仓库信息 -->
          <el-form-item label="仓库信息:" prop="warehouseName">
            <WarehouseSelect v-model="form.warehouseName"   @selectedData="selectedWarehouseData" size="small"/>
          </el-form-item>
          <!-- 业务活动信息 -->
          <el-form-item label="业务活动:" >
            <SalesActivitySelect @selectedData="selectedSalesActivityData" size="small"/>
          </el-form-item>
          <el-form-item label="备注信息:" prop="remark">
            <el-input v-model="form.remark"  placeholder="请输入备注" size="small"/>
          </el-form-item>
        </el-row>
      

        <!-- 分割线 -->
        <el-divider content-position="left" style="margin: 15px 0px 20px 0px;">
          <strong style="margin-right: 30px;">商品明细</strong>
          <el-button type="primary" size="small" icon="Refresh" @click="handleRefreshStock" v-if="form.orderStatus == OrderStatusEnum.INIT">刷新现存量</el-button>
        </el-divider>

        <!-- 商品明细 -->
        <el-table :data="form.salesOrderDetailList" ref="tableRef" :stripe="true" size="small" style="width: 100%; height: 100%;" >
          <!-- 动态控制展开列显示 -->
          <el-table-column v-if="hasComboItems" type="expand" width="50">
            <template #default="scope">
              <div class="combo-details" v-if="scope.row.skuType == 2">
                <h3>套餐明细</h3>
                <el-table :data="scope.row.detailComboList" border size="small" table-layout="auto" :stripe="true">
                  <el-table-column prop="skuCode" label="SKU条码" />
                  <el-table-column prop="skuName" label="SKU名称" />
                  <el-table-column prop="price" label="单价" />
                  <el-table-column prop="quantity" label="数量" />
                  <el-table-column prop="amount" label="金额" />
                </el-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column type="index" label="序号" align="center" width="50" />
          <el-table-column label="SKU 条码" prop="skuId" align="center" width="150"  show-overflow-tooltip>
            <template #default="scope">
                <!-- 编辑模式 - 聚焦时显示SkuSelect组件 -->
                <SkuSelect 
                  v-model="scope.row.skuCode"
                  @selectedData="(data) => handleSkuSelected(data, scope.row)"
                  style="width: 100%"
                  :teleported="true"
                />
            </template>
          </el-table-column>
          <el-table-column prop="skuCode" label="SKU条码"  show-overflow-tooltip/>
          <el-table-column prop="skuName" label="SKU名称"  show-overflow-tooltip/>
          <el-table-column prop="skuValue" label="规格属性"  show-overflow-tooltip>
            <template #default="scope">
              <div v-if="getSkuValue(scope.row.skuValue) == 'default'">
                --  <!-- 直接显示默认 SKU -->
              </div>
              <div v-else v-for="(item, index) in getSkuValue(scope.row.skuValue)" :key="index">
                <strong>{{ item[0] }}:</strong>
                <span>{{ item[1] }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="detailPrice" label="单价"  >
            <template #default="scope">
              <span>{{ formatTwo(scope.row.detailPrice) }} € </span>
            </template>
          </el-table-column>
          <el-table-column prop="detailQuantity" label="数量"  />
          <el-table-column prop="detailDiscountRate" label="折扣"  >
            <template #default="scope">
              <span>{{ showDetailDiscountRate(scope.row) || 0  }} % </span>
            </template>
          </el-table-column>
          <el-table-column prop="detailDiscountAmount" label="折扣金额"  >
            <template #default="scope">
              <span>{{ formatTwo(scope.row.detailDiscountAmount) }} € </span>
            </template>
          </el-table-column>
          <el-table-column prop="detailSalesAmount" label="销售金额"  >
            <template #default="scope">
              <span>{{ formatTwo(scope.row.detailSalesAmount) }} € </span>
            </template>
          </el-table-column>
          <el-table-column prop="detailTaxRate" label="税率"  >
            <template #default="scope">
              <span>{{ scope.row.detailTaxRate }} % </span>
            </template>
          </el-table-column>
          <el-table-column prop="detailTaxAmount" label="税额"  >
            <template #default="scope">
              <span>{{ formatTwo(scope.row.detailTaxAmount) }} € </span>
            </template>
          </el-table-column>
          <el-table-column prop="detailNetAmount" label="实际金额" >
            <template #default="scope">
              <span>{{ formatTwo(scope.row.detailNetAmount) }} € </span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 套餐确认 对话框 -->
        <ComboConfirmDialog ref="comboDialog" @add-combo-details="handleAddComboDetails" />

      </el-form> 

      <!-- 合计信息 -->
      <template #footer>
        <div style="display: flex; justify-content: space-evenly; align-items: center;">
          <div>
              <span > 合计采购额: {{ formatTwo(form.totalSalesAmount) }} € </span>
          </div>
          <div>
              <span >合计折扣额: {{ formatTwo(form.totalDiscountAmount) }} €  </span>
          </div>
          <div>
            <span > 合计税额: {{ formatTwo(form.totalTaxAmount) }} € </span>
          </div>
          <div>
            <strong class="total-net-amount"> 实际金额: {{ formatTwo(form.totalNetAmount) }} € </strong>
          </div>
        </div>
      </template>
    </el-card>
  
    <!-- 订单操作记录 -->
    <el-card class="card-operation-log">
      <template #header>
        <div class="card-header">
          <span>订单操作记录</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in orderOperateLog" :key="index"
          :type="getTimelineItemType(activity.actionValue)" :timestamp="activity.time" placement="top">
          {{ activity.operator }} - {{ activity.action }}
          <span v-if="activity.remark"> - -  描述 : </span>
          <span class="remark">{{ activity.remark }}</span>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 操作意见弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <!-- 强制填写备注 -->
      <el-form :model="approvalForm" label-width="80px">
        <el-form-item :label="getRemarkMessage(currentAction) + ':'" v-if="actionRequiresRemark.includes(currentAction)">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="20" :placeholder="'请输入' + getRemarkMessage(currentAction)" />
        </el-form-item>
      </el-form>
      <!-- 不强制填写备注 -->
      <span v-if="actionRequiresNoRemark.includes(currentAction)"> 您确认要 {{ dialogTitle }} 吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitApproval" >
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
import { listSalesOrder, addSalesOrder, updateSalesOrder, getSalesOrder, delSalesOrder, refundGoods } from "@/api/sales/salesOrder";
import useUserStore from "@/store/modules/user"
import { useRouter, useRoute } from "vue-router";
import { initOrderDetailData, CajaStatusEnum, ShiftStatusEnum, OrderDirectionEnum, orderSourceEnum, OrderTypeEnum, OrderStatusEnum, OrderIsHoldEnum, OrderPayStatusEnum } from './cashOperationUtil/cashOperationEnum.js';
import SnowflakeID from '@/utils/SnowflakeID.js';
import CustomerSelect from '@/components/Common/CustomerSelect.vue';
import SalesmanSelect from '@/components/Common/SalesmanSelect.vue';
import SalesActivitySelect from '@/components/Common/SalesActivitySelect.vue';
import WarehouseSelect from '@/components/Common/WarehouseSelect.vue';
import SkuSelect from '@/components/Common/SkuSelect.vue';
import ComboConfirmDialog from './cashOperationUtil/ComboConfirmDialog.vue';
import { computed } from 'vue';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const { proxy } = getCurrentInstance();
const { sales_order_source, sales_order_is_hold, sales_order_in_tax, sales_order_direction, sales_order_type, sales_order_status, erp_product_sku_type, sales_order_pay_status } = proxy.useDict('sales_order_source', 'sales_order_is_hold', 'sales_order_in_tax', 'sales_order_direction', 'sales_order_type', 'sales_order_status', 'erp_product_sku_type', 'sales_order_pay_status');


const maxLength = 200; // 允许最大订单条数
const onceAddItemLength = 1;  // 每次添加新增的条数
const comboDialog = ref();
const currentCustomer = ref(null)

const data = reactive({
  form:{
    salesOrderDetailList: [],
  },
  rules:{
    orderInitNo: [
    { required: true, message: '初始订单号不能为空' , trigger: ['blur','change'] }
    ],
  }
})

const {form, rules} = toRefs(data)

function reset() {
  const snowflake = new SnowflakeID({ objectId: userStore.id});
  const orderInitNo = snowflake.nextId();
  form.value = {
    orderId: null,
    orderDirection: OrderDirectionEnum.SALES,
    orderInitNo: orderInitNo,
    orderNo: null,
    parentOrderId: null,
    orderSource: orderSourceEnum.CAJA,
    warehouseId: null,
    cajaId: null,
    shiftId: null,
    salesmanId: null,
    salesmanName: null,
    customerId: null,
    customerName: null,
    activityId: null,
    orderType: OrderTypeEnum.PRE_ORDER,
    orderStatus: OrderStatusEnum.INIT,
    orderIsHold: OrderIsHoldEnum.NORMAL,
    orderPayStatus: OrderPayStatusEnum.SETTLE,
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
    operateLog: null,
    salesOrderDetailList: [],
    salesOrderPaymentList: [],
  };
  proxy.resetForm("salesOrderRef");

}

// 添加计算属性判断是否有套餐商品
const hasComboItems = computed(() => {
  return form.value.salesOrderDetailList.some(item => item.skuType == 2)
})

// 当前订单明细的行数
const salesOrderDetailLength = computed(()=>{
  return form.value.salesOrderDetailList.length || 0;
})

/** 获取选中的客户数据 */
const selectedCustomerData = (data) => {
  console.log('收银台获取的客户数据:', data)
  currentCustomer.value = data || null;
  form.value.customerId = data.customerId || null;
  form.value.customerName = data.customerName || null; 

  // 更新价格和折扣
  updateDetailPriceAndDiscount();

  // 更新客信息
  if(currentCustomer.value?.salesmanVo){
    currentSalesman.value = currentCustomer.value.salesmanVo
  }
}

// 根据客户信息 折扣/价格 更新明细价格/折扣 根据是否含税计算最终金额
const updateDetailPriceAndDiscount = () => {
  if (form.value.salesOrderDetailList.length > 0 ) {
    // 获取客户等级和折扣
    const customerLevel = currentCustomer.value?.customerLevel;
    const levelPrice = customerLevel?.levelPrice;
    const levelDiscount = customerLevel?.levelDiscount || 0;

    console.log("当前客户等级：", customerLevel);
    console.log("当前客户等级价格：", levelPrice);
    console.log("当前客户等级折扣：", levelDiscount);

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
      item.detailPrice = priceMap[levelPrice] || item.skuPrice;
      console.log("更新后的价格：", item.detailPrice);

      // 更新折扣率
      item.detailDiscountRate = levelDiscount;
      console.log("更新后的折扣率：", item.detailDiscountRate);

      // 计算订单金额
      item.detailAmount = item.detailPrice * item.detailQuantity;
      item.detailDiscountAmount = item.detailAmount * (item.detailDiscountRate / 100);
      item.detailSalesAmount = item.detailAmount - item.detailDiscountAmount;

      // 根据是否含税计算净金额、基础金额和税额
      if (item.inTax === 0) {
        // 含税
        item.detailNetAmount = item.detailSalesAmount;
        item.detailBaseAmount = item.detailNetAmount / (1 + item.detailTaxRate / 100);
        item.detailTaxAmount = item.detailNetAmount - item.detailBaseAmount;
      } else if (item.inTax === 1) {
        // 不含税
        item.detailBaseAmount = item.detailSalesAmount;
        item.detailTaxAmount = item.detailBaseAmount * (item.detailTaxRate / 100);
        item.detailNetAmount = item.detailBaseAmount + item.detailTaxAmount;
      }

      console.log("订单明细计算结果：", item);
    });

  }
};

/** 获取选中的业务员数据 */
const selectedSalesmanData = (data) => {
  console.log('收银台获取的业务员数据:', data)
  form.value.salesmanId = data.userId || null;
  form.value.salesmanName = data.userName || null;
}

/** 获取选中的业务活动数据 */
const selectedSalesActivityData = (data) => {
  console.log('收银台获取的业务活动数据:', data)
  currentSalesActivity.value = data || null;
  form.value.activityId = data.activityId || null;
  form.value.activityName = data.activityName || null;
}

/** 获取选中的仓库 */
const selectedWarehouseData = (data) => {
  console.log('收银台获取的仓库数据:', data)
  currentWarehouse.value = data || null;
  form.value.warehouseId = data.warehouseId || null;
}

// -------------------------------- 1 添加明细 start --------------------------------
// 修改handleSkuSelected，添加自动失去焦点逻辑
const handleSkuSelected = (data, row) => {
  console.log("获取的sku数据",data)
  console.log("当前行：", row)
  const { skuId, skuCode, skuImage, skuName, assistName, skuType, comboId, skuValue, batchNo, unitVo, productRateVo, inTax, skuPrice, skuPrice2, skuPrice3, skuPrice4, skuPrice5, skuPrice6 } = data;
  row.detailMainSkuId = null;
  row.skuId = skuId;
  row.skuCode = skuCode;
  row.skuImage = skuImage;
  row.skuName = skuName;
  row.assistName = assistName;
  row.skuType = skuType;
  row.comboId = comboId;
  row.skuValue = skuValue;
  row.batchNo = batchNo;
  row.detailSn = null;
  row.skuUnit = unitVo?.unitCode;
  row.inTax = inTax;
  row.skuPrice = skuPrice;
  row.skuPrice2 = skuPrice2;
  row.skuPrice3 = skuPrice3;
  row.skuPrice4 = skuPrice4;
  row.skuPrice5 = skuPrice5;
  row.skuPrice6 = skuPrice6;

  // 2 数量和金额计算
  row.detailPrice = data.skuPrice;
  row.detailQuantity = 1;
  row.detailAmount = data.skuPrice;
  row.detailDiscountRate = 0;
  row.promotionDiscountRate = 0;
  row.activityDiscountRate = 0;
  row.detailDiscountAmount = 0;
  row.detailSalesAmount = data.skuPrice;
  row.detailTaxRate = productRateVo?.rateValue || 0;
  // 3 含税/不含税
  const { detailBaseAmount, detailTaxAmount, detailNetAmount } = calculateAmounts(
    row.detailSalesAmount,
    row.detailTaxRate,
    row.inTax
  );
  row.detailBaseAmount = detailBaseAmount;
  row.detailTaxAmount = detailTaxAmount;
  row.detailNetAmount = detailNetAmount;
  
  // 4 套餐确认
  if (skuType == 2) {
    comboDialog.value.showComboDialog(row) 
  } 

  // 5 新增一行
  if(salesOrderDetailLength.value < maxLength){
    addItem()
  }
  // 选择后自动退出编辑模式
  console.log("更新后的行数据：",row)
  console.log("当前表单数据：",form.value)
};

/** 计算含税和不含税的金额 */
function calculateAmounts(detailPrice, taxRate, inTax) {
  const rateValue = (taxRate || 0)/100;
  let detailBaseAmount, detailTaxAmount, detailNetAmount;

  if (inTax === 0) {
    // 含税
    detailBaseAmount = detailPrice / (1 + rateValue);
    detailTaxAmount = detailPrice - detailBaseAmount;
    detailNetAmount = detailPrice;
  } else {
    // 不含税
    detailBaseAmount = detailPrice;
    detailTaxAmount = detailPrice * (rateValue);
    detailNetAmount = detailPrice + detailTaxAmount;
  }

  return { detailBaseAmount, detailTaxAmount, detailNetAmount };
}

/** 添加套餐处理套餐明细回调 */ 
const handleAddComboDetails = (data, row) => {
  row.detailComboList  = data.detailComboList;
}

/** 添加商品行 */ 
const addItem = () => {
  // 创建一个空数组来存储100条新记录
  const newItems = Array.from({ length: onceAddItemLength }, () => (
    initOrderDetailData()
  ))
  // 将新记录数组添加到现有数组中
  form.value.salesOrderDetailList.push(...newItems)
}


/** 移除商品行 */ 
const removeItem = (index) => {
  form.value.details.splice(index, 1)
}

// -------------------------------- 1 添加明细 end --------------------------------

// -------------------------------- 2 样式 start ---------------------------------
/**
 * 展示折扣
 * @param row 
 */
const showDetailDiscountRate = (row) => {
  const { detailDiscountRate, promotionDiscountRate, activityDiscountRate } = row;
  const rates = [];
  if (detailDiscountRate > 0) rates.push(detailDiscountRate);
  if (promotionDiscountRate > 0) rates.push(promotionDiscountRate);
  if (activityDiscountRate > 0) rates.push(activityDiscountRate);
  return rates.length > 0 ? rates.join('+') : 0;
};


// -------------------------------- 2 样式 end ---------------------------------
// -------------------------------- 3 枚举数据 start  ---------------------------------

// 订单状态枚举
const OptionStatusEnum = {
  INIT: 1,
}

// 订单状态颜色
const OrderStatusColor = {
  '0':'info',
  '1':'primary',
  '2':'warning',
  '3':'success',
  '4':'warning',
  '5':'success',
  '6':'danger',
}

// 订单状态描述
const OrderStatusName = {
  '0':'草稿',
  '1':'已保存',
  '2':'待审核',
  '3':'已审核',
  '4':'进行中',
  '5':'已完成',
  '6':'已关闭',
}

// 订单操作类型
const OperateType = {
  SAVE: 'save',
  EDIT: 'edit',
  SUBMIT_APPROVAL: 'submitApproval',
  APPROVE: 'approve',
  REJECT: 'reject',
  UN_APPROVE: 'unApprove',
  CLOSE_FOR_STOP: 'closeForStop',
  RESTART: 'restart'
}

/** 获取时间线项目类型 */ 
const getTimelineItemType = (actionValue) => {
  const typeMap = {
    edit: 'info',
    save: 'primary',
    submitApproval: 'warning',
    approve: 'success',
    reject: 'danger',
    unApprove: 'danger',
    closeForStop: 'danger',
    restart:'warning'
  }
  return typeMap[actionValue] || 'info'
}

/** 根据操作返回提示信息 */
function getRemarkMessage(action) {
  const messages = {
    [OperateType.APPROVE]: '审核意见',
    [OperateType.REJECT]: '驳回原因',
    [OperateType.UN_APPROVE]: '反审核原因',
    [OperateType.CLOSE_FOR_STOP]: '关闭原因',
    [OperateType.RESTART]: '重启原因'
  };
  return messages[action] || '备注';
}


// -------------------------------- 3 枚举数据 end  ---------------------------------





// --------------------------------  4 操作部分 start ---------------------------------

// 继续编辑订单
const handleEdit = () => {
 openApprovalDialog('编辑订单', OperateType.EDIT)
}

// 删除订单
const handleDelete = () => {
  proxy.$modal.confirm('是否确认删除采购订单编号为"' + form.value.orderNo + '"的数据项？').then(function() {
    return delPurchaseOrder(form.value.orderId);
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
  proxy.$refs["purchaseOrderRef"].validate().then(() => {
    // 1 过滤空数据
    form.value.details = form.value.details.filter(item => item.skuId)
    console.log(form.value.details)
    if(form.value.details.length === 0){
      ElMessage.error("请输入采购商品信息!")
      return;
    }
    // 2 检查采购条目的输入项 false不通过
    if (!validateItems(form.value.details)) {
      return;
    }
    // 3 检查是否存在相同的skuId+unitPrice  true存在相同的skuId
    if (checkHaveSameSkuIdAndPrice(form.value.details)) {
      return;
    }
    // 4 提交表单
    openApprovalDialog('保存订单', OperateType.SAVE)
  })
  
}
/** 检查采购条目的必输项 */
const validateItems = (submitItems) => {
  for (const item of submitItems) {
    if (item.quantity == null) {
      ElMessage.error("采购明细 数量不能为空!");
      return false;
    }
    if (item.unitPrice == null) {
      ElMessage.error("采购明细 采购单价不能为空!");
      return false;
    }
    if (item.quantity <= 0) {
      ElMessage.error("采购明细 数量必须大于 0 !");
      return false;
    }
    if (item.unitPrice < 0) {
      ElMessage.error("采购明细 采购单价必须大于等于 0 !");
      return false;
    }
  }
  return true;
};

/** 检查采购条目是否有相同的skuId+unitPrice */
const checkHaveSameSkuIdAndPrice = (submitItems) => {
  const skuChecker = new Set();
  const skuPriceChecker = new Set();

  for (const item of submitItems) {
    // 检查价格大于0的只能由唯一的sku
    if (item.unitPrice > 0) {
      let skuKey = item.skuId.toString();
      if (skuChecker.has(skuKey)) {
        ElMessage.error("价格大于 0 的商品明细 sku 重复，请检查！");
        return true;
      }
      skuChecker.add(skuKey);
    }

    // 检查采购明细是否重复(只有价格为0的skuId可以重复)
    let skuPriceKey = item.skuId.toString() + item.unitPrice.toString();
    if (skuPriceChecker.has(skuPriceKey)) {
      ElMessage.error("商品明细 sku 单价 重复，请检查！");
      return true;
    }
    skuPriceChecker.add(skuPriceKey);
  }
  return false;
}

/** 提交审核 */ 
const handleSubmitApproval = () => {
  openApprovalDialog('提交审核', OperateType.SUBMIT_APPROVAL)
}

/** 审核通过 */ 
const handleApprove = () => {
  openApprovalDialog('审核通过', OperateType.APPROVE)
}

/** 驳回 */ 
const handleReject = () => {
   openApprovalDialog('驳回', OperateType.REJECT)
}

/** 反审核 */ 
const handleUnApprove = () => {
  openApprovalDialog('反审核', OperateType.UN_APPROVE)
}

/** 关闭订单 */ 
const handleCloseForStop = () => {
   openApprovalDialog('关闭订单', OperateType.CLOSE_FOR_STOP)
}

const handleReStart = () => {
  openApprovalDialog('重新启用订单', OperateType.RESTART)
}

/** 打印 */
const handlePrint = () => {
  console.log("************* 当前的form值 ",form.value)
}

/** 导出 */
const handleExport = () => {
  console.log("************* 点击导出 ")
}

/** 刷新现存量 */
const handleRefreshStock = async () => {
  await Promise.all(
    form.value.details.map(async (item) => {
      if (item.skuId){
        const res = await selectStockBySkuId(item.skuId)
        item.productSkuVo.skuStock = res.data || 0
      } else {
        item.skuStock = 0
      }
    })
  );
  ElMessage.success('刷新现存量成功！')
};

// --------------------------------  4 操作部分 start ---------------------------------

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

/** 添加采购订单操作记录 */ 
// 订单操作记录
const orderOperateLog = ref([])
const addApprovalLog = (action, status, remark, actionValue) => {
  const newLog = {
    time: new Date().toLocaleString(),
    operator: userStore.name,
    action,
    status,
    remark,
    actionValue: actionValue || ''
  }
  // 查找是否存在相同 operator 的记录
  const existingIndex = orderOperateLog.value.findIndex(
    log => log.action === action
  )
  if (existingIndex !== -1) {
    // 如果存在，先删除原有记录
    orderOperateLog.value.splice(existingIndex, 1)
  }
  
  // 添加新记录（无论是否存在都会添加到最后）
  orderOperateLog.value.push(newLog)
}

/** 恢复预处理数据 */
const parseJson = () => {
  // 恢复json数据
  form.value.operateLog = orderOperateLog.value
}

 /** 提交数据预处理 */ 
const prepareData = () => {
  form.value.operateLog = JSON.stringify(orderOperateLog.value);
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

const actionRequiresRemark = [OperateType.APPROVE, OperateType.REJECT, OperateType.UN_APPROVE, OperateType.CLOSE_FOR_STOP, OperateType.RESTART];
const actionRequiresNoRemark = [OperateType.EDIT, OperateType.SAVE, OperateType.DELETE, OperateType.SUBMIT_APPROVAL];
/** 采购订单提交操作 */ 
const submitApproval = async () => {
  // 1 强制输入描述信息 检查
  if (actionRequiresRemark.includes(currentAction.value) && !approvalForm.value.remark) {
    ElMessage.warning(`请输入${getRemarkMessage(currentAction.value)}`);
    return;
  }

  // 3 定义动作及相应状态
  const actions = {
    [OperateType.SAVE]: {
      status: OptionStatusEnum.SAVE,
      message: '保存成功',
      actionValue: OperateType.SAVE
    },
    [OperateType.EDIT]: {
      status: OptionStatusEnum.EDIT,
      message: '开始编辑',
      actionValue: OperateType.EDIT
    },
    [OperateType.SUBMIT_APPROVAL]: {
      status: OptionStatusEnum.SUBMIT_APPROVAL,
      message: '提交审核 成功!',
      actionValue: OperateType.SUBMIT_APPROVAL
    },
    [OperateType.APPROVE]: {
      status: OptionStatusEnum.APPROVE,
      message: '审核通过!',
      actionValue: OperateType.APPROVE
    },
    [OperateType.REJECT]: {
      status: OptionStatusEnum.SAVE,
      message: '驳回 成功!',
      actionValue: OperateType.REJECT
    },
    [OperateType.UN_APPROVE]: {
      status: OptionStatusEnum.SAVE,
      message: '反审核 成功!',
      actionValue: OperateType.UN_APPROVE
    },
    [OperateType.CLOSE_FOR_STOP]: {
      status: OptionStatusEnum.CLOSE_FOR_STOP,
      message: '关闭订单 成功!',
      actionValue: OperateType.CLOSE_FOR_STOP
    },
    [OperateType.RESTART]: {
      status: OptionStatusEnum.IN_PROGRESS,
      message: '重新启用订单 成功!',
      actionValue: OperateType.RESTART
    }
  }

  const currentActionConfig = actions[currentAction.value]

  addApprovalLog(dialogTitle.value, currentActionConfig.status, approvalForm.value.remark, currentActionConfig.actionValue);
  form.value.operateType = currentActionConfig.actionValue;
  form.value.orderStatus = currentActionConfig.status;
  form.value.operateLog = JSON.stringify(orderOperateLog.value);

  try {
    // 1 数据预处理 转json格式
    prepareData();

    // 4 后端 API调用
    if (currentAction.value === OperateType.SAVE) {
      if (!form.value.orderId) {
        // 新增操作
        await addPurchaseOrder(form.value)
          .then( (res) => {
            form.value.orderId = res.data.orderId
            form.value.orderNo = res.data.orderNo
            parseJson();
            ElMessage.success(currentActionConfig.message)
            RefreshTab()
          })
          .catch(() => handleError("新增操作失败"));
      } else {
        // 修改操作
        await updatePurchaseOrder(form.value)
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
      await updatePurchaseOrderStatus(form.value)
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
  reset()
  // 获取修改传递的参数 productId
  const _orderId = route.query.orderId;
  console.log("获取到传递过来的orderId", _orderId)
  if (!_orderId) {
    console.log("传递的参数orderId为空");
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
        orderOperateLog.value = parsedLog;
      } catch (error) {
        console.error("operateLog 解析失败:", error);
        orderOperateLog.value = [];
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
  }

  .card-operation-log{
    width: 100%;
    height: 150px;
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
    gap: 20px;
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


</style>
