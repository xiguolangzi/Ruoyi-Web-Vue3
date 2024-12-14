<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="科目名称" prop="accountId" style="width: 250px;">
        <el-tree-select v-model="queryParams.accountId" :data="accountTree" :props="treeProps" value-key="accountId"
          placeholder="请选择科目" style="width: 100%;"
        >
        </el-tree-select>
      </el-form-item>
      <el-form-item label="会计年度:" prop="periodYear">
        <el-select v-model="queryParams.periodYear" placeholder="请选择会计年度" clearable>
          <el-option v-for="dict in finance_period_year" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="会计月份:" prop="periodMonth">
        <el-select v-model="queryParams.periodMonth" placeholder="请选择会计月份" clearable>
          <el-option v-for="dict in finance_period_month" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 10px;">
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
          v-hasPermi="['finance:accountBalance:add']"
          v-if="isShowOperation"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['finance:accountBalance:edit']"
          v-if="isShowOperation"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['finance:accountBalance:remove']"
          v-if="isShowOperation"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['finance:accountBalance:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="accountBalanceList" @selection-change="handleSelectionChange">
      <el-table-column label="序号" align="center" type="index" width="55" />
      <el-table-column label="科目编码" align="center" prop="accountVo.accountCode" />
      <el-table-column label="科目名称" align="center" prop="accountVo.accountName" />
      <el-table-column label="科目类型" align="center" prop="accountVo.accountType" >
        <template #default="scope">
          <dict-tag :options="erp_finance_account_style" :value="scope.row.accountVo.accountType"/>
        </template>
      </el-table-column>
      <el-table-column label="科目状态" align="center" prop="accountVo.status" >
        <template #default="scope">
          <dict-tag :options="project_general_status" :value="scope.row.accountVo.status"/>
        </template>
      </el-table-column>
      <el-table-column label="会计年度" align="center" prop="periodYear" width="80">
        <template #default="scope">
          <dict-tag :options="finance_period_year" :value="scope.row.periodYear" />
        </template>
      </el-table-column>
      <el-table-column label="会计月份" align="center" prop="periodMonth" width="80">
        <template #default="scope">
          <dict-tag :options="finance_period_month" :value="scope.row.periodMonth" />
        </template>
      </el-table-column>
      <el-table-column label="期初余额" align="center" prop="beginBalance" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.beginBalance) }} € </span>
        </template>
      </el-table-column>
      <el-table-column label="借方金额" align="center" prop="debitAmount" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.debitAmount) }} € </span>
        </template>
      </el-table-column>
      <el-table-column label="贷方金额" align="center" prop="creditAmount" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.creditAmount) }} € </span>
        </template>
      </el-table-column>
      <el-table-column label="期末余额" align="center" prop="endBalance" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.endBalance) }} € </span>
        </template>
      </el-table-column>
      <el-table-column label="最后修改时间" align="center" prop="lastChangeTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.lastChangeTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" v-if="isShowOperation">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:accountBalance:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:accountBalance:remove']">删除</el-button>
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

    <!-- 添加或修改 科目余额表对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="accountBalanceRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="科目名称" prop="accountId">
          <el-tree-select v-model="form.accountId" :data="accountTree" :props="treeProps" value-key="accountId"
            placeholder="请选择科目" style="width: 100%;" 
          >
          </el-tree-select>
        </el-form-item>
        <el-form-item label="会计年度" prop="periodYear">
          <el-select v-model="form.periodYear" placeholder="请选择会计年度" clearable>
            <el-option v-for="dict in finance_period_year" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="会计月份" prop="periodMonth">
          <el-select v-model="form.periodMonth" placeholder="请选择会计月份" clearable>
            <el-option v-for="dict in finance_period_month" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="期初余额" prop="beginBalance">
          <el-input v-model="form.beginBalance" placeholder="请输入期初余额" />
        </el-form-item>
        <el-form-item label="借方金额" prop="debitAmount">
          <el-input v-model="form.debitAmount" placeholder="请输入借方金额" />
        </el-form-item>
        <el-form-item label="贷方金额" prop="creditAmount">
          <el-input v-model="form.creditAmount" placeholder="请输入贷方金额" />
        </el-form-item>
        <el-form-item label="期末余额" prop="endBalance">
          <el-input v-model="form.endBalance" placeholder="请输入期末余额" />
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

<script setup name="AccountBalance">
import { listAccountBalance, getAccountBalance, delAccountBalance, addAccountBalance, updateAccountBalance } from "@/api/finance/accountBalance";
import useUserStore from "@/store/modules/user";
import { listAccount } from "@/api/finance/account";
import { ref } from "vue";
// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { erp_finance_account_style, project_general_status, finance_period_year, finance_period_month } = proxy.useDict('erp_finance_account_style', 'project_general_status', 'finance_period_year', 'finance_period_month');

const accountBalanceList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
// 控制操作显隐
const isShowOperation = ref(false);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 30,
    accountId: null,
    periodYear: null,
    periodMonth: null,
    tenantId: null,
    accountCode: null,
    accountName: null,
    accountType: null,
  },
  rules: {
    accountId: [
      { required: true, message: "科目ID不能为空", trigger: "blur" }
    ],
    financePeriod: [
      { required: true, message: "会计期间(YYYY-MM)不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

// ----------------- 1 获取科目列表数据
// 会计科目 - 初始化列表
const accountList = ref([])
const accountTree = ref([])
/** 会计科目 - 获取列表 */
const getAccountList = async () => {
    listAccount()
      .then(response => {
        accountTree.value = proxy.handleTree(response.data, "accountId", "parentId") || [];
        accountList.value = response.data || [];
      })
      .catch(error => {
        ElMessage.error("获取会计科目列表时出错:",error)
      })
};
getAccountList()

/** el-tree-select 配置 */ 
const treeProps = {
  value: "accountId",
  label: (node) => `${node.accountCode} - ${node.accountName}`, // 自定义显示内容
  children: "children",
  disabled: (node) => node.status == '1'
};

/** 查询 科目余额表列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listAccountBalance(queryParams.value).then(response => {
    accountBalanceList.value = response.rows;
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
    balanceId: null,
    accountId: null,
    periodYear: null,
    periodMonth: null,
    beginBalance: null,
    debitAmount: null,
    creditAmount: null,
    endBalance: null,
    tenantId: null,
    lastChangeTime: null
  };
  proxy.resetForm("accountBalanceRef");
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
  ids.value = selection.map(item => item.balanceId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加 科目余额表";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _balanceId = row.balanceId || ids.value
  getAccountBalance(_balanceId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改 科目余额表";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["accountBalanceRef"].validate(valid => {
    if (valid) {
      if (form.value.balanceId != null) {
        updateAccountBalance(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAccountBalance(form.value).then(response => {
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
  const _balanceIds = row.balanceId || ids.value;
  proxy.$modal.confirm('是否确认删除 科目余额表编号为"' + _balanceIds + '"的数据项？').then(function() {
    return delAccountBalance(_balanceIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('finance/accountBalance/export', {
    ...queryParams.value
  }, `accountBalance_${new Date().getTime()}.xlsx`)
}

getList();
</script>
