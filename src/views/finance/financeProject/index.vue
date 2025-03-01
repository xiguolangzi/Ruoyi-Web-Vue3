<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="项目名称:" prop="projectName">
        <el-input
          v-model="queryParams.projectName"
          placeholder="请输入项目名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会计科目:" prop="financeAccountId" >
        <el-tree-select 
          v-model="queryParams.financeAccountId" :data="accountTree" :props="treeProps" value-key="accountId"
          placeholder="请选择会计科目"  filterable @keyup.enter="handleQuery"
        >
        </el-tree-select>
      </el-form-item>
      <el-form-item label="项目状态:" prop="projectStatus">
        <el-select v-model="queryParams.projectStatus" placeholder="请选择项目状态" clearable>
          <el-option
            v-for="dict in project_general_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 50px;">
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
          v-hasPermi="['finance:financeProject:add']"
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

    <el-table class="table-container"
      v-if="refreshTable"
      v-loading="loading"
      :data="financeProjectList"
      row-key="projectId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="会计项目名称" prop="projectName" min-width="120" show-overflow-tooltip/>
      <el-table-column label="上级项目名称" align="center" prop="parentName">
        <template #default="scope">
          <span>{{ scope.row.parentName || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="会计科目" align="center" prop="financeAccountId" min-width="150" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ getAccountCodeName(scope.row.financeAccountId) || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="项目状态" align="center" prop="projectStatus">
        <template #default="scope">
          <dict-tag :options="project_general_status" :value="scope.row.projectStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" show-overflow-tooltip/>
      <el-table-column label="创建时间" align="center" prop="createTime" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改者" align="center" prop="updateBy" show-overflow-tooltip/>
      <el-table-column label="修改时间" align="center" prop="updateTime" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注描述" align="center" prop="remark" min-width="100" show-overflow-tooltip/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150">
        <template #default="scope">
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['finance:financeProject:add']">新增</el-button>
          <el-button link type="success" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:financeProject:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:financeProject:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改会计项目对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="financeProjectRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="项目名称:" prop="projectName">
          <el-input v-model="form.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="上级项目:" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="financeProjectOptions"
            :props="{ value: 'projectId', label: 'projectName', children: 'children' }"
            value-key="projectId"
            placeholder="请选择上级项目ID"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="会计科目:" prop="financeAccountId">
           <el-tree-select 
              v-model="form.financeAccountId" :data="accountTree" :props="treeProps" value-key="accountId"
              placeholder="请选择会计科目" style="width: 100%;"  filterable @change="changeFinanceAccountId(form.financeAccountId)"
            >
            </el-tree-select>
        </el-form-item>
        <el-form-item label="项目状态:" prop="projectStatus">
          <el-radio-group v-model="form.projectStatus">
            <el-radio v-for="dict in project_general_status" :key="dict.value" :value="dict.value" >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注描述:" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注描述" type="textarea" maxlength="20" show-word-limit  />
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

<script setup name="FinanceProject">
import { listFinanceProject, getFinanceProject, delFinanceProject, addFinanceProject, updateFinanceProject } from "@/api/finance/financeProject";
import useUserStore from "@/store/modules/user";
import { ElMessage } from "element-plus";
import { listAccount } from "@/api/finance/account";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { project_general_status } = proxy.useDict('project_general_status');

const financeProjectList = ref([]);
const financeProjectOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(true);
const refreshTable = ref(true);

const data = reactive({
  form: {},
  queryParams: {
    projectName: null,
    parentId: null,
    financeAccountId: null,
    projectStatus: null,
    tenantId: null
  },
  rules: {
    projectName: [
      { required: true, message: "项目名称不能为空", trigger: "blur" }
    ],
    projectStatus: [
      { required: true, message: "项目状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

// --------------------------------  2 获取科目列表数据  start  --------------------------------
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

getAccountList()

/** 根据科目ID 查询科目编码 + 科目名称 */
const getAccountCodeName = (accountId) => {
  const account = accountList.value.find(item => item.accountId === accountId)
  return account ? account.accountCode + ' - ' + account.accountName : '--'
}

/** 根据科目ID 查询科目编码 */
const changeFinanceAccountId = (accountId) => {
  const account = accountList.value.find(item => item.accountId === accountId)
  form.value.financeAccountCode = account ? account.accountCode : ''
}

// --------------------------------  2 获取科目列表数据  end  --------------------------------

/** 查询会计项目列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listFinanceProject(queryParams.value).then(response => {
    financeProjectList.value = proxy.handleTree(response.data, "projectId", "parentId");
    loading.value = false;
  });
}

/** 查询会计项目下拉树结构 */
function getTreeselect() {
  listFinanceProject().then(response => {
    financeProjectOptions.value = [];
    const data = { projectId: 0, projectName: '顶级节点', children: [] };
    data.children = proxy.handleTree(response.data, "projectId", "parentId");
    financeProjectOptions.value.push(data);
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
    projectId: null,
    projectName: null,
    parentId: null,
    parentName: null,
    ancestors: null,
    financeAccountId: null,
    financeAccountCode: null,
    projectStatus: '1',
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    tenantId: null
  };
  proxy.resetForm("financeProjectRef");
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
  if (row != null && row.projectId) {
    form.value.parentId = row.projectId;
  } else {
    form.value.parentId = 0;
  }
  open.value = true;
  title.value = "添加会计项目";
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
  }
  getFinanceProject(row.projectId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改会计项目";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["financeProjectRef"].validate(valid => {
    if (valid) {
      if (form.value.projectId != null) {
        updateFinanceProject(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addFinanceProject(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除会计项目编号为"' + row.projectId + '"的数据项？').then(function() {
    return delFinanceProject(row.projectId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
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
