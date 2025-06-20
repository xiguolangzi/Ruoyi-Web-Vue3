<template>
  <el-select-v2
    ref="selectRef"
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
import { ref, watch, onMounted, nextTick } from "vue";
import { suggest } from "@/api/product/sku.js";
import { debounce } from "lodash-es";
import { StatusEnum, DebounceTime, KeywordLength } from './CommonEnum.js'
import {playKeyErrorSound, playKeySuccessSound} from "@/utils/playKeySound.js"

// 父组件接受参数
const props = defineProps({
  modelValue: [String, Number, Array],
  placeholder: { type: String, default: "商品名称/商品编码" },
  multiple: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});

// 父组件绑定的事件 
const emit = defineEmits(['update:modelValue', 'selectedData']);

const dataList = ref([]);
const loading = ref(false);
const selectRef = ref(null);
const hasSelected = ref(false);

// 暴露 focus 方法
const focus = () => {
  if (selectRef.value) {
    selectRef.value.focus(); // 聚焦输入框
  }
};

/** 搜索函数 */
const fetchData = async (keyword = "") => {
  keyword = keyword.trim();
  console.log("搜索关键词:", keyword);
  console.log("开始请求时间:", new Date().getTime());

  // 输入长度小于指定长度时，清空列表
  if (keyword.length < KeywordLength || !keyword) {
    dataList.value = [];
    return;
  }
  // 显示加载中
  loading.value = true;

  try {
    let response;
    console.log("请求参数:", keyword);
    // 使用正则表达式检查 keyword 是否是 +数字 或 -数字（支持小数）
    const pattern = /^[+]\d+(\.\d+)?$/;
    if (pattern.test(keyword)) {
      // 提取数字部分（去掉 + 或 -），使用 parseFloat 保留小数
      const number = parseFloat(keyword.slice(1), 10);
      // 确定价格（保留符号）
      const price = keyword.startsWith('+') ? number : -number;
      // 返回临时商品对象
      keyword = "default";
      response = await suggest(keyword);
      if  (response.data) { 
        response.data.forEach(item => {
          item.skuPrice = price;
          item.skuPrice2 = price;
          item.skuPrice3 = price;
          item.skuPrice4 = price;
          item.skuPrice5 = price;
          item.skuPrice6 = price;
        });
      }
      console.log("---------临时商品response.data", response.data);
    } else {
      // 否则，使用 suggest 接口进行搜索
      response = await suggest(keyword);
    }
    console.log("返回数据:", response.data);
    if(!response.data){
      dataList.value = [];
      return;
    }

    // 格式化数据
    dataList.value = response.data.map(item => ({
      value: item.skuId,
      label: `${item.skuCode} - ${item.skuName}  ${JSON.parse(item.skuValue)  == "default" ? "" : '- ' + item.skuValue}`,
      disabled: item.skuStatus != StatusEnum.ENABLE,
      data: item // 保留完整数据
    }));

    console.log("结束请求时间:", new Date().getTime());
  } catch (error) {
    console.error("获取Sku列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// **防抖搜索**
const handleSearch = debounce(fetchData, DebounceTime);

/** 1 当前输入值发生变化触发的函数 */
const onSearch = (keyword) => {
  if (keyword.length >= KeywordLength) {
    handleSearch(keyword); // 防抖处理
  } else {
    dataList.value = []; // 清空搜索结果
  }
};

// **确保 v-model 绑定值能正确更新**
const handleChange = (val) => {
  emit("update:modelValue", val);

  // 清空输入框时，确保选中的数据也是清空
  if (!val) {
    emit("selectedData", null); 
    return;
  }

  // 获取所选ID对应的完整数据对象
  const selectedData = dataList.value.find((item) => item.value === val);
  if (selectedData) {
    // 触发事件，传递所选ID对应的完整数据对象
    emit("selectedData", selectedData.data);
    hasSelected.value = true; // 用户已经选择了数据
    playKeySuccessSound();
  }
};

// **清空输入框内容**
const clearInput = () => {
  if (selectRef.value) {
    console.log("清空输入框内容");
    const inputEl = selectRef.value.$el.querySelector('input'); // 获取输入框元素
    if (inputEl) {
      inputEl.value = ''; // 清空输入框内容
      const event = new Event('input', { bubbles: true }); // 创建输入事件
      inputEl.dispatchEvent(event); // 触发输入事件
    }
  }
};

// **在组件挂载后监听输入框的键盘事件**
onMounted(() => {
  nextTick(() => {
    if (selectRef.value) {
      const inputEl = selectRef.value.$el.querySelector('input'); // 获取输入框元素
      if (inputEl) {
        inputEl.addEventListener('keydown', handleKeyDown); // 监听键盘事件
      }
    }
  });
});

// **监听键盘事件**
const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
    handleEnterKey();
  }
};

// 处理回车键的逻辑
const handleEnterKey = async () => {
  // 获取输入框的当前值
  const inputEl = selectRef.value?.$el.querySelector('input');
  const currentValue = inputEl?.value || '';

  // 等待搜索完成
  console.log("按下回车键");

  if (currentValue.length < KeywordLength) {
    console.log('输入内容长度不足');
    return;
  }

  // 等待搜索完成
  await fetchData(currentValue);

  // 按下回车键
  if (dataList.value.length > 0) {
    // 如果用户未选择数据，但有搜索结果
    if (dataList.value.length == 1) {
      // 如果有搜索结果，默认选中第一个选项
      console.log("按下回车键只有1条数据");
      const firstOption = dataList.value[0];
      if (!firstOption.disabled) {
        handleChange(firstOption.value); // 触发 change 事件
        dataList.value = []; // 清空搜索结果
        clearInput(); // 清空输入框内容
        hasSelected.value = false; // 重置标志位
      }
    } else {
      if(hasSelected.value){
        const selectedData = dataList.value.find(
          (item) => item.value === props.modelValue
        );
        if (!selectedData || selectedData.label !== currentValue) {
          // 如果当前输入内容与已选中的内容不一致，则重置 hasSelected.value
          hasSelected.value = false;
          console.log('按下回车键多余1条数据,且没有选中数据');
          playKeyErrorSound(); // 播放错误提示音
        }
      } else {
        console.log('按下回车键多余1条数据,且没有选中数据');
        playKeyErrorSound(); // 播放错误提示音
      }
      
    }
  } else {
    // 如果用户未选择数据，且没有搜索结果
    console.log('按下回车键没有数据');
    playKeyErrorSound(); // 播放错误提示音
  }
};




watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      onSearch(newValue); // 触发搜索
    };
  },
  { immediate: true }
);

// 暴露 focus 方法给父组件,暴露 handleEnterKey 方法
defineExpose({ focus ,handleEnterKey});

</script>
