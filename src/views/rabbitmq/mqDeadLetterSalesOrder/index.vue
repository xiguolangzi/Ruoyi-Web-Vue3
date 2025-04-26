<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="销售初始编号" prop="orderInitNo">
        <el-input v-model="queryParams.orderInitNo" placeholder="请输入销售初始编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['rabbitmq:mqDeadLetterSalesOrder:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['rabbitmq:mqDeadLetterSalesOrder:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Edit" :disabled="single" @click="handleReSand"
          v-hasPermi="['rabbitmq:mqDeadLetterSalesOrder:edit']">重发</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['rabbitmq:mqDeadLetterSalesOrder:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Download" @click="handleExport"
          v-hasPermi="['rabbitmq:mqDeadLetterSalesOrder:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="mqDeadLetterSalesOrderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键id" align="center" prop="id" />
      <el-table-column label="销售订单ID" align="center" prop="orderId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['rabbitmq:mqDeadLetterSalesOrder:edit']">修改</el-button>
          <el-button link type="warning" icon="Edit" @click="handleReSand(scope.row)"
            v-hasPermi="['rabbitmq:mqDeadLetterSalesOrder:edit']">重发</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['rabbitmq:mqDeadLetterSalesOrder:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改库存死信队列对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="mqDeadLetterSalesOrderRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="销售订单ID" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入销售订单ID" />
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

<script setup name="MqDeadLetterSalesOrder">
import { listMqDeadLetterSalesOrder, getMqDeadLetterSalesOrder, delMqDeadLetterSalesOrder, addMqDeadLetterSalesOrder, updateMqDeadLetterSalesOrder } from "@/api/rabbitmq/mqDeadLetterSalesOrder";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();

const mqDeadLetterSalesOrderList = ref([]);
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
    orderInitNo: null,
    tenantId: null
  },
  rules: {
    orderId: [
      { required: true, message: "销售订单ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询库存死信队列列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listMqDeadLetterSalesOrder(queryParams.value).then(response => {
    mqDeadLetterSalesOrderList.value = response.rows;
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
    orderId: null,
    createTime: null,
    tenantId: null
  };
  proxy.resetForm("mqDeadLetterSalesOrderRef");
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
  title.value = "添加库存死信队列";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getMqDeadLetterSalesOrder(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改库存死信队列";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["mqDeadLetterSalesOrderRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMqDeadLetterSalesOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMqDeadLetterSalesOrder(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除库存死信队列编号为"' + _ids + '"的数据项？').then(function() {
    return delMqDeadLetterSalesOrder(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/**
 * 重发按钮操作
*/ 
const handleReSand = (row) => {
  reset();
  const _id = row.id || ids.value
  reSendMq(_id).then(response => {
    proxy.$modal.msgSuccess("重发成功");
    handleQuery();
  }).catch((e) => {
    proxy.$modal.msgError("重发失败", e.message);
  })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('rabbitmq/mqDeadLetterSalesOrder/export', {
    ...queryParams.value
  }, `mqDeadLetterSalesOrder_${new Date().getTime()}.xlsx`)
}

getList();
</script>
