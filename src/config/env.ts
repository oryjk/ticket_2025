// 环境配置
export const config = {
  // 是否使用mock数据
  useMock: false,
  server: {
    dev: {
      baseUrl: 'http://localhost:5689/ticket'
    },
    prod: {
      baseUrl: 'http://192.168.3.109:5689/ticket'
    }
  }
}
