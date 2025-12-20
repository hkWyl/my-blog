// 博客配置文件
export default {
  // 博客基本信息
  title: 'bug毁灭者',
  subtitle: '记录技术成长的点点滴滴',
  author: '小小怪',
  description: '一个专注于技术分享的个人博客',
  avatar: 'https://img.xintp.com/c2023/08/25/jld0yeg3kcw.jpg',

  // GitHub 配置（文章存储在 GitHub）
  github: {
    owner: 'hkWyl', // GitHub 用户名
    repo: 'my-blog', // 存储文章的仓库名
    branch: 'posts', // 文章分支
  },

  // GitHub API 地址
  api: {
    base: 'https://api.github.com',
  },

  // 导航菜单
  nav: [
    { name: '首页', path: '/' },
    { name: '分类', path: '/categories' },
    { name: '标签', path: '/tags' },
    { name: '归档', path: '/archive' },
    { name: '关于', path: '/about' },
  ],

  // 每页显示文章数
  pageSize: 10,

  // 社交链接（可选）
  social: {
    github: 'https://github.com/hkWyl',
    // email: '',
  },

  // Gitalk 评论配置（需要创建 Gitee 第三方应用）
  gitalk: {
    clientID: '', // 稍后配置
    clientSecret: '', // 稍后配置
    repo: 'my-blog', // 存储评论的仓库
    owner: 'love-little-monster',
    admin: ['love-little-monster'],
    distractionFreeMode: false,
  },
}
