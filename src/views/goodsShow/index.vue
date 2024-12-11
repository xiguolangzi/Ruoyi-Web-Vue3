<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="产品编码" prop="id">
        <el-input v-model="queryParams.id" placeholder="请输入产品编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="产品名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入产品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="dishList" @selection-change="handleSelectionChange">
      <el-table-column label="产品图片" align="center" prop="image" width="80" fixed="left">
        <template #default="scope">
          <image-preview :src="scope.row.image" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="产品价格" align="center" prop="price" width="100">
        <template #default="scope">
          <span>{{ scope.row.price }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="产品名称" align="center" prop="name" width="150" />
      <el-table-column label="产品编码" align="center" prop="id" width="80" />
      <el-table-column label="产品数量" align="center" prop="store" width="80" />
      <el-table-column label="描述信息" align="left" prop="description" min-width="300" show-overflow-tooltip />
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup name="Dish">
import { listDish, getDish, delDish, addDish, updateDish } from "@/api/sky/dish";

const { proxy } = getCurrentInstance();

const dishList = ref([]);
const dishFlavorList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedDishFlavor = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    code:null,
    id: null,
    status: null,
  },
  rules: {
    name: [
      { required: true, message: "菜品名称不能为空", trigger: "blur" }
    ],
    price: [
      { required: true, message: "菜品价格不能为空", trigger: "blur" }
    ],
    image: [
      { required: true, message: "图片不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "销售状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);


/** 查询菜品管理列表 */
function getList() {
  loading.value = true;
  listDish(queryParams.value).then(response => {
    dishList.value = response.rows;
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
    name: null,
    price: null,
    image: null,
    description: null,
    status: null,
    createTime: null,
    updateTime: null
  };
  dishFlavorList.value = [];
  proxy.resetForm("dishRef");
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


/** 导出按钮操作 */
function handleExport() {
  proxy.download('sky/dish/export', {
    ...queryParams.value
  }, `dish_${new Date().getTime()}.xlsx`)
}

getList();
</script>
