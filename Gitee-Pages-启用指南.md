# Gitee Pages 启用指南

## 方法1：通过Gitee官网启用（推荐）

### 步骤1：访问仓库设置
1. 访问：https://gitee.com/love-little-monster/my-blog
2. 确保你已登录

### 步骤2：查找Gitee Pages
Gitee Pages的位置可能在以下几个地方：

**位置A - 服务菜单**
1. 在仓库页面顶部，找到 **"服务"** 菜单（可能显示为"Services"）
2. 点击后展开下拉菜单
3. 找到 **"Gitee Pages"** 选项

**位置B - 管理菜单**
1. 在仓库页面右侧，找到 **"管理"** 按钮（齿轮图标）
2. 在左侧菜单中找到 **"Gitee Pages"**

**位置C - 直接访问**
直接访问这个URL：
```
https://gitee.com/love-little-monster/my-blog/pages
```

### 步骤3：启用Gitee Pages
1. 选择部署分支：**gh-pages**
2. 选择部署目录：**/ (根目录)**
3. 点击 **"启动"** 或 **"部署"** 按钮

### 步骤4：等待部署
- 首次部署需要等待1-5分钟
- 部署成功后会显示访问地址

---

## 方法2：使用Gitee的Raw功能（临时方案）

如果Gitee Pages不可用，可以临时使用这个方法：

### 查看已部署的内容
访问：https://gitee.com/love-little-monster/my-blog/tree/gh-pages

这个页面会显示gh-pages分支的内容。

---

## 方法3：检查账户状态

### 可能需要的操作：
1. **实名认证**：Gitee Pages可能需要实名认证
   - 访问：https://gitee.com/profile/account_information
   - 完成实名认证

2. **仓库类型**：确保仓库是公开的
   - 访问：https://gitee.com/love-little-monster/my-blog/settings
   - 在"仓库设置"中查看仓库是否为公开状态

---

## 方法4：使用GitHub Pages（替代方案）

如果Gitee Pages确实无法使用，我们可以改用GitHub Pages：

### 步骤1：推送到GitHub
```bash
cd /home/wyl/blog/gitee-blog
git push github master:main
```

### 步骤2：部署到GitHub Pages
```bash
cd dist
git push -f https://github.com/hkWyl/my-blog.git master:gh-pages
```

### 步骤3：启用GitHub Pages
1. 访问：https://github.com/hkWyl/my-blog
2. 点击 **Settings**
3. 左侧菜单找到 **Pages**
4. Source选择 **gh-pages** 分支
5. 点击 **Save**

访问地址将会是：`https://hkwyl.github.io/my-blog/`

---

## 故障排查

### 如果看到404错误：

**检查1：分支内容**
访问：https://gitee.com/love-little-monster/my-blog/tree/gh-pages
确认index.html文件存在

**检查2：仓库状态**
确认仓库是公开的，不是私有仓库

**检查3：URL是否正确**
确保访问的是正确的URL格式

---

## 需要我帮你做什么？

请告诉我：
1. 你能否访问这个链接：https://gitee.com/love-little-monster/my-blog/pages
2. 你的Gitee账号是否已实名认证？
3. 你更倾向于使用Gitee还是GitHub？

我会根据你的情况提供最合适的解决方案。
