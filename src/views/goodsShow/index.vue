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
        <el-button type="primary" plain icon="ShoppingCart" @click="showOrder='open'"  style="margin-left: 50px;" >查看订单</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" plain icon="ShoppingCart" @click="shoppingCart">添加购物车</el-button>
      </el-form-item>
      <el-form-item>
        <el-badge :value="totalNumber" class="item">
          <el-button type="success" plain icon="ShoppingCart" @click="showShoppingCart">查看购物车</el-button>
        </el-badge>
      </el-form-item>
      <el-form-item style="width: 400px;">
        <el-text class="w-150px mb-2" line-clamp="2" type="danger">
          注意：本人微信号 mogu910819619
        </el-text>
      </el-form-item>
      
    </el-form>

    <el-table v-loading="loading" :data="dishList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="产品图片" align="center" prop="image" min-width="80" fixed="left">
        <template #default="scope">
          <image-preview :src="scope.row.image" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="描述信息" align="left" prop="description" min-width="150" />
      <el-table-column label="产品价格" align="center" prop="price" min-width="100">
        <template #default="scope">
          <span>{{ scope.row.price }} €</span>
        </template>
      </el-table-column>
      <el-table-column label="产品名称" align="center" prop="name" min-width="150" />
      <el-table-column label="产品编码" align="center" prop="id" min-width="80" />
      <el-table-column label="产品数量" align="center" prop="store" min-width="80" >
        <template #default="scope">
          <span>{{ scope.row.store ? scope.row.store : 0 }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="加入购物车" align="center" class-name="small-padding fixed-width"  min-width="100px">
        <template #default="scope">
          <el-badge :value="scope.row.cartNo" class="item" :offset="[-80, 13]" :hidden="scope.row.cartNo == 0">
            <el-button link type="danger" icon="ShoppingCart" @click="shoppingCart(scope.row)" style="width: 100%;">购物车</el-button>
          </el-badge>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 购物车 -->
    <el-dialog title="购物车" v-model="open" width="750px"  append-to-body style="padding: auto;">
      <el-form ref="orderRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-form-item label="联系名称" prop="userName" >
            <el-input v-model="form.userName" placeholder="请输入联系名称" />
          </el-form-item>
          <el-form-item label="手机号" prop="userType">
            <el-input v-model="form.userType" placeholder="请输入手机号" />
          </el-form-item>
        </el-row>
        <el-form-item label="备注信息" prop="userAdress">
          <el-input v-model="form.userAdress" placeholder="请输入发货地址" type="textarea" maxlength="100" show-word-limit/>
        </el-form-item>
        <el-divider content-position="center">购物车商品信息</el-divider>
        <el-table :data="tbDishOrderDetailList"  ref="tbDishOrderDetail" >
          <el-table-column label="产品图片" align="center" prop="dish.image" min-width="80px"  fixed="left" >
            <template #default="scope">
              <image-preview :src="scope.row.dish.image" :width="50" :height="50" />
            </template>
          </el-table-column>
          <el-table-column label="产品名称" align="center" prop="dish.name" min-width="150px" />
          <el-table-column label="产品编码" align="center" prop="dishId" min-width="80px" />
          <el-table-column label="产品价格" align="center" prop="dishPrice" min-width="80px">
            <template #default="scope">
              <span>{{ scope.row.dishPrice }} €</span>
            </template>
          </el-table-column>
          <el-table-column label="数量" align="center" prop="dishNo" min-width="140px">
            <template #default="scope">
              <el-input-number v-model="scope.row.dishNo" :min="1" :max="500" placeholder="请输入数量" @change="calculateAmount(scope.$index)" style="width: 100%;"/>
            </template>
          </el-table-column>
          <el-table-column label="金额" align="right" prop="amount" min-width="80px" >
            <template #default="scope">
              <span>{{ scope.row.amount }} €</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width"  min-width="60px">
            <template #default="scope">
              <el-button link type="danger" icon="Delete" @click="handleDelete(scope.$index)" style="width: 100%;">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <strong>
            <span style="color: #999;">合计金额：</span>
            <span style="color: #f56c6c;">{{ form.totalAmount }} €</span>
          </strong>
          <el-button type="primary" @click="submitForm" style="margin-left: 30px;">确认下单</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看订单详情 -->
    <el-dialog title="查看订单" v-model="showOrder" width="750px"  append-to-body style="padding: auto;">
      <el-form :model="queryParams2" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
        <el-row>
          <el-form-item label="手机号：" prop="userType">
            <el-input v-model="queryParams2.userType" placeholder="请输入手机号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form>
            <el-button type="primary" style="margin-left: 50px;" @click="getOrderList">查询订单</el-button>
          </el-form>
        </el-row>
      </el-form>
      <el-table  v-loading="loading" :data="orderList">
        <el-table-column label="订单号" align="center" prop="orderNo" />
        <el-table-column label="联系名称" align="center" prop="userName" />
        <el-table-column label="联系方式" align="center" prop="userType" />
        <el-table-column label="备注信息" align="center" prop="userAdress"  show-overflow-tooltip/>
        <el-table-column label="订单总金额" align="center" prop="totalAmount" >
          <template #default="scope">
            <span>{{ scope.row.totalAmount }} €</span>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" align="center" prop="orderStatus" >
          <template #default="scope">
            <span>{{ orderStatusFormat(scope.row.orderStatus) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" align="center" prop="orderTime" >
          <template #default="scope">
            <span>{{ parseTime(scope.row.orderTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" icon="Edit" @click="selectOrderById(scope.row)" >订单详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 查看订单详情 -->
      <el-dialog title="查看订单" v-model="showOrderDetail" width="750px"  append-to-body style="padding: auto;">
        <template #footer>
          <div style="display: flex; justify-content: space-around;">
            <div>
              <span >订单号：</span>
              <strong>
                <span style="color: #f56c6c;">{{ form2.orderNo }}</span>
              </strong>
            </div>
            <div>
              <span >下单时间：</span>
              <strong>
                <span style="color: #f56c6c;">{{ parseTime(form2.orderTime, '{y}-{m}-{d}') }}</span>
              </strong>
            </div>

            <div>
              <span >订单状态：</span>
              <strong>
                <span style="color: #f56c6c;">{{ orderStatusFormat(form2.orderStatus) }}</span>
              </strong>
            </div>
            <div>
              <span >合计金额：</span>
              <strong>
                <span style="color: #f56c6c;">{{ form2.totalAmount }} €</span>
              </strong>
            </div>
          </div>
        </template>
        <el-table :data="tbDishOrderDetailList2"  ref="tbDishOrderDetail2" >
          <el-table-column label="产品图片" align="center" prop="dish.image" min-width="80px"  fixed="left" >
            <template #default="scope">
              <image-preview :src="scope.row.dish.image" :width="50" :height="50" />
            </template>
          </el-table-column>
          <el-table-column label="产品名称" align="center" prop="dish.name" min-width="150px" />
          <el-table-column label="产品编码" align="center" prop="dishId" min-width="80px" />
          <el-table-column label="产品价格" align="center" prop="dishPrice" min-width="80px">
            <template #default="scope">
              <span>{{ scope.row.dishPrice }} €</span>
            </template>
          </el-table-column>
          <el-table-column label="数量" align="center" prop="dishNo" min-width="140px">
            <template #default="scope">
              <el-input-number v-model="scope.row.dishNo" :min="1" :max="500" placeholder="请输入数量" @change="calculateAmount(scope.$index)" style="width: 100%;" disabled/>
            </template>
          </el-table-column>
          <el-table-column label="金额" align="right" prop="amount" min-width="80px" >
            <template #default="scope">
              <span>{{ scope.row.amount }} €</span>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </el-dialog>

    
  </div>
</template>

<script setup name="Dish">
import { listDish, getDish, delDish, addDish, updateDish } from "@/api/sky/dish";
import { listOrder, getOrder, delOrder, addOrder, updateOrder } from "@/api/sky/order";
import { ElMessage,ElNotification } from "element-plus";
import { sum } from "lodash";
import { computed, onMounted } from "vue";

const showOrder = ref(false)
const showOrderDetail = ref(false)
const tbDishOrderDetailList2 = ref([])
const form2 = ref({})
function selectOrderById(row) {
  const _orderId = row.orderId
  getOrder(_orderId).then(response => {
    form2.value = response.data;
    tbDishOrderDetailList2.value = response.data.tbDishOrderDetailList;
    showOrderDetail.value = true;
  });
}
/** 查询订单列表 */
function getOrderList() {
  loading.value = true;
  if(queryParams2.value.userType){
    listOrder(queryParams2.value).then(response => {
      orderList.value = response.rows;
      total.value = response.total;
      loading.value = false;
    });
  } else {
    ElMessage({
      showClose: true,
      message: '请输入手机号',
      type: 'error',
    })
    loading.value = false;
    return;
  }
  
}
/** 订单状态 */
const orderStatusOptions = [
  {
    value: 0,
    label: '未发货',
  },
  {
    value: 1,
    label: '已发货',
  },
  {
    value: 2,
    label: '未付款',
  },
  {
    value: 3,
    label: '已付款',
  },
]

const orderStatusFormat = (val) => {
  return orderStatusOptions.find(item => item.value == val)?.label || '--';
}

/** 添加购物车 */
const shoppingCart = (row) => {
  console.log("row",row)
  const _checkId = row.id ? [row.id] : ids.value
  console.log("选中的ID",_checkId)
  console.log("商品列表",dishList)
  const selectedDetails = dishList.value.filter(item => _checkId.includes(item.id));
  if (selectedDetails.length === 0) {
    ElMessage({
    showClose: true,
    message: '请选择要引入的明细数据',
    type: 'error',
  })
    return;
  }


  // 添加明细数据
  const newDetails = selectedDetails.map(item => ({
    dishId: item.id,
    dishPrice: item.price,
    dishNo: 1,
    amount: item.price,
    dish: item,
  }));

  console.log("选中的ID",newDetails)

  //已添加购物车，请在购物车中修改数量
  for (const item of newDetails) {
    const index = tbDishOrderDetailList.value.findIndex(detail => detail.dishId === item.dishId);
    if (index !== -1) {
      // 已存在，更新数量
      tbDishOrderDetailList.value[index].dishNo += 1;
      calculateAmount(index);
    } else {
      tbDishOrderDetailList.value.push(item);
    }

    const dishListIndex = dishList.value.findIndex(dish => dish.id === item.dishId)
    dishList.value[dishListIndex].cartNo += 1;
 
  }

  // 计算总金额
  calculateTotalAmount()

  ElNotification({
    title: 'Success',
    message: '添加购物车成功',
    type: 'success',
  })

}

 /** 购物车中的数量 */

/** 计算金额 */
const calculateAmount = (index) => {
  const detail = tbDishOrderDetailList.value[index];
  detail.amount = detail.dishPrice * detail.dishNo;
  calculateTotalAmount()
}

/** 计算购物车数量 */
const totalNumber = computed(() => {
  return tbDishOrderDetailList.value.reduce((sum, detail) => sum + detail.dishNo, 0);
});


/** 计算总金额 */
const calculateTotalAmount = () => {
  form.value.totalAmount = tbDishOrderDetailList.value.reduce((sum, detail) => sum + detail.amount, 0);
  /** 将购物车加入缓存 */
  setCache()
}

/** 将表单加入缓存 */
const setForm = () => {
  localStorage.setItem('form', JSON.stringify(form.value));
}
/** 将购物车加入缓存 */
const setTbDishOrderDetailList = () => {
  localStorage.setItem('tbDishOrderDetailList', JSON.stringify(tbDishOrderDetailList.value));
}

/** 将 dishList 加入缓存 */
const setDishList = () => {
  localStorage.setItem('dishList', JSON.stringify(dishList.value));
}

/** 加入缓存 */
const setCache = () => {
  setForm()
  setTbDishOrderDetailList()
  setDishList()
}

/** 清除缓存 */
const clearCache = () => {
  localStorage.removeItem('tbDishOrderDetailList');
  localStorage.removeItem('form');
  localStorage.removeItem('dishList');
}

/** 刷新界面获取缓存 并初始化数据 */
const init = () => {
  const cachedData = localStorage.getItem('tbDishOrderDetailList');
  if (cachedData) {
    tbDishOrderDetailList.value = JSON.parse(cachedData);
  }
  const formData = localStorage.getItem('form');
  if (formData) {
    form.value = JSON.parse(formData);
  }

  // const dishListData = localStorage.getItem('dishList');
  // if(dishListData){
  //   dishList.value = JSON.parse(dishListData);
  // }

  
}

/** 查看购物车 */
const showShoppingCart = () => {
  open.value = true;
  console.log("tbDishOrderDetailList---",tbDishOrderDetailList.value)
  console.log("form信息",form.value)
}

/** 删除按钮操作 */
function handleDelete(index) {
 tbDishOrderDetailList.value.splice(index, 1);
 calculateTotalAmount()
}



const orderList = ref([]);
const tbDishOrderDetailList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedTbDishOrderDetail = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {
    orderId: null,
    userName: null,
    userType: null,
    userAdress: null,
    orderNo: null,
    orderTime: null,
    totalAmount: null,
    tbDishOrderDetailList: []
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    code:null,
    id: null,
    status: null,
  },
  rules: {
    userName: [
      { required: true, message: "联系名称不能为空", trigger: "blur" }
    ],
    userAdress: [
      { required: true, message: "发货地址不能为空", trigger: "blur" }
    ],
    userType: [
      { required: true, message: "请输入联系方式", trigger: "blur" }
    ],

  }
});

const { queryParams, form, rules } = toRefs(data);

const queryParams2 = ref({
  userType: null,
})

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}


/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderRef"].validate(valid => {
    if (valid) {
      form.value.tbDishOrderDetailList = tbDishOrderDetailList.value;
      if (form.value.orderId != null) {
        updateOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改订单成功");
          open.value = false;
          getList();
        });
      } else {
        addOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("下单成功");
          reset()
          open.value = false;
          refreshPage()
        });
      }
    }
  });
}



// -------------------------------------------------------- 购物车业务 ------------------------------------------------

const { proxy } = getCurrentInstance();
const dishList = ref([]);
const dishFlavorList = ref([]);

/** 查询菜品管理列表 */
function getList() {
  loading.value = true;
  queryParams.value.status = '1'
  listDish(queryParams.value).then(response => {
    dishList.value = response.rows.map(item => ({
      ...item,
      cartNo: 0
    }));
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

/** 刷新页面 */
function refreshPage() {
  location.reload();
}

// 表单重置
function reset() {
  clearCache()
  form.value = {
    id: null,
    name: null,
    price: null,
    image: null,
    description: null,
    status: null,
    createTime: null,
    updateTime: null,
    totalAmount: null,
    tbDishOrderDetailList: []
  };
  dishFlavorList.value = [];
  proxy.resetForm("dishRef");
  console.log("form信息--重置",form.value)
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  reset()
  proxy.resetForm("queryRef");
  handleQuery();
  refreshPage()
  
}


/** 导出按钮操作 */
function handleExport() {
  proxy.download('sky/dish/export', {
    ...queryParams.value
  }, `dish_${new Date().getTime()}.xlsx`)
}



getList()
onMounted(() => {
  init()
  
});
</script>

<style lang="scss" scoped>
  .app-container {
    margin: 0 auto;
  }
</style>
