<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="所属仓库" prop="warehouseId">
        <el-select v-model="queryParams.warehouseId" placeholder="请选择所属仓库" filterable @change="handleChangeWarehouseId">
          <el-option v-for="item in warehouseList" :key="item.warehouseId" :label="item.warehouseName"
            :value="item.warehouseId" />
        </el-select>
      </el-form-item>
      <el-form-item label="库位编码" prop="locationCode">
        <el-input v-model="queryParams.locationCode" placeholder="请输入库位编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="库位类型" prop="locationType">
        <el-select v-model="queryParams.locationType" placeholder="请选择库位类型" clearable>
          <el-option v-for="dict in erp_warehouse_location_type" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="库位状态" prop="locationStatus">
        <el-select v-model="queryParams.locationStatus" placeholder="请选择库位状态" clearable>
          <el-option v-for="dict in erp_warehouse_location_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['product:warehouseLocation:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <el-col :span="1.5" style="margin-left: 50px;">
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 库位属性列表 -->
    <el-table class="table-container" v-if="refreshTable" v-loading="loading" :data="warehouseLocationList"
      row-key="locationId" :default-expand-all="isExpandAll" size="small"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}" >
      <el-table-column label="库位编码" prop="locationCode" min-width="150" show-overflow-tooltip="" />
      <el-table-column label="库位名称" align="center" prop="locationName" min-width="120" show-overflow-tooltip="" />
      <el-table-column label="库位类型" align="center" prop="locationType">
        <template #default="scope">
          <dict-tag :options="erp_warehouse_location_type" :value="scope.row.locationType" v-if="scope.row.locationType"/>
          <span v-else> -- </span>
        </template>
      </el-table-column>
      <el-table-column label="库位状态" align="center" prop="locationStatus">
        <template #default="scope">
          <dict-tag :options="erp_warehouse_location_status" :value="scope.row.locationStatus" v-if="scope.row.locationStatus"/>
          <span v-else> -- </span>
        </template>
      </el-table-column>
      <el-table-column label="所属仓库" align="center" show-overflow-tooltip="">
        <template #default="scope">
          <span>{{ scope.row.warehouseForStockInVo?.warehouseName || '--'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="sku名称" align="center">
        <template #default="scope">
          <span>{{ scope.row.productSkuVo?.skuName || '未绑定' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="现存数量" align="center" prop="quantity" />
      <el-table-column label="最大数量" align="center" prop="maxQuantity" />
      <el-table-column label="警报数量" align="center" prop="quantityAlarm" />
      <el-table-column label="过期日期" align="center" prop="expireDate">
        <template #default="scope">
          <span v-if="scope.row.expireDate">{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="过期预警" align="center" prop="expireAlarm">
        <template #default="scope">
          {{ scope.row.expireAlarm ?? 'xx'}} 天
        </template>
      </el-table-column>
      <el-table-column label="排序权重" align="center" prop="orderWeight" />
      <el-table-column label="库位节点" align="center" prop="isLeaf">
        <template #default="scope">
          <dict-tag :options="sys_yes_or_no" :value="scope.row.isLeaf" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="left" header-align="center" prop="remark" show-overflow-tooltip />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="235">
        <template #default="scope">
          <el-button link type="primary" icon="Plus" size="small" @click="handleAdd(scope.row)"
            v-hasPermi="['product:warehouseLocation:add']">新增</el-button>
          <el-button link type="success" icon="Edit" size="small" @click="handleUpdate(scope.row)"
            v-hasPermi="['product:warehouseLocation:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" size="small" @click="handleDelete(scope.row)"
            v-hasPermi="['product:warehouseLocation:remove']">删除</el-button>
          <el-button link type="primary" size="small" @click="handleShowDrawer(scope.row)">
            >>更多详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改库位管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="warehouseLocationRef" :model="form" :rules="rules" label-width="80px">
        <!-- 添加或修改 - 基础信息 -->
        <el-tabs type="border-card" class="full-height-tabs" v-model="activeTab">
          <el-tab-pane label="基础信息" name="basic">
            <el-form-item label="所属仓库" prop="warehouseId">
              <el-select v-model="form.warehouseId" placeholder="请选择所属仓库" filterable @change="changeWarehouseId" disabled>
                <el-option v-for="item in warehouseList" :key="item.warehouseId" :label="item.warehouseName"
                  :value="item.warehouseId" />
              </el-select>
            </el-form-item>
            <el-form-item label="上级节点" prop="parentId">
              <el-tree-select ref="locationTreeSelectRef" v-model="form.parentId" :data="warehouseLocationOptions"
                :props="{ value: 'locationId', label: 'locationCode', children: 'children' }" value-key="locationId"
                placeholder="请选择上级节点" check-strictly :disabled="isLocationDisabled" @change="updateParentNode" />
              <el-text type="danger" style="margin-left: 10px;"> 库存编码：xx-xx-xx-xx-xx </el-text>
            </el-form-item>
            <el-form-item label="库位编码" prop="locationCode">
              <el-input v-model="form.locationCode" placeholder="请输入库位编码" 
                :disabled="isLocationDisabled" />
            </el-form-item>
            <el-form-item label="库位名称" prop="locationName">
              <el-input v-model="form.locationName" placeholder="请输入库位名称" type="textarea" maxlength="100"
                show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="库位节点:" prop="isLeaf">
              <template #label>
                <span>库位节点:</span>
                <el-tooltip content="库位节点是末级节点，同时作为末级节点不允许添加下级节点" placement="top">
                  <el-icon color="red"><question-filled /></el-icon>
                </el-tooltip>
              </template>
              <el-radio-group v-model="form.isLeaf" :disabled="isLocationDisabled">
                <el-radio v-for="dict in sys_yes_or_no" :key="dict.value" :value="parseInt(dict.value)">{{
                  dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="库位类型" prop="locationType" v-if="form.isLeaf != IsLeafEnum.NO">
              <template #label>
                <span>库位类型:</span>
                <el-tooltip content="[ 固定库位 ] :用于高架2层，用于补货使用，上下架不可修改；[ 活动库位 ] :用于高架3层以上，普通存储使用，上下架可以修改绑定！" placement="top">
                  <el-icon color="red"><question-filled /></el-icon>
                </el-tooltip>
              </template>
              <el-radio-group v-model="form.locationType">
                <el-radio v-for="dict in erp_warehouse_location_type" :key="dict.value" :value="parseInt(dict.value)">{{
                  dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="库位状态" prop="locationStatus" v-if="form.isLeaf != IsLeafEnum.NO">
              <el-radio-group v-model="form.locationStatus">
                <el-radio v-for="dict in erp_warehouse_location_status" :key="dict.value"
                  :value="parseInt(dict.value)">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="节点等级" prop="locationLevel">
              <el-input v-model="form.locationLevel" placeholder="系统自动生成！" disabled />
            </el-form-item>
            <el-form-item label="排序权重:" prop="orderWeight" v-if="form.isLeaf != IsLeafEnum.NO">
              <template #label>
                <span>排序权重:</span>
                <el-tooltip content="拣货清单会根据排序权重进行排序" placement="top">
                  <el-icon color="red"><question-filled /></el-icon>
                </el-tooltip>
              </template>
              <el-input-number v-model="form.orderWeight" placeholder="请输入库位排序权重！" style="width: 80%;" :precision="0"
                :min="0" :max="999999" v-focusSelect />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注" type="textarea" maxlength="200" show-word-limit
                :rows="2" />
            </el-form-item>
          </el-tab-pane>
          <!-- 添加或修改 - 容量设置 -->
          <el-tab-pane label="容量设置" name="store" v-if="form.isLeaf != IsLeafEnum.NO">
            <el-form-item label="长度:" prop="locationLength">
              <el-input-number v-model="form.locationLength" placeholder="请输入长度" style="width: 80%;" :min="0"
                :max="99999" :value-on-clear="0" v-focusSelect @change="calculateVolume">
                <template #suffix>cm</template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="宽度:" prop="locationWidth">
              <el-input-number v-model="form.locationWidth" placeholder="请输入宽度" style="width: 80%;" :min="0"
                :max="99999" :value-on-clear="0" v-focusSelect @change="calculateVolume">
                <template #suffix>cm</template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="高度:" prop="locationHeight">
              <el-input-number v-model="form.locationHeight" placeholder="请输入高度" style="width: 80%;" :min="0"
                :max="99999" :value-on-clear="0" v-focusSelect @change="calculateVolume">
                <template #suffix>cm</template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="体积:" prop="volume">
              <el-input-number v-model="form.volume" placeholder="系统自动计算" style="width: 80%;" :controls="false"
                disabled>
                <template #suffix>m3</template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="最大承重:" prop="maxWeight">
              <el-input-number v-model="form.maxWeight" placeholder="请输入最大承重" style="width: 80%;" :min="0" :max="99999"
                :value-on-clear="0" v-focusSelect>
                <template #suffix>kg</template>
              </el-input-number>
            </el-form-item>
          </el-tab-pane>
          <!-- 添加或修改 - 商品设置 -->
          <el-tab-pane label="商品设置" name="setting" v-if="form.isLeaf != IsLeafEnum.NO">
            <el-form-item label="绑定SKU:" prop="skuId">
              <template #label>
                <span>绑定SKU:</span>
                <el-tooltip content="一个库位只能绑定一个SKU" placement="top">
                  <el-icon color="red"><question-filled /></el-icon>
                </el-tooltip>
              </template>
              <SkuSelect v-model="form.skuId" />
            </el-form-item>
            <el-form-item label="商品编码:" prop="productCode">
              {{ form.productSkuVo?.skuCode || ''  }}
            </el-form-item>
            <el-form-item label="商品名称:" prop="productName">
              {{ form.productSkuVo?.skuName || ''  }}
            </el-form-item>
            <el-form-item label="商品规格:" prop="specification">
              <div v-if="getSkuValue(form.productSkuVo?.skuValue) === 'default'">
                --  <!-- 直接显示默认 SKU -->
              </div>
              <div v-else v-for="(item, index) in getSkuValue(form.productSkuVo?.skuValue)" :key="index">
                <strong>{{ item[0] }}:</strong>
                <span>{{ item[1] }}</span>
              </div>
            </el-form-item>
            <el-form-item label="批次号:" prop="batchNo">
              <template #label>
                <span>批次号:</span>
                <el-tooltip content="一个库位只能绑定一个批次号" placement="top">
                  <el-icon color="red"><question-filled /></el-icon>
                </el-tooltip>
              </template>
              <el-input v-model="form.batchNo" placeholder="系统由补货上架操作更新" type="textarea" maxlength="20" show-word-limit
                :rows="1" disabled />
            </el-form-item>
            <el-form-item label="最大容纳数量:" prop="maxQuantity">
              <el-input-number v-model="form.maxQuantity" placeholder="请输入最大容纳数量" :min="0" :max="99999"
                style="width: 100%;" :value-on-clear="0" v-focusSelect />
            </el-form-item>
            <el-form-item label="现存数量:" prop="quantity">
              <el-input v-model="form.quantity" placeholder="系统由补货上架操作更新" disabled />
            </el-form-item>
            <el-form-item label="冻结数量:" prop="quantityLock">
              <el-input v-model="form.quantityLock" placeholder="系统由补货上架操作更新" disabled />
            </el-form-item>
            <el-form-item label="可用数量:" prop="quantityFree">
              <el-input v-model="form.quantityFree" placeholder="系统由补货上架操作更新" disabled />
            </el-form-item>
            <el-form-item label="数量预警下限:" prop="quantityAlarm">
              <template #label>
                <span>数量预警:</span>
                <el-tooltip content="当可用数量小于预警数量时, 触发预警" placement="top">
                  <el-icon color="red"><question-filled /></el-icon>
                </el-tooltip>
              </template>
              <el-input-number v-model="form.quantityAlarm" placeholder="请输入预警下限数量" :min="0" :max="99999"
                style="width: 100%;" :value-on-clear="0" v-focusSelect />
            </el-form-item>
            <el-form-item label="过期日期:" prop="expireDate">
              <el-input-number v-model="form.expireDate" placeholder="系统由入库单自动生成" :min="0" :max="99999"
                style="width: 100%;" :value-on-clear="0" v-focusSelect disabled>
                <template #suffix>天</template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="过期预警下限:" prop="expireAlarm">
              <template #label>
                <span>过期预警:</span>
                <el-tooltip content="当过期时间临近预警天数的下限时,触发预警" placement="top">
                  <el-icon color="red"><question-filled /></el-icon>
                </el-tooltip>
              </template>
              <el-input-number v-model="form.expireAlarm" placeholder="请输入过期预警天数" :min="0" :max="99999"
                style="width: 100%;" :value-on-clear="0" v-focusSelect>
                <template #suffix>天</template>
              </el-input-number>
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
    <el-drawer v-model="drawer" direction="rtl" append-to-body @close="handleCloseDrawerReset" :destroy-on-close="true">
      <template #header>
        <span>SKU 规格明细 详情</span>
      </template>
      <el-form ref="warehouseLocationRef" :model="form" :rules="rules" label-width="80px" disabled>
        <!-- 详情 - 基础信息 -->
        <el-tabs type="border-card" class="full-height-tabs" v-model="activeTab" >
          <el-tab-pane label="基础信息" name="basic">
            <el-form-item label="所属仓库" prop="warehouseId">
              <el-select v-model="form.warehouseId" placeholder="请选择所属仓库" filterable @change="changeWarehouseId" >
                <el-option v-for="item in warehouseList" :key="item.warehouseId" :label="item.warehouseName"
                  :value="item.warehouseId" />
              </el-select>
            </el-form-item>
            <el-form-item label="上级节点" prop="parentId">
              <el-tree-select ref="locationTreeSelectRef" v-model="form.parentId" :data="warehouseLocationOptions"
                :props="{ value: 'locationId', label: 'locationCode', children: 'children' }" value-key="locationId"
                placeholder="请选择上级节点" check-strictly :disabled="isLocationDisabled" @change="updateParentNode" />
              <el-text type="danger" style="margin-left: 10px;"> 库存编码：xx-xx-xx-xx-xx </el-text>
            </el-form-item>
            <el-form-item label="库位编码" prop="locationCode">
              <el-input v-model="form.locationCode" placeholder="请输入库位编码" 
                :disabled="isLocationDisabled" />
            </el-form-item>
            <el-form-item label="库位名称" prop="locationName">
              <el-input v-model="form.locationName" placeholder="请输入库位名称" type="textarea" maxlength="100"
                show-word-limit :rows="1" />
            </el-form-item>
            <el-form-item label="库位节点:" prop="isLeaf">
              <template #label>
                <span>库位节点:</span>
                <el-tooltip content="库位节点是末级节点，同时作为末级节点不允许添加下级节点" placement="top">
                  <el-icon color="red"><question-filled /></el-icon>
                </el-tooltip>
              </template>
              <el-radio-group v-model="form.isLeaf">
                <el-radio v-for="dict in sys_yes_or_no" :key="dict.value" :value="parseInt(dict.value)">{{
                  dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="库位类型" prop="locationType" v-if="form.isLeaf != IsLeafEnum.NO">
              <el-radio-group v-model="form.locationType">
                <el-radio v-for="dict in erp_warehouse_location_type" :key="dict.value" :value="parseInt(dict.value)">{{
                  dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="库位状态" prop="locationStatus" v-if="form.isLeaf != IsLeafEnum.NO">
              <el-radio-group v-model="form.locationStatus">
                <el-radio v-for="dict in erp_warehouse_location_status" :key="dict.value"
                  :value="parseInt(dict.value)">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="节点等级" prop="locationLevel">
              <el-input v-model="form.locationLevel" placeholder="系统自动生成！" disabled />
            </el-form-item>
            <el-form-item label="排序权重:" prop="orderWeight" v-if="form.isLeaf != IsLeafEnum.NO">
              <template #label>
                <span>排序权重:</span>
                <el-tooltip content="拣货清单会根据排序权重进行排序" placement="top">
                  <el-icon color="red"><question-filled /></el-icon>
                </el-tooltip>
              </template>
              <el-input-number v-model="form.orderWeight" placeholder="请输入库位排序权重！" style="width: 80%;" :precision="0"
                :min="0" :max="99999999999999999999" v-focusSelect />
            </el-form-item>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注" type="textarea" maxlength="200" show-word-limit
                :rows="2" />
            </el-form-item>
          </el-tab-pane>
          <!-- 详情 - 容量设置 -->
          <el-tab-pane label="容量设置" name="store" v-if="form.isLeaf != IsLeafEnum.NO">
            <el-form-item label="长度:" prop="locationLength">
              <el-input-number v-model="form.locationLength" placeholder="请输入长度" style="width: 80%;" :min="0"
                :max="99999" :value-on-clear="0" v-focusSelect @change="calculateVolume">
                <template #suffix>cm</template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="宽度:" prop="locationWidth">
              <el-input-number v-model="form.locationWidth" placeholder="请输入宽度" style="width: 80%;" :min="0"
                :max="99999" :value-on-clear="0" v-focusSelect @change="calculateVolume">
                <template #suffix>cm</template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="高度:" prop="locationHeight">
              <el-input-number v-model="form.locationHeight" placeholder="请输入高度" style="width: 80%;" :min="0"
                :max="99999" :value-on-clear="0" v-focusSelect @change="calculateVolume">
                <template #suffix>cm</template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="体积:" prop="volume">
              <el-input-number v-model="form.volume" placeholder="系统自动计算" style="width: 80%;" :controls="false"
                disabled>
                <template #suffix>m3</template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="最大承重:" prop="maxWeight">
              <el-input-number v-model="form.maxWeight" placeholder="请输入最大承重" style="width: 80%;" :min="0" :max="99999"
                :value-on-clear="0" v-focusSelect>
                <template #suffix>kg</template>
              </el-input-number>
            </el-form-item>
          </el-tab-pane>
          <!-- 详情 - 商品设置 -->
          <el-tab-pane label="商品设置" name="setting" v-if="form.isLeaf != IsLeafEnum.NO">
            <el-form-item label="商品编码:" prop="productCode">
              {{ form.productSkuVo?.skuCode || ''  }}
            </el-form-item>
            <el-form-item label="商品名称:" prop="productName">
              {{ form.productSkuVo?.skuName || ''  }}
            </el-form-item>
            <el-form-item label="商品规格:" prop="specification">
              <div v-if="getSkuValue(form.productSkuVo?.skuValue) === 'default'">
                --  <!-- 直接显示默认 SKU -->
              </div>
              <div v-else v-for="(item, index) in getSkuValue(form.productSkuVo?.skuValue)" :key="index">
                <strong>{{ item[0] }}:</strong>
                <span>{{ item[1] }}</span>
              </div>
            </el-form-item>
            <el-form-item label="批次号:" prop="batchNo">
              <template #label>
                <span>批次号:</span>
                <el-tooltip content="一个库位只能绑定一个批次号" placement="top">
                  <el-icon color="red"><question-filled /></el-icon>
                </el-tooltip>
              </template>
              <el-input v-model="form.batchNo" placeholder="系统由补货上架操作更新" type="textarea" maxlength="20" show-word-limit
                :rows="1" disabled />
            </el-form-item>
            <el-form-item label="最大容纳数量:" prop="maxQuantity">
              <el-input-number v-model="form.maxQuantity" placeholder="请输入最大容纳数量" :min="0" :max="99999"
                style="width: 100%;" :value-on-clear="0" v-focusSelect />
            </el-form-item>
            <el-form-item label="现存数量:" prop="quantity">
              <el-input v-model="form.quantity" placeholder="系统由补货上架操作更新" disabled />
            </el-form-item>
            <el-form-item label="冻结数量:" prop="quantityLock">
              <el-input v-model="form.quantityLock" placeholder="系统由补货上架操作更新" disabled />
            </el-form-item>
            <el-form-item label="可用数量:" prop="quantityFree">
              <el-input v-model="form.quantityFree" placeholder="系统由补货上架操作更新" disabled />
            </el-form-item>
            <el-form-item label="数量预警下限:" prop="quantityAlarm">
              <template #label>
                <span>数量预警:</span>
                <el-tooltip content="当可用数量小于预警数量时, 触发预警" placement="top">
                  <el-icon color="red"><question-filled /></el-icon>
                </el-tooltip>
              </template>
              <el-input-number v-model="form.quantityAlarm" placeholder="请输入预警下限数量" :min="0" :max="99999"
                style="width: 100%;" :value-on-clear="0" v-focusSelect />
            </el-form-item>
            <el-form-item label="过期日期:" prop="expireDate">
              <el-input-number v-model="form.expireDate" placeholder="系统由入库单自动生成" :min="0" :max="99999"
                style="width: 100%;" :value-on-clear="0" v-focusSelect disabled>
                <template #suffix>天</template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="过期预警下限:" prop="expireAlarm">
              <template #label>
                <span>过期预警:</span>
                <el-tooltip content="当过期时间临近预警天数的下限时,触发预警" placement="top">
                  <el-icon color="red"><question-filled /></el-icon>
                </el-tooltip>
              </template>
              <el-input-number v-model="form.expireAlarm" placeholder="请输入过期预警天数" :min="0" :max="99999"
                style="width: 100%;" :value-on-clear="0" v-focusSelect>
                <template #suffix>天</template>
              </el-input-number>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>

    </el-drawer>
  </div>
</template>

<script setup name="WarehouseLocation">
import { listWarehouseLocation, getWarehouseLocation, delWarehouseLocation, addWarehouseLocation, updateWarehouseLocation } from "@/api/product/warehouseLocation";
import useUserStore from "@/store/modules/user";
import { LocationTypeEnum, LocationStatusEnum, IsLeafEnum, convertXXToNumber, convertStringToNumber } from './warehouseLocation.js';
import { listWarehouse} from "@/api/product/warehouse";
import SkuSelect from '@/components/Common/SkuSelect.vue';

// 租户ID字段过滤使用
const userStore = useUserStore();

const { proxy } = getCurrentInstance();
const { sys_yes_or_no, erp_warehouse_location_type, erp_warehouse_location_status } = proxy.useDict('sys_yes_or_no', 'erp_warehouse_location_type', 'erp_warehouse_location_status');

const warehouseLocationList = ref([]);
const warehouseLocationOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(true);
const refreshTable = ref(true);
const activeTab = ref("basic");
const locationTreeSelectRef = ref(null);
// 计算属性，确保 disabled 属性为布尔值
const isLocationDisabled = computed(() => !!form.value.locationId);
const drawer = ref(false);  // 抽屉弹窗控制变量

const handleShowDrawer = (row) => {
  form.value = row;
  drawer.value = true;
}

const handleCloseDrawerReset = () => {
  drawer.value = false;
  form.value = {};
  activeTab.value = 'basic';
}

const handleChangeWarehouseId = () => {
  getList();
}

/** 包装信息计算 */
const calculateVolume = () => {
  const length = form.value.locationLength || 0;
  const width = form.value.locationWidth || 0;
  const height = form.value.locationHeight || 0;
  // 计算立方米
  form.value.volume = (length * width * height) / (100 * 100 * 100);
};

/** 获取选中父节点的科目编码 */
const getSelectedParentLocationNode = () => {
  const parentNode = locationTreeSelectRef.value.getCurrentNode();
  if (parentNode) {
    if (parentNode.parentId == 0) {
      form.value.locationLevel = 1;
    } else {
      form.value.locationLevel = parentNode.locationLevel + 1;
    }
  } else {
    form.value.locationLevel = 1;
  }
}

/** 修改父节点 - 更新节点等级 */
const updateParentNode = () => {
  getSelectedParentLocationNode()
}


// --------------------------- 仓库处理业务 start -----------------------------
/** 获取仓库列表 */
const warehouseList = ref([]);
const getWarehouseList = () => {
  listWarehouse().then(response => {
    warehouseList.value = response.rows;
  }).catch (error => {
    ElMessage.error("获取仓库列表时出错:",error)
  })
}

getWarehouseList()

/** 变更仓库ID - 更新上级节点数的选择 */
const changeWarehouseId = () => {
  const Params = {
    warehouseId: form.value.warehouseId
  }
  // 获取选中仓库的库位树
  listWarehouseLocation(Params).then(response => {
    warehouseLocationOptions.value = [];
    const data = { locationId: 0, locationCode: '顶级节点', children: [] };
    data.children = proxy.handleTree(response.data, "locationId", "parentId");
    warehouseLocationOptions.value.push(data);
  });
  // 更新选中父节点
  form.value.parentId = 0;
  
}

/** 监听 warehouseList 的变化并设置quaryParams.value.warehouseId 的默认值 */ 
watch(warehouseList, (newVal) => {
  if (newVal.length > 0 && !queryParams.value.warehouseId) {
    queryParams.value.warehouseId = newVal[0].warehouseId; // 默认选择第一个仓库
    getList();
  }
}, { immediate: true });

// --------------------------- 仓库处理业务 end -----------------------------

const data = reactive({
  form: {},
  queryParams: {
    locationCode: null,
    locationName: null,
    locationType: null,
    locationStatus: null,
    warehouseId: null,
    skuId: null,
    isLeaf: null,
    tenantId: null,
  },
  rules: {
    isLeaf: [
      { required: true, message: "节点类型不能为空", trigger: "blur" }
    ],
    locationCode: [
      {
        validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error('库位编码不能为空'));
            return;
          }

          // 校验格式是否为 xx-xx-xx-xx-xx，且 xx 为数字或字母
          if (!/^([A-Za-z0-9]{2}-){0,4}[A-Za-z0-9]{2}$/.test(value)) {
            callback(new Error('库位编码格式必须为 xx-xx-xx，且xx为 2 位数字或字母'));
            return;
          }

          // 校验层级数是否超过 5 级
          const levelCount = (value.match(/-/g) || []).length + 1;
          if (levelCount > 5) {
            callback(new Error('最多可以添加5级科目'));
            return;
          }

          // 校验通过
          callback();
        },
        trigger: 'blur',
      },
      {
        required: true, message: "科目编码不能为空", trigger: "blur"
      }
    ],
    warehouseId: [
      { required: true, message: "所属仓库不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询库位管理列表 */
function getList() {
  loading.value = true;
  // 请求参数增加租户ID
  queryParams.value.tenantId = userStore.tenantId;
  listWarehouseLocation(queryParams.value).then(response => {
    warehouseLocationList.value = proxy.handleTree(response.data, "locationId", "parentId");
    loading.value = false;
  });
}

/** 查询库位管理下拉树结构 */
function getTreeSelect() {
  listWarehouseLocation(queryParams.value).then(response => {
    warehouseLocationOptions.value = [];
    const data = { locationId: 0, locationCode: '顶级节点', children: [] };
    data.children = proxy.handleTree(response.data, "locationId", "parentId");
    warehouseLocationOptions.value.push(data);
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
    locationId: null,
    locationCode: null,
    locationName: null,
    locationType: LocationTypeEnum.PEAKING,
    locationStatus: LocationStatusEnum.DISABLE,
    locationLength: null,
    locationWidth: null,
    locationHeight: null,
    volume: null,
    maxWeight: null,
    warehouseId: queryParams.value.warehouseId,
    skuId: null,
    batchNo: null,
    maxQuantity: null,
    quantity: null,
    quantityLock: null,
    quantityFree: null,
    quantityAlarm: null,
    expireDate: null,
    expireAlarm: null, 
    parentId: null,
    parentCode: null,
    locationLevel: null,
    orderNum: 0,
    orderWeight: 0,
    ancestors: null,
    isLeaf: IsLeafEnum.NO,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    remark: null,
  };
  proxy.resetForm("warehouseLocationRef");
  activeTab.value = "basic";
}

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  getTreeSelect();
  if (row != null && row.locationId) {
    form.value.parentId = row.locationId;
    form.value.warehouseId = row.warehouseId;
  } else {
    form.value.parentId = 0;
  }
  open.value = true;
  title.value = "添加库位管理";
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  await getTreeSelect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  getWarehouseLocation(row.locationId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改库位管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["warehouseLocationRef"].validate(valid => {
    if (valid) {
      // 非末级节点 
      if (form.value.isLeaf == IsLeafEnum.NO) {
        // 库位类型为null
        form.value.locationType = null;
        // 库位状态为null
        form.value.locationStatus = null;
      }
      
      if (form.value.locationId != null) {
        updateWarehouseLocation(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addWarehouseLocation(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除库位管理编号为"' + row.locationId + '"的数据项？').then(function() {
    return delWarehouseLocation(row.locationId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
</script>

<style lang="scss" scoped>
.full-height-tabs{
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
}

.app-container {
  height: 100%;
  /* 确保父容器高度充满 */
  display: flex;
  flex-direction: column;
}

.table-container {
  flex-grow: 1;
  /* 表格区域充满剩余空间 */
  display: flex;
  flex-direction: column;
}

.el-table {
  flex-grow: 1;
  /* 表格充满剩余空间 */
}

.pagination {
  flex-shrink: 0;
  /* 分页栏固定在底部 */
  margin-top: auto;
  /* 将分页栏推到容器底部 */
}
</style>
