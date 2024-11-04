<!-- PurchaseOrderDetail.vue -->
<template>
  <div class="purchase-order-detail">
    <el-card class="purchase-order">
      <template #header>
        <div class="header-content">
          <div class="title">
            <h2>采购订单详情</h2>
            <el-tag type="info"    v-if="form.orderStatus === OrderStatusEnum.EDIT">草稿</el-tag>
            <el-tag type="primary" v-if="form.orderStatus === OrderStatusEnum.SAVE">已保存</el-tag>
            <el-tag type="warning" v-if="form.orderStatus === OrderStatusEnum.SUBMIT_APPROVAL">待审核</el-tag>
            <el-tag type="success" v-if="form.orderStatus === OrderStatusEnum.APPROVE">已审核</el-tag>
            <el-tag type="warning" v-if="form.orderStatus === OrderStatusEnum.IN_PROGRESS">进行中</el-tag>
            <el-tag type="success" v-if="form.orderStatus === OrderStatusEnum.COMPLETED">已完成</el-tag>
            <el-tag type="danger"  v-if="form.orderStatus === OrderStatusEnum.CLOSE_FOR_STOP">已关闭</el-tag>

          </div>
          <div class="actions">
            <!-- 根据不同状态显示不同的操作按钮 -->
            <el-button-group class="mr-4">
              <!-- 草稿状态 -->
              <el-button type="primary" v-if="form.orderStatus === OrderStatusEnum.EDIT" @click="handleSave" :loading="loading">
                保存
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.EDIT" @click="handleDelete" :loading="loading">
                删除
              </el-button>
              
              <!-- 已保存状态 -->
              <el-button type="primary" v-if="form.orderStatus === OrderStatusEnum.SAVE" @click="handleSubmitApproval" :loading="loading">
                提交审核
              </el-button>
              <el-button type="warning" v-if="form.orderStatus === OrderStatusEnum.SAVE" @click="handleEdit" :loading="loading">
                继续编辑
              </el-button>

              <!-- 待审核状态 -->
              <el-button type="success" v-if="form.orderStatus === OrderStatusEnum.SUBMIT_APPROVAL" @click="handleApprove" :loading="loading">
                审核通过
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.SUBMIT_APPROVAL" @click="handleReject" :loading="loading">
                驳回
              </el-button>

              <!-- 已审核状态 -->
              <el-button type="warning" v-if="form.orderStatus === OrderStatusEnum.APPROVE" @click="handleUnapprove" :loading="loading">
                反审核
              </el-button>
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.APPROVE" @click="handleCloseForStop"
                :loading="loading">
                关闭订单
              </el-button>

              <!-- 进行中状态，生成对应的入库单 -->
              <el-button type="danger" v-if="form.orderStatus === OrderStatusEnum.IN_PROGRESS" @click="handleCloseForStop"
                :loading="loading">
                关闭订单
              </el-button>

            </el-button-group>

            <!-- 通用操作按钮 -->
            <el-button-group>
              <el-button @click="handlePrint">打印</el-button>
              <el-button @click="handleExport">导出</el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" :disabled="form.orderStatus !== OrderStatusEnum.EDIT"  >

        <!-- 基本信息 -->
        <el-row :gutter="20">
            <el-form-item label="订单编号:" prop="orderNo" label-position="left">
              <el-input v-model="form.orderNo" placeholder="系统自动生成" disabled />
            </el-form-item>
            <el-form-item label="供应商：" prop="supplierId">
              <el-autocomplete v-model="form.supplierName" :fetch-suggestions="querySuppliers" placeholder="供应商编码/名称搜索"
                style="width: 100%" @select="handleSupplierSelect" @change="handleSupplierSelect" select-when-unmatched>
                <template #default="{ item }">
                  <div class="supplier-item">
                    <span>{{ item.supplierName }}</span>
                    <span class="supplier-code">{{ item.supplierCode }}</span>
                  </div>
                </template>
              </el-autocomplete>
            </el-form-item>
            <el-form-item label="采购人员:" prop="expectedDate">
              <el-select v-model="form.buyerId" placeholder="请选择采购员" clearable>
                <el-option v-for="item in buyerList" :key="item.userId" :label="item.userName" :value="item.userId" />
              </el-select>
            </el-form-item>
            <el-form-item label="下单日期:" prop="expectedDate">
              <el-date-picker v-model="form.orderDate" type="date" placeholder="选择日期" />
            </el-form-item>
            <el-form-item label="备注信息:" prop="remark">
              <el-input v-model="form.remark"  placeholder="请输入备注" />
            </el-form-item>
        </el-row>
        

        <!-- 分割线 -->
        <el-divider content-position="left">
          <strong style="margin-right: 30px;">商品明细</strong>
          <el-button type="info" size="small" icon="Refresh" @click="handleRefreshStock" v-if="form.orderStatus == OrderStatusEnum.EDIT">刷新现存量</el-button>
        </el-divider>

        <!-- 商品明细 -->

        <el-table :data="form.items" border style="width: 100%"> 
          <el-table-column width="60">
            <template #default="scope">
              <el-button v-if="form.orderStatus === OrderStatusEnum.EDIT" type="danger" circle @click="removeItem(scope.$index)">
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </template>
          </el-table-column>
          <el-table-column type="index" label="序号" width="55"  align="center"/>
          <el-table-column label="商品编码" width="180" align="center" show-overflow-tooltip>
            <template #default="scope">
              <el-autocomplete v-model="scope.row.productCode" :fetch-suggestions="queryProducts"
                placeholder="输入商品编码或名称" @select="(item) => handleProductSelect(item, scope.$index)">
                <template #default="{ item }">
                  <div class="product-item" >
                    <div>{{ item.productCode }} - {{ item.productName }}</div>
                    <small>->库存: {{ item.skuStock }}</small>
                  </div>
                </template>
              </el-autocomplete>
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="商品名称" width="150" align="center" show-overflow-tooltip/>
          <el-table-column prop="skuCode" label="规格编码" width="180" align="center" show-overflow-tooltip />
          <el-table-column prop="skuValue" label="规格属性" width="100" align="center" show-overflow-tooltip>
            <template #default="scope">
              <div v-for="(item, index) in getSkuValue(scope.row.skuValue)" :key="index">
                <strong v-if="item[0] !== '' && item[0] !== 'skuName'">
                  {{ item[0] }}:
                </strong>
                <span v-if="item[0] !== '' && item[1] !== 'skuValue'">
                  {{ item[1] }}
                </span>
                <span v-if="item[0] == '' || item[0] == 'skuName'"> -- -- </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="skuStock" label="现存量"  width="70" v-if="form.orderStatus == OrderStatusEnum.EDIT" align="right" header-align="center" show-overflow-tooltip/>
          <el-table-column prop="skuUnit" label="单位" width="60" align="center" >
            <template #default="scope">
              {{ getUnitCode(scope.row.skuUnit) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量"  align="center" min-width="100">
            <template #default="scope">
              <el-input-number 
                v-model="scope.row.quantity" 
                :precision="0" 
                :min="0"
                :max="999999"
                :controls="false"
                style="width: 100%"
                class="price-input"
                @change="calculateRowAmount(scope.$index)"
              />
            </template>
          </el-table-column>
          <el-table-column label="单价" prop="unitPrice" align="center" min-width="100" >
            <template #default="scope">
              <el-input-number 
                v-model="scope.row.unitPrice" 
                :precision="2" 
                :min="0"
                :max="99999"
                :controls="false"
                style="width: 100%"
                class="price-input"
                @change="calculateRowAmount(scope.$index)"
              >
                <template #suffix>€</template>
              </el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="金额"  align="right" header-align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ formatAmount(scope.row.totalAmount) }} €
            </template>
          </el-table-column>
          <el-table-column prop="discountRate" label="折扣率%" min-width="100"  align="right" header-align="center">
            <template #default="scope">
              <el-input-number 
                v-model="scope.row.discountRate" 
                :precision="0" 
                :min="0"
                :max="100"
                :controls="false"
                style="width: 100%"
                class="price-input"
                @change="calculateRowAmount(scope.$index)"
              >
                <template #suffix>%</template>
              </el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="discountAmount" label="折扣额"   align="right" header-align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ formatAmount(scope.row.discountAmount) }} €
            </template>
          </el-table-column>
          <el-table-column prop="taxRate" label="税率%" min-width="100"  align="right" header-align="center" >
            <template #default="scope">
              <el-input-number 
                v-model="scope.row.taxRate" 
                :precision="0" 
                :min="0"
                :max="100"
                :controls="false"
                style="width: 100%"
                class="price-input"
                @change="calculateRowAmount(scope.$index)"
              >
                <template #suffix>%</template>
              </el-input-number>
            </template>
          </el-table-column>
          <el-table-column prop="taxAmount" label="税额"  align="right" header-align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ formatAmount(scope.row.taxAmount) }} €
            </template>
          </el-table-column>
          <el-table-column prop="finalAmount" label="采购总金额"  align="right" header-align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ formatAmount(scope.row.finalAmount) }} €
            </template>
          </el-table-column>
          <el-table-column prop="shortageQuantity" label="缺货数量"   v-if="form.orderStatus == OrderStatusEnum.IN_PROGRESS || form.orderStatus == OrderStatusEnum.CLOSE_FOR_STOP"/>
        </el-table>

        <div class="table-operations" v-if="form.orderStatus === OrderStatusEnum.EDIT && form.items.length < maxLength">
          <el-button type="primary" @click="addItem">
            <el-icon><Plus /></el-icon>   
            <span> 添加商品 (限制最多 {{ maxLength }} 条流水)</span>
          </el-button>
        </div>

        <!-- 合计信息 -->
        <el-form-item label="合计金额">
          <span class="final-total-amount">{{ formatAmount(finalTotalAmount) }} € </span>
        </el-form-item>
      </el-form>
    </el-card>
  
    <!-- 订单操作记录 -->
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <span>订单操作记录</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in orderOperateLog" :key="index"
          :type="getTimelineItemType(activity.status)" :timestamp="activity.time" placement="top">
          {{ activity.operator }} - {{ activity.action }}
          <span v-if="activity.remark"> - -  描述 : </span>
          <span class="remark">{{ activity.remark }}</span>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 操作意见弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="approvalForm" label-width="80px">
        <el-form-item label="审核意见 ：" v-if="currentAction == 'approve'">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="50" placeholder="请输入审核意见" />
        </el-form-item>
        <el-form-item label="驳回原因 ：" v-if="currentAction == 'reject'">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="50" placeholder="请输入驳回原因" />
        </el-form-item>
        <el-form-item label="反审核原因 ：" v-if="currentAction == 'unapprove'">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="50" placeholder="请输入反审核原因" />
        </el-form-item>
        <el-form-item label="关闭订单原因 ：" v-if="currentAction == 'closeForStop'">
          <el-input v-model="approvalForm.remark" type="textarea" show-word-limit maxlength="50" placeholder="请输入关闭订单原因" />
        </el-form-item>
      </el-form>
      <span v-if="currentAction == 'edit' || currentAction == 'save' || currentAction == 'delete' || currentAction == 'submitApproval'"> 您确认要 {{ dialogTitle }} 吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitApproval" :loading="loading">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { listSupplier } from "@/api/order/supplier"
import { listSku, selectStockBySkuId } from "@/api/product/sku"
import { listBuyer } from "@/api/system/user"
import { listUnit } from "@/api/product/unit"
import useUserStore from "@/store/modules/user"



const { proxy } = getCurrentInstance();
const userStore = useUserStore();
const orderOperateLog = ref([])

// 订单状态枚举
const OrderStatusEnum = {
  EDIT: '0',
  SAVE: '1',
  SUBMIT_APPROVAL: '2',
  APPROVE: '3',
  IN_PROGRESS: '4',
  COMPLETED: '5',
  CLOSE_FOR_STOP: '6',
}

// 允许订单最大条数
const maxLength = 100

// 表单数据
const form = ref({
  orderId: '',
  orderNo: '',
  supplierId: '',
  buyerId: '',
  totalAmount:0,
  discountAmount:0,
  taxAmount:0,
  finalAmount:0,
  orderDate: new Date(),
  orderStatus: OrderStatusEnum.EDIT,
  remark: '',
  items: [],
  operateLog: '',
})

// 表单校验规则
const rules = {
  orderDate: [{ required: true, message: '请选择订单日期' }],
}


// *******************************************  数据展示 ********************************************
/** 格式化金额 - 通过Math.round处理小数点精度(5不进位的BUG) */ 
const formatAmount = (amount) => {
  return amount ? (Math.round(amount * 100) / 100).toFixed(2) : '0.00';
}

/**  skuValue 转化成表格数据 */
const getSkuValue = (skuValueList) => {
  // 将 skuValueList 转化成 [["型号","AA"] , ["尺寸","SS"]]
  const tableData = ref(Object.entries(skuValueList));
  return tableData.value;
};

// 默认选择计量单位
const baseUnit = "0";
const unitList = ref([]);
/** 获取计量单位code */
const getUnitCode = (unitId) => {
  if (!unitList.value) {
    return "";
  }
  if (!unitId) {
    return "";
  }
  let unitCode = "";
  unitList.value.forEach((item) => {
    if (item.unitId === unitId) {
      unitCode = item.unitCode;
    }
  });
  return unitCode;
};
/** 获取计量单位下拉框数据 */
function getUnitList() {
  listUnit({})
    .then((response) => {
      // 产品只赋值基础单位
      unitList.value = response.rows.filter((row) => row.unitType === baseUnit);
      if (unitList.value.length > 0) {
        form.value.unitId = unitList.value[0].unitId;
      } else {
        console.log("提示：请维护计量单位！！");
      }
    })
    .catch((error) => {
      console.error("获取计量单位列表时出错:", error);
    });
}

// *******************************************  数据模糊查询处理 ********************************************
// 供应商 - 初始化列表
const supplierList = ref([])
/** 供应商 - 获取列表 */
const getSuppliers = () => {
  listSupplier().then(response => {
    supplierList.value = response.rows || []
  })
}
/** 供应商 - 自动补全输入框的返回值 */
const querySuppliers = (queryString, cb) => {
  const results = queryString
    ? supplierList.value.filter(supplier =>
      supplier.supplierName.toLowerCase().includes(queryString.toLowerCase()) ||
      supplier.supplierCode.toLowerCase().includes(queryString.toLowerCase())
    )
    : []
  cb(results || [])
}
/** 供应商 -  选择后调用的赋值操作*/ 
const handleSupplierSelect = (supplier) => {
  form.value.supplierCode = supplier.supplierCode
  form.value.supplierName = supplier.supplierName
  form.value.supplierId = supplier.supplierId
  console.log("选择的结果：",form.value)
}

// 采购员 - 初始化列表
const buyerList = ref([])
/** 采购员 - 获取列表 */
const getBuyers = () => {
  listBuyer().then(response => {
    buyerList.value = response.rows || []
  })
}



// 商品 - 初始化商品列表
const skuList = ref([])
/** 商品 - 获取列表 */
const getSkuList = () => {
  listSku().then(response => {
    skuList.value = response.rows || []
    if(skuList.value){
      // 转移 skuValue 的json格式
      skuList.value.map((item) => {
        item.skuValue = JSON.parse(item.skuValue);
      });
    }
    
  })
}
/** 商品 -  自动补全输入框的返回值 */
const queryProducts = (queryString, cb) => {
  const results = queryString
    ? skuList.value.filter(sku =>
      sku.skuCode.toLowerCase().includes(queryString.toLowerCase()) ||
      sku.productName.toLowerCase().includes(queryString.toLowerCase())
    )
    : skuList.value
  cb(results || [])
}
/** 商品 -  选择后调用的赋值操作 */
const handleProductSelect = (sku, index) => {
  const item = form.value.items[index]
  item.orderId = sku.orderId
  item.orderNo = sku.orderNo
  item.skuId = sku.skuId
  item.productName = sku.productName
  item.productCode = sku.productCode
  item.skuCode = sku.skuCode
  item.skuValue = sku.skuValue
  item.skuStock = sku.skuStock
  item.skuUnit = sku.skuUnit
}

/** 添加商品行 */ 
const addItem = () => {
  // 创建一个空数组来存储10条新记录
  const newItems = Array.from({ length: 10 }, () => ({
    detailId: '',
    orderId: form.value.orderId,
    orderNo: form.value.orderCode,
    skuId: '',
    productName: '',
    productCode: '',
    skuCode: '',
    skuValue: '',
    skuStock: 0,
    unitPrice: null,
    quantity: 1,
    totalAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    taxRate: 0,
    taxAmount: 0,
    finalAmount: 0,
    shortageQuantity: 0,
  }))
  // 将新记录数组添加到现有数组中
  form.value.items.push(...newItems)
}

/** 移除商品行 */ 
const removeItem = (index) => {
  form.value.items.splice(index, 1)
}

// ********************************************  计算逻辑 ********************************************
/** 计算金额*/
const calculateRowAmount = (index) => {
  const item = form.value.items[index]
  item.totalAmount = item.unitPrice * item.quantity
  item.discountAmount = item.totalAmount * item.discountRate * 0.01
  item.taxAmount = (item.totalAmount - item.discountAmount) * item.taxRate * 0.01
  item.finalAmount = item.totalAmount - item.discountAmount + item.taxAmount
}

/** 合计金额 */ 
const finalTotalAmount = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (item.finalAmount || 0), 0)
})


// ********************************************  操作 ********************************************

// 继续编辑订单
const handleEdit = () => {
 openApprovalDialog('编辑订单', 'edit')
}

// 删除订单
const handleDelete = () => {
  proxy.$modal.confirm('是否确认删除采购订单编号为"' + form.value.orderNo + '"的数据项？').then(function() {
    return delPurchaseOrder(form.value.orderId);
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

// 保存订单
const handleSave = () => {
  openApprovalDialog('保存订单', 'save')
}



// 提交审核
const handleSubmitApproval = () => {
  openApprovalDialog('提交审核', 'submitApproval')
}

// 审核通过
const handleApprove = () => {
  openApprovalDialog('审核通过', 'approve')
}

// 驳回
const handleReject = () => {
   openApprovalDialog('驳回', 'reject')
}

// 反审核
const handleUnapprove = () => {
  openApprovalDialog('反审核', 'unapprove')
}

// 关闭订单
const handleCloseForStop = () => {
   openApprovalDialog('关闭订单', 'closeForStop')
}

/** 打印 */
const handlePrint = () => {
  console.log("************* 当前的form值 ",form.value)
}

/** 刷新现存量 */
const handleRefreshStock = async () => {
  await Promise.all(
    form.value.items.map(async (item) => {
      if (item.skuId){
        const res = await selectStockBySkuId(item.skuId)
        console.log("查询结果：*-******",res)
        console.log("查询结果：*-******2",res.data)
        item.skuStock = res.data
      } else {
        item.skuStock = 0
      }
    })
  );
  ElMessage.success('刷新现存量成功！')
};

// **************************************** 审核记录 + 提示弹窗 ****************************************
// 状态和加载
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentAction = ref('')

// 审核表单
const approvalForm = ref({
  remark: ''
})

/** 打开操作提示弹窗 */ 
const openApprovalDialog = (title, action) => {
  dialogTitle.value = title
  currentAction.value = action
  approvalForm.value.remark = ''
  dialogVisible.value = true
}

/** 添加订单操作记录 */ 
const addApprovalLog = (action, status, remark) => {
  const newLog = {
    time: new Date().toLocaleString(),
    operator: userStore.name,
    action,
    status,
    remark
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

// 获取时间线项目类型
const getTimelineItemType = (orderStatus) => {
  const typeMap = {
    0: 'info',
    1: 'primary',
    2: 'warning',
    3: 'success',
    6: 'danger'
  }
  return typeMap[orderStatus] || 'info'
}

// 提交审批
const submitApproval = () => {
  if (currentAction.value == 'approve' && !approvalForm.value.remark) {
    ElMessage.warning('请输入审核意见')
    return
  }

  if (currentAction.value == 'reject' && !approvalForm.value.remark) {
    ElMessage.warning('请输入驳回原因')
    return
  }

  if (currentAction.value == 'unapprove' && !approvalForm.value.remark) {
    ElMessage.warning('请输入反审核原因')
    return
  }

  if (currentAction.value == 'closeForStop' && !approvalForm.value.remark) {
    ElMessage.warning('请输入关闭订单原因')
    return
  }

  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    const actions = {
      save: {
        status: OrderStatusEnum.SAVE,
        message: '保存成功'
      },
      edit: {
        status: OrderStatusEnum.EDIT,
        message: '开始编辑'
      },
      submitApproval: {
        status: OrderStatusEnum.SUBMIT_APPROVAL,
        message: '提交审核 成功!'
      },
      approve: {
        status: OrderStatusEnum.APPROVE,
        message: '审核通过!'
      },
      reject: {
        status: OrderStatusEnum.SAVE,
        message: '驳回 成功!'
      },
      unapprove: {
        status: OrderStatusEnum.SAVE,
        message: '反审核 成功!'
      },
      closeForStop: {
        status: OrderStatusEnum.CLOSE_FOR_STOP,
        message: '关闭订单 成功!'
      }
    }

    const currentActionConfig = actions[currentAction.value]
    form.value.orderStatus = currentActionConfig.status
    addApprovalLog(
      dialogTitle.value,
      currentActionConfig.status,
      approvalForm.value.remark
    )

    ElMessage.success(currentActionConfig.message)
    dialogVisible.value = false
    loading.value = false
  }, 800)
}


getUnitList()
getSkuList()
getBuyers()
getSuppliers()

</script>

<style scoped lang="scss">
.purchase-order {
  margin: 0px 10px 0px 10px;
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


// 商品搜索展示框
.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
// 输入框对齐方式
.price-input :deep(.el-input__inner) {
  text-align: right;     /* 文本右对齐 */
  padding-right: 3px;   /* 为欧元符号留出空间 */
}
// 金额合计
.final-total-amount {
  font-size: 18px;
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