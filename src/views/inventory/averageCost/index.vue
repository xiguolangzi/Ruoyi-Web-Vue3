<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商品ID" prop="skuId">
        <el-input
          v-model="queryParams.skuId"
          placeholder="请输入商品ID"
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
          v-hasPermi="['inventory:averageCost:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['inventory:averageCost:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['inventory:averageCost:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['inventory:averageCost:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="averageCostList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" align="center" width="60" />
      <el-table-column label="商品ID" align="center" prop="skuId" />
      <el-table-column label="现存量" align="center" prop="currentStock" />
      <el-table-column label="总入库数量" align="center" prop="totalQuantity" />
      <el-table-column label="总采购金额" align="center" prop="totalPrice" />
      <el-table-column label="总额外费用" align="center" prop="totalExpense" />
      <el-table-column label="总成本" align="center" prop="totalCost" />
      <el-table-column label="加权平均成本" align="center" prop="averageCost" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['inventory:averageCost:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['inventory:averageCost:remove']">删除</el-button>
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

    <!-- 添加或修改加权平均成本对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="averageCostRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商品ID" prop="skuId">
          <el-input v-model="form.skuId" placeholder="请输入商品ID" />
        </el-form-item>
        <el-form-item label="入库数量" prop="totalQuantity">
          <el-input v-model="form.totalQuantity" placeholder="请输入入库数量" />
        </el-form-item>
        <el-form-item label="采购金额" prop="totalPrice">
          <el-input v-model="form.totalPrice" placeholder="请输入采购金额" />
        </el-form-item>
        <el-form-item label="入库费用" prop="totalExpense">
          <el-input v-model="form.totalExpense" placeholder="请输入入库费用" />
        </el-form-item>
        <el-form-item label="总成本" prop="totalCost">
          <el-input v-model="form.totalCost" placeholder="请输入总成本" />
        </el-form-item>
        <el-form-item label="加权平均成本" prop="averageCost">
          <el-input v-model="form.averageCost" placeholder="请输入加权平均成本" />
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

<script setup name="AverageCost">
import { listAverageCost, getAverageCost, delAverageCost, addAverageCost, updateAverageCost } from "@/api/inventory/averageCost";
import useUserStore from "@/store/modules/user";


// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();

const averageCostList = ref([]);
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
      { required: true, message: "商品ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询加权平均成本列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listAverageCost(queryParams.value).then(response => {
    averageCostList.value = response.rows;
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
    id: null,
    skuId: null,
    currentStock: null,
    totalQuantity: null,
    totalPrice: null,
    totalExpense: null,
    totalCost: null,
    averageCost: null,
    tenantId: null
  };
  proxy.resetForm("averageCostRef");
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
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加加权平均成本";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getAverageCost(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改加权平均成本";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["averageCostRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateAverageCost(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAverageCost(form.value).then(response => {
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
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除加权平均成本编号为"' + _ids + '"的数据项？').then(function() {
    return delAverageCost(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('inventory/averageCost/export', {
    ...queryParams.value
  }, `averageCost_${new Date().getTime()}.xlsx`)
}

getList();
</script>
