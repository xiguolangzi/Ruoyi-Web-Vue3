<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="币种名称" prop="currencyName">
        <el-input
          v-model="queryParams.currencyName"
          placeholder="请输入币种名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="币种编号" prop="currencyCode">
        <el-input
          v-model="queryParams.currencyCode"
          placeholder="请输入币种编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in project_general_status"
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
          v-hasPermi="['finance:currency:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['finance:currency:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['finance:currency:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['finance:currency:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="currencyList" @selection-change="handleSelectionChange" size="small">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" prop="currencyId" width="50" />
      <el-table-column label="币种名称" align="center" prop="currencyName" />
      <el-table-column label="币种编号" align="center" prop="currencyCode" />
      <el-table-column label="币种符号" align="center" prop="symbol" />
      <el-table-column label="相对汇率" align="center" prop="exchangeRate" >
        <template #default="scope">
          <el-tooltip
            content="对基准货币的汇率"
            placement="top"
          >
            <span>{{ scope.row.exchangeRate }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="是否基础币种" align="center" prop="isBase" >
        <template #default="scope">
          <dict-tag :options="sys_yes_or_no" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="project_general_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建者" align="center" prop="createBy" show-overflow-tooltip/>
      <el-table-column label="创建时间" align="center" prop="createTime" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" show-overflow-tooltip/>
      <el-table-column label="更新时间" align="center" prop="updateTime" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="100">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:currency:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:currency:remove']">删除</el-button>
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

    <!-- 添加或修改币种对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="currencyRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="币种名称" prop="currencyName">
          <el-input v-model="form.currencyName" placeholder="请输入币种名称" />
        </el-form-item>
        <el-form-item label="币种编号" prop="currencyCode">
          <el-input v-model="form.currencyCode" placeholder="请输入币种编号" />
        </el-form-item>
        <el-form-item label="币种符号" prop="symbol">
          <el-input v-model="form.symbol" placeholder="请输入币种符号" />
        </el-form-item>
        
        <el-form-item label="相对汇率" prop="exchangeRate">
          <template #label>
            相对汇率
            <el-tooltip content="相对基准货币的汇率" placement="top">
              <el-icon color="#E6A23C"><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="form.exchangeRate" placeholder="请输入对基准货币的汇率" />
        </el-form-item>
        <el-form-item label="基础币种" prop="isBase">
          <template #label>
            基础币种
            <el-tooltip content="是否设置成本位币" placement="top">
              <el-icon color="#E6A23C"><QuestionFilled /></el-icon>
            </el-tooltip>
          </template>
          <el-radio-group v-model="form.isBase" >
            <el-radio
              v-for="dict in sys_yes_or_no" :key="dict.value" :value="Number(dict.value)" >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in project_general_status" :key="dict.value" :value="Number(dict.value)" >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="币种描述" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入币种描述" maxlength="30" show-word-limit type="textarea"/>
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

<script setup name="Currency">
import { listCurrency, getCurrency, delCurrency, addCurrency, updateCurrency } from "@/api/finance/currency";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { project_general_status,sys_yes_or_no } = proxy.useDict('project_general_status','sys_yes_or_no');

const currencyList = ref([]);
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
    currencyName: null,
    currencyCode: null,
    status: null,
    tenantId: null,
  },
  rules: {
    currencyName: [
      { required: true, message: "币种名称不能为空", trigger: "blur" }
    ],
    currencyCode: [
      { required: true, message: "币种编号不能为空", trigger: "blur" }
    ],
    symbol: [
      { required: true, message: "币种符号不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询币种列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listCurrency(queryParams.value).then(response => {
    currencyList.value = response.rows;
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
    currencyId: null,
    currencyName: null,
    currencyCode: null,
    symbol: null,
    exchangeRate: null,
    isBase: '1',
    status: '0',
    tenantId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("currencyRef");
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
  ids.value = selection.map(item => item.currencyId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加币种";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _currencyId = row.currencyId || ids.value
  getCurrency(_currencyId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改币种";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["currencyRef"].validate(valid => {
    if (valid) {
      if (form.value.currencyId != null) {
        updateCurrency(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCurrency(form.value).then(response => {
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
  const _currencyIds = row.currencyId || ids.value;
  proxy.$modal.confirm('是否确认删除币种编号为"' + _currencyIds + '"的数据项？').then(function() {
    return delCurrency(_currencyIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('finance/currency/export', {
    ...queryParams.value
  }, `currency_${new Date().getTime()}.xlsx`)
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