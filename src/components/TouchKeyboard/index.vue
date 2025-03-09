<template>
  <div class="keyboard-container">
    <div class="keyboard">
      <button
        v-for="num in numbers"
        :key="num"
        class="key"
        @mousedown.stop.prevent="press(num)"
        @touchstart.stop.prevent="press(num)"
      >
        {{ num }}
      </button>
      <button class="key action" @mousedown.stop.prevent="press('.')">.</button>
      <button class="key action" @mousedown.stop.prevent="backspace">←</button>
      <button class="key action" @mousedown.stop.prevent="clear">清除</button>
      <button class="key enter" @mousedown.stop.prevent="confirm">Enter</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {playKeySound} from "@/utils/playKeySound.js"

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

// 存储当前聚焦的输入框元素
const activeInput = ref(null);
const skuSelectRef = ref(null); // SkuSelect 组件的引用

// 用于设置当前聚焦的输入框。当输入框获得焦点时，调用此方法将
const setActiveInput = (inputEl) => {
  activeInput.value = inputEl;
};

// 设置 SkuSelect 组件的引用
const setSkuSelectRef = (ref) => {
  skuSelectRef.value = ref;
};

// **更新值并触发 Vue 响应**
const updateInputValue = (newValue) => {
  if (activeInput.value) {
    activeInput.value.value = newValue;
    dispatchInputEvent(activeInput.value);
  }
};

// **触发 Vue 的 `input` 事件**
const dispatchInputEvent = (inputEl) => {
  const event = new Event("input", { bubbles: true });
  inputEl.dispatchEvent(event);
};

// **处理数字输入**
const press = (key) => {
  if (activeInput.value) {
    const inputEl = activeInput.value;
    const start = inputEl.selectionStart; // 选中内容的起始位置
    const end = inputEl.selectionEnd; // 选中内容的结束位置
    const currentValue = inputEl.value;

    // 如果有选中内容，则替换选中的内容
    if (start !== end) {
      const newValue = currentValue.slice(0, start) + key + currentValue.slice(end);
      updateInputValue(newValue);

      // 移动光标到新输入内容的后面
      nextTick(() => {
        inputEl.setSelectionRange(start + 1, start + 1);
      });
    } else {
      // 如果没有选中内容，则追加输入内容
      updateInputValue(currentValue + key);
    }

    playKeySound();
  }
};

// **退格删除**
const backspace = () => {
  if (activeInput.value) {
    const inputEl = activeInput.value;
    const start = inputEl.selectionStart; // 选中内容的起始位置
    const end = inputEl.selectionEnd; // 选中内容的结束位置
    const currentValue = inputEl.value;

    // 如果有选中内容，则删除选中的全部内容
    if (start !== end) {
      const newValue = currentValue.slice(0, start) + currentValue.slice(end);
      updateInputValue(newValue);

      // 移动光标到删除后的位置
      nextTick(() => {
        inputEl.setSelectionRange(start, start);
      });
    } else {
      // 如果没有选中内容，则删除一个字符
      if (start > 0) {
        const newValue = currentValue.slice(0, start - 1) + currentValue.slice(start);
        updateInputValue(newValue);

        // 移动光标到删除后的位置
        nextTick(() => {
          inputEl.setSelectionRange(start - 1, start - 1);
        });
      }
    }

    playKeySound();
  }
};

// **清除输入**
const clear = () => {
  if (activeInput.value) {
    updateInputValue("");
    playKeySound();

  }
};

// **回车提交并重置输入框**
const confirm = () => {
  // 当前聚焦的元素 = activeInput.value
  if (activeInput.value) {
    const inputEl = activeInput.value;
    // 如果当前聚焦的输入框是 SkuSelect 组件的输入框
    if (inputEl.tagName === 'INPUT' && inputEl.parentElement.classList.contains('el-select__selected-item')) {
      skuSelectRef.value?.handleEnterKey(); // 调用 SkuSelect 组件的 handleEnterKey 方法
    }else {
      activeInput.value.blur(); // **让输入框失焦**
      activeInput.value = null; // **清空 activeInput，确保下次点击输入框时能重新激活**
      playKeySound();
    }
    
  }
};

defineExpose({ setActiveInput, setSkuSelectRef });
</script>

<style scoped>
.keyboard-container {
  /* position: fixed; */
  /* right: 0px;
  bottom: 2px; */
  /* padding: 10px; */
  background: rgba(0, 64, 128, 0.3);
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* 容器阴影 */
}

.keyboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.key {
  width: 80px;
  height: 50px;
  font-size: 24px;
  color: white;
  background: linear-gradient(145deg, #007aff, #005bb5); /* 渐变背景 */
  border: none;
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* 按钮阴影 */
  transition: all 0.2s ease; /* 平滑过渡 */
}

.key:hover {
  background: linear-gradient(145deg, #005bb5, #007aff); /* 悬浮时反转渐变 */
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3); /* 悬浮时阴影加深 */
  transform: translateY(-2px); /* 悬浮时轻微上移 */
}

.key:active {
  background: linear-gradient(145deg, #004080, #007aff); /* 点击时颜色加深 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 点击时阴影减小 */
  transform: translateY(0); /* 点击时恢复原位 */
}

.action {
  background: linear-gradient(145deg, #ff6f61, #ff3b2f); /* 操作按钮渐变 */
}

.action:hover {
  background: linear-gradient(145deg, #ff3b2f, #ff6f61); /* 悬浮时反转渐变 */
}

.action:active {
  background: linear-gradient(145deg, #ff1a1a, #ff6f61); /* 点击时颜色加深 */
}

.enter {
  grid-column: 3;
  background: linear-gradient(145deg, #0aebc9, #00b894); /* Enter 按钮渐变 */
}

.enter:hover {
  background: linear-gradient(145deg, #00b894, #0aebc9); /* 悬浮时反转渐变 */
}

.enter:active {
  background: linear-gradient(145deg, #00997a, #0aebc9); /* 点击时颜色加深 */
}
</style>
