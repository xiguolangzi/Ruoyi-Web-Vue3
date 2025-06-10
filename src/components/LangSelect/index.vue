<template>
    <el-dropdown placement="bottom-end" @command="selectLanguage">
        <!-- 展示给客户，默认看到的 -->
        <span class="el-dropdown-link">
            <strong>{{ $t('lang.language') }}</strong>
            <svg-icon :icon-class="languageStore.language" />
            <el-icon><CaretBottom/></el-icon>
        </span>
        <!-- 语言下拉列表 -->
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item command="zh" >中文</el-dropdown-item>
                <el-dropdown-item command="es" >Español</el-dropdown-item>
                <el-dropdown-item command="en" >English</el-dropdown-item>
            </el-dropdown-menu>
        </template> 
    </el-dropdown>
</template>

<script setup name="LangSelect">
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '@/store/modules/language';
import { CaretBottom } from '@element-plus/icons-vue';
import { changeLanguage } from '../../api/login';
import { ElMessage } from 'element-plus';

const languageStore = useLanguageStore()
console.log("当前的语言状态是：",languageStore.language)
// 实时更新 i18n
const {locale} = useI18n()
const {t} = useI18n()
const javaLang = {
    zh : "zh_CN",
    es : "es_ES",
    en : "en_US"
}
const selectLanguage = (key) => {
  languageStore.setLanguage(key)
  locale.value = key
  changeLanguage(javaLang[key]).then(res => {
    //window.location.reload()
    ElMessage.success(t('lang.changeLanguageSuccess'))
  })
}

</script>

<style lang="scss" scoped>
.el-dropdown-link{
  height: 100%;
  margin-left: 10px;
  margin-right: 10px;
  padding: 0;
  display: flex;
  align-items: center;
  // color: $layout-font-color;
  // font-size: 20px;
  border: none !important;  // 隐藏组件el-dropdown 的边框
  outline: none !important;  // 隐藏组件el-dropdown 的边框
  .svg-icon{
    margin-left: 5px;
    font-size: 40px;
  }
}

</style>