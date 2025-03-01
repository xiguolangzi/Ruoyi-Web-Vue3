<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="分类名称" prop="categoryName">
        <el-input v-model="queryParams.categoryName" placeholder="请输入分类名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="分类状态" prop="categoryStatus">
        <el-select v-model="queryParams.categoryStatus" placeholder="请选择分类状态" clearable>
          <el-option v-for="dict in sys_tenant_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['order:customerCategory:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button-group style="margin-left: 50px;">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button type="info" icon="Refresh" @click="resetQuery">重置</el-button>
        </el-button-group>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-if="refreshTable" v-loading="loading" :data="customerCategoryList" row-key="categoryId"
      :default-expand-all="isExpandAll" :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="分类名称" align="center" prop="categoryName" />
      <el-table-column label="备注描述" align="center" prop="remark" />
      <el-table-column label="分类状态" align="center" prop="categoryStatus" width="80">
        <template #default="scope">
          <el-switch v-model="scope.row.categoryStatus" :active-value="sys_tenant_status[0].value"
            :inactive-value="sys_tenant_status[1].value" inline-prompt active-text="启用" inactive-text="禁用"
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            @change="handleChangeStatus(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="排列顺序" align="center" prop="orderNumber" />

      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改人" align="center" prop="updateBy" />
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="120">
        <template #default="scope">
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)"
            v-hasPermi="['order:customerCategory:add']">新增</el-button>
          <el-button link type="success" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['order:customerCategory:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['order:customerCategory:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改客户分类对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="customerCategoryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="父级ID" prop="parentId">
          <el-tree-select v-model="form.parentId" :data="customerCategoryOptions"
            :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }" value-key="categoryId"
            placeholder="请选择父级ID" check-strictly />
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" type="textarea" maxlength="30" show-word-limit
            :rows="1" />
        </el-form-item>
        <el-form-item label="分类状态" prop="categoryStatus">
          <el-radio-group v-model="form.categoryStatus">
            <el-radio v-for="dict in sys_tenant_status" :key="dict.value" :value="dict.value">{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排列顺序:" prop="orderNumber">
          <el-input-number v-model="form.orderNumber" placeholder="顺序" :max="999" :min="0" />
        </el-form-item>
        <el-form-item label="备注描述" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注描述" type="textarea" maxlength="50" show-word-limit
            :rows="2" />
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

<script setup name="CustomerCategory">
import { listCustomerCategory, getCustomerCategory, delCustomerCategory, addCustomerCategory, updateCustomerCategory, changeStatus } from "@/api/order/customerCategory";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { sys_tenant_status } = proxy.useDict('sys_tenant_status');

const customerCategoryList = ref([]);
const customerCategoryOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(true);
const refreshTable = ref(true);

const data = reactive({
  form: {},
  queryParams: {
    categoryName: null,
    categoryStatus: null,
    tenantId: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询客户分类列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listCustomerCategory(queryParams.value).then(response => {
    customerCategoryList.value = proxy.handleTree(response.data, "categoryId", "parentId");
    loading.value = false;
  });
}

/** 查询客户分类下拉树结构 */
function getTreeselect() {
  listCustomerCategory().then(response => {
    customerCategoryOptions.value = [];
    const data = { categoryId: 0, categoryName: '顶级节点', children: [] };
    data.children = proxy.handleTree(response.data, "categoryId", "parentId");
    customerCategoryOptions.value.push(data);
  });
}


/** 修改状态  */
function handleChangeStatus(row) {
  let text = row.categoryStatus === "0" ? "启用" : "禁用";
  proxy.$modal.confirm('确认要"' + text + '" 分类名称为："' + row.categoryName + '" 的分类吗?').then(function () {
    return changeStatus(row);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
    getList();
  }).catch(function () {
    row.categoryStatus = row.categoryStatus === "0" ? "1" : "0";
  });
};


	
// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    categoryId: null,
    parentId: null,
    ancestors: null,
    categoryName: null,
    categoryStatus: '0',
    orderNumber: 0,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    tenantId: null
  };
  proxy.resetForm("customerCategoryRef");
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
  if (row != null && row.categoryId) {
    form.value.parentId = row.categoryId;
  } else {
    form.value.parentId = 0;
  }
  open.value = true;
  title.value = "添加客户分类";
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
  getCustomerCategory(row.categoryId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改客户分类";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["customerCategoryRef"].validate(valid => {
    if (valid) {
      if (form.value.categoryId != null) {
        updateCustomerCategory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCustomerCategory(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除客户分类编号为"' + row.categoryId + '"的数据项？').then(function() {
    return delCustomerCategory(row.categoryId);
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
