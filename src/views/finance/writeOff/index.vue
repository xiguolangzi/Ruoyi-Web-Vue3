<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="核销类型:1-收款核销、2-付款核销 3-转账核销" prop="writeOffType">
        <el-select v-model="queryParams.writeOffType" placeholder="请选择核销类型:1-收款核销、2-付款核销 3-转账核销" clearable>
          <el-option
            v-for="dict in finance_write_off_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="核销流水编号" prop="writeOffNo">
        <el-input
          v-model="queryParams.writeOffNo"
          placeholder="请输入核销流水编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="核销金额" prop="writeOffAmount">
        <el-input
          v-model="queryParams.writeOffAmount"
          placeholder="请输入核销金额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="核销时间" prop="writeOffTime">
        <el-date-picker clearable
          v-model="queryParams.writeOffTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择核销时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="核销备注" prop="writeOffRemark">
        <el-input
          v-model="queryParams.writeOffRemark"
          placeholder="请输入核销备注"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="租户ID" prop="tenantId">
        <el-input
          v-model="queryParams.tenantId"
          placeholder="请输入租户ID"
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
          v-hasPermi="['finance:writeOff:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['finance:writeOff:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['finance:writeOff:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['finance:writeOff:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="writeOffList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="核销ID" align="center" prop="writeOffId" />
      <el-table-column label="核销类型:1-收款核销、2-付款核销 3-转账核销" align="center" prop="writeOffType">
        <template #default="scope">
          <dict-tag :options="finance_write_off_type" :value="scope.row.writeOffType"/>
        </template>
      </el-table-column>
      <el-table-column label="核销流水编号" align="center" prop="writeOffNo" />
      <el-table-column label="核销金额" align="center" prop="writeOffAmount" />
      <el-table-column label="核销时间" align="center" prop="writeOffTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.writeOffTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="核销备注" align="center" prop="writeOffRemark" />
      <el-table-column label="备注描述" align="center" prop="remark" />
      <el-table-column label="租户ID" align="center" prop="tenantId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:writeOff:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:writeOff:remove']">删除</el-button>
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

    <!-- 添加或修改应付核销对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="writeOffRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="核销类型:1-收款核销、2-付款核销 3-转账核销" prop="writeOffType">
          <el-select v-model="form.writeOffType" placeholder="请选择核销类型:1-收款核销、2-付款核销 3-转账核销">
            <el-option
              v-for="dict in finance_write_off_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="核销流水编号" prop="writeOffNo">
          <el-input v-model="form.writeOffNo" placeholder="请输入核销流水编号" />
        </el-form-item>
        <el-form-item label="核销金额" prop="writeOffAmount">
          <el-input v-model="form.writeOffAmount" placeholder="请输入核销金额" />
        </el-form-item>
        <el-form-item label="核销时间" prop="writeOffTime">
          <el-date-picker clearable
            v-model="form.writeOffTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择核销时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="核销备注" prop="writeOffRemark">
          <el-input v-model="form.writeOffRemark" placeholder="请输入核销备注" />
        </el-form-item>
        <el-form-item label="备注描述" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="租户ID" prop="tenantId">
          <el-input v-model="form.tenantId" placeholder="请输入租户ID" />
        </el-form-item>
        <el-divider content-position="center">应付核销明细信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddWriteOffDetail">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteWriteOffDetail">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="writeOffDetailList" :row-class-name="rowWriteOffDetailIndex" @selection-change="handleWriteOffDetailSelectionChange" ref="writeOffDetail">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50"/>
          <el-table-column label="现金银行日记账ID" prop="fundFlowId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.fundFlowId" placeholder="请输入现金银行日记账ID" />
            </template>
          </el-table-column>
          <el-table-column label="日记账流水编号" prop="fundFlowNo" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.fundFlowNo" placeholder="请输入日记账流水编号" />
            </template>
          </el-table-column>
          <el-table-column label="费用登记ID" prop="purchaseInvoiceId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.purchaseInvoiceId" placeholder="请输入费用登记ID" />
            </template>
          </el-table-column>
          <el-table-column label="费用登记流水编号" prop="purchaseInvoiceNo" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.purchaseInvoiceNo" placeholder="请输入费用登记流水编号" />
            </template>
          </el-table-column>
        </el-table>
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

<script setup name="WriteOff">
import { listWriteOff, getWriteOff, delWriteOff, addWriteOff, updateWriteOff } from "@/api/finance/writeOff";

const { proxy } = getCurrentInstance();
const { finance_write_off_type } = proxy.useDict('finance_write_off_type');

const writeOffList = ref([]);
const writeOffDetailList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedWriteOffDetail = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    writeOffType: null,
    writeOffNo: null,
    writeOffAmount: null,
    writeOffTime: null,
    writeOffRemark: null,
    tenantId: null
  },
  rules: {
    writeOffType: [
      { required: true, message: "核销类型:1-收款核销、2-付款核销 3-转账核销不能为空", trigger: "change" }
    ],
    writeOffAmount: [
      { required: true, message: "核销金额不能为空", trigger: "blur" }
    ],
    writeOffTime: [
      { required: true, message: "核销时间不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "修改时间不能为空", trigger: "blur" }
    ],
    tenantId: [
      { required: true, message: "租户ID不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询应付核销列表 */
function getList() {
  loading.value = true;
  listWriteOff(queryParams.value).then(response => {
    writeOffList.value = response.rows;
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
    writeOffId: null,
    writeOffType: null,
    writeOffNo: null,
    writeOffAmount: null,
    writeOffTime: null,
    writeOffRemark: null,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    remark: null,
    tenantId: null
  };
  writeOffDetailList.value = [];
  proxy.resetForm("writeOffRef");
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
  ids.value = selection.map(item => item.writeOffId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加应付核销";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _writeOffId = row.writeOffId || ids.value
  getWriteOff(_writeOffId).then(response => {
    form.value = response.data;
    writeOffDetailList.value = response.data.writeOffDetailList;
    open.value = true;
    title.value = "修改应付核销";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["writeOffRef"].validate(valid => {
    if (valid) {
      form.value.writeOffDetailList = writeOffDetailList.value;
      if (form.value.writeOffId != null) {
        updateWriteOff(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addWriteOff(form.value).then(response => {
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
  const _writeOffIds = row.writeOffId || ids.value;
  proxy.$modal.confirm('是否确认删除应付核销编号为"' + _writeOffIds + '"的数据项？').then(function() {
    return delWriteOff(_writeOffIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 应付核销明细序号 */
function rowWriteOffDetailIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 应付核销明细添加按钮操作 */
function handleAddWriteOffDetail() {
  let obj = {};
  obj.fundFlowId = "";
  obj.fundFlowNo = "";
  obj.purchaseInvoiceId = "";
  obj.purchaseInvoiceNo = "";
  writeOffDetailList.value.push(obj);
}

/** 应付核销明细删除按钮操作 */
function handleDeleteWriteOffDetail() {
  if (checkedWriteOffDetail.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的应付核销明细数据");
  } else {
    const writeOffDetails = writeOffDetailList.value;
    const checkedWriteOffDetails = checkedWriteOffDetail.value;
    writeOffDetailList.value = writeOffDetails.filter(function(item) {
      return checkedWriteOffDetails.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleWriteOffDetailSelectionChange(selection) {
  checkedWriteOffDetail.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('finance/writeOff/export', {
    ...queryParams.value
  }, `writeOff_${new Date().getTime()}.xlsx`)
}

getList();
</script>
