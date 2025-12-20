// 管理员配置文件
export default {
  // 管理员认证配置
  auth: {
    // 管理员密码（SHA-256 哈希值）
    // 默认密码：admin123
    // 修改密码：使用在线 SHA-256 工具生成新密码的哈希值
    // 工具地址：https://emn178.github.io/online-tools/sha256.html
    passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',

    // 会话过期时间（毫秒）- 默认 24 小时
    sessionTimeout: 24 * 60 * 60 * 1000,
  },

  // Gitee API 配置
  gitee: {
    // Token 会从 localStorage 读取，key 为 'gitee_access_token'
    // 请在管理面板的"系统配置"页面输入 Token
    // 获取 Token: https://gitee.com/profile/personal_access_tokens

    // 仓库信息
    owner: 'love-little-monster',
    repo: 'my-blog-posts',
    branch: 'master', // Gitee 默认分支通常是 master

    // API 基础地址
    apiBase: 'https://gitee.com/api/v5',
  },

  // 编辑器配置
  editor: {
    // 自动保存间隔（毫秒）
    autoSaveInterval: 30000, // 30 秒

    // Markdown 编辑器主题
    theme: 'dark',
  },

  // 常用标签（用于标签输入提示）
  commonTags: [
    'Vue3',
    '前端',
    'JavaScript',
    'CSS',
    'HTML',
    'Node.js',
    'TypeScript',
    'React',
    'Git',
    '算法',
    '数据结构',
    '设计模式',
    '性能优化',
    '工具推荐',
    '学习笔记',
  ],

  // 常用分类（用于分类选择）
  commonCategories: [
    '前端开发',
    '后端开发',
    '全栈开发',
    '移动开发',
    '算法与数据结构',
    '系统设计',
    '工具与效率',
    '技术分享',
    '学习笔记',
    '项目实战',
    '面试经验',
  ],
}
