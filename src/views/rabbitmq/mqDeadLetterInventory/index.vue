<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="队列类型" prop="queueType">
        <el-select v-model="queryParams.queueType" placeholder="请选择队列类型" clearable>
          <el-option v-for="dict in mq_dead_letter_inventory_type" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="入库单编号" prop="stockInNo">
        <el-input v-model="queryParams.stockInNo" placeholder="请输入入库单编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="入库单类型" prop="stockType">
        <el-select v-model="queryParams.stockType" placeholder="请选择入库单类型" clearable>
          <el-option v-for="dict in erp_stock_in_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['rabbitmq:mqDeadLetterInventory:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['rabbitmq:mqDeadLetterInventory:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Edit" :disabled="single" @click="handleReSend"
          v-hasPermi="['rabbitmq:mqDeadLetterInventory:edit']">重发</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['rabbitmq:mqDeadLetterInventory:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Download" @click="handleExport"
          v-hasPermi="['rabbitmq:mqDeadLetterInventory:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="mqDeadLetterInventoryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" />
      <el-table-column label="入库单编号" align="center" prop="stockIn.inNo" />
      <el-table-column label="队列类型" align="center" prop="queueType">
        <template #default="scope">
          <dict-tag :options="mq_dead_letter_inventory_type" :value="scope.row.queueType" />
        </template>
      </el-table-column>
      <el-table-column label="入库单类型" align="center" prop="stockType">
        <template #default="scope">
          <dict-tag :options="erp_stock_in_type" :value="scope.row.stockType" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['rabbitmq:mqDeadLetterInventory:edit']">修改</el-button>
          <el-button link type="warning" icon="Edit" @click="handleReSend(scope.row)"
            v-hasPermi="['rabbitmq:mqDeadLetterInventory:edit']">重发</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['rabbitmq:mqDeadLetterInventory:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改库存死信队列登记对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="mqDeadLetterInventoryRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="队列类型" prop="queueType">
          <el-select v-model="form.queueType" placeholder="请选择队列类型">
            <el-option v-for="dict in mq_dead_letter_inventory_type" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="入库单ID" prop="stockInId">
          <el-input v-model="form.stockInId" placeholder="请输入入库单ID" />
        </el-form-item>
        <el-form-item label="入库单类型" prop="stockType">
          <el-select v-model="form.stockType" placeholder="请选择入库单类型">
            <el-option v-for="dict in erp_stock_in_type" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
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

<script setup name="MqDeadLetterInventory">
import { listMqDeadLetterInventory, getMqDeadLetterInventory, delMqDeadLetterInventory, addMqDeadLetterInventory, updateMqDeadLetterInventory, reSendMq } from "@/api/rabbitmq/mqDeadLetterInventory";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { mq_dead_letter_inventory_type, erp_stock_in_type } = proxy.useDict('mq_dead_letter_inventory_type', 'erp_stock_in_type');

const mqDeadLetterInventoryList = ref([]);
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
    queueType: null,
    stockInNo: null,
    stockType: null,
    tenantId: null
  },
  rules: {
    stockInId: [
      { required: true, message: "入库单ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询库存死信队列登记列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listMqDeadLetterInventory(queryParams.value).then(response => {
    mqDeadLetterInventoryList.value = response.rows;
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
    queueType: null,
    stockInId: null,
    stockType: null,
    createTime: null,
    tenantId: null
  };
  proxy.resetForm("mqDeadLetterInventoryRef");
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
  title.value = "添加库存死信队列登记";
}

/** 重发按钮操作 */
function handleReSend(row) {
  reset();
  const _id = row.id || ids.value
  reSendMq(_id).then(response => {
    proxy.$modal.msgSuccess("重发成功");
    handleQuery();
  }).catch((e) => {
    proxy.$modal.msgError("重发失败",e.message);
    handleQuery();
  })
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getMqDeadLetterInventory(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改库存死信队列登记";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["mqDeadLetterInventoryRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMqDeadLetterInventory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMqDeadLetterInventory(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除库存死信队列登记编号为"' + _ids + '"的数据项？').then(function() {
    return delMqDeadLetterInventory(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('rabbitmq/mqDeadLetterInventory/export', {
    ...queryParams.value
  }, `mqDeadLetterInventory_${new Date().getTime()}.xlsx`)
}

getList();
</script>
