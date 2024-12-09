<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="科目编码" prop="accountCode">
        <el-input
          v-model="queryParams.accountCode"
          placeholder="请输入科目编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="科目名称" prop="accountName">
        <el-input
          v-model="queryParams.accountName"
          placeholder="请输入科目名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="科目类型" prop="accountType">
        <el-select v-model="queryParams.accountType" placeholder="请选择科目类型" clearable>
          <el-option
            v-for="dict in erp_finance_account_style"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in project_general_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
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
          v-hasPermi="['finance:account:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Sort"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      border
      :data="accountList"
      row-key="accountId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      ref="accountTable"
      @cell-click="handleCellClick"
    >
      <el-table-column label="科目编码" prop="accountCode" min-width="100" show-overflow-tooltip/>
      <el-table-column label="科目名称" align="center" prop="accountName" show-overflow-tooltip/>
      <el-table-column label="科目类型" align="center" prop="accountType">
        <template #default="scope">
          <dict-tag :options="erp_finance_account_style" :value="scope.row.accountType"/>
        </template>
      </el-table-column>
      <el-table-column label="上级科目" align="center" prop="parentCode" show-overflow-tooltip>
        <template #default="scope">
          <span> {{ scope.row.parentCode ? scope.row.parentCode : '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="辅助项" align="center" prop="assistTypes"  show-overflow-tooltip>
        <template #default="scope">
            <el-tag v-for="item in scope.row.assistTypes" :key="item" size="mini">
              <dict-tag :options="finance_assist_type" :value="item"/>
            </el-tag>
            <span v-if="scope.row.assistTypes.length == 0">--</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="project_general_status" :value="scope.row.status"/>
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
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150">
        <template #default="scope">
            <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['finance:account:add']">新增</el-button>
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:account:edit']">修改</el-button>
            <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:account:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改财务 - 科目对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="accountRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上级科目" prop="parentId">
          <el-tree-select
            ref="accountTreeSelectRef"
            v-model="form.parentId"
            :data="accountOptions"
            :props="{ value: 'accountId', label: 'accountCode', children: 'children' }"
            value-key="accountId"
            placeholder="请选择上级科目ID"
            check-strictly
            @change="updateParentCode"
            :disabled = "form.accountId"
          />
          <el-text type="danger" style="margin-left: 10px;"> 科目级长 4-2-2-2 </el-text>
        </el-form-item>

        <el-form-item label="科目编码" prop="accountCode">
          <el-input v-model="form.accountCode" placeholder="请输入科目编码" style="width: 90%;" @change="updateAccountCode" :disabled = "form.accountId"/>
        </el-form-item>
        <el-form-item label="科目名称" prop="accountName">
          <el-input v-model="form.accountName" placeholder="请输入科目名称" style="width: 90%;"/>
        </el-form-item>
        <el-form-item label="科目类型" prop="accountType">
          <el-select v-model="form.accountType" placeholder="请选择科目类型" :disabled = "form.accountId">
            <el-option
              v-for="dict in erp_finance_account_style"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="辅助项" prop="assistTypes" v-if="form.isLeaf == '0'">
          <el-select v-model="form.assistTypes" multiple placeholder="请选择科目类型" style="width: 90%;">
            <el-option
              v-for="dict in finance_assist_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in project_general_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" style="width: 90%;"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer" style="width: 90%;">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Account">
import { listAccount, getAccount, delAccount, addAccount, updateAccount } from "@/api/finance/account";
import useUserStore from "@/store/modules/user";
import { ElMessage } from "element-plus";
import { ref } from "vue";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { erp_finance_account_style, project_general_status, finance_assist_type } = proxy.useDict('erp_finance_account_style', 'project_general_status', 'finance_assist_type');

const accountList = ref([]);
const accountOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(false);
const refreshTable = ref(true);
// 编辑科目 - 选中绑定父节点
const accountTreeSelectRef = ref(null);
// 添加 ref，用于操作表格实例
const accountTable = ref(null);

/** 控制单行展开折叠 */
const handleCellClick = (row) => {
  if (row.children && row.children.length > 0) {
    // 获取当前展开状态
    accountTable.value.toggleRowExpansion(row)
  }
}

/** 获取选中父节点的科目编码 */
const getSelectedParentAccountCode = () => {
  const parentNode = accountTreeSelectRef.value.getCurrentNode();
  if (parentNode) {
    if(parentNode.parentId == 0){
      form.value.accountLevel = 1;
    } else {
      form.value.accountLevel = parentNode.accountLevel + 1;
    } 
  } else {
    form.value.accountLevel = 1;
  }
  
}

/** 修改父节点编码 */
const updateParentCode = () => {
  getSelectedParentAccountCode()
}

/** 更新科目编码 */
const updateAccountCode = () => {
   form.value.orderNum = form.value.accountCode;
}

const data = reactive({
  form: {},
  queryParams: {
    accountCode: null,
    accountName: null,
    accountType: null,
    status: null,
    tenantId: null
  },
  rules: {
    accountCode: [
      { 
        validator: (rule, value, callback) => {
          if (!form.value.parentId) {
            // 一级科目：必须为 4 位数字
            if (!/^\d{4}$/.test(value)) {
              callback(new Error('一级科目编码必须为 4 位数字'));
            } else {
              callback();
            }
          } else {
            if (form.value.accountLevel == 1){
              // 一级科目：必须为 4 位数字
              if (!/^\d{4}$/.test(value)) {
                callback(new Error('一级科目编码必须为 4 位数字'));
              } else {
                callback();
              }
            } else if (form.value.accountLevel == 2){
              // 二级科目：必须为 4 + 2 位数字
              if (!/^\d{6}$/.test(value)) {
                callback(new Error('二级科目编码必须为 6 位数字'));
              } else {
                callback();
              }
            } else if (form.value.accountLevel == 3){
              // 三级科目：必须为 4 + 2 + 2 位数字
              if (!/^\d{8}$/.test(value)) {
                callback(new Error('三级科目编码必须为 8 位数字'));
              } else {
                callback();
              }
            }else {
              // 最多3级科目
              callback(new Error('最多可以添加3级科目'));
            }
          }
        },
        trigger: 'blur',
      },
      {
        required: true, message: "科目编码不能为空", trigger: "blur" 
      }
    ]
    ,
    accountName: [
      { required: true, message: "科目名称不能为空", trigger: "blur" }
    ],
    accountType: [
      { required: true, message: "科目类型不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询财务 - 科目列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listAccount(queryParams.value).then(response => {
    accountList.value = proxy.handleTree(response.data, "accountId", "parentId");
    loading.value = false;
  });
}

/** 查询财务 - 科目下拉树结构 */
function getTreeselect() {
  listAccount().then(response => {
    accountOptions.value = [];
    const data = { accountId: 0, accountCode: '顶级节点', children: [] };
    data.children = proxy.handleTree(response.data, "accountId", "parentId");
    accountOptions.value.push(data);
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
    accountId: null,
    accountCode: null,
    accountName: null,
    accountType: null,
    parentId: null,
    accountLevel: null,
    ancestors: null,
    isLeaf: '0',
    orderNum: null,
    status: '0',
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    tenantId: null,
    assistTypes:[]
  };
  proxy.resetForm("accountRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  getTreeselect();
  if (row != null && row.accountId) {
    form.value.parentId = row.accountId;
    form.value.accountLevel = row.accountLevel + 1;
    if(form.value.accountLevel > 3){
      ElMessage.error("最多可以添加3级科目");
      return;
    }
  } else {
    form.value.parentId = 0;
    form.value.accountLevel = 1;
  }
  open.value = true;
  title.value = "添加 会计科目";
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.parentId;
    form.value.accountLevel = row.accountLevel;
  }
  getAccount(row.accountId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改 会计科目";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["accountRef"].validate(valid => {
    if (valid) {
      if (form.value.accountId != null) {
        updateAccount(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAccount(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除财务 - 科目编码为  "' + row.accountCode + '"  的数据项？').then(function() {
    return delAccount(row.accountId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
</script>
