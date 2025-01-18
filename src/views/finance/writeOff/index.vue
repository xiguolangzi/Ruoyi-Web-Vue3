<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="核销类型:" prop="writeOffType">
        <el-select v-model="queryParams.writeOffType" placeholder="请选择核销类型:1-收款核销、2-付款核销 3-转账核销" clearable>
          <el-option
            v-for="dict in finance_write_off_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="核销流水编号" prop="writeOffNo">
        <el-input
          v-model="queryParams.writeOffNo"
          placeholder="请输入核销流水编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="核销时间" prop="writeOffTime" style="width: 350px;">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          unlink-panels
          :clearable="false"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-value="dateRange"
          @change="handleRangeChange"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="辅助类型:" prop="assistType">
        <el-select v-model="queryParams.assistType" placeholder="请选择客户类型"  @keyup.enter="handleQuery" @change="changeQueryParamsAssistType" clearable>
          <el-option
            v-for="dict in finance_assist_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择客户:" prop="assistId" v-if="queryParams.assistType == AssistTypeEnum.ASSIST_TYPE_CUSTOMER">
        <!-- 客户 -->
        <el-select v-model="queryParams.assistId" placeholder="请选择客户" clearable  filterable>
          <el-option
            v-for="customer in customerList"
            :key="customer.customerId"
            :label="customer.customerName"
            :value="customer.customerId"
            :disabled="customer.customerStatus !== '0'"
          >
            <span>{{ '客户名称：' + customer.customerName + ' ---- ' + '客户编码：' + customer.customerCode }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择供应商:" prop="assistId" v-if="queryParams.assistType == AssistTypeEnum.ASSIST_TYPE_SUPPLIER">
        <!-- 供应商 -->
        <el-select v-model="queryParams.assistId" placeholder="请选择供应商" clearable  filterable >
          <el-option
            v-for="supplier in supplierList"
            :key="supplier.supplierId"
            :label="supplier.supplierName"
            :value="supplier.supplierId"
            :disabled="supplier.supplierStatus !== '0'"
          >
            <span>{{ '供应商名称：' + supplier.supplierName + ' ---- ' + '供应商编码：' + supplier.supplierCode }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择员工:" prop="assistId" v-if="queryParams.assistType == AssistTypeEnum.ASSIST_TYPE_EMPLOYEE">
        <!-- 员工 -->
        <el-select v-model="queryParams.assistId" placeholder="请选择员工" clearable  filterable >
          <el-option
            v-for="user in userList"
            :key="user.userId"
            :label="user.userName"
            :value="user.userId"
            :disabled="user.status !== '0'"
          >
            <span>{{ '员工名称：' + user.userName + ' ---- ' + '员工昵称：' + user.nickName }}</span>
          </el-option>
        </el-select>
        
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['finance:writeOff:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleView"
          v-hasPermi="['finance:writeOff:view']"
        >查看明细</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['finance:writeOff:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['finance:writeOff:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button-group>
          <el-button type="primary" icon="Search" @click="handleQuery" style="margin-left: 50px;">搜索</el-button>
          <el-button type="info" icon="Refresh" @click="resetQuery">重置</el-button>
        </el-button-group>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="writeOffList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="核销流水编号" align="center" prop="writeOffNo" />
      <el-table-column label="核销类型" align="center" prop="writeOffType">
        <template #default="scope">
          <dict-tag :options="finance_write_off_type" :value="scope.row.writeOffType"/>
        </template>
      </el-table-column>
      <el-table-column label="辅助类型" align="center" prop="assistType" >
        <template #default="scope">
          <dict-tag :options="finance_assist_type" :value="scope.row.assistType"/>
        </template>
      </el-table-column>
      <el-table-column label="辅助项值" align="center" header-align="center" prop="assistId"  show-overflow-tooltip>
        <template #default="scope">
          <span> {{ getAssistNameByAssistId(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="核销时间" align="center" prop="writeOffTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.writeOffTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注描述" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleView(scope.row)" v-hasPermi="['finance:writeOff:view']">查看明细</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:writeOff:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改应付核销对话框 -->
    <el-dialog :title="title" v-model="open"  append-to-body>
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
                <el-table-column prop="invoiceNo" label="费用登记流水编码" min-width="130" show-overflow-tooltip />
                <el-table-column prop="remainAmount" label="未核销金额" align="right" header-align="center" min-width="90">
                  <!-- 自定义表头，增加悬浮提示 -->
                  <template #header>
                    <el-tooltip content="这是核销之前的未核销的金额" placement="top">
                      <span>未核销金额</span>
                    </el-tooltip>
                  </template>
                  <template #default="scope">
                    <span :style="{ color: scope.row.remainAmount < 0 ? 'red' : 'black' }" >{{ formatTwo(scope.row.remainAmount) }} € </span>
                  </template>
                </el-table-column>
                <el-table-column prop="writeOffAmount" label="核销金额" min-width="120" align="right" header-align="center">
                  <template #default="scope">
                    <el-input-number v-model="scope.row.writeOffAmount" placeholder="核销金额" 
                      :precision='2' :controls="false"  ref="inputNumber" disabled
                      :class="scope.row.writeOffAmount < 0 ? 'negative-input' : ''" style="width: 100%;"
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
                <el-table-column prop="fundFlowNo" label="日记账流水号" min-width="130" show-overflow-tooltip/>
                <el-table-column prop="remainAmount" label="未核销金额" align="right" header-align="center" min-width="90">
                  <!-- 自定义表头，增加悬浮提示 -->
                  <template #header>
                    <el-tooltip content="这是核销之前的未核销的金额" placement="top">
                      <span>未核销金额</span>
                    </el-tooltip>
                  </template>
                  <template #default="scope">
                    <span :style="{ color: scope.row.remainAmount < 0 ? 'red' : 'black' }" >{{ formatTwo(scope.row.remainAmount) }} € </span>
                  </template>
                </el-table-column>
                <el-table-column prop="writeOffAmount" label="核销金额" min-width="120" align="right" header-align="center">
                  <template #default="scope">
                    <el-input-number v-model="scope.row.writeOffAmount" placeholder="核销金额" 
                      :precision='2' :controls="false"  ref="inputNumber2"  disabled
                      :class="scope.row.writeOffAmount < 0 ? 'negative-input' : ''" style="width: 100%;" 
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
      
    </el-dialog>
  </div>
</template>

<script setup name="WriteOff">
import { listWriteOff, getWriteOff, delWriteOff, addWriteOff, updateWriteOff } from "@/api/finance/writeOff";
import useUserStore from "@/store/modules/user";
import { listSupplier} from "@/api/order/supplier";
import { listCustomer} from "@/api/order/customer";
import { listUser } from "@/api/system/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { finance_write_off_type, finance_assist_type } = proxy.useDict('finance_write_off_type', 'finance_assist_type');

const writeOffList = ref([]);
const writeOffDetailList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedWriteOffDetail = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    assistType: null,
    assistId: null,
    writeOffType: null,
    writeOffNo: null,
    writeOffTime: null,
    tenantId: null
  },
  rules: {
    writeOffType: [
      { required: true, message: "核销类型:1-收款核销、2-付款核销 3-转账核销不能为空", trigger: "change" }
    ],
    writeOffAmount: [
      { required: true, message: "核销金额不能为空", trigger: "blur" }
    ],
    writeOffTime: [
      { required: true, message: "核销时间不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "修改时间不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询应付核销列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listWriteOff(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    writeOffList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// ----------------------- 1 渲染辅助项数据 end ----------------------------------------
/** 获取辅助项名称 */
const getAssistNameByAssistId = (row) => {
  const assistType = row.assistType
  const assistId = row.assistId
  if(!assistType || !assistId){
    return '' ;
  }
  switch (assistType) {
    case AssistTypeEnum.ASSIST_TYPE_CUSTOMER:
      // 客户
      const customer = customerList.value.find(item => item.customerId == assistId);
      
      return customer ? customer.customerName : '' ;
    case AssistTypeEnum.ASSIST_TYPE_SUPPLIER:
      // 供应商
      const supplier = supplierList.value.find(item => item.supplierId == assistId) ;
      return supplier ? supplier.supplierName : '' ;
    case AssistTypeEnum.ASSIST_TYPE_EMPLOYEE:
      // 员工
      const user = userList.value.find(item => item.userId == assistId);
      return user ? user.userName : '' ;
  }
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
    response => {
      customerList.value = response.rows
      console.log("获取客户列表customerList:",customerList.value)
    
    }
    
  )
  .catch(
    error => {ElMessage.error("获取客户列表时出错:",error)}
  )
listUser()
  .then(
    response => {userList.value = response.rows }
  )
  .catch(
    error => {ElMessage.error("获取客户列表时出错:",error)}
  )

/** 更新查询条件 辅助项类型 */
const changeQueryParamsAssistType = () => {
  queryParams.value.assistId = null ;
}

// ----------------------- 1 渲染辅助项数据 end ----------------------------------------
// ------------------------------------ 2 合计 start ------------------------------------
/** 合计行 */
const getSummaryRow = (param) => {
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
      sums[index] = column.property === 'remainAmount' ? '合计核销 :' : ''
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
      sums[index] = column.property === 'remainAmount' ? '合计核销 :' : ''
    }
  })
  
  return sums
}

// ------------------------------------ 2 合计 end ------------------------------------

// ------------------------------------------ 3 请求参数 - 日期区间 start -----------------------------------
const currentMonthStart = new Date(new Date().setDate(1));
const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
/** 格式化日期为 YYYY-MM-DD */
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const dateRange = ref([formatDate(currentMonthStart), formatDate(currentMonthEnd)]);


// 禁用日期 :disabled-date="disabledDate"
const  disabledDate = (time) => {
  // 获取当前日期
  const now = new Date();
  // 计算3个月前的第一天
  const maxRangeStart = new Date( now.getFullYear(), now.getMonth() - 3, 1 );
  // 计算3个月后的最后一天
  const maxRangeEnd = new Date( now.getFullYear(), now.getMonth() + 4, 0 );
  return time.getTime() < maxRangeStart.getTime() || time.getTime() > maxRangeEnd.getTime();
}
// 处理日期范围变化
const handleRangeChange = (dates) => {
  if (dates && dates.length === 2) {
    const [start, end] = dates.map((date) => new Date(date)); // 将字符串转换为 Date 对象
    // 计算月份差
    const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    // 如果跨度超过3个月，重置为合法范围
    if (monthDiff > 2) {
      const newEnd = new Date(start.getFullYear(), start.getMonth() + 3, 0); // 跨3个月的最后一天
      dateRange.value = [formatDate(start), formatDate(newEnd)]; // 重置范围
      ElMessage.warning("时间跨度不能超过3个月!");
    }
  }
};

// ------------------------------------------ 3 请求参数 - 日期区间 end ----------------------------------------

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
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
    tenantId: null
  };
  writeOffDetailList.value = [];
  proxy.resetForm("writeOffRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.writeOffId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加应付核销";
}

/** 查看按钮操作 */
function handleView(row) {
  reset();
  const _writeOffId = row.writeOffId || ids.value
  getWriteOff(_writeOffId).then(response => {
    form.value = response.data;
    writeOffDetailList.value = response.data.writeOffDetailList;
    initDate()
    open.value = true;
    title.value = "查看应付核销明细";
  });
}

/** 查看明细 - 初始化数据 */
const invoiceList = ref([]) ;
const fundFlowDetailList = ref([]) ;
const initDate = () => {
  invoiceList.value = writeOffDetailList.value.filter(item => item.invoiceId);
  fundFlowDetailList.value = writeOffDetailList.value.filter(item => item.fundFlowDetailId);
}


/** 删除按钮操作 */
function handleDelete(row) {
  const _writeOffIds = row.writeOffId || ids.value;
  proxy.$modal.confirm('是否确认删除应付核销编号为"' + _writeOffIds + '"的数据项？').then(function() {
    return delWriteOff(_writeOffIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 应付核销明细序号 */
function rowWriteOffDetailIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}


/** 应付核销明细删除按钮操作 */
function handleDeleteWriteOffDetail() {
  if (checkedWriteOffDetail.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的应付核销明细数据");
  } else {
    const writeOffDetails = writeOffDetailList.value;
    const checkedWriteOffDetails = checkedWriteOffDetail.value;
    writeOffDetailList.value = writeOffDetails.filter(function(item) {
      return checkedWriteOffDetails.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleWriteOffDetailSelectionChange(selection) {
  checkedWriteOffDetail.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('finance/writeOff/export', {
    ...queryParams.value
  }, `writeOff_${new Date().getTime()}.xlsx`)
}

getList();
</script>

<style lang="scss" scoped>
:deep(.el-input-number) {
  color: black; /* 默认字体颜色 */
}
:deep(.negative-input) input {
  color: red; /* 负数字体颜色 */
}

</style>
