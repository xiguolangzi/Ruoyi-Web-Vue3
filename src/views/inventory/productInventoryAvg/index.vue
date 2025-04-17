<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="skuId" prop="skuId">
        <el-input
          v-model="queryParams.skuId"
          placeholder="请输入skuId"
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
          v-hasPermi="['inventory:productInventoryAvg:add']"
          v-if="false"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['inventory:productInventoryAvg:edit']"
          v-if="false"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['inventory:productInventoryAvg:remove']"
          v-if="false"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['inventory:productInventoryAvg:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="productInventoryAvgList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="mainId" />
      <el-table-column label="skuCode" align="center" prop="skuId" />
      <el-table-column label="skuName" align="center" prop="skuId" />
      <el-table-column label="skuValue" align="center" prop="skuId" />
      <el-table-column label="skuPrice" align="center" prop="skuId" />
      <el-table-column label="总数量" align="center" prop="totalQuantity" />
      <el-table-column label="加权平均成本" align="center" prop="averageCost" />
      <el-table-column label="总成本" align="center" prop="totalCost" width="110" show-overflow-tooltip></el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="110" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" v-if="false">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['inventory:productInventoryAvg:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['inventory:productInventoryAvg:remove']">删除</el-button>
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

    <!-- 添加或修改库存查询对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="productInventoryAvgRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="skuId" prop="skuId">
          <el-input v-model="form.skuId" placeholder="请输入skuId" />
        </el-form-item>
        <el-form-item label="总数量" prop="totalQuantity">
          <el-input v-model="form.totalQuantity" placeholder="请输入总数量" />
        </el-form-item>
        <el-form-item label="加权平均成本" prop="averageCost">
          <el-input v-model="form.averageCost" placeholder="请输入加权平均成本" />
        </el-form-item>
        <el-form-item label="总成本" prop="totalCost">
          <el-input v-model="form.averageCost" placeholder="系统自动计算" disabled />
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

<script setup name="ProductInventoryAvg">
import { listProductInventoryAvg, getProductInventoryAvg, delProductInventoryAvg, addProductInventoryAvg, updateProductInventoryAvg } from "@/api/inventory/productInventoryAvg";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();

const productInventoryAvgList = ref([]);
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
    skuId: null,
    tenantId: null
  },
  rules: {
    skuId: [
      { required: true, message: "skuId不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询库存查询列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listProductInventoryAvg(queryParams.value).then(response => {
    productInventoryAvgList.value = response.rows;
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
    mainId: null,
    skuId: null,
    totalQuantity: null,
    averageCost: null,
    totalCost: null,
    createBy: null,
    createTime: null,
    tenantId: null
  };
  proxy.resetForm("productInventoryAvgRef");
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
  ids.value = selection.map(item => item.mainId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加库存查询";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _mainId = row.mainId || ids.value
  getProductInventoryAvg(_mainId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改库存查询";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productInventoryAvgRef"].validate(valid => {
    if (valid) {
      if (form.value.mainId != null) {
        updateProductInventoryAvg(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProductInventoryAvg(form.value).then(response => {
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
  const _mainIds = row.mainId || ids.value;
  proxy.$modal.confirm('是否确认删除库存查询编号为"' + _mainIds + '"的数据项？').then(function() {
    return delProductInventoryAvg(_mainIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('inventory/productInventoryAvg/export', {
    ...queryParams.value
  }, `productInventoryAvg_${new Date().getTime()}.xlsx`)
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
