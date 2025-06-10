<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="租户名称" prop="tenantName">
        <el-input
          v-model="queryParams.tenantName"
          placeholder="请输入租户名称"
          clearable
          @keyup.enter="handleQuery"
          size="small"
        />
      </el-form-item>
      <el-form-item label="CIF/NIF" prop="invoiceNif">
        <el-input
          v-model="queryParams.invoiceNif"
          placeholder="请输入CIF/NIF"
          clearable
          @keyup.enter="handleQuery"
          size="small"
        />
      </el-form-item>
      <el-form-item label="租户类型" prop="tenantType">
        <el-select v-model="queryParams.tenantType" placeholder="请选择租户类型" clearable style="width: 200px" size="small">
          <el-option
            v-for="dict in sys_tenant_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="帐号状态" prop="tenantStatus">
        <el-select v-model="queryParams.tenantStatus" placeholder="请选择帐号状态" clearable style="width: 200px" size="small">
          <el-option
            v-for="dict in sys_tenant_status"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="手机号" prop="invoicePhoneNumber">
        <el-input
          v-model="queryParams.invoicePhoneNumber"
          placeholder="请输入手机号"
          clearable
          @keyup.enter="handleQuery"
          size="small"
        />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="queryParams.email"
          placeholder="请输入邮箱"
          clearable
          @keyup.enter="handleQuery"
          size="small"
        />
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
          v-hasPermi="['system:tenant:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:tenant:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:tenant:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:tenant:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-tooltip content="新增/修改 租户绑定的顶级部门" effect="dark" placement="bottom">
          <el-button
            type="primary"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleAddTenantDept"
            v-hasPermi="['system:tenant:add:dept']"
          >部门</el-button>
        </el-tooltip>
      </el-col>
      <el-col :span="1.5">
        <el-tooltip content="新增/修改 租户绑定的管理员" effect="dark" placement="bottom">
          <el-button
            type="primary"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleAddTenantAdmin"
            v-hasPermi="['system:tenant:add:admin']"
          >管理员</el-button>
        </el-tooltip>
      </el-col>
      <el-col :span="1.5">
        <el-tooltip content="同时 新增/修改 租户部门、租户管理员" effect="dark" placement="bottom">
          <el-button
            type="warning"
            plain
            icon="Pointer"
            :disabled="single"
            @click="handleOneClickAddDeptAdmin"
            v-hasPermi="['system:tenant:export']"
          >一键初始化</el-button>
        </el-tooltip>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Share"
          :disabled="single"
          @click="handleAssignRoles"
          v-hasPermi="['system:tenant:export']"
        >分配套餐</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Finished"
          :disabled="single"
          @click="handleInitDataBase"
          v-hasPermi="['system:tenant:export']"
        >开通数据</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table class="table-container" v-loading="loading" :data="tenantList" @selection-change="handleSelectionChange" size="small">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="租户编码" align="center" prop="tenantCode" />
      <el-table-column label="租户名称" align="center" prop="tenantName" show-overflow-tooltip=""/>
      <el-table-column label="租户类型" align="center" prop="tenantType" width="80">
        <template #default="scope">
          <dict-tag :options="sys_tenant_type" :value="scope.row.tenantType"/>
        </template>
      </el-table-column>
      <el-table-column label="租户状态" align="center" prop="tenantStatus" width="80">
        <template #default="scope">
          <dict-tag :options="sys_tenant_status" :value="scope.row.tenantStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="成本计算" align="center" prop="costMethod" width="80">
        <template #default="scope">
          <dict-tag :options="product_cost_method" :value="scope.row.costMethod"/>
        </template>
      </el-table-column>

      <el-table-column label="CIF/NIF" align="center" prop="invoiceNif"  show-overflow-tooltip/>
      <el-table-column label="欧盟增值税号" align="center" prop="invoiceVatNumber"  show-overflow-tooltip/>
      <el-table-column label="公司名称" align="center" prop="invoiceNombre" show-overflow-tooltip/>
      <el-table-column label="手机号" align="center" prop="invoicePhoneNumber" show-overflow-tooltip/>
      <el-table-column label="邮编" align="center" prop="invoicePostalCode" show-overflow-tooltip/>
      <el-table-column label="地址国家" align="center" prop="invoiceAddressCountry" show-overflow-tooltip/>
      <el-table-column label="地址省份" align="center" prop="invoiceAddressProvince" show-overflow-tooltip/>
      <el-table-column label="地址明细" align="center" prop="invoiceAddressDetail" show-overflow-tooltip/>
      <el-table-column label="邮箱" align="center" prop="email" show-overflow-tooltip/>
      <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="130">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:tenant:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:tenant:remove']">删除</el-button>
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


    <!-- 添加或修改租户信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="tenantRef" :model="form" :rules="rules" label-width="80px">
        <el-tabs class="tab-container" v-model="activeName" type="border-card" style="margin: 0 20px" >
          <!-- 基础信息部分 -->
          <el-tab-pane  label="商品基础信息" name="first">
            <el-form-item label="租户编码:" prop="tenantCode">
              <el-input v-model="form.tenantCode" placeholder="请输入租户名称" type="textarea" maxlength="30" show-word-limit :rows="1"/>
            </el-form-item>
            <el-form-item label="租户名称:" prop="tenantName">
              <el-input v-model="form.tenantName" placeholder="请输入租户名称" type="textarea" maxlength="100" show-word-limit :rows="1"/>
            </el-form-item>
            <el-form-item label="租户类型:" prop="tenantType">
              <el-select v-model="form.tenantType" placeholder="请选择租户类型">
                <el-option
                  v-for="dict in sys_tenant_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="Number(dict.value)"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="租户状态:" prop="tenantStatus">
              <el-select v-model="form.tenantStatus" placeholder="请选择帐号状态">
                <el-option
                  v-for="dict in sys_tenant_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="Number(dict.value)"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="成本计算方式:" prop="costMethod">
              <el-select v-model="form.costMethod" placeholder="请选择租户类型">
                <el-option
                  v-for="dict in product_cost_method"
                  :key="dict.value"
                  :label="dict.label"
                  :value="Number(dict.value)"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="备注:" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入内容" type="textarea" maxlength="200" show-word-limit :rows="2"/>
            </el-form-item>
          </el-tab-pane>
          <!--  发票信息 -->
          <el-tab-pane label="发票信息" name="second">
            <el-form-item label="CIF/NIF:" prop="invoiceNif">
              <el-input v-model="form.invoiceNif" placeholder="请输入CIF企业/NIF个人" type="textarea" maxlength="9" show-word-limit :rows="1"/>
            </el-form-item>
            <el-form-item label="欧盟税号:" prop="invoiceVatNumber">
              <el-input v-model="form.invoiceVatNumber" placeholder="请输入欧盟增值税号" type="textarea" maxlength="9" show-word-limit :rows="1"/>
            </el-form-item>
            <el-form-item label="公司名称:" prop="invoiceNombre">
              <el-input v-model="form.invoiceNombre" placeholder="公司名称" type="textarea" maxlength="100" show-word-limit :rows="1"/>
            </el-form-item>
            <el-form-item label="手机号:" prop="invoicePhoneNumber">
              <el-input v-model="form.invoicePhoneNumber" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="公司邮箱:" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" type="textarea" maxlength="100" show-word-limit :rows="1"/>
            </el-form-item>
            <el-form-item label="邮编:" prop="invoicePostalCode">
              <el-input v-model="form.invoicePostalCode" placeholder="请输入邮编" />
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

          <!-- 注册信息 -->
          <el-tab-pane label="注册信息" name="third">
            <el-form-item label="注册ID:" prop="apiIdEmisor">
              <el-input
                v-model="form.apiIdEmisor"
                style="max-width: 600px"
                placeholder="系统自动生成"
                disabled
              />
            </el-form-item>
            <el-form-item label="注册代码:" prop="apiCodigo">
              <el-input
                v-model="form.apiCodigo"
                style="max-width: 600px"
                placeholder="系统自动生成"
                disabled
              />
            </el-form-item>
            <el-row>
              <el-form-item label="激活状态:" prop="apiActivo">
                <span v-if="form.apiActivo == ActiveEnum.ACTIVE"> 已激活 </span>
                <span v-else style="color: crimson;"> 未激活 </span>
              </el-form-item>
              <el-form-item label="授权状态:" prop="apiAutorizacion">
                <span v-if="form.apiAutorizacion == AuthorizationEnum.AUTHORIZATION" > 已授权 </span>
                <span v-else style="color: crimson;"> 未授权 </span>
              </el-form-item>
            </el-row>
            <el-form-item label="税种:" prop="apiImpuesto">
              <el-input
                v-model="form.apiImpuesto"
                style="max-width: 600px"
                placeholder="税种 默认01-IVA"
                :disabled="disabledEmisorData"
              />
            </el-form-item>
            <el-form-item label="税务制度: " prop="apiRegimen">
              <el-select v-model="form.apiRegimen" placeholder="请选择税务制度" clearable :disabled="disabledEmisorData">
                <el-option v-for="dict in invoice_regimen" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="应税类型: " prop="apiCalificacion">
              <el-select v-model="form.apiCalificacion" placeholder="请选择纳税类型" clearable :disabled="disabledEmisorData">
                <el-option v-for="dict in invoice_calificacion" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="发票类型: " prop="apiTipoFactura">
              <el-select v-model="form.apiTipoFactura" placeholder="请选择发票类型" clearable :disabled="disabledEmisorData">
                <el-option v-for="dict in varifac_invoice_type" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="税率:" prop="apiIva">
              <el-select v-model="form.apiIva" placeholder="请选择税率" :disabled="disabledEmisorData">
                <el-option v-for="item in rateList" :key="item.rateId" :label="item.rateName"
                  :value="item.rateValue" :disabled="item.rateStatus != 0" />
              </el-select>
            </el-form-item>
            <el-form-item label="F1系列号:" prop="apiSerieF1">
              <el-input
                v-model="form.apiSerieF1"
                style="max-width: 600px"
                placeholder="请输入 F1系列号"
                type="textarea" maxlength="10" show-word-limit :rows="1"
                :disabled="disabledEmisorData"
              />
            </el-form-item>
            <el-form-item label="F2系列号:" prop="apiSerieF2">
              <el-input
                v-model="form.apiSerieF2"
                style="max-width: 600px"
                placeholder="请输入 F2系列号"
                type="textarea" maxlength="10" show-word-limit :rows="1"
                :disabled="disabledEmisorData"
              />
            </el-form-item>
            <el-form-item label="F3系列号:" prop="apiSerieF3">
              <el-input
                v-model="form.apiSerieF3"
                style="max-width: 600px"
                placeholder="请输入 F3系列号"
                type="textarea" maxlength="10" show-word-limit :rows="1"
                :disabled="disabledEmisorData"
              />
            </el-form-item>
            <el-form-item label="R系列号:" prop="apiSerieR">
              <el-input
                v-model="form.apiSerieR"
                style="max-width: 600px"
                placeholder="请输入 R系列号"
                type="textarea" maxlength="10" show-word-limit :rows="1"
                :disabled="disabledEmisorData"
              />
            </el-form-item>
            <el-form-item label="是否年连续:" prop="apiSeriesAnuales">
              <el-radio-group v-model="form.apiSeriesAnuales" :disabled="disabledEmisorData">
                <el-radio :value="0" size="large">年连续</el-radio>
                <el-radio :value="1" size="large">非年连续</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="F2限制金额:" prop="apiLimiteImporte">
              <el-input-number
                v-model="form.apiLimiteImporte"
                placeholder="请输入 F2限制金额"
                :min="0" :max="999999" :precision='2'
                v-focusSelect
                style="width: 100%;"
                :disabled="disabledEmisorData"
              >
                <template #suffix>€</template>
              </el-input-number>
            </el-form-item>
            <el-button-group style="width: 100%;">
              <el-button type="primary" style="width: 33%;"  :disabled="disabledEmisorData" @click="registerEmisor">首次签发注册</el-button>
              <el-button type="warning" style="width: 33%;"    @click="changeEmisor">选择已有注册</el-button>
              <el-button type="danger" style="width: 33%;"  :disabled="!disabledEmisorData" @click="refreshEmisor">刷新注册</el-button>
            </el-button-group>
            
          </el-tab-pane>

          <!-- 注册信息查询 -->
          <el-tab-pane label="注册信息" name="catchApi">
            <el-input
              v-model="form.invoiceNif"
              style="max-width: 600px; margin-bottom: 5px;"
              placeholder="系统自动生成"
              disabled
            >
              <template #append>
                <el-button style="background-color: #FFA500; border-color: #FFA500; color: white;"  @click="selectEmisorList">Verifac 查询结果</el-button>
              </template>
            </el-input>

            <!-- 查询结果 -->
            <el-table class="table-container"  :data="emisorList" style="width: 100%;" >
              <el-table-column label="ID" prop="idEmisor"  align="center" show-overflow-tooltip />
              <el-table-column label="NIF" prop="nif"  align="center" show-overflow-tooltip />
              <el-table-column label="Codigo" prop="codigo"  align="center" show-overflow-tooltip />
              <el-table-column label="激活状态" prop="activo"  align="center" show-overflow-tooltip >
                <template #default="scope">
                  <el-tag v-if="scope.row.activo == ActiveEnum.NO_ACTIVE" type="danger" size="small">未激活</el-tag>
                  <el-tag v-else type="success" size="small">已激活</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" >
                <template #default="scope">
                  <el-button  type="danger" size="small" @click="deleteEmisor(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            
          </el-tab-pane>
        </el-tabs>

      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">{{ buttonTital }}</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>

    </el-dialog>

    <el-dialog title="选择已注册信息" v-model="openChangeDialog" width="500px" append-to-body  >
      <el-table class="table-container"  :data="emisorList" style="width: 100%;" @current-change="handleSelectionEmisor" highlight-current-row>
        <el-table-column label="ID" prop="idEmisor"  align="center" show-overflow-tooltip />
          <el-table-column label="NIF" prop="nif"  align="center" show-overflow-tooltip />
          <el-table-column label="Codigo" prop="codigo"  align="center" show-overflow-tooltip />
          <el-table-column label="激活状态" prop="activo"  align="center" show-overflow-tooltip >
            <template #default="scope">
              <el-tag v-if="scope.row.activo == ActiveEnum.NO_ACTIVE" type="danger" size="small">未激活</el-tag>
              <el-tag v-else type="success" size="small">已激活</el-tag>
            </template>
          </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :disabled="currentEmisor == null" @click="confirmChangeEmisor">确认更换</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Tenant">
import { listTenant, getTenant, delTenant, addTenant, updateTenant, addTenantDept, addTenantAdmin } from "@/api/system/tenant";
import { vrifacRegisterEmisor, vrifacSelectEmisorList, vrifacDeleteEmisor} from "@/api/system/tenant";
import useUserStore from "@/store/modules/user";
import { ElMessage, ElMessageBox } from 'element-plus';
import { listAddressCountry } from "@/api/address/addressCountry";
import { listAddressProvince } from "@/api/address/addressProvince";
import { listProductRate } from "@/api/product/productRate";
import { ref } from "vue";
import { computed } from "vue";

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { sys_tenant_status, sys_tenant_type, product_cost_method } = proxy.useDict('sys_tenant_status', 'sys_tenant_type', 'product_cost_method');
const { invoice_regimen, invoice_calificacion, varifac_invoice_type} = proxy.useDict('invoice_regimen', 'invoice_calificacion', 'varifac_invoice_type');

const tenantList = ref([]);
const open = ref(false);
const openChangeDialog = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const buttonTital = ref("确定");
const rateList = ref([]);
const activeName = ref("first");  // 标签菜单默认首页
const addressCountryList = ref([]);
const addressProvinceList = ref([]);
const emisorList = ref([]);


// -------------------------- 签发注册业务 start ------------------------------------
/** 签发注册  */
function registerEmisor () {
  if(form.value.tenantId  == null){
    proxy.$modal.msgError("请先新增租户信息");
    return;
  }
  vrifacRegisterEmisor(form.value).then((response) => { 
      proxy.$modal.msgSuccess("修改成功");
      form.value = response.data;
  });
}

/** 获取签发注册列表 */
async function selectEmisorList () {
  vrifacSelectEmisorList(form.value).then((response) => {
    if  (response.data) {
      console.log("前端查询的结果是：",response.data);
      emisorList.value = response.data;
    }
  });

}

/** 删除签发注册记录 */
function deleteEmisor(row){
  proxy.$modal.confirm('是否确认删除当前注册ID"' + row.idEmisor + '"的数据项？').then(function() {
    vrifacDeleteEmisor(row).then((response) => {
        selectEmisorList();
        if(response){
          ElMessage.success(response.msg);
        }
        
    })
    .catch(()=>{
      selectEmisorList();
    })
  });
  
}

/**
 * 更换已注册的信息 - 如果已被租户引用不可以更换
 */
function changeEmisor(){
  selectEmisorList().then((response) => {
    // 弹出已签发的注册信息
    openChangeDialog.value  = true;
  });
}

const currentEmisor = ref(null);
function handleSelectionEmisor(selection){
  currentEmisor.value = selection
  console.log("当前选择的是：",currentEmisor.value)

}

/** 确认更换 */
function confirmChangeEmisor(){
  console.log("当前更换的信息是", currentEmisor.value)
  fromEmisorToForm(currentEmisor.value)
  ElMessage.warning("注册信息更换成功，需要确认新增/修改 才会生效！！")
  openChangeDialog.value  = false;
}

function fromEmisorToForm(emisor){
  if(emisor){
    form.value.apiIdEmisor = emisor.idEmisor;
    form.value.apiCodigo = emisor.codigo;
    form.value.apiActivo = emisor.activo;
    form.value.apiAutorizacion = emisor.autorizacion;
    form.value.apiImpuesto = emisor.impuesto;
    form.value.apiRegimen = emisor.regimen;
    form.value.apiCalificacion = emisor.calificacion;
    form.value.apiTipoFactura = emisor.tipoFactura;
    form.value.apiIva = emisor.iva;
    form.value.apiSerieF1 = emisor.serieF1;
    form.value.apiSerieF2 = emisor.serieF2;
    form.value.apiSerieF3 = emisor.serieF3;
    form.value.apiSerieR = emisor.serieR;
    form.value.apiSeriesAnuales = emisor.seriesAnuales;
    form.value.apiLimiteImporte = emisor.limiteImporte;
  }
}

/** 刷新注册 - 更新注册，替换之前的注册信息 */
function refreshEmisor(){
  proxy.$modal.confirm('是否确认重新注册，更换当前注册ID"' + form.value.apiIdEmisor + '"的数据项？').then(function() {
    return registerEmisor();
  }).then(() => {
    getList();
  }).catch(() => {});
}

const disabledEmisorData= computed(() => {
  if(form.value.apiIdEmisor == null){
    return false;
  } else{
    return true;
  }
})

/**
 * 激活状态： 0-未激活，1-激活
 */
const ActiveEnum = {
  NO_ACTIVE: 0,
  ACTIVE: 1,
};

/**
 * 授权状态： 0-未授权，1-已授权
 */
const AuthorizationEnum = {
  NO_AUTHORIZATION: 0,
  AUTHORIZATION: 1,
};

/** 获取税率下拉数据 */
function getRateList(){
  listProductRate().then(response => {
    rateList.value = response.rows;
  }).catch(error => {
    console.error("获取税率列表失败：", error);
  })
}
getRateList();

// -------------------------- 签发注册业务 end ------------------------------------


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


const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tenantCode: null,
    tenantName: null,
    tenantType: null,
    tenantStatus: null,
    invoiceNif: null,
    invoiceVatNumber: null,
    invoicePhoneNumber: null,
    email: null,
  },
  rules: {
    tenantCode: [
      { required: true, message: "公司编码不能为空", trigger: "blur" }
    ],
    tenantName: [
      { required: true, message: "公司名称不能为空", trigger: "blur" }
    ],
    tenantType: [
      { required: true, message: "公司类型不能为空", trigger: "change" }
    ],
    invoiceNif: [
      { required: true, message: "发票税号不能为空", trigger: "blur" }
    ],
    invoiceNombre: [
      { required: true, message: "发票公司不能为空", trigger: "blur" }
    ],
    invoicePhoneNumber: [
      { required: true, message: "发票手机号不能为空", trigger: "blur" }
    ],
    invoicePostalCode: [
      { required: true, message: "发票邮编不能为空", trigger: "blur" }
    ],
    invoiceAddressCountry: [
      { required: true, message: "发票地址国家不能为空", trigger: "blur" }
    ],
    invoiceAddressProvince: [
      { required: true, message: "发票地址省份不能为空", trigger: "blur" }
    ],
    invoiceAddressDetail: [
      { required: true, message: "发票地址明细不能为空", trigger: "blur" }
    ],
    email: [
      { required: true, message: "邮箱不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询租户信息列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listTenant(queryParams.value).then(response => {
    tenantList.value = response.rows;
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
    tenantId: null,
    tenantCode: null,
    tenantName: null,
    tenantType: 2,
    tenantStatus: 0,
    costMethod: 1,
    invoiceNif: null,
    invoiceNombre: null,
    invoicePhoneNumber: null,
    invoicePostalCode: null,
    invoiceAddressCountry: null,
    invoiceAddressProvince: null,
    invoiceAddressDetail: null,
    invoiceVatNumber: null,
    email: null,
    remark: null,
    apiIdEmisor: null,
    apiCodigo: null,
    apiActivo: ActiveEnum.NO_ACTIVE,
    apiAutorizacion: AuthorizationEnum.NO_AUTHORIZATION,
    apiImpuesto: '01',
    apiRegimen: '01',
    apiCalificacion: 'S1',
    apiTipoFactura: 'F1',
    apiIva: 21,
    apiSerieF1: 'C',
    apiSerieF2: 'S',
    apiSerieF3: 'X',
    apiSerieR: 'R',
    apiSeriesAnuales: 0,
    apiLimiteImporte: 3000,
  };
  proxy.resetForm("tenantRef");
  activeName.value = "first";
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
  ids.value = selection.map(item => item.tenantId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加租户信息";
  buttonTital.value = "确认添加";
  getAddressCountryList()
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _tenantId = row.tenantId || ids.value
  getTenant(_tenantId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改租户信息";
    buttonTital.value  = "确认修改";
  });
  getAddressCountryList()
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["tenantRef"].validate(valid => {
    if (valid) {
      if (form.value.tenantId != null) {
        updateTenant(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          activeName.value = "first";
          getList();
        });
      } else {
        addTenant(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          activeName.value = "first";
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _tenantIds = row.tenantId || ids.value;
  proxy.$modal.confirm('是否确认删除租户信息编号为"' + _tenantIds + '"的数据项？').then(function() {
    return delTenant(_tenantIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/tenant/export', {
    ...queryParams.value
  }, `tenant_${new Date().getTime()}.xlsx`)
}

/** 新增租户顶级部门 */
function handleAddTenantDept() {
  // 获取选中租户的信息
  reset();
  const _tenantId = ids.value
  getTenant(_tenantId).then(response => {
    form.value = response.data;
    // 调用新增部门接口
    addTenantDept(form.value).then(response => {
      proxy.$modal.msgSuccess(response.msg);
    });
  });
  
}


/** 新增租户管理员用户 */
function handleAddTenantAdmin(){
  reset();
  const _tenantId = ids.value
  getTenant(_tenantId).then(response => {
    form.value = response.data;
    // 调用新增部门接口
    addTenantAdmin(form.value).then(response => {
      proxy.$modal.msgSuccess(response.msg);
    });
  });  
}

/** 一键处理住户初始化操作 */
function handleOneClickAddDeptAdmin(){
  reset();
  const _tenantId = ids.value
  getTenant(_tenantId).then(response => {
    form.value = response.data;
    // 调用新增部门接口
    addTenantDept(form.value).then(response => {
      proxy.$modal.msgSuccess(response.msg);
      // 调用新增管理员接口
      addTenantAdmin(form.value).then(response => {
        proxy.$modal.msgSuccess(response.msg);
      });
    }); 
  });   
}

/** 租户分配套餐 */
function handleAssignRoles(){
  ElMessage.warning("分配套餐 功能尚未开发！");
}

/** 租户开通数据操作 */
function handleInitDataBase(){
  ElMessage.warning("开通数据 功能尚未开发！");
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
