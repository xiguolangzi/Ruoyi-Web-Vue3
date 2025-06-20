<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="分类名称" prop="categoryName">
        <el-input
          v-model="queryParams.categoryName"
          placeholder="请输入分类名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分类状态" prop="status" >
        <el-select v-model="queryParams.status" placeholder="请选择分类状态" clearable style="width: 200px">
          <el-option
            v-for="dict in sys_tenant_status"
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
          v-hasPermi="['product:category:add']"
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
      :data="categoryList"
      row-key="categoryId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      ref="categoryTable"
      size="small"
      @cell-click="handleCellClick"
    >
      <el-table-column label="分类名称" prop="categoryName" min-width="100" show-overflow-tooltip/>
      <el-table-column label="排序" align="center" prop="orderNum" />
      <el-table-column label="分类状态" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_tenant_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建者" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="updateTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="100">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['product:category:edit']">修改</el-button>
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['product:category:add']">新增</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['product:category:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改商品分类对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="categoryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="父类编码" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="categoryOptions"
            :props="{ value: 'categoryId', label: 'categoryName', children: 'children' }"
            value-key="categoryId"
            placeholder="请选择父类编码"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input v-model="form.orderNum" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="分类状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
                v-for="dict in sys_tenant_status"
                :key="dict.value"
                :value="Number(dict.value)"
            >{{ dict.label }}</el-radio>
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

<script setup name="Category">
import { listCategory, getCategory, delCategory, addCategory, updateCategory } from "@/api/product/category";
import useUserStore from "@/store/modules/user";
// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { sys_tenant_status } = proxy.useDict('sys_tenant_status');

const categoryList = ref([]);
const categoryOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(false);
const refreshTable = ref(true);
// 添加 ref，用于操作表格实例
const categoryTable = ref(null);

/** 控制单行展开折叠 */
const handleCellClick = (row) => {
  if (row.children && row.children.length > 0) {
    // 获取当前展开状态
    categoryTable.value.toggleRowExpansion(row)
  }
}

const data = reactive({
  form: {},
  queryParams: {
    categoryName: null,
    status: null,
    tenantId: null
  },
  rules: {
    categoryId: [
      { required: true, message: "分类编码不能为空", trigger: "blur" }
    ],
    parentId: [
      { required: true, message: "父类编码不能为空", trigger: "blur" }
    ],
    categoryName: [
      { required: true, message: "分类名称不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "分类状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询商品分类列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listCategory(queryParams.value).then(response => {
    categoryList.value = proxy.handleTree(response.data, "categoryId", "parentId");
    loading.value = false;
  });
}

/** 查询商品分类下拉树结构 */
function getTreeselect() {
  listCategory().then(response => {
    categoryOptions.value = [];
    const data = { categoryId: 0, categoryName: '顶级节点', children: [] };
    data.children = proxy.handleTree(response.data, "categoryId", "parentId");
    categoryOptions.value.push(data);
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
    categoryId: null,
    parentId: null,
    ancestors: null,
    categoryName: null,
    orderNum: "0",
    status: "0",
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    tenantId: null
  };
  proxy.resetForm("categoryRef");
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
  title.value = "添加商品分类";
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
  getCategory(row.categoryId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改商品分类";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["categoryRef"].validate(valid => {
    if (valid) {
      if (form.value.categoryId != null) {
        updateCategory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCategory(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认 删除 分类名称："' + row.categoryName + '"  的数据项？').then(function() {
    return delCategory(row.categoryId);
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
