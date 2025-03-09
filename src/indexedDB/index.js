import { dbConfig } from './dbConfig';

class IndexedDBUtil {
  /**
   * 1. 打开或创建数据库
   * @param {string} dbName 数据库名称
   * @returns {Promise<IDBDatabase>}
   */
  static openDB(dbName) {
    const dbObject = dbConfig.find((db) => db.dbName == dbName);
    if (!dbObject) {
      return Promise.reject(new Error(`数据库配置未找到: ${dbName}`));
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbObject.dbName, dbObject.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log(`初始化数据库 '${dbObject.dbName}' 需要升级, 旧版本: ${event.oldVersion}, 新版本: ${event.newVersion}`);

        dbObject.storeNameList.forEach(({ storeName, options, indexList }) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, options);
            if (indexList) {
              indexList.forEach(({ name, keyPath, options }) => {
                store.createIndex(name, keyPath, options);
              });
            }
          }
        });
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          console.log('数据库连接已关闭，等待升级');
        };
        console.log('数据库打开成功:', dbObject.dbName);
        resolve(db);
      };

      request.onerror = () => reject(new Error(`数据库打开失败: ${request.error?.message}`));
      request.onblocked = () => reject(new Error('数据库连接被阻止，请关闭其他窗口或刷新页面'));
    });
  }

  /**
   * 2. 使用事务管理优化
   * @param {string} dbName
   * @param {string} storeName
   * @param {'readonly'|'readwrite'} mode
   * @param {(store: IDBObjectStore) => any} callback
   * @returns {Promise<any>}
   */
  static async withTransaction(dbName, storeName, mode, callback) {
    const db = await this.openDB(dbName);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      const result = callback(store); // 允许 callback 返回结果
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(new Error(`事务失败: ${transaction.error?.message}`));
    });
  }

  /**
   * 3. 统一封装 IndexedDB 请求
   * @param {IDBRequest} request
   * @returns {Promise<any>}
   */
  static handleRequest(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result ?? null); // 兼容 undefined
      request.onerror = () => reject(new Error(`IndexedDB Error: ${request.error?.message}`));
    });
  }

  /**
   * 4. 添加或更新数据
   * @param {string} dbName
   * @param {string} storeName
   * @param {Object} data
   * @returns {Promise<void>}
   */
  static async saveData(dbName, storeName, data) {
    console.log("save存储的数据是：", data)
    return this.withTransaction(dbName, storeName, 'readwrite', (store) => store.put(data));
  }

  /**
   * 5. 获取单条数据
   * @param {string} dbName
   * @param {string} storeName
   * @param {string|number} id
   * @returns {Promise<Object|null>}
   */
  static async getData(dbName, storeName, id) {
    const db = await this.openDB(dbName);
    const transaction = db.transaction(storeName, 'readonly');
    return this.handleRequest(transaction.objectStore(storeName).get(id));
  }

  /**
   * 6. 通过索引获取单条数据
   * @param {string} dbName
   * @param {string} storeName
   * @param {string} indexName
   * @param {any} value
   * @returns {Promise<Object|null>}
   */
  static async getDataByIndex(dbName, storeName, indexName, value) {
    const db = await this.openDB(dbName);
    const transaction = db.transaction(storeName, 'readonly');
    const index = transaction.objectStore(storeName).index(indexName);
    return this.handleRequest(index.get(value));
  }

  /**
   * 7. 通过索引获取多条数据
   * @param {string} dbName
   * @param {string} storeName
   * @param {string} indexName
   * @param {any} value
   * @returns {Promise<Array>}
   */
  static async getAllDataByIndex(dbName, storeName, indexName, value) {
    const db = await this.openDB(dbName);
    const transaction = db.transaction(storeName, 'readonly');
    const index = transaction.objectStore(storeName).index(indexName);
    return this.handleRequest(index.getAll(value));
  }

  /**
   * 8. 获取所有数据
   * @param {string} dbName
   * @param {string} storeName
   * @returns {Promise<Array>}
   */
  static async getAllData(dbName, storeName) {
    const db = await this.openDB(dbName);
    const transaction = db.transaction(storeName, 'readonly');
    return this.handleRequest(transaction.objectStore(storeName).getAll());
  }

  /**
   * 9. 删除单条数据 (重命名为 removeData)
   * @param {string} dbName
   * @param {string} storeName
   * @param {string|number} id
   * @returns {Promise<void>}
   */
  static async removeData(dbName, storeName, id) {
    return this.withTransaction(dbName, storeName, 'readwrite', (store) => store.delete(id));
  }


  /**
   * 10. 清空整个存储 (deleteData 作为 clearStore 的别名)
   * @param {string} dbName
   * @param {string} storeName
   * @returns {Promise<void>}
   */
  static async clearStore(dbName, storeName) {
    return this.withTransaction(dbName, storeName, 'readwrite', (store) => store.clear());
  }

  static async deleteData(dbName, storeName) {
    return this.clearStore(dbName, storeName);
  }
}

export default IndexedDBUtil;
