# Gitee Pages 开启指南

## ⚠️ 前提条件

Gitee Pages 服务需要满足以下条件：

1. **Gitee 账号已实名认证**
   - 访问：https://gitee.com/profile/account_information
   - 如果没有实名认证，需要先完成实名认证才能使用 Pages 服务

2. **仓库必须是公开的**
   - my-blog 仓库需要设置为公开（Public）

## 📝 开启步骤

### 方法1：通过仓库设置开启

1. 访问你的仓库：https://gitee.com/love-little-monster/my-blog

2. 点击仓库页面顶部的 **"服务"** 标签（在代码、Issues 等标签旁边）

3. 在服务列表中找到 **"Gitee Pages"**
   - 如果看不到这个选项，可能是因为：
     - 账号未实名认证
     - 仓库不是公开的
     - 需要刷新页面

4. 点击 **"Gitee Pages"**

5. 选择部署分支：
   - 分支：选择 `gh-pages`
   - 目录：选择 `/`（根目录）

6. 点击 **"启动"** 或 **"开启"** 按钮

7. 等待部署完成（通常 1-2 分钟）

8. 部署成功后，会显示访问地址：
   - https://love-little-monster.gitee.io/my-blog/

### 方法2：如果找不到"服务"标签

1. 访问：https://gitee.com/love-little-monster/my-blog/pages

2. 如果页面提示需要开启，点击 **"开启 Gitee Pages"**

3. 按照提示选择分支和目录

## 🔍 常见问题

### Q1: 找不到"服务"标签或"Gitee Pages"选项

**可能原因**：
- 账号未实名认证
- 仓库是私有的（需要改为公开）

**解决方法**：
1. 实名认证：https://gitee.com/profile/account_information
2. 修改仓库可见性：
   - 进入仓库 → 设置 → 基本信息
   - 将"仓库公开性"改为"公开"

### Q2: Pages 服务启动失败

**可能原因**：
- gh-pages 分支不存在或为空
- 分支中没有 index.html 文件

**解决方法**：
- 确认 gh-pages 分支存在并包含构建后的文件
- 我已经推送了正确的代码，应该没问题

### Q3: 更新后页面没变化

**解决方法**：
1. 重新点击 **"更新"** 按钮
2. 清除浏览器缓存（Ctrl + Shift + R）
3. 等待 1-2 分钟让 Gitee Pages 同步

## 🚀 如果 Gitee Pages 不可用

如果你的账号无法使用 Gitee Pages（未实名认证或其他原因），可以使用以下替代方案：

### 替代方案1：本地测试（推荐）
```bash
npm run dev
# 访问: http://localhost:5173/my-blog/
```

### 替代方案2：使用其他托管服务
- **Vercel**：https://vercel.com （免费，速度快）
- **Netlify**：https://www.netlify.com （免费）
- **GitHub Pages**：如果你有 GitHub 账号

### 替代方案3：自己的服务器
如果有自己的服务器，可以：
1. 构建项目：`npm run build`
2. 将 dist 文件夹内容上传到服务器
3. 配置 Nginx 或 Apache

## 📋 验证清单

- [ ] Gitee 账号已实名认证
- [ ] my-blog 仓库是公开的
- [ ] gh-pages 分支已推送到 Gitee
- [ ] Gitee Pages 服务已开启
- [ ] 选择了 gh-pages 分支
- [ ] 等待部署完成
- [ ] 访问地址可以正常打开

## 🔗 相关链接

- Gitee 账号信息：https://gitee.com/profile/account_information
- my-blog 仓库：https://gitee.com/love-little-monster/my-blog
- Gitee Pages 文档：https://gitee.com/help/articles/4136

---

如果按照以上步骤还是无法开启 Gitee Pages，建议先使用本地测试，或者考虑使用 Vercel/Netlify 等其他托管服务。
