<template>
  <div class="ap-writeOff-container">
    <!-- 查询条件 -->
    <el-form :inline="true" :model="queryParams" class="demo-form-inline">
      <el-form-item label="辅助类型:" prop="assistType">
        <el-select v-model="queryParams.assistType" placeholder="请选择客户类型"  @keyup.enter="handleQuery" @change="changeQueryParamsAssistType" clearable>
          <el-option
            v-for="dict in finance_assist_type"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          ></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="选择客户:" prop="assistId" v-if="queryParams.assistType == AssistTypeEnum.ASSIST_TYPE_CUSTOMER">
        <!-- 客户 -->
        <el-select v-model="queryParams.assistId" placeholder="请选择客户" clearable  filterable @change="changeQueryParamsAssistId" >
          <el-option
            v-for="customer in customerList"
            :key="customer.customerId"
            :label="customer.customerName"
            :value="customer.customerId"
            :disabled="customer.customerStatus != '0'"
          >
            <span>{{ '客户名称：' + customer.customerName + ' ---- ' + '客户编码：' + customer.customerCode }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择供应商:" prop="assistId" v-if="queryParams.assistType == AssistTypeEnum.ASSIST_TYPE_SUPPLIER">
        <!-- 供应商 -->
        <el-select v-model="queryParams.assistId" placeholder="请选择供应商" clearable  filterable @change="changeQueryParamsAssistId" >
          <el-option
            v-for="supplier in supplierList"
            :key="supplier.supplierId"
            :label="supplier.supplierName"
            :value="supplier.supplierId"
            :disabled="supplier.supplierStatus != '0'"
          >
            <span>{{ '供应商名称：' + supplier.supplierName + ' ---- ' + '供应商编码：' + supplier.supplierCode }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择员工:" prop="assistId" v-if="queryParams.assistType == AssistTypeEnum.ASSIST_TYPE_EMPLOYEE">
        <!-- 员工 -->
        <el-select v-model="queryParams.assistId" placeholder="请选择员工" clearable  filterable @change="changeQueryParamsAssistId" >
          <el-option
            v-for="user in userList"
            :key="user.userId"
            :label="user.userName"
            :value="user.userId"
            :disabled="user.status != '0'"
          >
            <span>{{ '员工名称：' + user.userName + ' ---- ' + '员工昵称：' + user.nickName }}</span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item >
        <el-button type="primary" @click="handleQuery"> 查询 </el-button>
        <el-button type="success" @click="handleWriteOff" style="margin-left: 50px;"> 点击核销 </el-button>
      </el-form-item>
    </el-form>

    <!-- 待核销列表 -->
    <div class="list-container">
      <el-row :gutter="20">
        <!-- 应付单列表 -->
        <el-col :span="12">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>待核销 应付单</span>
                <el-tooltip content="对费用登记流水进行核销" placement="top">
                  <el-icon color="red"><question-filled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <el-table
              :data="invoiceList"
              style="width: 100%"
              :summary-method="getSummaryRow" show-summary
            >
              <el-table-column prop="invoiceFlowNo" label="费用登记流水编码" min-width="130" show-overflow-tooltip />
              <el-table-column prop="invoiceTotalNetAmount" label="应付金额" align="right" header-align="center" >
                <template #default="scope">
                  <span :style="{ color: scope.row.invoiceTotalNetAmount < 0 ? 'red' : '' }" >{{ formatTwo(scope.row.invoiceTotalNetAmount) }} € </span>
                </template>
              </el-table-column>
              <el-table-column prop="verifiedAmount" label="已核销金额"  align="right" header-align="center">
                <template #default="scope">
                  <span :style="{ color: scope.row.verifiedAmount < 0 ? 'red' : '' }" >{{ formatTwo(scope.row.verifiedAmount) }} € </span>
                </template>
              </el-table-column>
              <el-table-column prop="remainAmount" label="未核销金额" align="right" header-align="center">
                <template #default="scope">
                  <span :style="{ color: scope.row.remainAmount < 0 ? 'red' : '' }" >{{ formatTwo(scope.row.remainAmount) }} € </span>
                </template>
              </el-table-column>
              <el-table-column prop="paymentDueDate" label="应付日期" align="right" header-align="center" show-overflow-tooltip/>
              <el-table-column prop="writeOffAmount" label="核销金额" min-width="120" align="right" header-align="center">
                <template #default="scope">
                  <el-input-number v-model="scope.row.writeOffAmount" placeholder="核销金额" 
                    :max='scope.row.remainAmount < 0 ? 0 : scope.row.remainAmount' 
                    :min='scope.row.remainAmount < 0 ? scope.row.remainAmount : 0' 
                    :precision='2' :controls="false"  ref="inputNumber" @focus="handleFocus" 
                    :class="scope.row.writeOffAmount < 0 ? 'negative-input' : ''" style="width: 100%;"
                    @change="handleChangeInvoiceWriteOffAmount(scope.row)"
                  >
                    <template #suffix>
                      <span>€</span>
                    </template>
                  </el-input-number>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <!-- 收付款单列表 -->
        <el-col :span="12">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>待核销 收/付款单</span>
                <el-tooltip content="日记账流水: 正数为收入流水，负数为支出流水" placement="top">
                  <el-icon color="red"><question-filled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <el-table
              :data="fundFlowDetailList"
              style="width: 100%"
              :summary-method="getSummaryRow2" show-summary
            >
              <el-table-column prop="flowNo" label="日记账流水号" min-width="130" show-overflow-tooltip/>
              <el-table-column prop="detailAmount" label="收/付金额" align="right" header-align="center">
                <template #default="scope">
                  <span :style="{ color: scope.row.detailAmount < 0 ? 'red' : '' }" >{{ formatTwo(scope.row.detailAmount) }} € </span>
                </template>
              </el-table-column>
              <el-table-column prop="verifiedAmount" label="核销金额" align="right" header-align="center">
                <template #default="scope">
                 <span :style="{ color: scope.row.verifiedAmount < 0 ? 'red' : '' }" >{{ formatTwo(scope.row.verifiedAmount) }} € </span>
                </template>
              </el-table-column>
              <el-table-column prop="remainAmount" label="未核销金额" align="right" header-align="center">
                <template #default="scope">
                  <span :style="{ color: scope.row.remainAmount < 0 ? 'red' : '' }" >{{ formatTwo(scope.row.remainAmount) }} € </span>
                </template>
              </el-table-column>
              <el-table-column prop="flowTime" label="交易日期" align="right" header-align="center"/>
              <el-table-column prop="writeOffAmount" label="核销金额" min-width="120" align="right" header-align="center">
                <template #default="scope">
                  <el-input-number v-model="scope.row.writeOffAmount" placeholder="核销金额" 
                    :max='scope.row.remainAmount < 0 ? 0 : scope.row.remainAmount' 
                    :min='scope.row.remainAmount < 0 ? scope.row.remainAmount : 0' 
                    :precision='2' :controls="false"  ref="inputNumber2" @focus="handleFocus2" 
                    :class="scope.row.writeOffAmount < 0 ? 'negative-input' : ''" style="width: 100%;"
                    @change="handleChangeFundFlowWriteOffAmount(scope.row)"
                  >
                    <template #suffix>
                      <span>€</span>
                    </template>
                  </el-input-number>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 核销弹窗 -->
    <el-dialog v-model="writeOffDialogVisible" title="确认核销？" width="500px">
      <div style="margin: 0px 20px;">
        <strong >备注信息:</strong>
        <el-input v-model="form.remark" placeholder="请输入备注信息" type="textarea" maxlength="20" show-word-limit :rows="1" style="margin-top: 10px;"/>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="writeOffDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmWriteoff">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { listSupplier} from "@/api/order/supplier";
import { listCustomer} from "@/api/order/customer";
import { listUser } from "@/api/system/user";
import { getCostInvoiceListByAssist, getFundFlowDetailListByAssist } from "@/api/finance/writeOff"
import {  addWriteOff, updateWriteOff } from "@/api/finance/writeOff";



const { proxy } = getCurrentInstance();
const { finance_assist_type } = proxy.useDict('finance_assist_type');

// ------------------------------------ 1 查询条件 start ------------------------------------
// 查询条件
const queryParams = ref({
  assistType: null,
  assistId: null
})

/* 查询条件修改辅助项类型 */
const changeQueryParamsAssistType = () => {
  queryParams.value.assistId = null
  // 待核销数据
  invoiceList.value = []        
  fundFlowDetailList.value = [] 
  reset()
  
}

/* 查询条件修改辅助项Id */
const changeQueryParamsAssistId = () => {
  // 待核销数据
  invoiceList.value = []        
  fundFlowDetailList.value = [] 
  reset()
}

/** 初始化数 */
const reset = () => {
  // form表单数据
  form.value = {
    writeOffId: null,
    writeOffType: null,
    writeOffNo: null,
    writeOffTotalAmount: null,
    writeOffTime: null,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    remark: null,
    tenantId: null,
    writeOffDetailList: []
  };

}

/** 辅助项类型 */
const  AssistTypeEnum = {
  // 客户
  ASSIST_TYPE_CUSTOMER: '1',
  // 供应商
  ASSIST_TYPE_SUPPLIER: '2',
  // 员工
  ASSIST_TYPE_EMPLOYEE: '3'
}

const supplierList = ref([])
const customerList = ref([])
const userList = ref([])
listSupplier()
  .then(
    response => { supplierList.value = response.rows }
  )
  .catch(
    error => {ElMessage.error("获取供应商列表时出错:",error)}
  )
listCustomer()
  .then(
    response => { customerList.value = response.rows }
  )
  .catch(
    error => { ElMessage.error("获取客户列表时出错:",error) }
  )
listUser()
  .then(
    response => { userList.value = response.rows }
  )
  .catch(
    error => { ElMessage.error("获取客户列表时出错:",error) }
  )

// ------------------------------------ 1 查询条件 end ------------------------------------

// ------------------------------------ 2 表单 输入框聚焦选中 start ------------------------------------
const inputNumber  = ref({}); // 使用对象存储各列引用
const inputNumber2  = ref({}); 

// 聚焦时选中内容
const handleFocus = () => {
  const input = inputNumber.value?.$el.querySelector("input");
  if (input) {
    input.select(); // 选中输入框内的所有文本
  }
};

// 聚焦时选中内容
const handleFocus2 = () => {
  const input = inputNumber2.value?.$el.querySelector("input");
  if (input) {
    input.select(); // 选中输入框内的所有文本
  }
};

// ------------------------------------ 2 表单 输入框聚焦选中 end ----------------------

// ------------------------------------ 3合计 start ------------------------------------
/** 合计行 - 计算借方总金额 */
const getSummaryRow = (param) => {
  const { columns, data } = param
  const sums = []
  
  columns.forEach((column, index) => {
    // 只计算特定列
    if (column.property === 'writeOffAmount') {
      const totalAmount = data.reduce((sum, item) => {
        const value = Number(item.writeOffAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum
      }, 0)
      sums[index] = `${totalAmount.toFixed(2)} € `
    } else if (column.property === 'invoiceTotalNetAmount') {
      const totalAmount = data.reduce((sum, item) => {
        const value = Number(item.invoiceTotalNetAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum
      }, 0)
      sums[index] = `${totalAmount.toFixed(2)} € `

    } else if (column.property === 'verifiedAmount') {
      const totalAmount = data.reduce((sum, item) => {
        const value = Number(item.verifiedAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum
      }, 0)
      sums[index] = `${totalAmount.toFixed(2)} € `

    } else if (column.property === 'remainAmount') {
      const totalAmount = data.reduce((sum, item) => {
        const value = Number(item.remainAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum
      }, 0)
      sums[index] = `${totalAmount.toFixed(2)} € `

    } else {
      // 其他列显示"合计"或留空
      sums[index] = column.property === 'paymentDueDate' ? '本次核销 :' : ''
    }
  })
  
  return sums
}

const getSummaryRow2 = (param) => {
  const { columns, data } = param
  const sums = []
  
  columns.forEach((column, index) => {
    // 只计算特定列
    if (column.property === 'writeOffAmount') {
      // 计算借方总金额
      const totalAmount = data.reduce((sum, item) => {
        const value = Number(item.writeOffAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum
      }, 0)
      sums[index] = `${totalAmount.toFixed(2)} € `
    }  else {
      // 其他列显示"合计"或留空
      sums[index] = column.property === 'flowTime' ? '合计核销 :' : ''
    }
  })
  
  return sums
}

// ------------------------------------ 3 合计 end ------------------------------------

// ------------------------------------ 4 获取待核销数据 start ------------------------------------
const invoiceList = ref([])         // 待核销数据
const fundFlowDetailList = ref([])  // 付款单列表

// 查询方法
const handleQuery = async () => {
  // 获取应付单数据 - 费用登记数据
  getCostInvoiceListByAssist(queryParams.value).then(response => {
    invoiceList.value = response.rows
  })

  // 获取付款单数据 - 日记账数据
  getFundFlowDetailListByAssist(queryParams.value).then(response => {
    fundFlowDetailList.value = response.rows
  })

}

// ------------------------------------ 4 获取待核销数据 end ------------------------------------

// ------------------------------------ 5 校验核销数据 + 计算核销总数据 start ---------------------

const handleChangeInvoiceWriteOffAmount = (row) => {
  if (row.invoiceTotalNetAmount > 0 && row.writeOffAmount < 0) {
    row.writeOffAmount = null
    ElMessage.error('核销金额 需要与 应付金额 正负数一致!')
  }
  if (row.invoiceTotalNetAmount < 0 && row.writeOffAmount > 0) {
    row.writeOffAmount = null
    ElMessage.error('核销金额 需要与 应付金额 正负数一致!')
  }
}

const handleChangeFundFlowWriteOffAmount = (row) => {
   if (row.detailAmount > 0 && row.writeOffAmount < 0) {
    row.writeOffAmount = null
    ElMessage.error('核销金额 需要与 收/付金额 正负数一致!')
  }
  if (row.detailAmount < 0 && row.writeOffAmount > 0) {
    row.writeOffAmount = null
    ElMessage.error('核销金额 需要与 应付金额 正负数一致!')
  }
}


// ------------------------------------ 5 校验核销数据 + 计算核销总数据 end ---------------------

// ------------------------------------ 6 核销操作 start ---------------------
const formDataByInvoiceList = ref([])         // 待核销数据
const formDataByFundFlowDetailList = ref([])  // 付款单列表
const invoiceTotalWriteOffAmount = ref(0)   // 费用登记核销总金额
const fundFlowTotalWriteOffAmount = ref(0)  // 账户流水核销总金额
const writeOffDialogVisible = ref(false)      // 核销弹窗
const writeOffResult = ref(false)   // 核销试算平衡 true/false

// form 表单
const form = ref({
  writeOffId: null,
  writeOffType: null,
  writeOffNo: null,
  writeOffTotalAmount: null,
  writeOffTime: null,
  createTime: null,
  createBy: null,
  updateTime: null,
  updateBy: null,
  remark: null,
  tenantId: null,
  writeOffDetailList: [],
});

// 点击核销按钮
const handleWriteOff = () => {
  // 检查核销数据
  if (!checkWriteOffData()) {
    return ;
  }
  writeOffDialogVisible.value = true
}

/** 检查核销数据 */
const checkWriteOffData = () => {
  
  // 1 必须要有核销数据(不能同时为空)
  formDataByInvoiceList.value = invoiceList.value.filter(item => item.writeOffAmount !== null && item.writeOffAmount !== 0) ;
  formDataByFundFlowDetailList.value = fundFlowDetailList.value.filter(item => item.writeOffAmount !== null && item.writeOffAmount !== 0) ;
  if(formDataByInvoiceList.value.length <= 0 && formDataByFundFlowDetailList.value.length <= 0){
    proxy.$modal.msgError("没有需要核销的数据，请检查！")
    return false ;
  }

  // 2.1 计算核销总金额 - 费用登记列表合计
  if(formDataByInvoiceList.value.length > 0){
    invoiceTotalWriteOffAmount.value = formDataByInvoiceList.value.reduce(
      (sum, item) => {
        const value = Number(item.writeOffAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum

      }, 0);
  }
  // 2.1 计算核销总金额 - 日记账明细列表合计
  if(formDataByFundFlowDetailList.value.length > 0){
     fundFlowTotalWriteOffAmount.value = formDataByFundFlowDetailList.value.reduce(
      (sum, item) => {
        const value = Number(item.writeOffAmount)
        if (!isNaN(value)) {
          return sum + value
        }
        return sum

      }, 0);
  }

  // 3 核销数据的合计金额 必须平衡(合计==0)
  writeOffResult.value = (invoiceTotalWriteOffAmount.value + fundFlowTotalWriteOffAmount.value) == 0 ? true : false ;
  if(!writeOffResult.value){
    proxy.$modal.msgError('核销金额不平衡, 请检查！')
    return false ;
  }

  console.log('核销过程 - 检查核销数据')
  return true ;

}

 // 确认核销
const confirmWriteoff = async () => {
  try {
    // 1 初始化数据
    reset()
    // 2 转化表单数据
    generateFormData()
    console.log("form表单数据====",form.value)
    // 3 提交核销请求
    submitForm()
  } catch (error) {
    ElMessage.error('核销失败:' + error)
  } finally {
    writeOffDialogVisible.value = false
  }
} 

/**  初始化表单数据 */
const generateFormData = () => {
  // 1 确认核销主表信息
  console.log('初始化数据')
  // 2 费用登记列表 -> 写入核销明细
  form.value.assistType = queryParams.value.assistType;
  form.value.assistId = queryParams.value.assistId;
  // 3 日记账明细列表 -> 写入核销明细 -- 发票登记
  formDataByInvoiceList.value.forEach(item => {
    let obj = {};
    obj.fundFlowId = null;
    obj.fundFlowNo = null;
    obj.fundFlowDetailId = null;
    obj.invoiceId = item.invoiceId;
    obj.invoiceNo = item.invoiceFlowNo;
    obj.remainAmount = item.remainAmount;
    obj.writeOffAmount = item.writeOffAmount;
    form.value.writeOffDetailList.push(obj);
  });
  // 4 日记账明细列表 -> 写入核销明细 -- 日记账明细
  formDataByFundFlowDetailList.value.forEach(item => {
    let obj = {};
    obj.fundFlowId = item.flowId;
    obj.fundFlowNo = item.flowNo;
    obj.fundFlowDetailId = item.flowDetailId;
    obj.invoiceId = null;
    obj.invoiceNo = null;
    obj.remainAmount = item.remainAmount;
    obj.writeOffAmount = item.writeOffAmount;
    form.value.writeOffDetailList.push(obj);
  });
}

/** 提交按钮 */
function submitForm() {
if (form.value.writeOffId != null) {
  updateWriteOff(form.value).then(response => {
    handleQuery();
    proxy.$modal.msgSuccess("修改成功");
  });
} else {
  addWriteOff(form.value).then(response => {
    handleQuery();
    proxy.$modal.msgSuccess("新增成功");
  });
}
}


// ------------------------------------ 6 核销操作 end ---------------------

// ------------------------------------ 7 编辑备注信息 start ---------------------
const isEditing = ref(false)
const originalRemark = ref('')  // 用于取消时恢复数据
const saveRemark = () => {
  isEditing.value = false
  originalRemark.value = form.remark  // 保存当前值
  // 可在此处添加 API 请求保存逻辑
}
const cancelEdit = () => {
  form.remark = originalRemark.value  // 恢复原始值
  isEditing.value = false
}

// ------------------------------------ 7 编辑备注信息 end ---------------------






</script>

<style lang="scss" scoped>
  .ap-writeOff-container {
    margin: 10px;

    .operation-container {
      margin-top: 20px;
    }
  }

// :deep(.el-input-number) {
//   color: black; /* 默认字体颜色 */
// }
:deep(.negative-input) input {
  color: red; /* 负数字体颜色 */
}

</style>