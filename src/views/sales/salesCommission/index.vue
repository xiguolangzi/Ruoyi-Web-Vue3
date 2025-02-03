<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="业务员" prop="salesmanId">
        <el-select
            v-model="queryParams.salesmanId"
            filterable
            clearable
            placeholder="请选择业务员"
            @keyup.enter="handleQuery"
        >
            <el-option
            v-for="item in userList"
            :key="item.userId"
            :label="item.userName"
            :value="item.userId"
            />
        </el-select>
      </el-form-item>
      <el-form-item label="佣金状态" prop="commissionStatus">
        <el-select v-model="queryParams.commissionStatus" placeholder="请选择佣金状态" clearable>
          <el-option
            v-for="dict in sys_tenant_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
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
          v-hasPermi="['sales:salesCommission:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sales:salesCommission:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sales:salesCommission:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['sales:salesCommission:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="salesCommissionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" type="index" min-width="50"/>
      <el-table-column label="佣金名称" align="center" prop="commissionName" />
      <el-table-column label="业务员" align="center" prop="salesmanId" min-width="120" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ getUserName(scope.row.salesmanId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="佣金点数" align="center" prop="commissionRate" >
        <template #default="scope">
          <span>{{ scope.row.commissionRate }} %</span>
        </template>
      </el-table-column>
      <el-table-column label="佣金状态" align="center" prop="commissionStatus">
        <template #default="scope">
          <el-switch v-model="scope.row.commissionStatus" :active-value="sys_tenant_status[0].value"
            :inactive-value="sys_tenant_status[1].value" inline-prompt active-text="启用" inactive-text="禁用"
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            @change="handleChangeStatus(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="是否默认" align="center" prop="commissionIsDefault">
        <template #default="scope">
          <dict-tag :options="sys_yes_or_no" :value="scope.row.commissionIsDefault"/>
        </template>
      </el-table-column>
      <el-table-column label="备注说明" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改人" align="center" prop="updateBy" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="90">
        <template #default="scope">
          <el-button link type="success" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['sales:salesCommission:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['sales:salesCommission:remove']">删除</el-button>
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

    <!-- 添加或修改业务员佣金管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="salesCommissionRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="佣金名称" prop="commissionName">
          <el-input v-model="form.commissionName" type="textarea" placeholder="请输入内容" :maxlength="50" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="业务员ID" prop="salesmanId">
          <el-select
              v-model="form.salesmanId"
              filterable
              clearable
              placeholder="请选择业务员"
          >
              <el-option
              v-for="item in userList"
              :key="item.userId"
              :label="item.userName"
              :value="item.userId"
              />
          </el-select>
        </el-form-item>
        <el-form-item label="佣金点数" prop="commissionRate">
          <div class="flex items-center">
            <el-input-number
              v-model="form.commissionRate"
              :min="0"
              :max="99.9"
              :step="0.1"
              :controls="false"
              :precision="1"
              placeholder="请输入佣金点数"
              ref="inputNumber" @focus="handleFocus" 
            />
            <span> %</span>
          </div>
        </el-form-item>
        <el-form-item label="佣金状态" prop="commissionStatus">
          <el-radio-group v-model="form.commissionStatus">
            <el-radio
              v-for="dict in sys_tenant_status"
              :key="dict.value"
              :label="dict.value"
              :value="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否默认" prop="commissionIsDefault">
          <el-radio-group v-model="form.commissionIsDefault">
            <el-radio
              v-for="dict in sys_yes_or_no"
              :key="dict.value"
              :label="dict.value"
              :value="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注说明" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" :maxlength="70" show-word-limit :rows="2"/>
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

<script setup name="SalesCommission">
import { listSalesCommission, getSalesCommission, delSalesCommission, addSalesCommission, updateSalesCommission, changeStatus } from "@/api/sales/salesCommission";
import useUserStore from "@/store/modules/user";
import { listSalesman } from "@/api/system/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { sys_tenant_status, sys_yes_or_no } = proxy.useDict('sys_tenant_status', 'sys_yes_or_no');

const salesCommissionList = ref([]);
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
    salesmanId: null,
    commissionName: null,
    commissionIsDefault: null,
    commissionStatus: null,
    tenantId: null,
  },
  rules: {
    salesmanId: [
      { required: true, message: "业务员ID不能为空", trigger: "blur" }
    ],
    commissionRate: [
      { required: true, message: "佣金点数不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询业务员佣金管理列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listSalesCommission(queryParams.value).then(response => {
    salesCommissionList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// ------------------------------------ 1 获取业务员信息 start ------------------------------------
const userList = ref([]);
/** 获取员工列表 */
const getUserList = () => {
  listSalesman().then(response => {
    userList.value = response.rows || [];
    console.log("获取业务员列表：",userList.value);
  }).catch((e) => {
    console.log("获取业务员列表失败：",e);
  });
}

const getUserName = (id) => {
  const user = userList.value.find(item => item.userId === id);
  return user ? user.userName : '--';
}

getUserList();

// ------------------------------------ 1 获取业务员信息 end ------------------------------------

// ------------------------------------ 2 表单 输入框聚焦选中 start ------------------------------------
const inputNumber  = ref({}); // 使用对象存储各列引用

// 聚焦时选中内容
const handleFocus = () => {
  const input = inputNumber.value?.$el.querySelector("input");
  if (input) {
    input.select(); // 选中输入框内的所有文本
  }
};

// ------------------------------------ 2 表单 输入框聚焦选中 end ------------------------------------

// ------------------------------------- 3 修改状态 start ------------------------------------
/** 修改状态  */
function handleChangeStatus(row) {
  let text = row.commissionStatus === "0" ? "启用" : "禁用";
  proxy.$modal.confirm('确认要"' + text + '" 佣金名称为："' + row.commissionName + '" 的佣金吗?').then(function () {
    return changeStatus(row);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
    getList();
  }).catch(function () {
    row.commissionStatus = row.commissionStatus === "0" ? "1" : "0";
  });
};
// ------------------------------------- 3 修改状态 end ------------------------------------


// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    commissionId: null,
    salesmanId: null,
    commissionName: null,
    commissionRate: null,
    commissionStatus: '0',
    commissionIsDefault: '1',
    remark: null,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    tenantId: null,
    delFlag: null
  };
  proxy.resetForm("salesCommissionRef");
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
  ids.value = selection.map(item => item.commissionId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加业务员佣金管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _commissionId = row.commissionId || ids.value
  getSalesCommission(_commissionId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改业务员佣金管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["salesCommissionRef"].validate(valid => {
    if (valid) {
      if (form.value.commissionId != null) {
        updateSalesCommission(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSalesCommission(form.value).then(response => {
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
  const _commissionIds = row.commissionId || ids.value;
  proxy.$modal.confirm('是否确认删除业务员佣金管理编号为"' + _commissionIds + '"的数据项？').then(function() {
    return delSalesCommission(_commissionIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sales/salesCommission/export', {
    ...queryParams.value
  }, `salesCommission_${new Date().getTime()}.xlsx`)
}

getList();
</script>

<style scoped lang="scss">
.el-input-number {
  position: relative;
}

.el-input-number .el-input__inner {
  padding-right: 30px; /* 为后缀内容留出空间 */
}

.el-input-number .suffix {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}
</style>
