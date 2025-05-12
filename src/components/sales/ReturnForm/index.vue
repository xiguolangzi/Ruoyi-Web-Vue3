<!-- refundGoodsPage.vue -->
<template>
  <div class="return-page">
    <!-- 查询订单 -->
    <el-card class="box-card" shadow="hover" v-if="!form.orderInitNo">
      <template #header>销售订单查询</template>
      <el-input
        v-model="orderInitNo"
        placeholder="请输入或扫描原始订单条码"
        @keyup.enter="fetchOriginalOrder"
        clearable
        style="width: 300px"
        v-focusSelect
      >
        <template #append>
          <el-button :icon="Search" @click="fetchOriginalOrder">查询</el-button>
        </template>
      </el-input>
      <el-button
        type="warning"
        @click="noTicketRefund"
        :loading="submitting"
        style="margin-left: 20px"
      >
        无票退货
      </el-button>
    </el-card>

    <!-- 订单信息 -->
    <el-card v-if="form.orderInitNo" class="box-card" shadow="hover">
      <template #header>原始订单信息</template>
      <el-descriptions :column="3" border size="small" :label-width="80" v-if="refundType == refundTypeEnum.HAS_TICKET">
        <el-descriptions-item label="原始订单号" :width="100" >{{ form.orderInitNo }}</el-descriptions-item>
        <el-descriptions-item label="下单时间" :width="100">{{ form.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付状态" :width="100">{{ form.orderPayStatus }}</el-descriptions-item>
        <el-descriptions-item label="客户" :width="100">{{ form.customId }}</el-descriptions-item>
        <el-descriptions-item label="业务员" :width="100">{{ form.salesmanId }}</el-descriptions-item>
        <el-descriptions-item label="佣金点数" :width="100">{{ form.baseCommissionRate }}</el-descriptions-item>
      </el-descriptions>
      <el-descriptions :column="2" border size="small" :label-width="80" v-else>
        <el-descriptions-item label="退货订单号" :width="100" >{{ form.orderInitNo }}</el-descriptions-item>
        <el-descriptions-item label="客户" :width="100">{{ form.customId }}</el-descriptions-item>
        <el-descriptions-item label="业务员" :width="100">{{ form.salesmanId }}</el-descriptions-item>
        <el-descriptions-item label="佣金点数" :width="100">{{ form.baseCommissionRate }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 商品信息展示 - 有票退货 -->
    <el-card v-if="form.orderInitNo && refundType" class="box-card" shadow="hover" style="margin-top: 10px;">
      <template #header>订单商品列表</template>
      <el-table
        :data="form.salesOrderDetailList"
        border
        size="small"
        height="400"
        row-key="detailId"
      >
        <el-table-column type="selection" width="40" />
        <el-table-column prop="skuCode" label="商品编码"  show-overflow-tooltip />
        <el-table-column prop="skuName" label="商品名称" show-overflow-tooltip/>
        <el-table-column label="SKU 规格" align="left" header-align="center" show-overflow-tooltip>
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
        <el-table-column prop="detailPrice" label="单价"  align="center" width="70"/>
        <el-table-column prop="detailQuantity" label="购买数量"  align="center"  width="70"/>
        <el-table-column prop="unitCode" label="计量单位"  align="center"  width="70"/>
        <el-table-column prop="detailDiscountRate" label="折扣"  align="center" width="45">
          <template #default="scope">
            <span> {{ showDetailDiscountRate(scope.row) || 0  }} % </span>
          </template>
        </el-table-column>
        <el-table-column prop="detailTaxRate" label="税率"  align="center" width="45">
          <template #default="scope">
            <span> {{ scope.row.detailTaxRate || 0  }} % </span>
          </template>
        </el-table-column>
        <el-table-column prop="detailNetAmount" label="总金额"  align="center" width="70">
          <template #default="scope">
            <span> {{ formatTwo(scope.row.detailNetAmount)}} €</span>
          </template>
        </el-table-column> 
        <el-table-column prop="isGift" align="center" label="赠品" width="45">
          <template #default="scope">
            <span :style="{ color: scope.row.isGift == 1 ? 'red' : '' }">{{ scope.row.isGift == 1 ? "是" : '否' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="promotionName" label="活动名称"  align="left" header-align="center" show-overflow-tooltip/>
        <el-table-column prop="refundedQuantity" label="已退数量" align="center" width="70"/>
        <el-table-column label="可退数量" align="center" width="70">
          <template #default="{ row }">
            <span :style="{color : (row.refundedAvailableQuantity - row.refundedCurrentQuantity) <= 0 ? 'red' : 'green'}">{{  row.refundedAvailableQuantity || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="退货数量"  align="center" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.refundedCurrentQuantity"
              :min="0"
              :max="row.refundedAvailableQuantity || 0"
              size="small"
              @change="validateReturnQuantity(row)"
              :disabled="(row.refundedAvailableQuantity || 0) <= 0"
              style="width: 100%"
              v-focusSelect
            />
          </template>
        </el-table-column>
        <el-table-column label="退货金额" align="center" width="80">
          <template #default="{ row }">
            <span> {{ formatTwo(row.detailNetAmount / row.detailQuantity * row.refundedCurrentQuantity)}} €</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 商品信息展示 - 无票退货 -->
    <el-card v-if="form.orderInitNo && !refundType" class="box-card" shadow="hover" style="margin-top: 10px;">
      <template #header>订单商品列表</template>
      <el-table
        :data="form.salesOrderDetailList"
        border
        size="small"
        height="400"
        row-key="detailId"
      >
        <el-table-column type="selection" width="40" />
        <el-table-column prop="skuCode" label="商品编码"  show-overflow-tooltip>
          <template #default="scope">
            <div @click.stop="handleCellClick(scope.row)">
              <!-- 显示模式 - 失去焦点时显示SKU Code -->
              <span v-if="!scope.row.isEditing" style="color: blue;">
                {{ scope.row.skuCode || '请单击选择SKU' }}
              </span>
              
              <!-- 编辑模式 - 聚焦时显示SkuSelect组件 -->
              <SkuSelect 
                v-else
                ref="skuSelectRef" 
                @selectedData="(data) => handleSkuSelected(data, scope.row)"
                @blur="handleBlur(scope.row)"
                style="width: 100%"
                :teleported="true"
              />
            </div>
          </template>
        </el-table-column> 
        <el-table-column prop="skuName" label="商品名称" show-overflow-tooltip/>
        <el-table-column label="SKU 规格" align="left" header-align="center" show-overflow-tooltip>
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
        <el-table-column prop="detailPrice" label="单价"  align="center" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.detailPrice"
              :min="0"
              :max="99999"
              :precision="2"
              size="small"
              @change="updateRefundDataByRow(row)"
              style="width: 100%"
              v-focusSelect
            >
              <template #suffix>
                <span>€</span>
              </template>
            </el-input-number>
          </template>
        </el-table-column>
        <el-table-column prop="detailQuantity" label="退货数量"  align="center" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.detailQuantity"
              :min="0"
              :max="99999"
              size="small"
              @change="updateRefundDataByRow(row)"
              style="width: 100%"
              v-focusSelect
            />
          </template>
        </el-table-column>
        <el-table-column prop="unitCode" label="计量单位"  align="center"  width="70"/>
        <el-table-column prop="detailTaxRate" label="税率"  align="center" width="45">
          <template #default="scope">
            <span> {{ scope.row.detailTaxRate || 0  }} % </span>
          </template>
        </el-table-column>
        <el-table-column label="退货金额" align="center" width="80">
          <template #default="{ row }">
            <span> {{ formatTwo(row.detailNetAmount)}} €</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 退货摘要与原因 -->
    <el-card v-if="totalReturnQuantity > 0" class="box-card" shadow="hover" style="margin-top: 10px;">
      <template #header>退货信息</template>
      <div class="summary-row-flex">
        <el-form label-width="100px" class="form-left">
          <el-form-item label="退货原因">
            <el-input
              v-model="form.remark"
              type="textarea"
              :maxlength="200"
              show-word-limit
              :rows="2"
              placeholder="请输入详细的退货原因"
              style="width: 300px"
            />
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
      <el-button
        type="primary"
        @click="submitReturn"
        :disabled="totalReturnQuantity <= 0 || !form.remark"
        :loading="submitting"
      >
        提交退货
      </el-button>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSalesOrderByOrderInitNo, refundGoods } from '@/api/sales/salesOrder'
import SnowflakeID from '@/utils/SnowflakeID.js';
import useUserStore from "@/store/modules/user";
import { initOrderDetailData, CajaStatusEnum, ShiftStatusEnum, OrderDirectionEnum, orderSourceEnum, OrderTypeEnum, OrderStatusEnum, OrderIsHoldEnum, OrderPayStatusEnum } from "@/views/sales/salesOrder/cashOperationUtil/cashOperationEnum.js";
import SkuSelect from '@/components/Common/SkuSelect.vue';


const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { erp_refunded_reason } = proxy.useDict('erp_refunded_reason');

/** 退货类型 */
const refundTypeEnum = {
  // 有票退货
  HAS_TICKET: true,
  // 无票退货
  NO_TICKET: false
}

const orderInitNo = ref('')   // 查询参数-初始订单号
const submitting = ref(false) // 提交加载状态
const refundType = ref(refundTypeEnum.HAS_TICKET)


// --------------- 无票退货 start -------------------
// 添加编辑状态管理
const editingRow = ref(null);
const skuSelectRef = ref(null);

// 处理单元格点击事件
const handleCellClick = (row) => {
  // 设置当前行为编辑状态
  row.isEditing = true;
  editingRow.value = row;
  
  // 下一个tick聚焦输入框
  nextTick(() => {
    const selectRef = skuSelectRef.value;
    if (selectRef && selectRef.focus) {
      selectRef.focus();
    }
  });
};

// 处理失去焦点事件
const handleBlur = (row) => {
  row.isEditing = false;
  editingRow.value = null;
};

/** 计算含税和不含税的金额 */
function calculateAmounts(salesAmount, taxRate, inTax) {
  const rateValue = (taxRate || 0)/100;
  let detailBaseAmount, detailTaxAmount, detailNetAmount;

  if (inTax === 0) {
    // 含税
    detailBaseAmount = salesAmount / (1 + rateValue);
    detailTaxAmount = salesAmount - detailBaseAmount;
    detailNetAmount = salesAmount;
  } else {
    // 不含税
    detailBaseAmount = salesAmount;
    detailTaxAmount = salesAmount * (rateValue);
    detailNetAmount = salesAmount + detailTaxAmount;
  }

  return { detailBaseAmount, detailTaxAmount, detailNetAmount };
}

/** 初始设置当前行数据 */
const setDetailData = (data, row) =>{
  const {skuId, skuCode, skuName, skuValue, skuPrice, inTax, productRateVo, unitVo } = data
  row.skuId = skuId;
  row.skuCode = skuCode;
  row.skuName = skuName;
  row.skuValue = skuValue;
  row.detailPrice = +skuPrice;
  row.inTax = inTax;
  row.detailTaxRate = productRateVo?.rateValue;
  row.unitCode = unitVo?.unitCode;
  row.detailQuantity = 1

  const price = Number(row.detailPrice) || 0;
  const quantity = Number(row.detailQuantity) || 0;
  const discount = Number(row.detailDiscountRate) || 0;
  
  row.detailAmount = +(price * quantity).toFixed(2);
  row.detailDiscountAmount = +((price * quantity) * discount / 100).toFixed(4);
  row.detailSalesAmount = row.detailAmount - row.detailDiscountAmount;

  // 3 含税/不含税
  const { detailBaseAmount, detailTaxAmount, detailNetAmount } = calculateAmounts(
    row.detailSalesAmount,
    row.detailTaxRate,
    row.inTax
  );
  row.detailBaseAmount = detailBaseAmount;
  row.detailTaxAmount = detailTaxAmount;
  row.detailNetAmount = detailNetAmount;
}

/** 修改行数据 */
const updateRefundDataByRow = (row) =>{
  const price = Number(row.detailPrice) || 0;
  const quantity = Number(row.detailQuantity) || 0;
  const discount = Number(row.detailDiscountRate) || 0;
  
  row.detailAmount = +(price * quantity).toFixed(2);
  row.detailDiscountAmount = +((price * quantity) * discount / 100).toFixed(4);
  row.detailSalesAmount = row.detailAmount - row.detailDiscountAmount;

  // 3 含税/不含税
  const { detailBaseAmount, detailTaxAmount, detailNetAmount } = calculateAmounts(
    row.detailSalesAmount,
    row.detailTaxRate,
    row.inTax
  );
  row.detailBaseAmount = detailBaseAmount;
  row.detailTaxAmount = detailTaxAmount;
  row.detailNetAmount = detailNetAmount;
}

// 修改handleSkuSelected，添加自动失去焦点逻辑
const handleSkuSelected = (data, row) => {
  console.log(data)
  // 当前行赋值
  setDetailData(data, row)

  // 新增一行
  form.value.salesOrderDetailList.push(initOrderDetailData())
  // 同步编辑状态
  setIsEditing()
  // 选择后自动退出编辑模式
  handleBlur(row);
};

const setIsEditing = () => {
  form.value.salesOrderDetailList.forEach((row) => {
    if (row.isEditing === undefined) {
      row.isEditing = false;
    }
  });
};

// 确保每行数据都有isEditing属性
onMounted(() => {
  if(form.value){
    setIsEditing()
  }; 
});


// ----------------- 无票退货 end -----------------

// 表单数据
const data = reactive({
  form: {
    salesOrderDetailList: [], // 初始化为空数组
  },
  rules: {
    orderInitNo: [
      { required: true, message: "初始订单号不能为空", trigger: "blur" }
    ],
  }
});

const { form, rules } = toRefs(data);


// 无票退货
function initForm() {
  const snowflake = new SnowflakeID({ objectId: userStore.id});
  const orderInitNo = snowflake.nextId();
  form.value = {
    orderId: null,
    orderDirection: OrderDirectionEnum.RETURN,
    orderInitNo: orderInitNo,
    orderNo: null,
    parentOrderId: null,
    orderSource: orderSourceEnum.CAJA,
    warehouseId: null,
    cajaId: null,
    shiftId: null,
    salesmanId: null,
    customerId: null,
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
    salesOrderDetailList: [
      initOrderDetailData()
    ],
    salesOrderPaymentList: [],
  };
  submitting.value = false;
}

const noTicketRefund = () => {
  initForm();
  refundType.value = refundTypeEnum.NO_TICKET;
}

/** 获取原始订单 */
const fetchOriginalOrder = async () => {
  refundType.value = refundTypeEnum.HAS_TICKET;
  if (!orderInitNo.value) return ElMessage.warning('请输入订单编号')
  try {
    const res = await getSalesOrderByOrderInitNo(orderInitNo.value)
    form.value = res.data
    console.log("获取的订单数据：",form.value)
  } catch (e) {
    ElMessage.error('查询失败: ' + e.message)
  }
}




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

/**
 *  验证退货数量
 * @param row  
 */
const validateReturnQuantity = (row) => {
  if (row.refundedCurrentQuantity > row.refundedAvailableQuantity) {
    ElMessage.warning(`不能超过最大可退数量 ${row.refundedAvailableQuantity}`)
  }
}

/** 计算退货总数量 */
const totalReturnQuantity = computed(() =>{
  if(refundType.value == refundTypeEnum.HAS_TICKET){
    return form.value.salesOrderDetailList.reduce((sum, item) => sum + (item.refundedCurrentQuantity || 0), 0);
  } else{
    return form.value.salesOrderDetailList.reduce((sum, item) => sum + (item.detailQuantity || 0), 0);
  }
})

/** 计算退货总金额 */
const totalReturnAmount = computed(() => {
  if(refundType.value == refundTypeEnum.HAS_TICKET){
    return form.value.salesOrderDetailList.reduce((sum, item) => sum + ((item.detailNetAmount / item.detailQuantity ) * (item.refundedCurrentQuantity || 0)), 0);
  } else{
    return form.value.salesOrderDetailList.reduce((sum, item) => sum + (item.detailNetAmount || 0), 0);
  }
  
})


/** 提交退货表单 */
const submitReturn = async () => {
  try {
    submitting.value = true
    console.log("提交的表单信息：",form.value)
    refundGoods(form.value).then((res)=>{
      // 退货成功确认退货金额
      ElMessageBox.alert('退货成功，确认退货金额：' + res.data.totalNetAmount + ' €', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'Success'
      }).then(() => {
        ElMessage.success('退货金额确认成功,退货完成！')
        goBack()
      }).catch(() => {
        ElMessage.info('已取消退货金额确认')
      })
    }).catch((error) => { 
      ElMessage.error('退货失败:' + error)
    })

    ElMessage.success('退货成功')
    await fetchOriginalOrder() // 重新拉取更新后的已退数量
  } catch (e) {
    ElMessage.error('退货提交失败: ' + e.message)
  } finally {
    submitting.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  orderInitNo.value = '';
  form.value = { salesOrderDetailList: [] };
  refundType.value = refundTypeEnum.HAS_TICKET;
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
</style>
