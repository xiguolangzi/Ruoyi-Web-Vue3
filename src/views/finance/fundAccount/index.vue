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
      <el-table-column label="会计科目" align="center" prop="financeAccountId" min-width="150" show-overflow-tooltip >
        <template #default="scope">
          <span>{{ getAccountCodeName(scope.row.financeAccountId) || '--' }}</span>
        </template>
      </el-table-column>
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
    <el-dialog :title="title" v-model="open" width="650px" append-to-body>
      <el-form ref="fundAccountRef" :model="form" :rules="rules" label-width="80px">
        <el-row >
          <el-form-item label="账户名称:" prop="fundAccountName">
            <el-input v-model="form.fundAccountName" placeholder="请输入账户名称" />
          </el-form-item>
          <el-form-item label="账户账号:" prop="fundAccountNo">
            <el-input v-model="form.fundAccountNo" placeholder="请输入银行账号" />
          </el-form-item>
        </el-row>
        <el-form-item label="会计科目:" prop="financeAccountId" >
          <el-tree-select 
            v-model="form.financeAccountId" :data="accountTree" :props="treeProps" value-key="accountId"
            placeholder="请选择会计科目"  filterable 
          >
          </el-tree-select>
        </el-form-item>
        <el-row >
          <el-form-item label="银行名称:" prop="bankName">
            <el-input v-model="form.bankName" type="textarea"  maxlength="50" show-word-limit :rows="1" placeholder="请输入银行名称" />
          </el-form-item>
          <el-form-item label="swiftCode:" prop="bankSwiftCode">
            <el-input v-model="form.bankSwiftCode" type="textarea"  maxlength="20" show-word-limit :rows="1"  placeholder="请输入swiftCode" />
          </el-form-item>
        </el-row>
        <el-form-item label="开户支行:" prop="bankBranch">
          <el-input v-model="form.bankBranch" type="textarea"  maxlength="100" show-word-limit :rows="1" placeholder="请输入开户支行" />
        </el-form-item>
        <el-row >
          <el-form-item label="公司名称:" prop="bankCompanyName">
            <el-input v-model="form.bankCompanyName" placeholder="请输入公司名称" />
          </el-form-item>
          <el-form-item label="公司税号:" prop="bankTaxNo">
            <el-input v-model="form.bankTaxNo" placeholder="请输入公司税号" />
          </el-form-item>
        </el-row>
        <el-row >
          <el-form-item label="公司电话:" prop="bankPhoneNo">
            <el-input v-model="form.bankPhoneNo" placeholder="请输入公司电话" />
          </el-form-item>
          <el-form-item label="公司邮箱:" prop="bankEmail">
            <el-input v-model="form.bankEmail" placeholder="请输入公司邮箱" />
          </el-form-item>
        </el-row>

        <el-form-item label="公司地址:" prop="bankAddress" >
          <el-input v-model="form.bankAddress" placeholder="请输入公司地址" />
        </el-form-item>

        <el-row >
          <el-form-item label="期初余额:" prop="fundInitialBalance">
            <el-input-number v-model="form.fundInitialBalance" placeholder="请输入期初余额" 
              :max='99999999' 
              :min='-99999999' 
              :precision='2' :step='0' :controls="false"  ref="inputNumber" @focus="handleFocus" 
              :class="form.fundInitialBalance < 0 ? 'negative-input' : ''" 
            >
              <template #suffix>
                <span>€</span>
              </template>
            </el-input-number>
          </el-form-item>
          <el-form-item label="当前余额:" prop="fundCurrentBalance">
            <el-input-number v-model="form.fundCurrentBalance" placeholder="系统自动生成"  disabled 
              :max='99999999' 
              :min='-99999999' 
              :precision='2' :step='0' :controls="false"
            >
              <template #suffix>
                <span>€</span>
              </template>
            </el-input-number>
          </el-form-item>
        </el-row>

        <el-row >
          <el-form-item label="账户状态:" prop="fundAccountStatus" style="margin-right: 30px;">
            <el-radio-group v-model="form.fundAccountStatus">
              <el-radio v-for="dict in project_general_status" :key="dict.value" :value="dict.value" >{{dict.label}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否默认:" prop="fundIsDefault" >
            <el-radio-group v-model="form.fundIsDefault">
              <el-radio v-for="dict in sys_yes_or_no" :key="dict.value" :value="dict.value" >{{dict.label}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-row>
        
        
        <el-form-item label="备注描述:" prop="remark">
          <el-input v-model="form.remark" type="textarea"  maxlength="100" show-word-limit :rows="2"  placeholder="请输入备注描述信息" />
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

// ********************************* 4 表单 输入框聚焦选中 start ********************************
const inputNumber  = ref({}); // 使用对象存储各列引用
// 聚焦时选中内容
const handleFocus = () => {
  const input = inputNumber.value?.$el.querySelector("input");
  if (input) {
    input.select(); // 选中输入框内的所有文本
  }
};

// ********************************* 4 表单 输入框聚焦选中 end ********************************

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
      { required: true, message: "账户账号不能为空", trigger: "blur" }
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
      //accountTree.value = proxy.handleTree(response.data, "accountId", "parentId") || [];
      accountList.value = response.data || [];
      accountTree.value = filterAccountTree(accountList.value, '100') || [];
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

/** 根据科目ID 查询科目编码 + 科目名称 */
const getAccountCodeName = (accountId) => {
  const account = accountList.value.find(item => item.accountId === accountId)
  return account ? account.accountCode + ' - ' + account.accountName : '--'
}

getAccountList()

/** 4 获取指定的会计科目树形列表 */
const filterAccountTree = (data,AccountCodeStartNumber) => {
  if (!data || !AccountCodeStartNumber) {
    return data
  }
  // 用于记录应该保留的节点的ID
  const keepIds = new Set()
  // 第一次遍历：找出所有符合条件的节点及其所有父节点
  const findValidNodes = (node) => {
    if (node.accountCode && node.accountCode.startsWith(AccountCodeStartNumber)) { // 现金1001 银行1002 100开头
      // 找到符合条件的节点，记录这个节点和它所有的父节点
      let current = node
      while (current) {
        keepIds.add(current.accountId)
        // 通过parentId找父节点
        current = data.find(item => item.accountId === current.parentId)
      }
    }

  }

  // 对原始数据进行遍历
  data.forEach(findValidNodes)

  // 第二次遍历：过滤并重构树
  const filterNode = (nodes) => {
    return nodes
      .filter(node => keepIds.has(node.accountId))
      .map(node => ({
        ...node,
        children: node.children ? filterNode(node.children) : []
      }))
  }

  return filterNode(proxy.handleTree(data, "accountId", "parentId"))
}

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

<style scoped lang="scss">
.el-select {
  width: 200px ;
}

:deep(.el-input-number) {
  color: black; /* 默认字体颜色 */
}
:deep(.negative-input) input {
  color: red; /* 负数字体颜色 */
}

</style>
