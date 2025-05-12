<!-- Detail.vue -->
<template>
  <div class="app-container">
    <el-card class="card-data" size="small">
      <template #header>
        <div class="header-content">
          <div class="title">
            <h2>订单详情</h2>
            <dict-tag :options="sales_order_direction" :value="form.orderDirection"/>
            <dict-tag :options="sales_order_source" :value="form.orderSource"/>
            <dict-tag :options="sales_order_status" :value="form.orderStatus"/>
          </div>
          <div class="actions">
            <!-- 根据不同状态显示不同的操作按钮 -->
            <el-button-group class="ml-4" >
              <!-- 初始状态 -->
              <el-button type="info" v-if="form.orderStatus == OperateStatusEnum.INIT" @click="handleEdit" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']" >
                继续编辑
              </el-button>
              <el-button type="primary"  v-if="form.orderStatus == OperateStatusEnum.INIT" :disabled="!canEditStatus" @click="handleSave" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']" >
                保存
              </el-button>
              <el-button type="success" v-if="form.orderStatus === OperateStatusEnum.INIT" @click="handlePick" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']" >
                提交拣货
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OperateStatusEnum.INIT" @click="handleDelete" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']" >
                删除
              </el-button>
              
              <!-- 拣货状态 -->
              <el-button type="primary" v-if="form.orderStatus === OperateStatusEnum.PICK" @click="handleCheck"  v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']">
                提交复核
              </el-button>
              <el-button type="warning" v-if="form.orderStatus === OperateStatusEnum.PICK" @click="handleUnPick"  v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']" >
                反拣货
              </el-button>
              <el-button type="info" v-if="form.orderStatus == OperateStatusEnum.PICK" @click="handleEdit" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']" >
                继续编辑
              </el-button>
              <el-button type="info" v-if="form.orderStatus == OperateStatusEnum.PICK" :disabled="!canEditStatus" @click="handleSaveEdit" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']" >
                保存修改
              </el-button>

              <!-- 复核状态 -->
              <el-button type="success" v-if="form.orderStatus === OperateStatusEnum.CHECK" @click="handlePack"  v-hasPermi="['sales:salesOrder:approve']" >
                提交打包
              </el-button>
              <el-button type="success" v-if="form.orderStatus === OperateStatusEnum.CHECK" @click="handleUnCheck"  v-hasPermi="['sales:salesOrder:approve']" >
                反复核
              </el-button>
              <el-button type="info" v-if="form.orderStatus == OperateStatusEnum.CHECK" @click="handleEdit" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']" >
                继续编辑
              </el-button>
              <el-button type="info" v-if="form.orderStatus == OperateStatusEnum.CHECK" :disabled="!canEditStatus" @click="handleSaveEdit" v-hasPermi="['sales:salesOrder:add','sales:salesOrder:edit']" >
                保存修改
              </el-button>

              <!-- 打包状态 -->
              <el-button type="warning" v-if="form.orderStatus === OperateStatusEnum.PACK" @click="handleComplete"  v-hasPermi="['sales:salesOrder:approve']" >
                完成打包
              </el-button>
              <el-button type="warning" v-if="form.orderStatus === OperateStatusEnum.PACK" @click="handleUnPack"  v-hasPermi="['sales:salesOrder:approve']" >
                反打包
              </el-button>

              <!-- 完成打包状态 -->
              <el-button type="warning" v-if="form.orderStatus === OperateStatusEnum.COMPLETE" @click="handleConfirm"  v-hasPermi="['sales:salesOrder:approve']" >
                确认订单
              </el-button>
              <el-button type="warning" v-if="form.orderStatus === OperateStatusEnum.COMPLETE" @click="handleUnComplete"  v-hasPermi="['sales:salesOrder:approve']" >
                反完成
              </el-button>

              <!-- 确认状态 -->
               <el-button type="warning" v-if="form.orderStatus === OperateStatusEnum.CONFIRM" @click="handleUnConfirm"  v-hasPermi="['sales:salesOrder:approve']" >
                反确认
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

      <el-form ref="salesOrderRef" :model="form" :rules="rules" label-width="120px"  size="small" :disabled="!canEditStatus">

        <!-- 基本信息 -->
        <el-row >
          <el-form-item label="原始订单编号:" prop="orderInitNo" >
            <el-input v-model="form.orderInitNo" placeholder="系统自动生成" disabled size="small"/>
          </el-form-item>
          <el-form-item label="订单方向:" prop="orderDirection" >
            <el-select v-model="form.orderDirection" placeholder="请选择订单方向" clearable :disabled="!!form.orderId">
              <el-option
                v-for="dict in sales_order_direction"
                :key="dict.value"
                :label="dict.label"
                :value="Number(dict.value)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label=" 业务员:" prop="salesmanID" >
            <SalesmanSelect v-model="form.salesmanName"   @selectedData="selectedSalesmanData" size="small" :disabled="form.orderStatus != OrderStatusEnum.INIT"/>
          </el-form-item>
          <!-- 客户信息 -->
          <el-form-item label="客户信息:" prop="customerId">
            <CustomerSelect v-model="form.customerName"  @selectedData="selectedCustomerData" size="small" :disabled="form.orderStatus != OrderStatusEnum.INIT"/>
          </el-form-item>
          <!-- 仓库信息 -->
          <el-form-item label="仓库信息:" prop="warehouseId">
            <WarehouseSelect v-model="form.warehouseName"   @selectedData="selectedWarehouseData" size="small" :disabled="form.orderStatus != OrderStatusEnum.INIT"/>
          </el-form-item>
          <!-- 业务活动信息 -->
          <el-form-item label="业务活动:" prop="warehouseId">
            <SalesActivitySelect v-model="form.activityName" @selectedData="selectedSalesActivityData" size="small" :disabled="form.orderStatus != OrderStatusEnum.INIT"/>
          </el-form-item>
          <el-form-item label="备注信息:" prop="remark">
            <el-input v-model="form.remark"  placeholder="请输入备注" size="small"/>
          </el-form-item>
        </el-row>

        <!-- 商品明细 -->
        <RefundEditTable :tableData="form.salesOrderDetailList" :customerPriceLevel="form.customerPriceLevel" :customerDiscountRate="form.customerDiscountRate"/>
      </el-form> 

      <!-- 合计信息 -->
      <template #footer >
        <div class="fixed-footer">
          <el-row class="footer-row">
            <!-- 第1个区域：订单配置数据 -->
            <el-col class="footer-col" :span="8">
              <div class="footer-content">
                <el-descriptions :column="2" size="small">
                  <el-descriptions-item label="客户名称:" :span="2">
                    <span class="highlight-text">{{form.customerName || '--'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="税号:" :span="1" >
                    <span class="highlight-text">{{form.invoiceTax || '--'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="手机:" :span="1" >
                    <span class="highlight-text">{{form.invoicePhone || '--'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="地址:" :span="2">
                    <span class="highlight-text">{{form.invoiceAddress || '--'}}</span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-col>

            <!-- 分割线 -->
            <div class="divider vertical"></div>

            <!-- 第3个区域：税率明细 -->
            <el-col class="footer-col" :span="4">
              <div class="footer-content">
                <el-descriptions :column="1" size="small" style="width: 100%;">
                  <el-descriptions-item label="21% 税额:" :span="2">
                    <span class="highlight-text">{{form.customerName || '--'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="10% 税额:" :min-width="100">
                    <span class="highlight-text">{{form.invoiceTax || '--'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="4% 税额:" :min-width="100">
                    <span class="highlight-text">{{form.invoicePhone || '--'}}</span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-col>

            <!-- 分割线 -->
            <div class="divider vertical"></div>

            <!-- 第2个区域：订单统计数据 -->
            <el-col class="footer-col" :span="8">
              <div class="footer-content">
                <el-descriptions :column="4" size="small" style="margin-top: 10px;">
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
                  <el-descriptions-item label="基础金额:" :span="1">
                    <span class="highlight-text">{{ formatTwo(form.totalBaseAmount) + ' €'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="交税金额:" :span="1">
                    <span class="highlight-text">{{ formatTwo(form.totalTaxAmount) + ' €'}}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="应收金额:" :span="2" class-name="total-label"
                    label-class-name="total-content2">
                    <span>{{ formatTwo(form.totalNetAmount) + ' €'}}</span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-col>
          </el-row>
        </div>
      </template>
    </el-card>
  
    <!-- 订单操作记录 -->
    <el-collapse class="card-operation-log">
      <el-collapse-item  name="1" >
        <template #title>
          <h3 style="margin-left: 20px;">订单操作记录</h3>
        </template>
        <div>
          <el-timeline>
            <el-timeline-item v-for="(activity, index) in operateLog" :key="index"
              :type="getTimelineItemType(activity.actionValue)" :timestamp="activity.time" placement="top">
              {{ activity.operator }} - {{ activity.action }}
              <span v-if="activity.remark"> - -  描述 : </span>
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
        <el-form-item :label="getRemarkMessage(currentAction) + ':'" v-if="actionRequiresRemark.includes(currentAction)">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="20" :placeholder="'请输入' + getRemarkMessage(currentAction)" />
        </el-form-item>
      </el-form>
      <!-- 不强制填写备注 -->
      <span v-if="actionRequiresNoRemark.includes(currentAction)"> 您确认要 {{ dialogTitle }} 吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitOperate" >
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
import { listSalesOrder, addSalesOrder, updateSalesOrder, getSalesOrder, delSalesOrder, updateByOtherOperate, refundGoods } from "@/api/sales/salesOrder";
import useUserStore from "@/store/modules/user"
import { useRouter, useRoute } from "vue-router";
import { initOrderDetailData, CajaStatusEnum, ShiftStatusEnum, OrderDirectionEnum, orderSourceEnum, OrderTypeEnum, OrderStatusEnum, OrderIsHoldEnum, OrderPayStatusEnum } from './cashOperationUtil/cashOperationEnum.js';
import SnowflakeID from '@/utils/SnowflakeID.js';
import CustomerSelect from '@/components/Common/CustomerSelect.vue';
import SalesmanSelect from '@/components/Common/SalesmanSelect.vue';
import SalesActivitySelect from '@/components/Common/SalesActivitySelect.vue';
import WarehouseSelect from '@/components/Common/WarehouseSelect.vue';
import RefundEditTable from "./refundEditTable"
import { computed } from 'vue';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const { proxy } = getCurrentInstance();
const { sales_order_source, sales_order_is_hold, sales_order_in_tax, sales_order_direction, sales_order_type, sales_order_status, erp_product_sku_type, sales_order_pay_status } = proxy.useDict('sales_order_source', 'sales_order_is_hold', 'sales_order_in_tax', 'sales_order_direction', 'sales_order_type', 'sales_order_status', 'erp_product_sku_type', 'sales_order_pay_status');


/** 是否允许编辑 */
const canEditStatus = ref(false)

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
    orderSource: orderSourceEnum.SALESMAN,
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
  canEditStatus.value = true;

}


// 当前订单明细的行数
const salesOrderDetailLength = computed(()=>{
  return form.value.salesOrderDetailList.length || 0;
})

/** 获取选中的客户数据 */
const selectedCustomerData = (data) => {
  console.log('收银台获取的客户数据:', data)
  if(data){
    form.value.customerId = data.customerId;
    form.value.customerName = data.customerName; 
    form.value.customerPriceLevel = data.customerLevel?.levelPrice || 1;
    form.value.customerDiscountRate = data.customerLevel?.levelDiscount || 0;
    if(data.salesmanVo){
      form.value.salesmanId = data.salesmanVo?.userId || null;
      form.value.salesmanName = data.salesmanVo?.userName || null;
    } else {
      form.value.salesmanId =  null;
      form.value.salesmanName =  null;
    }
  } else {
    form.value.customerId =  null;
    form.value.customerName =  null; 
    form.value.customerPriceLevel =  1;
    form.value.customerDiscountRate =  0;
  }

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
      console.log("更新后的价格：", item.detailPrice);

      // 更新折扣率
      item.detailDiscountRate = +form.value.customerDiscountRate || 0;
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
  form.value.salesmanId = data?.userId || null;
  form.value.salesmanName = data?.userName || null;
}

/** 获取选中的业务活动数据 */
const selectedSalesActivityData = (data) => {
  console.log('收银台获取的业务活动数据:', data)
  currentSalesActivity.value = data || null;
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
  // 创建一个空数组来存储100条新记录
  const newItems = Array.from({ length: onceAddItemLength }, () => (
    initOrderDetailData()
  ))
  // 将新记录数组添加到现有数组中
  form.value.salesOrderDetailList.push(...newItems)
}

// -------------------------------- 1 添加明细 end --------------------------------

// -------------------------------- 2 枚举数据 start  ---------------------------------

/**
 * 操作状态枚举：1-初始状态 2-拣货状态 3-复核状态 4-打包状态 5-完成状态
 */
const OperateStatusEnum = {
  INIT: 1,
  PICK: 2,
  CHECK: 3,
  PACK: 4,
  COMPLETE: 5,
  CONFIRM: 6,
  VOIDED: 7
}

// 订单状态颜色
const OperateStatusColor = {
  '1':'primary',
  '2':'warning',
  '3':'success',
  '4':'primary',
  '5':'success',
  '6':'info',
  '7':'danger'
}

// 订单状态描述
const OperateStatusName = {
  '1':'初始化',
  '2':'拣货',
  '3':'复核',
  '4':'打包',
  '5':'完成打包',
  '6':'已完成',
  '7':'已作废',
}

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
  COMPLETE: 6,
  UN_COMPLETE: 16,
  CONFIRM: 7,
  UN_CONFIRM: 17,
}

/** 获取时间线项目类型 */ 
const getTimelineItemType = (actionValue) => {
  const typeMap = {
    1: 'info',
    2: 'warning',
    3: 'primary',
    4: 'primary',
    5: 'primary',
    6: 'primary',
    7: 'success',
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
    [OperateType.COMPLETE]: '完成打包',
    [OperateType.UN_COMPLETE]: '反完成打包',
    [OperateType.CONFIRM]: '订单确认',
    [OperateType.UN_CONFIRM]: '订单反确认',
    
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
    // 1 过滤空数据
    form.value.salesOrderDetailList = form.value.salesOrderDetailList.filter(item => item.skuId)
    if(salesOrderDetailLength.value <= 0){
      ElMessage.error("订单明细不能为空!")
      return;
    }
    // 2 检查采购条目的输入项 false不通过
    if (!validateItems(form.value.salesOrderDetailList)) {
      return;
    }

    // 3 提交表单
    openApprovalDialog('保存订单', OperateType.SAVE)
  }) 
}

/** 检查采购条目的必输项 */
const validateItems = (salesOrderDetailList) => {
  salesOrderDetailList.forEach((item) => {
      if (item.detailQuantity == 0) {
        ElMessage.error("订单明细 数量不能为空!");
        return false;
      }
      if (item.detailPrice <= 0) {
        ElMessage.error("订单明细 单价不能小于0!");
        return false;
      }
      if (isNaN(item.detailTaxRate)) {
        ElMessage.error("订单明细 税率异常，请检查!");
        return false;
      }
      if(item.detailTaxRate < 0 || item.detailTaxRate > 100){
        ElMessage.error("订单明细 税率需要在 0-100% 之间，请检查!");
        return false;
      }
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
  )
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

/** 完成打包 */ 
const handleComplete = () => {
  openApprovalDialog('完成打包', OperateType.COMPLETE)
}

/** 反完成打包 */ 
const handleUnComplete = () => {
  openApprovalDialog('反完成打包', OperateType.UN_COMPLETE)
}

/** 确认 */ 
const handleConfirm = () => {
  openApprovalDialog('完成', OperateType.CONFIRM)
}

/** 反确认 */ 
const handleUnConfirm = () => {
  openApprovalDialog('反完成', OperateType.UN_CONFIRM)
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

/** 添加采购订单操作记录 */ 
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
const actionRequiresNoRemark = [OperateType.SAVE, OperateType.DELETE, OperateType.INIT, OperateType.PICK, OperateType.CONFIRM, OperateType.PACK, OperateType.COMPLETE];
const actionRequiresRemark = [OperateType.SAVE_EDIT, OperateType.UN_PICK, OperateType.UN_PACK, OperateType.UN_CHECK, OperateType.UN_COMPLETE, OperateType.UN_CONFIRM];

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
      status: OperateStatusEnum.INIT,
      message: '保存成功',
      actionValue: OperateType.SAVE
    },
    [OperateType.SAVE_EDIT]: {
      status: null,
      message: '保存修改',
      actionValue: OperateType.SAVE_EDIT
    },
    [OperateType.PICK]: {
      status: OperateStatusEnum.PICK,
      message: '拣货',
      actionValue: OperateType.PICK
    },
    [OperateType.UN_PICK]: {
      status: OperateStatusEnum.INIT,
      message: '反拣货',
      actionValue: OperateType.UN_PICK
    },
    [OperateType.CHECK]: {
      status: OperateStatusEnum.CHECK,
      message: '复核',
      actionValue: OperateType.CHECK
    },
    [OperateType.UN_CHECK]: {
      status: OperateStatusEnum.PICK,
      message: '反复核',
      actionValue: OperateType.UN_CHECK
    },
    [OperateType.PACK]: {
      status: OperateStatusEnum.PACK,
      message: '打包',
      actionValue: OperateType.PACK
    },
    [OperateType.UN_PACK]: {
      status: OperateStatusEnum.CHECK,
      message: '反打包',
      actionValue: OperateType.UN_PACK
    },
    [OperateType.COMPLETE]: {
      status: OperateStatusEnum.COMPLETE,
      message: '完成',
      actionValue: OperateType.COMPLETE
    },
    [OperateType.UN_COMPLETE]: {
      status: OperateStatusEnum.PACK,
      message: '反完成',
      actionValue: OperateType.UN_COMPLETE
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
            form.value = res.data
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
  canEditStatus.value = false;
}

/** 通过传递的 orderId 获取订单信息 */
const getInfoById = async () => {
  // 获取修改传递的参数 productId
  const _orderId = route.query.orderId || form.value.orderId;
  console.log("获取到传递过来的orderId", _orderId)
  if (!_orderId) {
    console.log("传递的参数orderId为空");
    reset()
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
  //getInfoById()
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



</style>
