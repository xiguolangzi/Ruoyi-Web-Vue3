<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="单据类型" prop="sequenceType">
        <el-select v-model="queryParams.sequenceType" placeholder="请选择单据类型" clearable>
          <el-option v-for="dict in order_sequence_type" :key="dict.value" :label="dict.label" :value="Number(dict.value)" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序规则" prop="sequenceRule">
        <el-select v-model="queryParams.sequenceRule" placeholder="请选择排序规则" clearable>
          <el-option v-for="dict in order_sequence_rules" :key="dict.value" :label="dict.label" :value="Number(dict.value)" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序状态" prop="sequenceStatus">
        <el-select v-model="queryParams.sequenceStatus" placeholder="请选择状态" clearable>
          <el-option v-for="dict in project_general_status" :key="dict.value" :label="dict.label" :value="Number(dict.value)" />
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
          v-hasPermi="['sequence:sequence:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['sequence:sequence:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['sequence:sequence:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['sequence:sequence:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="sequenceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" width="50" />
      <el-table-column label="单据类型" align="center" prop="sequenceType">
        <template #default="scope">
          <dict-tag :options="order_sequence_type" :value="scope.row.sequenceType" />
        </template>
      </el-table-column>
      <el-table-column label="排序规则" align="center" prop="sequenceRule">
        <template #default="scope">
          <dict-tag :options="order_sequence_rules" :value="scope.row.sequenceRule" />
        </template>
      </el-table-column>
      <el-table-column label="订单前缀" align="center" prop="sequencePrefix" />
      <el-table-column label="时间格式" align="center" prop="dateType">
        <template #default="scope">
          <dict-tag :options="order_sequence_date_type" :value="scope.row.dateType" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="sequenceStatus">
        <template #default="scope">
          <dict-tag :options="project_general_status" :value="scope.row.sequenceStatus" />
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="updateTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="110">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['sequence:sequence:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['sequence:sequence:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改序列配置管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="sequenceRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="单据类型" prop="sequenceType">
          <el-select v-model="form.sequenceType" placeholder="请选择单据类型">
            <el-option v-for="dict in order_sequence_type" :key="dict.value" :label="dict.label"
              :value="Number(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序规则" prop="sequenceRule">
          <el-select v-model="form.sequenceRule" placeholder="请选择排序规则" @change="handleRulesChanged">
            <el-option v-for="dict in order_sequence_rules" :key="dict.value" :label="dict.label"
              :value="Number(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="订单前缀" prop="sequencePrefix">
          <el-input v-model="form.sequencePrefix" placeholder="请输入订单前缀" type="textarea" :maxlength="9" show-word-limit
            :rows="1" />
        </el-form-item>
        <el-form-item label="时间格式" prop="dateType">
          <el-select v-model="form.dateType" placeholder="请选择时间格式" clearable disabled>
            <el-option v-for="dict in order_sequence_date_type" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <div style="margin-bottom: 10px; margin-left: 40px;" v-if="form.sequenceRule !== RulesType.RANDOM">
          <strong style="color: blue;">序号组成示例：</strong>
          <el-text type="danger">{{ orderNumber }}</el-text>
        </div>
        <el-form-item label="状态" prop="sequenceStatus">
          <el-radio-group v-model="form.sequenceStatus">
            <el-radio v-for="dict in project_general_status" :key="dict.value"
              :value="Number(dict.value)">{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" type="textarea" :maxlength="200" show-word-limit
            :rows="2" />
        </el-form-item>

        <!--  规则序号记录明细信息  -->
        <div v-if="form.sequenceRule !== RulesType.RANDOM">
          <el-divider content-position="center">序号记录明细信息</el-divider>
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button type="primary" icon="Plus" @click="handleAddSequenceDetail">添加</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button type="danger" icon="Delete" @click="handleDeleteSequenceDetail">删除</el-button>
            </el-col>
          </el-row>
          <el-table :data="sequenceDetailList" :row-class-name="rowSequenceDetailIndex"
            @selection-change="handleSequenceDetailSelectionChange" ref="sequenceDetail">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="序号" align="center" prop="index" width="50" />
            <el-table-column label="会计年度" prop="periodYear">
              <template #default="scope">
                <el-select v-model="scope.row.periodYear" placeholder="请选择会计年度" style="width: 100%;">
                  <el-option v-for="dict in finance_period_year" :key="dict.value" :label="dict.label"
                    :value="Number(dict.value)"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="会计月份" prop="periodMonth">
              <template #default="scope">
                <el-select v-model="scope.row.periodMonth" placeholder="请选择会计月份" style="width: 100%;" :disabled="form.sequenceRule === RulesType.YEAR">
                  <el-option v-for="dict in finance_period_month" :key="dict.value" :label="dict.label"
                    :value="Number(dict.value)"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="当前序号" prop="currentNumber">
              <template #default="scope">
                <el-input v-model="scope.row.currentNumber" placeholder="请输入当前序号" />
              </template>
            </el-table-column>
          </el-table>
        </div>


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

<script setup name="Sequence">
import { listSequence, getSequence, delSequence, addSequence, updateSequence } from "@/api/sequence/sequence";
import useUserStore from "@/store/modules/user";
import { RulesType, DateType, DefaultConfig } from "./sequenceEnum.js"

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { project_general_status, order_sequence_type, order_sequence_rules, order_sequence_date_type, finance_period_year, finance_period_month} = proxy.useDict('project_general_status', 'finance_period_year', 'order_sequence_type', 'order_sequence_date_type', 'finance_period_month', 'order_sequence_rules');

const sequenceList = ref([]);
const sequenceDetailList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedSequenceDetail = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sequenceType: null,
    sequenceRule: null,
    sequenceStatus: null,
    tenantId: null,
  },
  rules: {
    sequenceType: [
      { required: true, message: "单据类型不能为空", trigger: "change" }
    ],
    sequenceRule: [
      { required: true, message: "排序规则不能为空", trigger: "change" }
    ],
    sequenceStatus: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 切换排序规则 - 选择对应的时间格式 */
const handleRulesChanged = () => {
  if (form.value.sequenceRule === RulesType.YEAR) {
    form.value.dateType = DateType.YEAR;
  } else if (form.value.sequenceRule === RulesType.YEAR_MONTH) {
    form.value.dateType = DateType.YEAR_MONTH;
  } else if (form.value.sequenceRule === RulesType.RANDOM) {
    form.value.dateType = '';
  }
  // 清空明细信息
  sequenceDetailList.value = [];
}

/** 获取当前设置的订单号组成 */
const DATE_FORMATS = {
  yyyy: () => {
    return new Date().getFullYear().toString();
  },
  yyyyMM: () => {
    const date = new Date();
    return date.getFullYear() +
           (date.getMonth() + 1).toString().padStart(2, '0');
  },
  yyyyMMdd: () => {
    const date = new Date();
    return date.getFullYear() +
           (date.getMonth() + 1).toString().padStart(2, '0') +
           date.getDate().toString().padStart(2, '0');
  },
  yyyyMMddHHmm: () => {
    const date = new Date();
    return date.getFullYear() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0') +
      date.getHours().toString().padStart(2, '0') +
      date.getMinutes().toString().padStart(2, '0')
  },
  yyyyMMddHHmmss: () => {
    const date = new Date();
    return date.getFullYear() +
           (date.getMonth() + 1).toString().padStart(2, '0') +
           date.getDate().toString().padStart(2, '0') +
           date.getHours().toString().padStart(2, '0') +
           date.getMinutes().toString().padStart(2, '0') +
           date.getSeconds().toString().padStart(2, '0');
  }
};
const orderNumber = computed(() => {
  const formatFn = DATE_FORMATS[form.value.dateType];
  let formattedDate = ''
  if (formatFn){
    formattedDate = formatFn()
  }
  let num = ''
  if(form.value.currentNumber){
    num = form.value.currentNumber.toString().padStart(6, '0')
  }else{
    num = '000001'
  }
  // 拼接并返回完整订单号
  return `${form.value.sequencePrefix ? form.value.sequencePrefix : '' }${formattedDate}${num}`;
});

/** 查询序列配置管理列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listSequence(queryParams.value).then(response => {
    sequenceList.value = response.rows;
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
    sequenceId: null,
    sequenceType: DefaultConfig.DEFAULT_TYPE,
    sequenceRule: DefaultConfig.DEFAULT_RULES,
    sequencePrefix: null,
    dateType: DefaultConfig.DEFAULT_DATE_TYPE,
    sequenceStatus: DefaultConfig.DEFAULT_STATUS,
    tenantId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  sequenceDetailList.value = [];
  proxy.resetForm("sequenceRef");
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
  ids.value = selection.map(item => item.sequenceId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加序列配置管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _sequenceId = row.sequenceId || ids.value
  getSequence(_sequenceId).then(response => {
    form.value = response.data;
    sequenceDetailList.value = response.data.sequenceDetailList;
    open.value = true;
    title.value = "修改序列配置管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["sequenceRef"].validate(valid => {
    if (valid) {
      form.value.sequenceDetailList = sequenceDetailList.value;
      form.value.dateType = form.value.dateType ? form.value.dateType : '';
      if (form.value.sequenceId != null) {
        updateSequence(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        }).catch(error => {
          proxy.$modal.msgError(error.message);
        });
      } else {
        addSequence(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        }).catch(error => {
          proxy.$modal.msgError(error.message);
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _sequenceIds = row.sequenceId || ids.value;
  proxy.$modal.confirm('是否确认删除序列配置管理编号为"' + _sequenceIds + '"的数据项？').then(function() {
    return delSequence(_sequenceIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 序号记录明细序号 */
function rowSequenceDetailIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 序号记录明细添加按钮操作 */
function handleAddSequenceDetail() {
  let obj = {};
  // 如果规则是 年 则 月份为 "00"
  if (form.value.sequenceRule == RulesType.YEAR) {
    obj.periodMonth = "00";
  } else {
    obj.periodMonth = "";
  }
  obj.periodYear = "";
  obj.currentNumber = '1';
  sequenceDetailList.value.push(obj);
}

/** 序号记录明细删除按钮操作 */
function handleDeleteSequenceDetail() {
  if (checkedSequenceDetail.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的序号记录明细数据");
  } else {
    const sequenceDetails = sequenceDetailList.value;
    const checkedSequenceDetails = checkedSequenceDetail.value;
    sequenceDetailList.value = sequenceDetails.filter(function(item) {
      return checkedSequenceDetails.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleSequenceDetailSelectionChange(selection) {
  checkedSequenceDetail.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sequence/sequence/export', {
    ...queryParams.value
  }, `sequence_${new Date().getTime()}.xlsx`)
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
