
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
            name: 'password',
            keyPath: 'password',
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

]