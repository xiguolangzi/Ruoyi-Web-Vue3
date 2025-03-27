<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="凭证ID" prop="voucherId">
        <el-input
          v-model="queryParams.voucherId"
          placeholder="请输入凭证ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="科目ID" prop="accountId">
        <el-input
          v-model="queryParams.accountId"
          placeholder="请输入科目ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="辅助类型" prop="auxiliaryType">
        <el-select v-model="queryParams.auxiliaryType" placeholder="请选择辅助类型" clearable>
          <el-option
            v-for="dict in finance_auxiliary_type"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="单据类型" prop="documentType">
        <el-select v-model="queryParams.documentType" placeholder="请选择单据类型" clearable>
          <el-option
            v-for="dict in finance_document_type"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 20px;">
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
          v-hasPermi="['finance:voucherDetail:add']"
          v-if="showOperationButton"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['finance:voucherDetail:edit']"
           v-if="showOperationButton"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['finance:voucherDetail:remove']"
           v-if="showOperationButton"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['finance:voucherDetail:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="voucherDetailList" @selection-change="handleSelectionChange" size="small">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" width="55"/>
      <el-table-column label="凭证ID" align="center" prop="voucherId" />
      <el-table-column label="科目ID" align="center" prop="accountId" />
      <el-table-column label="借方金额" align="right" header-align="center" prop="debitAmount" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.debitAmount) }} € </span>
        </template>
      </el-table-column>
      <el-table-column label="贷方金额" align="right" header-align="center" prop="creditAmount" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.creditAmount) }} € </span>
        </template>
      </el-table-column>
      <el-table-column label="摘要" align="center" prop="summary" />
      <el-table-column label="辅助项类型" align="center" prop="assistType">
        <template #default="scope">
          <dict-tag :options="finance_auxiliary_type" :value="scope.row.assistType"/>
        </template>
      </el-table-column>
      <el-table-column label="辅助项" align="center" prop="assistName" />
      <el-table-column label="单据类型" align="center" prop="documentType">
        <template #default="scope">
          <dict-tag :options="finance_document_type" :value="scope.row.documentType"/>
        </template>
      </el-table-column>
      <el-table-column label="单据号" align="center" prop="documentNo" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width"  v-if="showOperationButton">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:voucherDetail:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:voucherDetail:remove']">删除</el-button>
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

    <!-- 添加或修改凭证明细表对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="voucherDetailRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="凭证ID" prop="voucherId">
          <el-input v-model="form.voucherId" placeholder="请输入凭证ID" />
        </el-form-item>
        <el-form-item label="科目ID" prop="accountId">
          <el-input v-model="form.accountId" placeholder="请输入科目ID" />
        </el-form-item>
        <el-form-item label="借方金额" prop="debitAmount">
          <el-input v-model="form.debitAmount" placeholder="请输入借方金额" />
        </el-form-item>
        <el-form-item label="贷方金额" prop="creditAmount">
          <el-input v-model="form.creditAmount" placeholder="请输入贷方金额" />
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input v-model="form.summary" placeholder="请输入摘要" />
        </el-form-item>
        <el-form-item label="辅助类型" prop="auxiliaryType">
          <el-select v-model="form.auxiliaryType" placeholder="请选择辅助类型">
            <el-option
              v-for="dict in finance_auxiliary_type"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="辅助ID" prop="auxiliaryId">
          <el-input v-model="form.auxiliaryId" placeholder="请输入辅助ID" />
        </el-form-item>
        <el-form-item label="单据类型" prop="documentType">
          <el-select v-model="form.documentType" placeholder="请选择单据类型">
            <el-option
              v-for="dict in finance_document_type"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="单据号" prop="documentNo">
          <el-input v-model="form.documentNo" placeholder="请输入单据号" />
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

<script setup name="VoucherDetail">
import { listVoucherDetail, getVoucherDetail, delVoucherDetail, addVoucherDetail, updateVoucherDetail } from "@/api/finance/voucherDetail";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { finance_auxiliary_type, finance_document_type } = proxy.useDict('finance_auxiliary_type', 'finance_document_type');

const voucherDetailList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
// 控制操作的显隐
const showOperationButton = ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    voucherId: null,
    accountId: null,
    auxiliaryType: null,
    documentType: null,
    tenantId: null
  },
  rules: {
    voucherId: [
      { required: true, message: "凭证ID不能为空", trigger: "blur" }
    ],
    accountId: [
      { required: true, message: "科目ID不能为空", trigger: "blur" }
    ],
    tenantId: [
      { required: true, message: "租户ID不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询凭证明细表列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listVoucherDetail(queryParams.value).then(response => {
    voucherDetailList.value = response.rows;
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
    detailId: null,
    voucherId: null,
    accountId: null,
    debitAmount: null,
    creditAmount: null,
    summary: null,
    assistType: null,
    assistId: null,
    assistName:null,
    documentType: null,
    documentNo: null,
    tenantId: null
  };
  proxy.resetForm("voucherDetailRef");
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
  ids.value = selection.map(item => item.detailId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加凭证明细表";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _detailId = row.detailId || ids.value
  getVoucherDetail(_detailId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改凭证明细表";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["voucherDetailRef"].validate(valid => {
    if (valid) {
      if (form.value.detailId != null) {
        updateVoucherDetail(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addVoucherDetail(form.value).then(response => {
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
  const _detailIds = row.detailId || ids.value;
  proxy.$modal.confirm('是否确认删除凭证明细表编号为"' + _detailIds + '"的数据项？').then(function() {
    return delVoucherDetail(_detailIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('finance/voucherDetail/export', {
    ...queryParams.value
  }, `voucherDetail_${new Date().getTime()}.xlsx`)
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
