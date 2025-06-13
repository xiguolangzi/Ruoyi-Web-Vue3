<template>
  <el-select-v2
    :model-value="modelValue"
    filterable
    remote
    :remote-method="onSearch"
    clearable
    :options="dataList"
    :loading="loading"
    :disabled="disabled"
    :multiple="multiple"
    :placeholder="placeholder"
    style="width: 180px"
    :teleported='false'
    :fit-input-width="false"
    @change="handleChange"
    :reserve-keyword="false"
  />
</template>

<script setup>
import { ref, watch } from "vue";
import { listCustomer } from "@/api/order/customer";
import { debounce } from "lodash-es";
import { StatusEnum, DebounceTime, KeywordLength } from './CommonEnum.js'
import { MaxLengthEnum } from '@/api/constants/commonConstants.js'

// 父组件接受参数
const props = defineProps({
  modelValue: [String, Number, Array],
  placeholder: { type: String, default: "手机号/邮箱/税号" },
  multiple: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});

// 父组件绑定的事件 
const emit = defineEmits(['update:modelValue', 'selectedData']);

const dataList = ref([]);
const loading = ref(false);
const keyword = ref("");
const pageNum = ref(1);
const pageSize = MaxLengthEnum.maxQuerySize;
const total = ref(0);

/** 搜索函数 */
const fetchData = async (query = "") => {
  // query去除前后空格
  query = query.trim();
  console.log("搜索关键词:", query);
  // 打印开始请求的事件 毫秒级别
  console.log("开始请求时间:", new Date().getTime());
  // 输入长度小于指定长度时，清空列表
  if (query.length < KeywordLength || !query) {
    dataList.value = [];
    return;
  }
  
  // 显示加载中
  loading.value = true;

  try {
    const queryParams = {
      invoicePhone: null,
      contactEmail: null,
      invoiceNif: null,
      pageNum: pageNum.value,
      pageSize
    };

    // 判断query是不是邮箱
    if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(query)) {
      // 邮箱
      queryParams.contactEmail = query;
    } else if (/^\d{6,11}$/.test(query)) {
      // 手机号
      queryParams.invoicePhone = query;
    } else {
      // 其他情况
      queryParams.invoiceNif = query;
    }

    console.log("请求参数:", queryParams);

    // 调用后端接口获取客户列表
    const response = await listCustomer(queryParams);
    dataList.value = response.rows.map(item => ({
      value: item.customerId,
      label: `${item.invoicePhone} - ${item.customerName}`,
      disabled: item.customerStatus != StatusEnum.ENABLE,
      data: item // 保留完整数据
    }));
    total.value = response.total || 0;
    console.log("结束请求时间:", new Date().getTime());
  } catch (error) {
    console.error("获取客户列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// **防抖搜索**
const handleSearch = debounce(fetchData, DebounceTime);

/** 1 当前输入值发生变化触发的函数 */
const onSearch = (query) => {
  keyword.value = query;
  pageNum.value = 1;
  // 防抖处理
  handleSearch(query);
};


// **确保 v-model 绑定值能正确更新**
const handleChange = (val) => {
  emit("update:modelValue", val);

  // 清空输入框时，确保选中的数据也是清空
  if (!val) {
    emit("selectedData", null); // 清空输入框时 ->  传递空数据对象
    return;
  }

  // 获取所选ID对应的完整数据对象
  const selectedData = dataList.value.find((item) => item.value === val);
  if (selectedData) {
    // 触发事件，传递所选ID对应的完整数据对象
    emit("selectedData", selectedData.data);
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) fetchData();
  },
  { immediate: true }
);
</script>
