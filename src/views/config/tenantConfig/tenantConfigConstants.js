import { Switch } from "@element-plus/icons-vue";

/** 配置展示的类型
 * 1-开关 2-输入框
 */
export const ShowTypeDict = [
  { key: 'SWITCH', value: 1, label: '开关' },
  { key: 'INPUT', value: 2, label: '输入框' },
];

/**
 * 状态配置
 * 1-启用 2-禁用
 */
export const StatusEnum = {
  ENABLE: 0,
  DISABLE: 1
}

/**
 * 配置类型
 * 1-开关 2-输入框
 */
export const ShowTypeEnum = {
  SWITCH: 1,
  INPUT: 2
}