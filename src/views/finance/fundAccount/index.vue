<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="账户名称" prop="fundAccountName">
        <el-input
          v-model="queryParams.fundAccountName"
          placeholder="请输入账户名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="账户编号" prop="fundAccountNo">
        <el-input
          v-model="queryParams.fundAccountNo"
          placeholder="请输入账户编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="账户状态" prop="fundAccountStatus">
        <el-select v-model="queryParams.fundAccountStatus" placeholder="请选择账户状态" clearable>
          <el-option
            v-for="dict in project_general_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="swiftCode" prop="bankSwiftCode">
        <el-input
          v-model="queryParams.bankSwiftCode"
          placeholder="请输入swiftCode"
          clearable
          @keyup.enter="handleQuery"
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
          v-hasPermi="['finance:fundAccount:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['finance:fundAccount:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['finance:fundAccount:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['finance:fundAccount:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="fundAccountList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="50" align="center" />
      <el-table-column label="账户名称" align="center" prop="fundAccountName" min-width="150" show-overflow-tooltip/>
      <el-table-column label="账户账号" align="center" prop="fundAccountNo" min-width="150" show-overflow-tooltip/>
      <el-table-column label="期初余额" align="center" prop="fundInitialBalance" min-width="120" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ formatTwo(scope.row.fundInitialBalance) }} € </span>
        </template>
      </el-table-column>
      <el-table-column label="当前余额" align="center" prop="fundCurrentBalance" min-width="120" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ formatTwo(scope.row.fundCurrentBalance) }} € </span>
        </template>
      </el-table-column>
      <el-table-column label="swiftCode" align="center" prop="bankSwiftCode" min-width="100" show-overflow-tooltip/>
      <el-table-column label="银行名称" align="center" prop="bankName" min-width="100" show-overflow-tooltip/>
      <el-table-column label="开户支行" align="center" prop="bankBranch" show-overflow-tooltip/>
      <el-table-column label="公司名称" align="center" prop="bankCompanyName"  min-width="150" show-overflow-tooltip/>
      <el-table-column label="公司税号" align="center" prop="bankTaxNo"  min-width="150" show-overflow-tooltip/>
      <el-table-column label="公司电话" align="center" prop="bankPhoneNo" show-overflow-tooltip/>
      <el-table-column label="公司邮箱" align="center" prop="bankEmail" show-overflow-tooltip/>
      <el-table-column label="公司地址" align="center" prop="bankAddress" show-overflow-tooltip/>
      
      <el-table-column label="账户状态" align="center" prop="fundAccountStatus" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="project_general_status" :value="scope.row.fundAccountStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="是否默认" align="center" prop="fundIsDefault" show-overflow-tooltip>
        <template #default="scope">
          <dict-tag :options="sys_yes_or_no" :value="scope.row.fundIsDefault"/>
        </template>
      </el-table-column>
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
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="会计科目" align="center" prop="financeAccountId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:fundAccount:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:fundAccount:remove']">删除</el-button>
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

    <!-- 添加或修改资金账户对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="fundAccountRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="账户名称" prop="fundAccountName">
          <el-input v-model="form.fundAccountName" placeholder="请输入账户名称" />
        </el-form-item>
        <el-form-item label="账户编号" prop="fundAccountNo">
          <el-input v-model="form.fundAccountNo" placeholder="请输入账户编号" />
        </el-form-item>
        <el-form-item label="会计科目:" prop="financeAccountId">
          <el-tree-select 
            v-model="form.financeAccountId" :data="accountTree" :props="treeProps" value-key="accountId"
            placeholder="请选择会计科目" style="width: 100%;"  filterable
          >
          </el-tree-select>
        </el-form-item>
        <el-form-item label="swiftCode" prop="bankSwiftCode">
          <el-input v-model="form.bankSwiftCode" placeholder="请输入swiftCode" />
        </el-form-item>
        <el-form-item label="银行名称" prop="bankName">
          <el-input v-model="form.bankName" placeholder="请输入银行名称" />
        </el-form-item>
        <el-form-item label="开户支行" prop="bankBranch">
          <el-input v-model="form.bankBranch" placeholder="请输入开户支行" />
        </el-form-item>
        <el-form-item label="公司名称" prop="bankCompanyName">
          <el-input v-model="form.bankCompanyName" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="公司税号" prop="bankTaxNo">
          <el-input v-model="form.bankTaxNo" placeholder="请输入公司税号" />
        </el-form-item>
        <el-form-item label="公司电话" prop="bankPhoneNo">
          <el-input v-model="form.bankPhoneNo" placeholder="请输入公司电话" />
        </el-form-item>
        <el-form-item label="公司邮箱" prop="bankEmail">
          <el-input v-model="form.bankEmail" placeholder="请输入公司邮箱" />
        </el-form-item>
        <el-form-item label="公司地址" prop="bankAddress">
          <el-input v-model="form.bankAddress" placeholder="请输入公司地址" />
        </el-form-item>
        <el-form-item label="期初余额:" prop="fundInitialBalance">
          <el-input-number v-model="form.fundInitialBalance" placeholder="请输入期初余额" style="width: 70%;" />
        </el-form-item>
        <el-form-item label="当前余额:" prop="fundCurrentBalance">
          <el-input-number v-model="form.fundCurrentBalance" placeholder="请输入当前余额"  style="width: 70%;" disabled/>
        </el-form-item>
        <el-form-item label="账户状态:" prop="fundAccountStatus">
          <el-radio-group v-model="form.fundAccountStatus">
            <el-radio
              v-for="dict in project_general_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否默认:" prop="fundIsDefault">
          <el-radio-group v-model="form.fundIsDefault">
            <el-radio
              v-for="dict in sys_yes_or_no"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注描述:" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="FundAccount">
import { listFundAccount, getFundAccount, delFundAccount, addFundAccount, updateFundAccount } from "@/api/finance/fundAccount";
import { listAccount } from "@/api/finance/account";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { project_general_status, sys_yes_or_no } = proxy.useDict('project_general_status', 'sys_yes_or_no');

const fundAccountList = ref([]);
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
    fundAccountName: null,
    fundAccountNo: null,
    bankSwiftCode: null,
    fundAccountStatus: null,
    fundIsDefault: null,
    tenantId: null,
  },
  rules: {
    fundAccountName: [
      { required: true, message: "账户名称不能为空", trigger: "blur" }
    ],
    fundAccountNo: [
      { required: true, message: "账户编号不能为空", trigger: "blur" }
    ],
    bankSwiftCode: [
      { required: true, message: "swiftCode不能为空", trigger: "blur" }
    ],
    bankName: [
      { required: true, message: "银行名称不能为空", trigger: "blur" }
    ],
    bankBranch: [
      { required: true, message: "开户支行不能为空", trigger: "blur" }
    ],
    bankCompanyName: [
      { required: true, message: "公司名称不能为空", trigger: "blur" }
    ],
    bankTaxNo: [
      { required: true, message: "公司税号不能为空", trigger: "blur" }
    ],
    bankPhoneNo: [
      { required: true, message: "公司电话不能为空", trigger: "blur" }
    ],
    bankEmail: [
      { required: true, message: "公司邮箱不能为空", trigger: "blur" }
    ],
    bankAddress: [
      { required: true, message: "公司地址不能为空", trigger: "blur" }
    ],
    financeAccountId: [
      { required: true, message: "绑定的会计科目ID不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

// --------------------------------  获取科目列表数据  start  --------------------------------
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


/** el-tree-select 配置 */ 
const treeProps = {
  value: "accountId",
  label: (node) => `${node.accountCode} - ${node.accountName}`, // 自定义显示内容
  children: "children",
  disabled: (node) => node.status == '1'
};

// --------------------------------  获取科目列表数据  end  --------------------------------

/** 查询资金账户列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listFundAccount(queryParams.value).then(response => {
    fundAccountList.value = response.rows;
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
    fundAccountId: null,
    fundAccountName: null,
    fundAccountNo: null,
    bankSwiftCode: null,
    bankName: null,
    bankBranch: null,
    bankCompanyName: null,
    bankTaxNo: null,
    bankPhoneNo: null,
    bankEmail: null,
    bankAddress: null,
    fundInitialBalance: null,
    fundCurrentBalance: null,
    fundAccountStatus: '0',
    fundIsDefault: '1',
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    tenantId: null,
    financeAccountId: null
  };
  proxy.resetForm("fundAccountRef");
  getAccountList()
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
  ids.value = selection.map(item => item.fundAccountId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加资金账户";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _fundAccountId = row.fundAccountId || ids.value
  getFundAccount(_fundAccountId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改资金账户";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["fundAccountRef"].validate(valid => {
    if (valid) {
      if (form.value.fundAccountId != null) {
        updateFundAccount(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addFundAccount(form.value).then(response => {
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
  const _fundAccountIds = row.fundAccountId || ids.value;
  proxy.$modal.confirm('是否确认删除资金账户编号为"' + _fundAccountIds + '"的数据项？').then(function() {
    return delFundAccount(_fundAccountIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('finance/fundAccount/export', {
    ...queryParams.value
  }, `fundAccount_${new Date().getTime()}.xlsx`)
}

getList();
</script>
