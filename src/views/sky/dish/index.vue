<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="菜品名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入菜品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="销售状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择销售状态" clearable style="width: 180px;">
          <el-option v-for="dict in sky_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['sky:dish:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['sky:dish:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['sky:dish:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['sky:dish:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dishList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="产品图片" align="center" prop="image" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.image" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="产品编码" align="center" prop="id" />
      <el-table-column label="产品名称" align="center" prop="name" />
      <el-table-column label="产品价格" align="center" prop="price">
        <template #default="scope">
          <span>{{ scope.row.price }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="产品数量" align="center" prop="store" />

      <el-table-column label="描述信息" align="center" prop="description" />
      <el-table-column label="销售状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sky_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['sky:dish:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['sky:dish:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改菜品管理对话框 -->
    <el-dialog 
      :title="title" 
      v-model="open" 
      width="600px" 
      append-to-body 
      style="padding: 10px 50px 10px 10px;"
      :close-on-click-modal="false"
    >
      <el-form ref="dishRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品编码" prop="id">
          <el-input v-model="form.id" placeholder="请输入产品编码" />
        </el-form-item>
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入产品价格">
            <template #append>€</template>
          </el-input>
        </el-form-item>
        <el-form-item label="产品数量" prop="store">
          <el-input-number v-model="form.store" placeholder="请输入产品数量" />
        </el-form-item>
        <el-form-item label="产品图片" prop="image">
          <image-upload v-model="form.image" :limit="20" />
        </el-form-item>
        <el-form-item label="描述信息" prop="description">
          <el-input v-model="form.description" placeholder="请输入描述信息" type="textarea" maxlength="50" show-word-limit/>
        </el-form-item>
        <el-form-item label="销售状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择销售状态">
            <el-option v-for="dict in sky_status" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-divider content-position="center" v-if="false">菜品口味关系信息</el-divider>
        <el-row :gutter="10" class="mb8" v-if="false">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddDishFlavor">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteDishFlavor">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="dishFlavorList" :row-class-name="rowDishFlavorIndex"
          @selection-change="handleDishFlavorSelectionChange" ref="dishFlavor" v-if="false">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50" />
          <el-table-column label="口味名称" prop="name" width="150">
            <template #default="scope">
              <!-- <el-input v-model="scope.row.name" placeholder="请输入口味名称" /> -->
              <el-select v-model="scope.row.name" placeholder="请选择口味名称" @change="getDishFlavorValue(scope.row)">
                <el-option v-for="dishFlavor in dishFlavorData" :key="dishFlavor.name" :label="dishFlavor.name"
                  :value="dishFlavor.name"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="口味列表" prop="value" width="300">
            <template #default="scope">
              <!-- <el-input v-model="scope.row.value" placeholder="请输入口味列表" /> -->
              <el-select v-model="scope.row.value" placeholder="请选择口味列表" multiple
                @focus="handleDishFlavorFocus(scope.row)">
                <el-option v-for="value in dishFlavorDataCheckList" :key="value" :label="value"
                  :value="value"></el-option>
              </el-select>
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

<script setup name="Dish">
import { listDish, getDish, delDish, addDish, updateDish } from "@/api/sky/dish";

const { proxy } = getCurrentInstance();
const { sky_status } = proxy.useDict('sky_status');

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
    status: null,
  },
  rules: {
    name: [
      { required: true, message: "菜品名称不能为空", trigger: "blur" }
    ],
    price: [
      { required: true, message: "菜品价格不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "销售状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

// ----------------------------
// 定义口味名称和口味列表的静态数据
const dishFlavorData = ref([
  { name: "辣度", value: ["不辣","微辣","中辣","重辣"] },
  { name: "忌口", value: ["不要葱","不要蒜","不要香菜","不要辣"]},
  { name: "甜度", value: ["无糖","少糖","半糖"] },
]);

// 存储当前口味的数据列表
const dishFlavorDataCheckList = ref([]);

// 根据选中的name去查找静态数据的value
function getDishFlavorValue(row) {
  // 清空当前行的value
  row.value = [];
  dishFlavorDataCheckList.value = dishFlavorData.value.find(item => item.name === row.name).value;
}

// 定义口味列表获取焦点时更新当前口味列表
function handleDishFlavorFocus(row) {
  dishFlavorDataCheckList.value = dishFlavorData.value.find(item => item.name === row.name).value;
}

// ----------------------------

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
    status: 1,
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
  title.value = "添加菜品管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getDish(_id).then(response => {
    form.value = response.data;
    dishFlavorList.value = response.data.dishFlavorList;
    // 将口味列表的字符串转为json数组
    if (dishFlavorList.value) {
      dishFlavorList.value.forEach(item => {
        item.value = JSON.parse(item.value);
      });
    }
  
    open.value = true;
    title.value = "修改菜品管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["dishRef"].validate(valid => {
    if (valid) {
      form.value.dishFlavorList = dishFlavorList.value;
      // 将口味列表中的value通过json工具类转为字符串
      if(form.value.dishFlavorList != null){
        form.value.dishFlavorList.forEach(item => {
          item.value = JSON.stringify(item.value);
        });
      }

      if (form.value.id != null) {
        updateDish(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDish(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除菜品编码为"' + _ids + '"的数据项？').then(function() {
    return delDish(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 菜品口味关系序号 */
function rowDishFlavorIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 菜品口味关系添加按钮操作 */
function handleAddDishFlavor() {
  let obj = {};
  obj.name = "";
  obj.value = "";
  dishFlavorList.value.push(obj);
}

/** 菜品口味关系删除按钮操作 */
function handleDeleteDishFlavor() {
  if (checkedDishFlavor.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的菜品口味关系数据");
  } else {
    const dishFlavors = dishFlavorList.value;
    const checkedDishFlavors = checkedDishFlavor.value;
    dishFlavorList.value = dishFlavors.filter(function(item) {
      return checkedDishFlavors.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleDishFlavorSelectionChange(selection) {
  checkedDishFlavor.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('sky/dish/export', {
    ...queryParams.value
  }, `dish_${new Date().getTime()}.xlsx`)
}

getList();
</script>
