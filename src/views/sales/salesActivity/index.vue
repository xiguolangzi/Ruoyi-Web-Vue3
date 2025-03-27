<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="活动名称" prop="activityName">
        <el-input
          v-model="queryParams.activityName"
          placeholder="请输入活动名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="活动状态" prop="activityStatus">
        <el-select v-model="queryParams.activityStatus" placeholder="请选择活动状态" clearable>
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
          v-hasPermi="['sales:salesActivity:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['sales:salesActivity:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['sales:salesActivity:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['sales:salesActivity:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="salesActivityList" @selection-change="handleSelectionChange" size="small">
      <el-table-column type="selection" :width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" :width="50" />
      <el-table-column label="活动名称" align="center" prop="activityName" :min-width="150" show-overflow-tooltip/>
      <el-table-column label="活动状态" align="center" prop="activityStatus">
        <template #default="scope">
          <dict-tag :options="sys_tenant_status" :value="scope.row.activityStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="基础佣金" align="center" prop="salesmanHasCommission">
        <!-- 自定义表头，增加悬浮提示 -->
        <template #header>
          <el-tooltip content="业务员的基础佣金" placement="top">
            <span>基础佣金</span>
          </el-tooltip>
        </template>
        <template #default="scope">
          <dict-tag :options="erp_sales_is_calculate" :value="scope.row.salesmanHasCommission" />
        </template>
      </el-table-column>
      <el-table-column label="累加佣金点数" align="center" prop="salesmanAddCommissionRate" :min-width="110" show-overflow-tooltip>
        <!-- 自定义表头，增加悬浮提示 -->
        <template #header>
          <el-tooltip content="在业务员的基础佣金的基础上累加的点数" placement="top">
            <span>累加佣金点数</span>
          </el-tooltip>
        </template>
        <template #default="scope">
          <span :style="{ color: scope.row.salesmanAddCommissionRate < 0 ? 'red' : '' }" > {{ scope.row.salesmanAddCommissionRate }} % </span>
        </template>
      </el-table-column>
      <el-table-column label="基础折扣" align="center" prop="customerHasDiscount">
        <!-- 自定义表头，增加悬浮提示 -->
        <template #header>
          <el-tooltip content="客户档案的基础折扣" placement="top">
            <span>基础折扣</span>
          </el-tooltip>
        </template>
        <template #default="scope">
          <dict-tag :options="erp_sales_is_calculate" :value="scope.row.customerHasDiscount"/>
        </template>
      </el-table-column>
      <el-table-column label="追加折上折" align="center" prop="customerAddDiscountRate" :min-width="110" show-overflow-tooltip>
        <!-- 自定义表头，增加悬浮提示 -->
        <template #header>
          <el-tooltip content="基础折扣基础上折上折" placement="top">
            <span>追加折上折</span>
          </el-tooltip>
        </template>
        <template #default="scope">
          <span :style="{ color: scope.row.customerAddDiscountRate < 0 ? 'red' : '' }"  >{{ scope.row.customerAddDiscountRate }} %</span>
        </template>
      </el-table-column>
      <el-table-column label="产品活动" align="center" prop="closePromotion">
        <template #default="scope">
          <dict-tag :options="erp_sales_is_calculate" :value="scope.row.closePromotion"/>
        </template>
      </el-table-column>
      <el-table-column label="活动开始时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动结束时间" align="center" prop="endTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :min-width="100" show-overflow-tooltip/>
      <el-table-column label="创建人" align="center" prop="createBy" show-overflow-tooltip/>
      <el-table-column label="创建时间" align="center" prop="createTime" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改人" align="center" prop="updateBy" show-overflow-tooltip/>
      <el-table-column label="修改时间" align="center" prop="updateTime" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['sales:salesActivity:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['sales:salesActivity:remove']">删除</el-button>
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

    <!-- 添加或修改销售活动 对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="salesActivityRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="活动名称:" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" type="textarea" :maxlength="50" show-word-limit :rows="1"/>
        </el-form-item>
        <el-form-item label="活动时间:" prop="timeRange">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="defaultTime2"
            @change="handleDateChange"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="活动状态:" prop="activityStatus">
          <el-radio-group v-model="form.activityStatus">
            <el-radio
              v-for="dict in sys_tenant_status"
              :key="dict.value"
              :label="dict.value"
              :value="Number(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-divider content-position="center">
          <span>业务员 - 基础佣金</span>
        </el-divider>
        <el-form-item label="基础佣金:" prop="salesmanHasCommission">
          <el-radio-group v-model="form.salesmanHasCommission">
            <el-radio
              v-for="dict in erp_sales_is_calculate"
              :key="dict.value"
              :label="dict.value"
              :value="Number(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="累加佣金点数" prop="salesmanAddCommissionRate">
          <el-input-number
            v-model="form.salesmanAddCommissionRate"
            :min="-100"
            :max="100"
            :controls="false"
            :precision="0"
            placeholder="请输入累加佣金点数"
            ref="inputNumber" @focus="handleFocus()" 
          >
            <template #suffix>
              <span> %</span>
            </template>
          </el-input-number>
        </el-form-item>

        <el-divider content-position="center">
          <span>客户 - 基础折扣</span>
        </el-divider>
        <el-form-item label="基础折扣:" prop="customerHasDiscount">
          <el-radio-group v-model="form.customerHasDiscount">
            <el-radio
              v-for="dict in erp_sales_is_calculate"
              :key="dict.value"
              :label="dict.value"
              :value="Number(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="追加折上折:" prop="customerAddDiscountRate">
          <el-input-number
            v-model="form.customerAddDiscountRate"
            :min="0"
            :max="100"
            :controls="false"
            :precision="0"
            placeholder="请输入折上折(大于0)"
            ref="inputNumber2" @focus="handleFocus2()" 
          >
            <template #suffix>
              <span> %</span>
            </template>
          </el-input-number>
        </el-form-item>

        <el-divider content-position="center">
          <span>sku - 促销活动</span>
        </el-divider>
        <el-form-item label="促销活动:" prop="closePromotion">
          <el-radio-group v-model="form.closePromotion">
            <el-radio
              v-for="dict in erp_sales_is_calculate"
              :key="dict.value"
              :label="dict.value"
              :value="Number(dict.value)"
            >{{dict.label}}</el-radio>
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

<script setup name="SalesActivity">
import { listSalesActivity, getSalesActivity, delSalesActivity, addSalesActivity, updateSalesActivity } from "@/api/sales/salesActivity";
import useUserStore from "@/store/modules/user";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { sys_tenant_status, erp_sales_is_calculate } = proxy.useDict('sys_tenant_status', 'erp_sales_is_calculate');

const salesActivityList = ref([]);
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
    activityName: null,
    activityStatus: null,
    tenantId: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询销售活动 列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listSalesActivity(queryParams.value).then(response => {
    salesActivityList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// --------------------- 1 表单 输入框聚焦选中 start ---------------
const inputNumber  = ref({}); // 使用对象存储各列引用
const inputNumber2  = ref({}); 
// 聚焦时选中内容
const handleFocus = () => {
  const input = inputNumber.value?.$el.querySelector("input");
  if (input) {
    input.select(); // 选中输入框内的所有文本
  }
};
const handleFocus2 = () => {
  const input = inputNumber2.value?.$el.querySelector("input");
  if (input) {
    input.select(); // 选中输入框内的所有文本
  }
};


// ---------------------- 1 表单 输入框聚焦选中 end ------------------

// ********************** 2 时间区域选择 start **********************
// const timeRange = ref([])
const defaultTime2 = [
  new Date(2000, 1, 1, 0, 0, 0),
  new Date(2000, 2, 1, 23, 59, 59),
] 
// 处理日期选择变化
const handleDateChange = (value) => {
  if (value && value.length === 2) {
    form.value.startTime = value[0];
    form.value.endTime = value[1];
  } else {
    form.value.startTime = '';
    form.value.endTime = '';
  }
};
  
// *********************** 2 时间区域选择 end ***********************

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    activityId: null,
    activityName: null,
    activityStatus: '0',
    activityWeight: 0,
    salesmanHasCommission: '0',
    salesmanAddCommissionRate: 0,
    customerHasDiscount: '0',
    customerAddDiscountRate: 0,
    closePromotion: '0',
    timeRange: [],
    startTime: null,
    endTime: null,
    tenantId: null,
    delFlag: null
  };
  proxy.resetForm("salesActivityRef");
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
  ids.value = selection.map(item => item.activityId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加业务活动 ";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _activityId = row.activityId || ids.value
  getSalesActivity(_activityId).then(response => {
    form.value = response.data;
    form.value.timeRange = [form.value.startTime, form.value.endTime];
    open.value = true;
    title.value = "修改业务活动 ";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["salesActivityRef"].validate(valid => {
    if (valid) {
      if (form.value.activityId != null) {
        updateSalesActivity(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSalesActivity(form.value).then(response => {
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
  const _activityIds = row.activityId || ids.value;
  proxy.$modal.confirm('是否确认删除销售活动 编号为"' + _activityIds + '"的数据项？').then(function() {
    return delSalesActivity(_activityIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sales/salesActivity/export', {
    ...queryParams.value
  }, `salesActivity_${new Date().getTime()}.xlsx`)
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
