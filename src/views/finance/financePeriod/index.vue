<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="会计年度" prop="periodYear">
        <el-select v-model="queryParams.periodYear" placeholder="请选择会计年度" clearable>
          <el-option
            v-for="dict in finance_period_year"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
         </el-select>
      </el-form-item>
      <el-form-item label="会计月份" prop="periodMonth">
         <el-select v-model="queryParams.periodMonth" placeholder="请选择会计月份" clearable>
          <el-option
            v-for="dict in finance_period_month"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
         </el-select>
      </el-form-item>
      <el-form-item label="期间状态" prop="periodStatus">
        <el-select v-model="queryParams.periodStatus" placeholder="请选择期间状态" clearable>
          <el-option
            v-for="dict in finance_period_status"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
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
          v-hasPermi="['finance:financePeriod:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['finance:financePeriod:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['finance:financePeriod:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['finance:financePeriod:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="financePeriodList" @selection-change="handleSelectionChange" size="small">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" min-width="50"/>
      <el-table-column label="会计年度" align="center" prop="periodYear" />
      <el-table-column label="会计月份" align="center" prop="periodMonth" />
      <el-table-column label="开始日期" align="center" prop="startDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束日期" align="center" prop="endDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="期间状态" align="center" prop="periodStatus">
        <template #default="scope">
          <dict-tag :options="finance_period_status" :value="scope.row.periodStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="当前期间" align="center" prop="isCurrent">
        <template #default="scope">
          <dict-tag :options="sys_yes_or_no" :value="scope.row.isCurrent"/>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改者" align="center" prop="updateBy" />
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:financePeriod:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:financePeriod:remove']">删除</el-button>
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

    <!-- 添加或修改会计期间对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="financePeriodRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="会计年度" prop="periodYear">
          <el-select v-model="form.periodYear" placeholder="请选择会计年度" clearable>
            <el-option
              v-for="dict in finance_period_year"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
            />
         </el-select>
        </el-form-item>
        <el-form-item label="会计月份" prop="periodMonth">
          <el-select v-model="form.periodMonth" placeholder="请选择会计月份" clearable>
            <el-option
              v-for="dict in finance_period_month"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
            />
         </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker clearable
            v-model="form.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择会计期间开始日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker clearable
            v-model="form.endDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择会计期间结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="期间状态" prop="periodStatus">
          <el-radio-group v-model="form.periodStatus">
            <el-radio v-for="dict in finance_period_status" :key="dict.value" :value="Number(dict.value)" >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="当前期间" prop="isCurrent">
          <el-radio-group v-model="form.isCurrent">
            <el-radio v-for="dict in sys_yes_or_no" :key="dict.value" :value="Number(dict.value)" >{{dict.label}}</el-radio>
          </el-radio-group>
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

<script setup name="FinancePeriod">
import { listFinancePeriod, getFinancePeriod, delFinancePeriod, addFinancePeriod, updateFinancePeriod } from "@/api/finance/financePeriod";
import useUserStore from "@/store/modules/user";
import { ref } from "vue";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { finance_period_status, sys_yes_or_no, finance_period_month, finance_period_year } = proxy.useDict('finance_period_status', 'sys_yes_or_no', 'finance_period_month', 'finance_period_year');

const financePeriodList = ref([]);
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
    periodYear: null,
    periodMonth: null,
    periodStatus: null,
    tenantId: null
  },
  rules: {
    periodYear: [
      { required: true, message: "会计年度不能为空", trigger: "blur" }
    ],
    periodMonth: [
      { required: true, message: "会计月份不能为空", trigger: "blur" }
    ],
    startDate: [
      { required: true, message: "会计期间开始日期不能为空", trigger: "blur" }
    ],
    endDate: [
      { required: true, message: "会计期间结束日期不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询会计期间列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listFinancePeriod(queryParams.value).then(response => {
    financePeriodList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    periodId: null,
    periodYear: null,
    periodMonth: null,
    startDate: null,
    endDate: null,
    periodStatus: '1',
    isCurrent: '1',
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    tenantId: null
  };
  proxy.resetForm("financePeriodRef");
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
  ids.value = selection.map(item => item.periodId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加会计期间";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _periodId = row.periodId || ids.value
  getFinancePeriod(_periodId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改会计期间";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["financePeriodRef"].validate(valid => {
    if (valid) {
      if (form.value.periodId != null) {
        updateFinancePeriod(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addFinancePeriod(form.value).then(response => {
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
  const _periodIds = row.periodId || ids.value;
  proxy.$modal.confirm('是否确认删除会计期间编号为"' + _periodIds + '"的数据项？').then(function() {
    return delFinancePeriod(_periodIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('finance/financePeriod/export', {
    ...queryParams.value
  }, `financePeriod_${new Date().getTime()}.xlsx`)
}

getList();
</script>

<style lang="scss" scoped>
.app-container {
  height: 100%; /* 确保父容器高度充满 */
  display: flex;
  flex-direction: column;
}

.table-container {
  flex-grow: 1; /* 表格区域充满剩余空间 */
  display: flex;
  flex-direction: column;
}

.el-table {
  flex-grow: 1; /* 表格充满剩余空间 */
}

.pagination {
  flex-shrink: 0; /* 分页栏固定在底部 */
  margin-top: auto; /* 将分页栏推到容器底部 */
}
</style>
