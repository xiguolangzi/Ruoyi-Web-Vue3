<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发票系列" prop="invoiceSerie">
        <el-input
          v-model="queryParams.invoiceSerie"
          placeholder="请输入发票系列"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发票号" prop="invoiceNumero">
        <el-input
          v-model="queryParams.invoiceNumero"
          placeholder="请输入发票号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="creareTime">
        <el-date-picker clearable
          v-model="queryParams.creareTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择创建时间">
        </el-date-picker>
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
          v-hasPermi="['rabbitmq:mqDeadLetterInvoice:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['rabbitmq:mqDeadLetterInvoice:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button 
          type="warning" 
          plain 
          icon="Edit" 
          :disabled="multiple"
          @click="handleReSand"
          v-hasPermi="['rabbitmq:mqDeadLetterInvoice:edit']"
        >重发</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['rabbitmq:mqDeadLetterInvoice:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['rabbitmq:mqDeadLetterInvoice:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="mqDeadLetterInvoiceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" width="55"/>
      <el-table-column label="订单号" align="center" prop="orderNo" />
      <el-table-column label="发票编号" align="center" prop="invoiceSerie" />
      <el-table-column label="订单号" align="center" prop="invoiceNumero" />
      <el-table-column label="上传编号" align="center" prop="invoiceIdFactura" />
      <el-table-column label="失败原因" align="center" prop="message" />
      <el-table-column label="创建时间" align="center" prop="creareTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.creareTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['rabbitmq:mqDeadLetterInvoice:edit']">修改</el-button>
          <el-button link type="primary" icon="Edit" @click="handleReSand(scope.row)" v-hasPermi="['rabbitmq:mqDeadLetterInvoice:edit']">重发</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['rabbitmq:mqDeadLetterInvoice:remove']">删除</el-button>
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

    <!-- 添加或修改发票队列对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="mqDeadLetterInvoiceRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="发票编号" prop="invoiceCode">
          <el-input v-model="form.invoiceCode" placeholder="请输入发票编号" />
        </el-form-item>
        <el-form-item label="失败原因" prop="message">
          <el-input v-model="form.message" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="创建时间" prop="creareTime">
          <el-date-picker clearable
            v-model="form.creareTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择创建时间">
          </el-date-picker>
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

<script setup name="MqDeadLetterInvoice">
import { listMqDeadLetterInvoice, getMqDeadLetterInvoice, delMqDeadLetterInvoice, addMqDeadLetterInvoice, updateMqDeadLetterInvoice, resendMq } from "@/api/rabbitmq/mqDeadLetterInvoice";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();

const mqDeadLetterInvoiceList = ref([]);
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
    invoiceId: null,
    invoiceCode: null,
    creareTime: null,
    tenantId: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询发票队列列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listMqDeadLetterInvoice(queryParams.value).then(response => {
    mqDeadLetterInvoiceList.value = response.rows;
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
    invoiceId: null,
    invoiceCode: null,
    message: null,
    creareTime: null,
    tenantId: null
  };
  proxy.resetForm("mqDeadLetterInvoiceRef");
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
  title.value = "添加发票队列";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getMqDeadLetterInvoice(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改发票队列";
  }); 
}

/**
 * 重发按钮操作
*/ 
const handleReSand = (row) => {
  reset();
  const _id = row.id || ids.value
  resendMq(_id).then(response => {
    proxy.$modal.msgSuccess("重发成功");
    handleQuery();
  }).catch((e) => {
    proxy.$modal.msgError("重发失败", e.message);
    handleQuery();
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["mqDeadLetterInvoiceRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMqDeadLetterInvoice(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMqDeadLetterInvoice(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除发票队列编号为"' + _ids + '"的数据项？').then(function() {
    return delMqDeadLetterInvoice(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('rabbitmq/mqDeadLetterInvoice/export', {
    ...queryParams.value
  }, `mqDeadLetterInvoice_${new Date().getTime()}.xlsx`)
}

getList();
</script>
