<template>
  <div class="app-container">
    <!-------------------- 搜索条件 ----------------------->

    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" :label-width="68">
      <el-form-item label="商品编码:" prop="productCode">
        <el-input v-model="queryParams.productCode" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品名称:" prop="productName">
        <el-input v-model="queryParams.productName" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品分类:" prop="categoryId">
        <el-tree-select v-model="queryParams.categoryId" :data="categoryList" :props="{
          value: 'categoryId',
          label: 'categoryName',
          children: 'children',
        }" value-key="categoryId" placeholder="请选择商品分类" clearable />
      </el-form-item>
      <el-form-item label="商品状态:" prop="productStatus">
        <el-select v-model="queryParams.productStatus" placeholder="请选择商品状态" clearable>
          <el-option v-for="dict in product_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="商品品牌:" prop="brandId">
        <el-select v-model="queryParams.brandId" placeholder="请选择商品品牌" clearable>
          <el-option v-for="items in brandList" :key="items.brandId" :label="items.brandName" :value="items.brandId" />
        </el-select>
      </el-form-item>
      <el-form-item label="税率:" prop="rateId">
        <el-select v-model="queryParams.rateId" placeholder="请选择税率" clearable>
          <el-option v-for="items in rateList" :key="items.rateId" :label="items.rateValue + '%'"
            :value="items.rateId" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-------------------- 操作按钮栏 ----------------------->

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['product:product:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['product:product:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['product:product:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['product:product:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-------------------- 数据展示列表区域 ----------------------->

      <el-table class="table-container" v-loading="loading" :data="productList" @selection-change="handleSelectionChange" fit>
        <el-table-column type="selection" :width="50" align="center" fixed="left" />
        <el-table-column label="商品主图" align="center" prop="productImage" :width="100">
          <template #default="scope">
            <image-preview :src="scope.row.productImage" :width="75" :height="75" />
          </template>
        </el-table-column>
        <el-table-column label="商品编码/名称" header-align="center" :min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <div>
              <strong> 编码：</strong>
              <span>{{ scope.row.productCode }}</span>
            </div>
            <div>
              <strong> 名称：</strong>
              <span>{{ scope.row.productName }}</span>
            </div>
            <div>
              <strong> 辅助名：</strong>
              <span>{{ scope.row.assistName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="sku规格" :min-width="80" show-overflow-tooltip>
          <template #default="scope">
            <div v-for="(item, index) in scope.row.skuSelected" :key="index">
              <strong v-if="item.name">{{ item.name }} : </strong>
              <span>{{ item.values.join(" 、 ") }}</span>
              <span v-if="!item.name"> -- </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="计量单位" align="center" prop="unitVo.unitCode" :width="80">
          <template #default="scope">
            <span>{{ scope.row.unitVo?.unitCode || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品价格" header-align="center" align="right" prop="productPrice" :width="80">
          <template #default="scope">
            <span>{{ formatTwo(scope.row.productPrice) }} €</span>
          </template>
        </el-table-column>
        <el-table-column label="税率" align="center" prop="productRateVo.rateValue" :width="80">
          <template #default="scope">
            <span>{{ scope.row.productRateVo?.rateValue || '--' }} %</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="productStatus" :width="80">
          <template #default="scope">
            <dict-tag :options="product_status" :value="scope.row.productStatus" />
          </template>
        </el-table-column>


        <el-table-column label="商品分类/品牌" header-align="center" show-overflow-tooltip>
          <template #default="scope">
            <div>
              <strong>分类：</strong>
              <span>{{ scope.row.productCategoryVo?.categoryName || '--' }} </span>
            </div>
            <div>
              <strong>品牌：</strong>
              <span>{{ scope.row.brandForProductVo?.brandName || '--' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip :width="200" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" :width="200">
          <template #default="scope">
            <div>
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                v-hasPermi="['product:product:edit']">修改</el-button>
              <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
                v-hasPermi="['product:product:remove']">删除</el-button>
            </div>
            <div>
              <el-button link type="success" icon="MoreFilled" @click="lookDetails(scope.row)">查看更多详情</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页查询页脚 -->
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize" @pagination="getList" />

    

    <!-------------------- 商品详情查看 dialog ----------------------->

    <el-dialog :title="title" v-model="open" :width="800" append-to-body>
      <!------ 商品部分 ------>
      <div>
        <el-card>
          <template #header>
            基础信息
          </template>
          <el-descriptions direction="horizontal" :column="2" size="small" border>
            <el-descriptions-item label="商品主图" align="center" :rowspan="2" :width="100">
              <image-preview :src="productDetail.productImage" :width="75" :height="75" />
            </el-descriptions-item>
            <el-descriptions-item label="商品名称" align="center">
              <span> {{ productDetail.productName }} </span>
            </el-descriptions-item>
            <el-descriptions-item label="商品编码" align="center">
              <span> {{ productDetail.productCode }} </span>
            </el-descriptions-item>
          </el-descriptions>
          <el-descriptions direction="vertical" :column="4" size="small" border style="margin-top: 20px">
            <el-descriptions-item label="商品分类" :span="2" align="center">
              {{productDetail.productCategoryVo?.categoryName || '--'}}
            </el-descriptions-item>
            <el-descriptions-item label="商品单价" align="center">
              {{ formatTwo(productDetail.productPrice) }} €
            </el-descriptions-item>
            <el-descriptions-item label="商品品牌" align="center">
              {{ productDetail.brandForProductVo?.brandName || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="商品税率" align="center">
              {{productDetail.productRateVo?.rateValue || '--'}} %
            </el-descriptions-item>
            <el-descriptions-item label="计量单位" align="center">
              {{productDetail.unitVo?.unitCode || '--'}}
            </el-descriptions-item>
            <el-descriptions-item label="商品状态" align="center">
              <dict-tag :options="product_status" :value="productDetail.productStatus" />
            </el-descriptions-item>
            <el-descriptions-item label="成本核算方式" :span="2" align="center">
              <dict-tag :options="product_cost_method" :value="productDetail.costMethod" />
            </el-descriptions-item>
            <el-descriptions-item label="创建人" align="center">
              <span>{{ productDetail.createBy }} </span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间" align="center">
              <span>{{ productDetail.createTime }} </span>
            </el-descriptions-item>
            <el-descriptions-item label="修改人" align="center">
              <span>{{ productDetail.updateBy }} </span>
            </el-descriptions-item>
            <el-descriptions-item label="修改时间" align="center">
              <span>{{ productDetail.updateTime }} </span>
            </el-descriptions-item>
            <el-descriptions-item label="备注信息" :span="4" align="left" label-align="center">
              {{ productDetail.remark ? productDetail.remark : "--" }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
      <!-------------------- 包装信息 ----------------------->
      <div>
        <el-card>
          <template #header> 包装信息 </template>
          <el-descriptions direction="vertical" :column="5" size="small" border style="margin-top: 20px">
            <el-descriptions-item label="长(cm)" align="center">{{ productDetail.length ? productDetail.length : "--" }}
              cm
            </el-descriptions-item>
            <el-descriptions-item label="宽(cm)" align="center">
              {{ productDetail.width ? productDetail.width : "--" }} cm
            </el-descriptions-item>
            <el-descriptions-item label="高(cm)" align="center">
              {{ productDetail.height ? productDetail.height : "--" }} cm
            </el-descriptions-item>
            <el-descriptions-item label="体积(m³)" align="center">
              {{ formatTree(productDetail.volume) }} m³
            </el-descriptions-item>
            <el-descriptions-item label="重量(kg)" align="center">
              {{ formatTree(productDetail.weight) }} kg
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
      <!-------------------- SKU信息 ----------------------->
      <div>
        <el-card>
          <template #header> SKU信息 </template>
          <el-table v-loading="loading" :data="productDetail.productSkuList">
            <el-table-column label="图片" align="center" show-overflow-tooltip>
              <template #default="scope">
                <image-preview :src="scope.row.skuImage" :width="60" :height="60" />
              </template>
            </el-table-column>
            <el-table-column label="SKU编码" align="center" prop="skuCode" show-overflow-tooltip />
            <el-table-column label="SKU规格值" align="center" show-overflow-tooltip>
              <template #default="scope">
                <div v-if="getSkuValue(scope.row.skuValue) === 'default'">
                  --  <!-- 直接显示默认 SKU -->
                </div>
                <div v-else v-for="(item, index) in getSkuValue(scope.row.skuValue)" :key="index">
                  <strong>{{ item[0] }}:</strong>
                  <span>{{ item[1] }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="sku单价" header-align="center" align="left" :width="140" show-overflow-tooltip>
              <template #default="scope">
                <div class="price">
                  <div style="margin-right: 5px;">
                    <div class="price">
                      <strong> sku单价: </strong>
                      <span> {{ formatTwo(scope.row.skuPrice) }} €</span>
                    </div>
                    <div class="price">
                      <strong> sku单价2: </strong>
                      <span> {{ formatTwo(scope.row.skuPrice2) }} €</span>
                    </div>
                    <div class="price">
                      <strong> sku单价3: </strong>
                      <span> {{ formatTwo(scope.row.skuPrice3) }} €</span>
                    </div>
                  </div>
                  <div>
                    <div class="price">
                      <strong> sku单价4: </strong>
                      <span> {{ formatTwo(scope.row.skuPrice4) }} €</span>
                    </div>
                    <div class="price">
                      <strong> sku单价5: </strong>
                      <span> {{ formatTwo(scope.row.skuPrice5) }} €</span>
                    </div>
                    <div class="price">
                      <strong> sku单价6: </strong>
                      <span> {{ formatTwo(scope.row.skuPrice6) }} €</span>
                    </div>
                  </div>
                </div>

              </template>
            </el-table-column>
            <el-table-column label="SKU库存" align="center" :width="80">
              <template #default="scope">
                <span> {{ scope.row.productInventoryForSkuVo?.currentStock || '--' }} </span>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center" prop="skuStatus" :width="60">
              <template #default="scope">
                <dict-tag :options="product_status" :value="scope.row.skuStatus" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    
  </div>
</template>

<script setup name="Product">
import {listProduct, getProduct, delProduct } from "@/api/product/product";
import { listCategory } from "@/api/product/category";
import { listUnit } from "@/api/product/unit";
import { listBrand } from "@/api/product/brand";
import { listProductRate } from "@/api/product/productRate";
import useUserStore from "@/store/modules/user";
import { useRouter, useRoute } from "vue-router";
// 租户ID字段过滤使用
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const { proxy } = getCurrentInstance();
const { product_cost_method, product_status } = proxy.useDict(
  "product_cost_method",
  "product_status"
);

const productList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const categoryList = ref([]);
const categoryNameList = ref([]);
const unitList = ref([]);
const brandList = ref([]);
const rateList = ref([]);
const baseUnit = "0";

// *************************************************************** 表格展示数据转换 ***************************************************************

/** 保留3位小数 */
const formatTree = (value) => {
  // 首先检查是否为有效的有限数字
  if (!Number.isFinite(Number(value))) {
    return "0.000";
  }
  // 然后进行四舍五入和格式化
  return (Math.round(Number(value) * 1000) / 1000).toFixed(3);
};

/** 查询列表 请求参数 */
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productName: null,
    productStatus: null,
    categoryId: null,
    brandId: null,
    costMethod: null,
    tenantId: null,
  },
});
const { queryParams } = toRefs(data);

//*****************************************************************  控制按钮相关的操作  ************************************************
/** 查询商品列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listProduct(queryParams.value).then((response) => {
    productList.value = response.rows;
    // json转化
    productList.value.forEach((item) => {
      item.skuSelected = JSON.parse(item.skuSelected) || [];
    });
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
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
  ids.value = selection.map((item) => item.productId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  // reset();
  if (unitList.length < 1) {
    // 提示：请添加计量单位，跳转到计量单位页
    console.log("提示：请添加计量单位，跳转到计量单位页");
  }
  const obj = {path: "/product/edit", name:"editProduct"}
  proxy.$tab.closePage(obj).then(
    () => {
      router.push({ path: "/product/edit" })
    } 
  )
}

/** 修改按钮操作 */
function handleUpdate(row) {
  const _productId = row.productId || ids.value[0];
  const obj = {path: "/product/edit", name:"editProduct"}
  proxy.$tab.closePage(obj).then(
    () => {
      router.push({ path: "/product/edit", query: { productId: _productId } });
    } 
  )
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _productIds = row.productId || ids.value;
  const codeList = getCodeListByIds(_productIds);
  console.log("codeList--------", codeList);
  proxy.$modal
    .confirm('是否确认删除商品编号为:\n' + codeList.join('、\n') + '\n的数据项？')
    .then(function () {
      return delProduct(_productIds);
    })
    .then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    })
    .catch(() => {});
}
/** 删除提示的 productCode 数组 */
function getCodeListByIds(ids) {
  // Step 1: 如果 ids 是 Proxy(Array)，先转换为标准数组
  // Proxy 对象也是类数组对象，所以可以用 Array.from 来处理
  let idList = Array.isArray(ids) ? ids : Array.from(ids);
  // Step 2: 如果 ids 是单个 id，将其转换为数组，方便统一处理
  if (typeof ids === 'string' || typeof ids === 'number') {
    idList = [ids];
  }
  // Step 3: 检查 productList.value 是否为有效数组
  if (!productList || !productList.value || !Array.isArray(productList.value)) {
    console.error('productList 是无效数组！');
    return [];
  }
  // Step 4: 将 productList 转换为一个 Map，使用 id 作为键，code 作为值
  const productMap = new Map();
  productList.value.forEach(product => {
    productMap.set(product.productId, product.productCode);
  });
  // Step 5: 根据 ids 查找并返回对应的 code 列表
  return idList.map(id => productMap.get(id) || null); 
}

/** 查看商品详情 */
const productDetail = ref({});
function lookDetails(row) {
  const _productId = row.productId || ids.value;
  if (_productId) {
    getProduct(_productId).then((response) => {
      console.log("商品详情", response.data);
      productDetail.value = response.data || [];
      // json转化
      productDetail.value.skuSelected = JSON.parse(productDetail.value.skuSelected) || [];
      open.value = true;
      title.value = "商品详情";
    });
  }
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    "product/product/export",
    {
      ...queryParams.value,
    },
    `product_${new Date().getTime()}.xlsx`
  );
}

//******************************************************************  页面加载时执行操作  ************************************************
/** 获取商品分类下拉框数据 */
function getCategoryList() {
  listCategory()
    .then((response) => {
      categoryList.value = proxy.handleTree(
        response.data,
        "categoryId",
        "parentId"
      );
      categoryNameList.value = response.data;
      console.log("categoryList:", categoryList.value);
    })
    .catch((error) => {
      console.error("获取分类列表时出错:", error);
    });
}
/** 获取计量单位下拉框数据 */
function getUnitList() {
  listUnit()
    .then((response) => {
      // 产品只赋值基础单位
      unitList.value = response.rows.filter((row) => row.unitType === baseUnit);
    })
    .catch((error) => {
      console.error("获取计量单位列表时出错:", error);
    });
}
/** 获取品牌下拉框数据 */
function getBrandList() {
  listBrand()
    .then((response) => {
      brandList.value = response.rows;
    })
    .catch((error) => {
      console.error("获取品牌列表时出错:", error);
    });
}

/** 获取税率下拉数据 */
function getRateList(){
  listProductRate().then(response => {
    rateList.value = response.rows;
  }).catch(error => {
    console.error("获取税率列表失败：", error);
  })
}

/** 监听路由，路由跳转后更新界面数据 */
watch(
  () => route.fullPath,
  () => {
    // 路由发生变化时执行操作
    getList();
  },{props: true}
);

getCategoryList(); // 获取商品分类数据
getUnitList(); // 获取计量单位数据
getBrandList(); // 获取品牌数据
getRateList();  // 获取税率数据
getList(); // 获取商品列表
</script>

<style scoped lang="scss">
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

.compact-form-item {
  margin-bottom: 0;
  /* 根据需要调整其他样式 */
}

.el-form-item {
  margin-right: 10px;
  flex-shrink: 0;
  .el-input,
  .el-select,
  .el-tree-select {
    width: 150px;
  }
}

.price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
