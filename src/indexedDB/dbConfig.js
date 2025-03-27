import { version } from "nprogress";

// 配置库 ConfigDB
export const dbConfig = [
  {
    dbName: 'configDB',
    version: 1,
    storeNameList: [
      {
        storeName: 'lockScreenConfig',
        options: {
          keyPath: 'id',
          autoIncrement: true
        },
        indexList: [
          {
            name: 'lockScreenKey',
            keyPath: 'lockScreenKey',
            options: {
              unique: false
            }
          }
        ]
      },
      {
        storeName: 'fingerprint',
        options: {
          keyPath: 'id',
        }
      },
    ]
  },
  {
    dbName: 'OrderDB',
    version: 1,
    storeNameList: [
      {
        storeName: 'order',
        options: {
          keyPath: 'orderNo',
          autoIncrement: true
        },
        indexList: [
          {
            name: 'orderNo',
            keyPath: 'orderNo',
            options: {
              unique: true
            }
          },
          {
            name: 'customerId',
            keyPath: 'customerId',
            options: {
              unique: false
            }
          },
        ]
      },
      {
        storeName: 'orderDetail',
        options: {
          keyPath: 'detailId',
          autoIncrement: true
        },
        indexList: [
          {
            name: 'orderId',
            keyPath: 'orderId',
            options: {
              unique: false
            }
          },
          {
            name: 'skuId',
            keyPath: 'skuId',
            options: {
              unique: false
            }
          }
        ]
      }
    ]
  }

]