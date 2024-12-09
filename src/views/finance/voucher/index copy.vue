<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="会计年度" prop="periodYear">
        <el-select v-model="queryParams.periodYear" placeholder="请选择会计年度" clearable >
          <el-option
            v-for="dict in finance_period_year"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="会计月份" prop="periodMonth">
        <el-select v-model="queryParams.periodMonth" placeholder="请选择会计月份" clearable >
          <el-option
            v-for="dict in finance_period_month"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="凭证类型" prop="voucherType">
        <el-select v-model="queryParams.voucherType" placeholder="请选择凭证类型" clearable >
          <el-option
            v-for="dict in finance_voucher_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="凭证编号" prop="voucherNo" >
        <el-input
          v-model="queryParams.voucherNo"
          placeholder="请输入凭证编号"
          clearable
          @keyup.enter="handleQuery"
          style="width: 150px;"
        />
      </el-form-item>
      <el-form-item label="凭证状态" prop="voucherStatus">
        <el-select v-model="queryParams.voucherStatus" placeholder="请选择凭证状态" clearable >
          <el-option
            v-for="dict in finance_voucher_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 20px;">
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
          v-hasPermi="['finance:voucher:add']"
        >填制凭证</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['finance:voucher:edit']"
        >修改凭证</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['finance:voucher:remove']"
        >作废凭证</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['finance:voucher:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="voucherList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="会计年度" align="center" prop="periodYear">
        <template #default="scope">
          <dict-tag :options="finance_period_year" :value="scope.row.periodYear"/>
        </template>
      </el-table-column>
      <el-table-column label="会计月份" align="center" prop="periodMonth">
        <template #default="scope">
          <dict-tag :options="finance_period_month" :value="scope.row.periodMonth"/>
        </template>
      </el-table-column>
      <el-table-column label="凭证编号" align="center" prop="voucherNo" />
      <el-table-column label="凭证类型" align="center" prop="voucherType">
        <template #default="scope">
          <dict-tag :options="finance_voucher_type" :value="scope.row.voucherType"/>
        </template>
      </el-table-column>
      <el-table-column label="凭证日期" align="center" prop="voucherDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.voucherDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总金额" align="center" prop="totalAmount" >
        <template #default="scope">
          <span>{{ formatTwo(scope.row.totalAmount) }} € </span>
        </template>
      </el-table-column>
      <el-table-column label="凭证状态" align="center" prop="voucherStatus">
        <template #default="scope">
          <dict-tag :options="finance_voucher_status" :value="scope.row.voucherStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="操作人ID" align="center" prop="operatorId" />
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="updateTime" >
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:voucher:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:voucher:remove']">删除</el-button>
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

    <!-- 添加或修改会计凭证对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="voucherRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="凭证类型" prop="voucherType">
          <el-select v-model="form.voucherType" placeholder="请选择凭证类型">
            <el-option
              v-for="dict in finance_voucher_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="会计年度" prop="periodYear">
          <el-select v-model="form.periodYear" placeholder="请选择会计年度">
            <el-option
              v-for="dict in finance_period_year"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="会计月份" prop="periodMonth">
          <el-select v-model="form.periodMonth" placeholder="请选择会计月份">
            <el-option
              v-for="dict in finance_period_month"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="凭证日期" prop="voucherDate">
          <el-date-picker clearable
            v-model="form.voucherDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择凭证日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="凭证编号" prop="voucherNo">
          <el-input v-model="form.voucherNo" placeholder="请输入凭证编号" />
        </el-form-item>
        <el-form-item label="总金额" prop="totalAmount">
          <el-input v-model="form.totalAmount" placeholder="请输入总金额" />
        </el-form-item>
        <el-form-item label="凭证状态" prop="voucherStatus">
          <el-radio-group v-model="form.voucherStatus">
            <el-radio
              v-for="dict in finance_voucher_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="操作人ID" prop="operatorId">
          <el-input v-model="form.operatorId" placeholder="请输入操作人ID" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="Voucher">
import { listVoucher, getVoucher, delVoucher, addVoucher, updateVoucher } from "@/api/finance/voucher";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { finance_period_year, finance_period_month, finance_voucher_type, finance_voucher_status } = proxy.useDict('finance_period_year', 'finance_period_month', 'finance_voucher_type', 'finance_voucher_status');

const voucherList = ref([]);
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
    voucherType: null,
    periodYear: null,
    periodMonth: null,
    voucherNo: null,
    voucherStatus: null,
    operatorId: null,
    tenantId: null
  },
  rules: {
    voucherType: [
      { required: true, message: "凭证类型不能为空", trigger: "change" }
    ],
    periodYear: [
      { required: true, message: "会计年度不能为空", trigger: "change" }
    ],
    periodMonth: [
      { required: true, message: "会计月份不能为空", trigger: "change" }
    ],
    voucherDate: [
      { required: true, message: "凭证日期不能为空", trigger: "blur" }
    ],
    voucherNo: [
      { required: true, message: "凭证编号不能为空", trigger: "blur" }
    ],
    voucherStatus: [
      { required: true, message: "凭证状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询会计凭证列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listVoucher(queryParams.value).then(response => {
    voucherList.value = response.rows;
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
    voucherId: null,
    voucherType: null,
    periodYear: null,
    periodMonth: null,
    voucherDate: null,
    voucherNo: null,
    totalAmount: null,
    voucherStatus: null,
    operatorId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    tenantId: null
  };
  proxy.resetForm("voucherRef");
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
  ids.value = selection.map(item => item.voucherId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加会计凭证";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _voucherId = row.voucherId || ids.value
  getVoucher(_voucherId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改会计凭证";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["voucherRef"].validate(valid => {
    if (valid) {
      if (form.value.voucherId != null) {
        updateVoucher(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addVoucher(form.value).then(response => {
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
  const _voucherIds = row.voucherId || ids.value;
  proxy.$modal.confirm('是否确认删除会计凭证编号为"' + _voucherIds + '"的数据项？').then(function() {
    return delVoucher(_voucherIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('finance/voucher/export', {
    ...queryParams.value
  }, `voucher_${new Date().getTime()}.xlsx`)
}

getList();
</script>
