<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="交班编号" prop="shiftNo">
        <el-input
          v-model="queryParams.shiftNo"
          placeholder="请输入交班编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="交班的caja" prop="cajaId">
         <el-select
            v-model="queryParams.cajaId"
            filterable
            clearable
            placeholder="请选择设备"
            @keyup.enter="handleQuery"
        >
            <el-option
            v-for="item in cajaList"
            :key="item.cajaId"
            :label="item.cajaName"
            :value="item.cajaId"
            />
        </el-select>
      </el-form-item>
      <el-form-item label="收银员" prop="userId">
        <el-select
            v-model="queryParams.userId"
            filterable
            clearable
            placeholder="请选择收银员"
            @keyup.enter="handleQuery"
        >
            <el-option
            v-for="item in userList"
            :key="item.userId"
            :label="item.userName"
            :value="item.userId"
            />
        </el-select>
      </el-form-item>
      <el-form-item label="交班状态" prop="shiftStatus">
        <el-select v-model="queryParams.shiftStatus" placeholder="请选择交班状态" clearable>
          <el-option v-for="dict in erp_sales_shift_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="交班开始时间" prop="shiftStartTime" style="width: 350px;">
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
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['sales:SalesShiftRecords:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sales:SalesShiftRecords:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['sales:SalesShiftRecords:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="SalesShiftRecordsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="交班编号" align="center" prop="shiftNo" />
      <el-table-column label="设备名称" align="center" prop="cajaId" min-width="150" show-overflow-tooltip/>
      <el-table-column label="收银员ID" align="center" prop="userId" />
      <el-table-column label="上次交班编号"  align="center" prop="lastShiftNo" min-width="150" show-overflow-tooltip/>
      <el-table-column label="开始现金余额" align="center" prop="lastShiftCashAmount" min-width="110" show-overflow-tooltip />
      <el-table-column label="开始时间" align="center" prop="shiftStartTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.shiftStart, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="shiftEndTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.shiftEnd, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="现金收入" align="center" prop="salesCash" />
      <el-table-column label="银行收入" align="center" prop="salesBank" />
      <el-table-column label="优惠金额" align="center" prop="salesDiscount" />
      <el-table-column label="退款总额" align="center" prop="salesRefunds" />
      <el-table-column label="找零总额" align="center" prop="salesChange" />
      <el-table-column label="应交金额" align="center" prop="currentExpectedCash" />
      <el-table-column label="补充金额" align="center" prop="currentReplenishCash" />
      <el-table-column label="上交金额" align="center" prop="currentDepositCash" />
      <el-table-column label="实交金额" align="center" prop="currentActualCash" />
      <el-table-column label="长短款" align="center" prop="currentBalanceDifference" />
      <el-table-column label="交班状态" align="center" prop="shiftStatus" >
        <template #default="scope">
          <dict-tag :options="erp_sales_shift_status" :value="scope.row.shiftStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="备注信息" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="danger" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['sales:SalesShiftRecords:edit']">修改</el-button>
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

    <!-- 添加或修改交班记录对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="SalesShiftRecordsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="交班编号" prop="shiftNo">
          <el-input v-model="form.shiftNo" placeholder="请输入交班编号" />
        </el-form-item>
        <el-form-item label="交班的caja" prop="cajaId">
          <el-input v-model="form.cajaId" placeholder="请输入交班的caja" />
        </el-form-item>
        <el-form-item label="收银员ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入收银员ID" />
        </el-form-item>
        <el-form-item label="上次交班编号" prop="lastShiftNo">
          <el-input v-model="form.lastShiftNo" placeholder="请输入上次交班编号" />
        </el-form-item>
        <el-form-item label="上次现金余额" prop="lastShiftCashAmount">
          <el-input v-model="form.lastShiftCashAmount" placeholder="请输入上次现金余额" />
        </el-form-item>
        <el-form-item label="开始交班时间" prop="shiftStartTime">
          <el-date-picker clearable
            v-model="form.shiftStart"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择交班开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束交班时间" prop="shiftEndTime">
          <el-date-picker clearable
            v-model="form.shiftEnd"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择交班结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="现金收入" prop="salesCash">
          <el-input v-model="form.salesCash" placeholder="请输入本次值班-现金收入" />
        </el-form-item>
        <el-form-item label="银行收入" prop="salesBank">
          <el-input v-model="form.salesBank" placeholder="请输入本次值班-银行收入" />
        </el-form-item>
        <el-form-item label="优惠金额" prop="salesDiscount">
          <el-input v-model="form.salesDiscount" placeholder="请输入本次值班-优惠金额" />
        </el-form-item>
        <el-form-item label="退款总额" prop="salesRefunds">
          <el-input v-model="form.salesRefunds" placeholder="请输入本次值班-退款总额" />
        </el-form-item>
        <el-form-item label="找零总额" prop="salesChange">
          <el-input v-model="form.salesChange" placeholder="请输入本次值班-找零总额" />
        </el-form-item>

        <el-form-item label="交班-应交金额" prop="currentExpectedCash">
          <el-input v-model="form.currentExpectedCash" placeholder="请输入本次值班-应交金额" />
        </el-form-item>
        <el-form-item label="交班-补充金额" prop="currentReplenishCash">
          <el-input v-model="form.currentReplenishCash" placeholder="请输入本次值班-补充金额" />
        </el-form-item>
        <el-form-item label="交班-上交金额" prop="currentDepositCash">
          <el-input v-model="form.currentDepositCash" placeholder="请输入本次值班-上交金额" />
        </el-form-item>
        <el-form-item label="交班-实交金额" prop="currentActualCash">
          <el-input v-model="form.currentActualCash" placeholder="请输入本次值班-实交金额" />
        </el-form-item>
        <el-form-item label="交班-长短款" prop="currentBalanceDifference">
          <el-input v-model="form.currentBalanceDifference" placeholder="请输入本次值班-长短款" />
        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-divider content-position="center">现金盘点记录信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddSalesCountingCash">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteSalesCountingCash">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="salesCountingCashList" :row-class-name="rowSalesCountingCashIndex" @selection-change="handleSalesCountingCashSelectionChange" ref="salesCountingCash">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50"/>
          <el-table-column label="面值为500的数量" prop="cashValue500" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cashValue500" placeholder="请输入面值为500的数量" />
            </template>
          </el-table-column>
          <el-table-column label="面值为200的数量" prop="cashValue200" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cashValue200" placeholder="请输入面值为200的数量" />
            </template>
          </el-table-column>
          <el-table-column label="面值为100的数量" prop="cashValue100" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cashValue100" placeholder="请输入面值为100的数量" />
            </template>
          </el-table-column>
          <el-table-column label="面值为50的数量" prop="cashValue50" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cashValue50" placeholder="请输入面值为50的数量" />
            </template>
          </el-table-column>
          <el-table-column label="面值为20的数量" prop="cashValue20" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cashValue20" placeholder="请输入面值为20的数量" />
            </template>
          </el-table-column>
          <el-table-column label="面值为10的数量" prop="cashValue10" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cashValue10" placeholder="请输入面值为10的数量" />
            </template>
          </el-table-column>
          <el-table-column label="面值为5的数量" prop="cashValue5" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cashValue5" placeholder="请输入面值为5的数量" />
            </template>
          </el-table-column>
          <el-table-column label="面值为2的数量" prop="cashValue2" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cashValue2" placeholder="请输入面值为2的数量" />
            </template>
          </el-table-column>
          <el-table-column label="面值为1的数量" prop="cashValue1" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cashValue1" placeholder="请输入面值为1的数量" />
            </template>
          </el-table-column>
          <el-table-column label="面值为0.5的数量" prop="cashValue05" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cashValue05" placeholder="请输入面值为0.5的数量" />
            </template>
          </el-table-column>
          <el-table-column label="面值为0.2的数量" prop="cashValue02" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cashValue02" placeholder="请输入面值为0.2的数量" />
            </template>
          </el-table-column>
          <el-table-column label="面值为0.1的数量" prop="cashValue01" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cashValue01" placeholder="请输入面值为0.1的数量" />
            </template>
          </el-table-column>
          <el-table-column label="现金盘点总金额" prop="totalAmount" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.totalAmount" placeholder="请输入现金盘点总金额" />
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SalesShiftRecords">
import { listSalesShiftRecords, getSalesShiftRecords, delSalesShiftRecords, addSalesShiftRecords, updateSalesShiftRecords } from "@/api/sales/SalesShiftRecords";
import useUserStore from "@/store/modules/user";
import { getFingerprint } from "@/utils/fingerprintJS";
import { listSalesCaja } from "@/api/sales/salesCaja";
import { listCashier } from "@/api/system/user";

// 租户ID字段过滤使用
const userStore = useUserStore();
const {deviceFingerprint} = getFingerprint();

const { proxy } = getCurrentInstance();
const { erp_sales_shift_status } = proxy.useDict('erp_sales_shift_status');

const SalesShiftRecordsList = ref([]);
const salesCountingCashList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedSalesCountingCash = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    shiftNo: null,
    cajaId: null,
    userId: null,
    shiftStartTime: null,
    tenantId: null,
    shiftStatus: null
  },
  rules: {
    cajaId: [
      { required: true, message: "交班的caja不能为空", trigger: "blur" }
    ],
    userId: [
      { required: true, message: "收银员ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询交班记录列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listSalesShiftRecords(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    SalesShiftRecordsList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// ---------------------------------- 1 请求参数 - 日期区间 start --------------------------
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

// ------------------------------------ 1 请求参数 - 日期区间 end --------------------------------

// ************************************ 2 获取设备信息 start ************************************
const cajaList = ref([]);
/** 获取设备列表 */
const getCajaList = () => {
  listSalesCaja().then(response => {
    cajaList.value = response.rows || [];
    console.log("获取设备列表：",cajaList.value);
  }).catch((e) => {
    console.log("获取设备列表失败：",e);
  });
}

getCajaList();
// ************************************ 2 获取设备信息 end **************************************

// ------------------------------------ 3 获取收银员信息 start ------------------------------------
const userList = ref([]);
/** 获取员工列表 */
const getUserList = () => {
  listCashier().then(response => {
    userList.value = response.rows || [];
    console.log("获取收银员列表：",userList.value);
  }).catch((e) => {
    console.log("获取收银员列表失败：",e);
  });
}

getUserList();

// ------------------------------------ 3 获取收银员信息 end ------------------------------------

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    shiftId: null,
    shiftNo: null,
    cajaId: null,
    userId: null,
    lastShiftId: null,
    lastShiftNo: null,
    lastShiftCashAmount: null,
    shiftStartTime: null,
    shiftEndTime: null,
    salesCash: null,
    salesBank: null,
    salesDiscount: null,
    salesRefunds: null,
    salesChange: null,
    currentExpectedCash: null,
    currentReplenishCash: null,
    currentDepositCash: null,
    currentActualCash: null,
    currentBalanceDifference: null,
    remark: null,
    tenantId: null,
    delFlag: null,
    shiftStatus: '0'
  };
  salesCountingCashList.value = [];
  proxy.resetForm("SalesShiftRecordsRef");
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
  ids.value = selection.map(item => item.shiftId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加交班记录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _shiftId = row.shiftId || ids.value
  getSalesShiftRecords(_shiftId).then(response => {
    form.value = response.data;
    salesCountingCashList.value = response.data.salesCountingCashList;
    open.value = true;
    title.value = "修改交班记录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["SalesShiftRecordsRef"].validate(valid => {
    if (valid) {
      form.value.salesCountingCashList = salesCountingCashList.value;
      if (form.value.shiftId != null) {
        updateSalesShiftRecords(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSalesShiftRecords(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _shiftIds = row.shiftId || ids.value;
  proxy.$modal.confirm('是否确认删除交班记录编号为"' + _shiftIds + '"的数据项？').then(function() {
    return delSalesShiftRecords(_shiftIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 现金盘点记录序号 */
function rowSalesCountingCashIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 现金盘点记录添加按钮操作 */
function handleAddSalesCountingCash() {
  let obj = {};
  obj.cashValue500 = "";
  obj.cashValue200 = "";
  obj.cashValue100 = "";
  obj.cashValue50 = "";
  obj.cashValue20 = "";
  obj.cashValue10 = "";
  obj.cashValue5 = "";
  obj.cashValue2 = "";
  obj.cashValue1 = "";
  obj.cashValue05 = "";
  obj.cashValue02 = "";
  obj.cashValue01 = "";
  obj.totalAmount = "";
  obj.tenantId = "";
  salesCountingCashList.value.push(obj);
}

/** 现金盘点记录删除按钮操作 */
function handleDeleteSalesCountingCash() {
  if (checkedSalesCountingCash.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的现金盘点记录数据");
  } else {
    const salesCountingCashs = salesCountingCashList.value;
    const checkedSalesCountingCashs = checkedSalesCountingCash.value;
    salesCountingCashList.value = salesCountingCashs.filter(function(item) {
      return checkedSalesCountingCashs.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleSalesCountingCashSelectionChange(selection) {
  checkedSalesCountingCash.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sales/SalesShiftRecords/export', {
    ...queryParams.value
  }, `SalesShiftRecords_${new Date().getTime()}.xlsx`)
}

getList();
</script>
