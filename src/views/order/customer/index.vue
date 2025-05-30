<template>
  <div class="app-container">
    <el-row class="row-container">
      <el-col :span="4" :xs="24" class="col-category-container">
        <div class="head-container">
          <el-input v-model="categoryName" placeholder="请输入分类名称" clearable prefix-icon="Search"
            style="margin-bottom: 20px" size="small"/>
        </div>
        <div class="head-container">
          <el-tree :data="categoryOptions" :props="{ label: 'label', children: 'children' }"
            :expand-on-click-node="false" :filter-node-method="filterNode" ref="categoryTreeRef" node-key="id"
            highlight-current default-expand-all @node-click="handleNodeClick" />
        </div>
      </el-col>
      <el-col :span="20" :xs="24" class="col-data-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px" size="small">
          <el-form-item label="客户编码: " prop="customerCode">
            <el-input v-model="queryParams.customerCode" placeholder="请输入客户编码" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="客户名称: " prop="customerName">
            <el-input v-model="queryParams.customerName" placeholder="请输入客户名称" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="CIF/NIE: " prop="invoiceNif">
            <el-input v-model="queryParams.invoiceNif" placeholder="请输入纳税人税号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="发票名称: " prop="invoiceNombre">
            <el-input v-model="queryParams.invoiceNombre" placeholder="请输入纳税人名称" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="客户类型: " prop="invoiceRegimen">
            <el-select v-model="queryParams.invoiceRegimen" placeholder="请选择客户类型" clearable>
              <el-option v-for="dict in invoice_regimen" :key="dict.value" :label="dict.label"
                :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="交易类型: " prop="invoiceCalificacion">
            <el-select v-model="queryParams.invoiceCalificacion" placeholder="请选择客户类型" clearable>
              <el-option v-for="dict in invoice_calificacion" :key="dict.value" :label="dict.label"
                :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="客户等级: " prop="levelId">
            <el-select v-model="queryParams.levelId" placeholder="请选择客户等级" clearable filterable>
              <el-option v-for="item in customerLevelList" :key="item.id" :label="item.levelName"
                :value="item.levelId" />
            </el-select>
          </el-form-item>
          <el-form-item label="绑定业务员: " prop="salesmanId">
            <SalesmanSelect v-model="queryParams.salesmanName"  @selectedData="selectedParamSalesmanData" />
          </el-form-item>
          <el-form-item label="发掘客户者: " prop="findBy">
            <UserSelect v-model="queryParams.findByName"  @selectedData="selectedParamFindByData" />
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd"
              v-hasPermi="['order:customer:add']" >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
              v-hasPermi="['order:customer:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
              v-hasPermi="['order:customer:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport"
              v-hasPermi="['order:customer:export']">导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button type="info" icon="Refresh" @click="resetQuery">重置</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>


          <el-table class="table-container" v-loading="loading" :data="customerList" size="small"
            @selection-change="handleSelectionChange" resizable  ref="customerTable" row-key="customerId"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="客户分类" align="left" prop="categoryName" show-overflow-tooltip />
            <el-table-column label="客户编码" align="left" prop="customerCode" show-overflow-tooltip />
            <el-table-column label="客户名称" align="left" prop="customerName" show-overflow-tooltip />
            <el-table-column label="客户类型" align="center" prop="invoiceRegimen" show-overflow-tooltip>
              <template #default="scope">
                <dict-tag :options="invoice_regimen" :value="scope.row.invoiceRegimen" />
              </template>
            </el-table-column>
            <el-table-column label="交易类型" align="center" prop="invoiceCalificacion" show-overflow-tooltip>
              <template #default="scope">
                <dict-tag :options="invoice_calificacion" :value="scope.row.invoiceCalificacion" />
              </template>
            </el-table-column>
            <el-table-column label="客户等级" align="left" prop="leverId">
              <template #default="scope">
                <span>{{ scope.row.levelName?? '--' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="客户状态" align="center" prop="customerStatus">
              <template #default="scope">
                <dict-tag :options="project_general_status" :value="scope.row.customerStatus" />
              </template>
            </el-table-column>
            <el-table-column label="绑定业务员" align="left" prop="salesmanName" show-overflow-tooltip>
              <template #default="scope">
                <span>{{ scope.row.salesmanName?? '--' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="发掘客户者" align="left" prop="findByName" show-overflow-tooltip>
              <template #default="scope">
                <span>{{ scope.row.findByName?? '--' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="left" class-name="small-padding fixed-width" width="180px">
              <template #default="scope">
                <el-button link type="primary" icon="Edit" size="small" @click="handleUpdate(scope.row)"  v-hasPermi="['order:customer:edit']">修改</el-button>
                <el-button link type="primary" size="small"  @click="handleEditSku(scope.row)"> >>更多详情 </el-button>
                <el-button link type="danger" icon="Delete" size="small" @click="handleDelete(scope.row)"  v-hasPermi="['order:customer:remove']">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize" @pagination="getList" />

      </el-col>
    </el-row>

    <!-- 添加或修改客户对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="customerRef" :model="form" :rules="rules" label-width="80px">
        <el-tabs type="border-card" v-model="activeTab">
          <!-- 基础信息 -->
          <el-tab-pane label="基础信息" name="basic">
            <el-form-item label="客户分类" prop="categoryId">
              <el-tree-select v-model="form.categoryId" :data="categoryOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }" value-key="categoryId"
                placeholder="请选择客户分类" :accordion="true" filterable clearable/>
            </el-form-item>
            <el-form-item label="客户编码: " prop="customerCode">
              <el-input v-model="form.customerCode" placeholder="请输入客户编码" type="textarea" :maxlength="50"
                show-word-limit :rows="1" :disabled="form.customerId ? true : false" />
            </el-form-item>
            <el-form-item label="客户名称: " prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户名称" type="textarea" :maxlength="50"
                show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="客户类型: " prop="invoiceRegimen">
              <el-select v-model="form.invoiceRegimen" placeholder="请选择客户类型">
                <el-option v-for="dict in invoice_regimen" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="交易类型: " prop="invoiceCalificacion">
              <el-select v-model="form.invoiceCalificacion" placeholder="请选择交易类型">
                <el-option v-for="dict in invoice_calificacion" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="客户等级: " prop="levelId">
              <el-select v-model="form.levelId" placeholder="请选择客户等级" clearable filterable style="width: auto;">
                <el-option v-for="item in customerLevelList" :key="item.id" :label="item.levelName"
                  :value="item.levelId" />
              </el-select>
            </el-form-item>
            <el-form-item label="客户状态" prop="customerStatus">
              <el-radio-group v-model="form.customerStatus">
                <el-radio v-for="dict in project_general_status" :key="dict.value" :value="Number(dict.value)">{{ dict.label
                  }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="发掘客户者: " prop="findBy">
              <UserSelect v-model="form.findByName" @selectedData="selectedFindByData"/>
            </el-form-item>
            <el-form-item label="绑定业务员: " prop="salesmanId">
              <SalesmanSelect v-model="form.salesmanName" @selectedData="selectedSalesmanData"/>
            </el-form-item>
            <el-form-item label="备注: " prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" maxlength="50" show-word-limit
                :rows="2" />
            </el-form-item>
          </el-tab-pane>
          <!-- 发票信息 -->
          <el-tab-pane label="发票信息" name="invoiceInfo">
            <el-form-item label="CIF/NIE: " prop="invoiceNif">
              <el-input v-model="form.invoiceNif" placeholder="请输入纳税人税号" type="textarea" maxlength="50" show-word-limit
                :rows="1" />
            </el-form-item>
            <el-form-item label="发票名称: " prop="invoiceNombre">
              <el-input v-model="form.invoiceNombre" placeholder="请输入纳税人名称" type="textarea" maxlength="50" show-word-limit
                :rows="1" />
            </el-form-item>
            <el-form-item label="发票电话: " prop="invoicePhone">
              <el-input v-model="form.invoicePhone" placeholder="请输入纳税人电话" type="textarea" maxlength="20"
                show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="发票邮编: " prop="invoicePostcode">
              <el-input v-model="form.invoicePostcode" placeholder="请输入纳税人邮编" type="textarea" maxlength="10"
                show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="发票邮箱: " prop="contactEmail">
              <el-input v-model="form.contactEmail" placeholder="请输入联系人邮箱" type="textarea" maxlength="50"
                show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="地址-国家:" prop="invoiceAddressCountry">
              <el-select v-model="form.invoiceAddressCountry" placeholder="请输入地址国家" filterable clearable style="width: 100%" @change="handleAddressCountryChange">
                <el-option
                  v-for="item in addressCountryList"
                  :key="item.countryId"
                  :label="`${item.countryCode} - ${item.nameEs} - ${item.nameZh}`"
                  :value="item.nameEs"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="地址-省份:" prop="invoiceAddressProvince">
              <el-select v-model="form.invoiceAddressProvince" placeholder="请输入地址省份" filterable clearable style="width: 100%" v-if="addressProvinceList.length > 0">
                <el-option
                  v-for="item in addressProvinceList"
                  :key="item.provinceId"
                  :label="`${item.provinceCode} - ${item.provinceNameEs} - ${item.provinceNameZh}`"
                  :value="item.provinceNameEs"
                >
                </el-option>
              </el-select>
              <el-input v-else v-model="form.invoiceAddressProvince" placeholder="请输入地址省份" type="textarea" maxlength="50" show-word-limit :rows="1"/>
            </el-form-item>
            
            <el-form-item label="地址-明细:" prop="invoiceAddressDetail">
              <el-input v-model="form.invoiceAddressDetail" placeholder="请输入地址明细" type="textarea" maxlength="200" show-word-limit :rows="2"/>
            </el-form-item>
          </el-tab-pane>
          <!-- 联系人信息 -->
          <el-tab-pane label="联系人信息" name="contactInfo">
            <el-form-item label="联系人名称: " prop="contactName">
              <el-input v-model="form.contactName" placeholder="请输入联系人名称" type="textarea" maxlength="50" show-word-limit
                :rows="1" />
            </el-form-item>
            <el-form-item label="联系人电话: " prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系人电话" type="textarea" maxlength="20"
                show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="联系人地址: " prop="contactAddressDetail">
              <el-input v-model="form.contactAddressDetail" placeholder="请输入联系人详细地址" type="textarea" maxlength="200"
                show-word-limit :rows="2" />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情抽屉弹窗 -->
    <el-drawer v-model="drawer" direction="rtl" append-to-body >
      <template #header>
        <span>客户详情 : {{ currentRow?.customerName || '' }}</span>
      </template>
      <div v-if="currentRow">
        <el-card shadow="hover" style="margin-bottom: 5px;">
          <template #header>
            <div class="clearfix" style="display: flex;">
              <span style="margin-right: 20px;">发票信息</span>
            </div>
          </template>
          <el-descriptions  :column="2" size="small">
            <el-descriptions-item label="纳税人税号:">{{ currentRow.invoiceNif }}</el-descriptions-item>
            <el-descriptions-item label="纳税人名称:">{{ currentRow.invoiceNombre }}</el-descriptions-item>
            <el-descriptions-item label="纳税人电话:">{{ currentRow.invoicePhone }}</el-descriptions-item>
            <el-descriptions-item label="纳税人邮编:">{{ currentRow.invoicePostcode }}</el-descriptions-item>
            <el-descriptions-item label="纳税人地址:" :span="2">
              {{ currentRow.invoiceAddressCountry + ' '+ currentRow.invoiceAddressProvince + ' ' + currentRow.invoiceAddressDetail }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-card shadow="hover" style="margin-bottom: 5px;">
          <template #header>
            <div class="clearfix" style="display: flex;">
              <span style="margin-right: 20px;">联系人信息</span>
            </div>
          </template>
          <el-descriptions  :column="2" size="small">
            <el-descriptions-item label="联系人名称:">{{ currentRow.contactName }}</el-descriptions-item>
            <el-descriptions-item label="联系人电话:">{{ currentRow.contactPhone }}</el-descriptions-item>
            <el-descriptions-item label="联系人邮箱:" :span="2">{{ currentRow.contactEmail }}</el-descriptions-item>
            <el-descriptions-item label="联系人地址:" :span="2">{{ currentRow.contactAddress }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-card shadow="hover">
          <template #header>
            <div class="clearfix" style="display: flex;">
              <span style="margin-right: 20px;">更新信息</span>
            </div>
          </template>
          <el-descriptions :column="2" size="small">
            <el-descriptions-item label="创建人:">{{ currentRow.createBy }}</el-descriptions-item>
            <el-descriptions-item label="创建时间:">{{ parseTime(currentRow.createTime, '{y}-{m}-{d}')}}</el-descriptions-item>
            <el-descriptions-item label="修改人:">{{ currentRow.updateBy }}</el-descriptions-item>
            <el-descriptions-item label="修改时间:">{{ parseTime(currentRow.updateTime, '{y}-{m}-{d}')}}</el-descriptions-item>
            <el-descriptions-item label="备注:" :span="2">{{ currentRow.remark }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
    </el-drawer>
  </div>
</template>

<script setup name="Customer">
import { listCustomer, getCustomer, delCustomer, addCustomer, updateCustomer } from "@/api/order/customer";
import {listCustomerLevel} from "@/api/order/customerLevel";
import { listAddressCountry } from "@/api/address/addressCountry";
import { listAddressProvince } from "@/api/address/addressProvince";
import {categoryTreeSelect} from "@/api/order/customerCategory";
import useUserStore from "@/store/modules/user";
import { ref } from "vue";
import SalesmanSelect from '@/components/Common/SalesmanSelect.vue';
import UserSelect from "@/components/Common/UserSelect.vue";


// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { invoice_regimen, invoice_calificacion, project_general_status, sys_yes_or_no } = proxy.useDict('invoice_regimen', 'invoice_calificacion', 'project_general_status', 'sys_yes_or_no');

const customerList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const categoryName = ref(""); // 分类名称
const categoryOptions = ref(null);
const activeTab = ref('basic'); // 当前激活的标签页
const addressCountryList = ref([]);
const addressProvinceList = ref([]);



const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    salesmanId: null,
    findBy: null,
    customerCode: null,
    customerName: null,
    customerStatus: null,
    invoiceRegimen: null,
    invoiceCalificacion: null,
    invoiceNif: null,
    invoiceNombre: null,
    invoicePhone: null,
    invoicePostcode: null,
    tenantId: null,
  },
  rules: {
    categoryId: [
      { required: true, message: "客户状态不能为空", trigger: "change" }
    ],
    customerCode: [
      { required: true, message: "客户编码不能为空", trigger: "blur" }
    ],
    customerName: [
      { required: true, message: "客户名称不能为空", trigger: "blur" }
    ],
    invoiceRegimen: [
      { required: true, message: "客户类型不能为空", trigger: "change" }
    ],
    invoiceCalificacion: [
      { required: true, message: "交易类型不能为空", trigger: "change" }
    ],
    invoiceNif: [
      { required: true, message: "Nif不能为空", trigger: "blur" }
    ],
    invoiceNombre: [
      { required: true, message: "公司/个人名称不能为空", trigger: "blur" }
    ],
    invoicePhone: [
      { required: true, message: "电话不能为空", trigger: "blur" }
    ],
    invoicePostcode: [
      { required: true, message: "邮编不能为空", trigger: "blur" }
    ],
    invoiceAddressCountry: [
      { required: true, message: "地址-国家 不能为空", trigger: "blur" }
    ],
    invoiceAddressProvince: [
      { required: true, message: "地址-省份 不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询客户列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listCustomer(queryParams.value).then(response => {
    customerList.value = response.rows || [] ;
    total.value = response.total;
    loading.value = false;
  });
}

// ***************************************  6 抽屉数据部分 start *********************************************
// 抽屉弹窗
const drawer = ref(false);
const currentRow = ref(null)
const handleEditSku = (row) => {
  currentRow.value = row;
  drawer.value = true;
}
// ***************************************  6 抽屉数据部分 end *********************************************

// --------------------- 查询客户 start -------------------
/** 查询发掘客户的用户 */
function selectedFindByData(data){
  if(data){
    form.value.findById = data.userId;
    form.value.findByName = data.userName;
  } else {
    form.value.findById = null;
    form.value.findByName = null;
  }
}

/** 查询业务员 */
function selectedSalesmanData(data){
  if(data){
    form.value.salesmanId = data.userId;
    form.value.salesmanName = data.userName;
  } else {
    form.value.salesmanId = null;
    form.value.salesmanName = null;
  }
  
}

function selectedParamSalesmanData(data){
  if(data){
    queryParams.value.salesmanId = data.userId;
    queryParams.value.salesmanName = data.userName;
  } else {
    queryParams.value.salesmanId = null;
    queryParams.value.salesmanName = null;
  }
} 

function selectedParamFindByData(data){
  if(data){ 
    queryParams.value.findBy = data.userId;
    queryParams.value.findByName = data.userName;
  } else {
    queryParams.value.findBy = null;
    queryParams.value.findByName = null;
  }

}


// ----------------------- 查询客户 end -------------------

// ---------------------- 1 分类树相关 start ----------------
/**
 * 获取地址数据
 */
 const getAddressCountryList = () => {
  const param = {
    pageNum: 1,
    pageSize: 500
  }
  listAddressCountry(param).then(response => {
    if(response.rows){
      addressCountryList.value = response.rows;
    }
  }).catch(error => {
    console.error("获取地址国家列表失败：", error);
  });
}
getAddressCountryList();

/**
 * 获取省份地址数据
 */
const getAddressProvinceList = () => {
  const param = {
    pageNum: 1,
    pageSize: 500,
    countryCode: 'ES'
  }
  listAddressProvince(param).then(response => {
    if(response.rows){
      addressProvinceList.value = response.rows;
    }
  }).catch(error => {
    console.error("获取地址省份列表失败：", error);
  })
}

const handleAddressCountryChange = () => {
  form.value.invoiceAddressProvince = null;
  form.value.invoiceAddressDetail = null;
  if(form.value.invoiceAddressCountry){
    if(form.value.invoiceAddressCountry == 'España'){
      getAddressProvinceList();
    } else{
      addressProvinceList.value = [];
    }
  } else{
    addressProvinceList.value = [];
  }
}

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};

/** 根据名称筛选部门树 */
watch(categoryName, val => {
  proxy.$refs["categoryTreeRef"].filter(val);
});

/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.categoryId = data.id;
  handleQuery();
};

/** 查询部门下拉树结构 */
function getCategoryTree() {
  categoryTreeSelect().then(response => {
    categoryOptions.value = response.data;
  });
};

getCategoryTree()

// ---------------------- 1 分类树相关 end ----------------

// ---------------------- 2 客户等级相关 start ----------------
// 客户等级列表
const customerLevelList = ref([]);
/** 获取客户等级列表 */
function getCustomerLevelList() {
  listCustomerLevel().then(response => {
    customerLevelList.value = response.rows;
  }).catch((error) => {
    console.error("获取客户等级列表时出错:", error);
  });
}

getCustomerLevelList()
// ---------------------- 2 客户等级相关 end ----------------

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    categoryId: null,
    customerId: null,
    customerCode: null,
    customerName: null,
    customerStatus: 0,
    contactName: null,
    contactPhone: null,
    contactEmail: null,
    contactAddress: null,
    invoiceRegimen: '01',
    invoiceCalificacion: 'S1',
    levelId: null,
    invoiceNif: null,
    invoiceNombre: null,
    invoicePhone: null,
    invoicePostcode: null,
    invoiceAddress: null,
    salesmanId: null,
    findBy: null,
    remark: null,
    tenantId: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
  };
  proxy.resetForm("customerRef");
  activeTab.value = 'basic';
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  queryParams.value.categoryId = null;
  categoryName.value = "";
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.customerId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加客户";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _customerId = row.customerId || ids.value
  getCustomer(_customerId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改客户";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["customerRef"].validate(valid => {
    if (valid) {
      if (form.value.customerId != null) {
        updateCustomer(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCustomer(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    } else {
      proxy.$modal.msgError("请检查 【基础信息】 【发票信息】 【联系人信息】 ，并完善信息！");
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _customerIds = row.customerId || ids.value;
  if (!_customerIds) {
    proxy.$modal.msgWarning("请选择要删除的数据");
    return;
  }
  proxy.$modal.confirm(row?.customerCode ? '是否确认删除客户编号为"' + row.customerCode + '"的数据项？' : '是否确认删除已选中的数据项？').then(function() {
    return delCustomer(_customerIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/customer/export', {
    ...queryParams.value
  }, `customer_${new Date().getTime()}.xlsx`)
}

getList();
</script>

<style lang="scss" scoped>
.app-container {
  width: 100%;
  height: 100%; /* 确保父容器高度充满视口 */
  display: flex;
  flex-direction: row;
  margin: 0px;
  padding: 10px;

  .row-container{
    height: 100%;
    width: 100%;

    // 客户分类
    .col-category-container {
      height: 100%;
      .head-container{
        width: 100%;
        .el-input{
          width: 100%;
          margin-right: 5px;
        }
      }

    }

    .col-data-container {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;

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

    }

  }


}


</style>
