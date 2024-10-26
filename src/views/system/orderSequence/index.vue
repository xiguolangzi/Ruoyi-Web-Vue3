<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单类型" prop="orderType">
        <el-select v-model="queryParams.orderType" placeholder="请选择订单类型" clearable>
          <el-option
            v-for="dict in order_sequence_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in project_general_status"
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
          v-hasPermi="['system:orderSequence:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:orderSequence:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:orderSequence:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:orderSequence:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderSequenceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="订单类型" align="center" prop="orderType">
        <template #default="scope">
          <dict-tag :options="order_sequence_type" :value="scope.row.orderType"/>
        </template>
      </el-table-column>
      <el-table-column label="订单前缀" align="center" prop="orderPrefix" min-width="80" show-overflow-tooltip />
      <el-table-column label="时间格式" align="center" prop="dateType" min-width="80" show-overflow-tooltip />
      <el-table-column label="当前单号" align="center" prop="currentValue" min-width="120" show-overflow-tooltip />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="project_general_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="租户id" align="center" prop="tenantId" />
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
      <el-table-column label="乐观锁" align="center" prop="version" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:orderSequence:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:orderSequence:remove']">删除</el-button>
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

    <!-- 添加或修改单号序列配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="orderSequenceRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="订单类型" prop="orderType">
          <el-select v-model="form.orderType" placeholder="请选择订单类型">
            <el-option
              v-for="dict in order_sequence_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="订单前缀" prop="orderPrefix">
          <el-input v-model="form.orderPrefix" placeholder="请输入订单前缀" />
        </el-form-item>
        <el-form-item label="时间格式" prop="dateType">
         <el-select v-model="form.dateType" placeholder="请选择时间格式" clearable>
            <el-option
              v-for="dict in order_sequence_date_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="当前单号" prop="currentValue">
          <el-input v-model="form.currentValue" placeholder="请输入当前单号" />
        </el-form-item>
        <div style="margin-bottom: 10px;">
          <strong>当前单号的组成：</strong>
          <el-text type="danger">{{ orderNumber }}</el-text>
        </div>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status" disabled>
            <el-radio
              v-for="dict in project_general_status"
              :key="dict.value"
              :label="dict.value"
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

<script setup name="OrderSequence">
import { listOrderSequence, getOrderSequence, delOrderSequence, addOrderSequence, updateOrderSequence } from "@/api/system/orderSequence";
import {selectAll} from "@/api/system/tenant";
import useUserStore from "@/store/modules/user";
import { computed } from "vue";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { project_general_status, order_sequence_type, order_sequence_date_type } = proxy.useDict('project_general_status', 'order_sequence_type', 'order_sequence_date_type');

const orderSequenceList = ref([]);
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
    orderType: null,
    status: null,
  },
  rules: {
    orderType: [
      { required: true, message: "订单类型不能为空", trigger: "change" }
    ],
    currentValue: [
    { required: true, message: '请输入起始单号', trigger: 'blur' },
    { 
      pattern: /^[1-9]\d{0,5}$/, 
      message: '请输入1-6位正整数', 
      trigger: 'blur' 
    }
  ],
    orderPrefix: [
      { required: true, message: "订单前缀不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);


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
  if(form.value.currentValue){
    num = form.value.currentValue.toString().padStart(6, '0')
  }else{
    num = '000001'
  }
  
  
  // 拼接并返回完整订单号
  return `${form.value.orderPrefix}${formattedDate}${num}`;
});

/** 查询单号序列配置列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listOrderSequence(queryParams.value).then(response => {
    orderSequenceList.value = response.rows;
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
    orderType: '1',
    orderPrefix: '',
    dateType: null,
    currentValue: 1,
    status: '0',
    tenantId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    version: null
  };
  proxy.resetForm("orderSequenceRef");
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
  title.value = "添加单号序列配置";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getOrderSequence(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改单号序列配置";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderSequenceRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateOrderSequence(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addOrderSequence(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除单号序列配置编号为"' + _ids + '"的数据项？').then(function() {
    return delOrderSequence(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/orderSequence/export', {
    ...queryParams.value
  }, `orderSequence_${new Date().getTime()}.xlsx`)
}

/** 获取租户列表 */
const fetchTenantList = async () => {
    try {
    const response = await selectAll();
    tenantList.value = response.data;
    console.log("--------------",tenantList.value)
    } catch (error) {
    console.error('获取租户列表失败:', error);
    }
};

getList();
</script>
