<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="日记账ID" prop="fundFlowId">
        <el-input
          v-model="queryParams.fundFlowId"
          placeholder="请输入日记账ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="采购发票ID" prop="purchaseInvoiceId">
        <el-input
          v-model="queryParams.purchaseInvoiceId"
          placeholder="请输入采购发票ID"
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
      <el-form-item label="核销类型" prop="writeOffType">
        <el-select v-model="queryParams.writeOffType" placeholder="请选择核销类型" clearable>
          <el-option
            v-for="dict in finance_write_off_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 30px;">
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
          v-hasPermi="['finance:payableWriteOff:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['finance:payableWriteOff:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['finance:payableWriteOff:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['finance:payableWriteOff:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="payableWriteOffList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="核销ID" align="center" prop="writeOffId" />
      <el-table-column label="日记账ID" align="center" prop="fundFlowId" />
      <el-table-column label="采购发票ID" align="center" prop="purchaseInvoiceId" />
      <el-table-column label="核销金额" align="center" prop="writeOffAmount" />
      <el-table-column label="核销时间" align="center" prop="writeOffTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.writeOffTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="核销类型" align="center" prop="writeOffType">
        <template #default="scope">
          <dict-tag :options="finance_write_off_type" :value="scope.row.writeOffType"/>
        </template>
      </el-table-column>
      <el-table-column label="核销备注" align="center" prop="writeOffRemark" />
      <el-table-column label="租户ID" align="center" prop="tenantId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:payableWriteOff:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:payableWriteOff:remove']">删除</el-button>
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
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="payableWriteOffRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="日记账ID" prop="fundFlowId">
          <el-input v-model="form.fundFlowId" placeholder="请输入日记账ID" />
        </el-form-item>
        <el-form-item label="采购发票ID" prop="purchaseInvoiceId">
          <el-input v-model="form.purchaseInvoiceId" placeholder="请输入采购发票ID" />
        </el-form-item>
        <el-form-item label="核销金额" prop="writeOffAmount">
          <el-input v-model="form.writeOffAmount" placeholder="请输入核销金额" />
        </el-form-item>
        <el-form-item label="核销时间" prop="writeOffTime">
          <el-date-picker clearable
            v-model="form.writeOffTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择核销时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="核销类型" prop="writeOffType">
          <el-select v-model="form.writeOffType" placeholder="请选择核销类型">
            <el-option
              v-for="dict in finance_write_off_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="核销备注" prop="writeOffRemark">
          <el-input v-model="form.writeOffRemark" placeholder="请输入核销备注" />
        </el-form-item>
        <el-form-item label="租户ID" prop="tenantId">
          <el-input v-model="form.tenantId" placeholder="请输入租户ID" />
        </el-form-item>
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

<script setup name="PayableWriteOff">
import { listPayableWriteOff, getPayableWriteOff, delPayableWriteOff, addPayableWriteOff, updatePayableWriteOff } from "@/api/finance/payableWriteOff";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { finance_write_off_type } = proxy.useDict('finance_write_off_type');

const payableWriteOffList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    fundFlowId: null,
    purchaseInvoiceId: null,
    writeOffTime: null,
    writeOffType: null,
    tenantId: null
  },
  rules: {
    fundFlowId: [
      { required: true, message: "日记账ID不能为空", trigger: "blur" }
    ],
    purchaseInvoiceId: [
      { required: true, message: "采购发票ID不能为空", trigger: "blur" }
    ],
    writeOffAmount: [
      { required: true, message: "核销金额不能为空", trigger: "blur" }
    ],
    writeOffTime: [
      { required: true, message: "核销时间不能为空", trigger: "blur" }
    ],
    writeOffType: [
      { required: true, message: "核销类型不能为空", trigger: "change" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "修改时间不能为空", trigger: "blur" }
    ],
    tenantId: [
      { required: true, message: "租户ID不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询应付核销列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listPayableWriteOff(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    payableWriteOffList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// ------------------------------------------ 数据表格 start -----------------------------------
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

// ------------------------------------------ 数据表格 end ----------------------------------------

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    writeOffId: null,
    fundFlowId: null,
    purchaseInvoiceId: null,
    writeOffAmount: null,
    writeOffTime: null,
    writeOffType: null,
    writeOffRemark: null,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    tenantId: null
  };
  proxy.resetForm("payableWriteOffRef");
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

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _writeOffId = row.writeOffId || ids.value
  getPayableWriteOff(_writeOffId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改应付核销";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["payableWriteOffRef"].validate(valid => {
    if (valid) {
      if (form.value.writeOffId != null) {
        updatePayableWriteOff(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPayableWriteOff(form.value).then(response => {
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
  const _writeOffIds = row.writeOffId || ids.value;
  proxy.$modal.confirm('是否确认删除应付核销编号为"' + _writeOffIds + '"的数据项？').then(function() {
    return delPayableWriteOff(_writeOffIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('finance/payableWriteOff/export', {
    ...queryParams.value
  }, `payableWriteOff_${new Date().getTime()}.xlsx`)
}

getList();
</script>
