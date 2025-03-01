<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="单位名称" prop="unitCode">
        <el-input
          v-model="queryParams.unitCode"
          placeholder="请输入单位名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="单位类型" prop="unitType">
        <el-select v-model="queryParams.unitType" placeholder="请选择单位类型" style="width: 200px;" clearable>
          <el-option
            v-for="dict in product_unit_type"
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
          v-hasPermi="['product:unit:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['product:unit:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['product:unit:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['product:unit:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="unitList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="计量单位ID" align="center" prop="unitId" />
      <el-table-column label="单位名称" align="center" prop="unitCode" />
      <el-table-column label="单位类型" align="center" prop="unitType">
        <template #default="scope">
          <dict-tag :options="product_unit_type" :value="scope.row.unitType"/>
        </template>
      </el-table-column>
      <el-table-column label="换算率" align="right" prop="conversionRate" />
      <el-table-column label="备注" align="center" prop="unitRemark" />
      <el-table-column label="创建者" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updateBy" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['product:unit:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['product:unit:remove']">删除</el-button>
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

    <!-- 添加或修改计量单位对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="unitRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="单位名称" prop="unitCode">
          <el-input v-model="form.unitCode" placeholder="请输入单位名称" />
        </el-form-item>
        <el-form-item label="单位类型" prop="unitType">
          <el-tooltip content="基础单位默认 = 1 ；转换单位 = 基础单位 * 换算率，如(箱12 = 1 * 12)；" effect="dark" placement="bottom">
            <el-radio-group v-model="form.unitType">
              <el-radio
                v-for="dict in product_unit_type"
                :key="dict.value"
                :value="dict.value"
              >{{dict.label}}</el-radio>
            </el-radio-group>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="换算率" prop="conversionRate" v-if="form.unitType == 1">
          <el-input v-model="form.conversionRate" placeholder="请输入换算率(如 箱12 的转换率是 12)"  type="number"/>
        </el-form-item>
        <el-form-item label="备注" prop="unitRemark">
          <el-input v-model="form.unitRemark" placeholder="请输入备注" />
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

<script setup name="Unit">
import { listUnit, getUnit, delUnit, addUnit, updateUnit } from "@/api/product/unit";
import useUserStore from "@/store/modules/user";
// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { product_unit_type } = proxy.useDict('product_unit_type');

const unitList = ref([]);
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
    unitCode: null,
    unitType: null,
    tenantId: null
  },
  rules: {
    unitCode: [
      { required: true, message: "单位名称不能为空", trigger: "blur" }
    ],
    unitType: [
      { required: true, message: "单位类型不能为空", trigger: "change" }
    ],
    conversionRate: [
      {required: true, message: "转换率不能为空", trigger: "blur"},
       // 必须大于0
       {
        validator: (rule, value, callback) => {
          if (parseInt(value, 10) <= 0) {
            callback(new Error('必须大于0'));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询计量单位列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listUnit(queryParams.value).then(response => {
    unitList.value = response.rows;
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
    unitId: null,
    unitCode: null,
    unitType: "0",
    skuId: null,
    conversionRate: '',
    unitRemark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    tenantId: null
  };
  proxy.resetForm("unitRef");
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
  ids.value = selection.map(item => item.unitId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加计量单位";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _unitId = row.unitId || ids.value
  getUnit(_unitId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改计量单位";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["unitRef"].validate(valid => {
    if (valid) {
      if (form.value.unitId != null) {
        updateUnit(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addUnit(form.value).then(response => {
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
  const _unitIds = row.unitId || ids.value;
  proxy.$modal.confirm('是否确认删除计量单位编号为"' + _unitIds + '"的数据项？').then(function() {
    return delUnit(_unitIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('product/unit/export', {
    ...queryParams.value
  }, `unit_${new Date().getTime()}.xlsx`)
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
