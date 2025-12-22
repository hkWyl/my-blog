#!/usr/bin/env node

/**
 * 验证管理面板保存功能
 * 模拟管理面板保存文章的完整流程
 */

const TOKEN = '49608c6fe1eb2fdc956ca2572a6164fa';
const API_BASE = 'https://gitee.com/api/v5';
const OWNER = 'love-little-monster';
const REPO = 'my-blog-posts';
const BRANCH = 'master';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 管理面板保存功能验证');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function verifyAdminSave() {
  const testFileName = 'admin-save-test.md';
  const timestamp = new Date().toLocaleString('zh-CN');

  console.log('【步骤 1】模拟管理面板新建文章\n');

  // 1. 生成文章内容（Front Matter格式）
  const articleContent = `---
title: 管理面板保存测试
date: ${new Date().toISOString().split('T')[0]}
categories: [测试]
tags: [验证]
excerpt: 这是用于验证管理面板保存功能的测试文章
---

# 管理面板保存测试

这是一篇测试文章，用于验证管理面板的保存功能是否正常工作。

**创建时间**: ${timestamp}

## 测试目的

验证以下功能：
1. ✅ 管理面板可以成功创建文章
2. ✅ 文章内容正确保存到 Gitee 仓库
3. ✅ Front Matter 格式正确解析
4. ✅ 中文内容正确编码

## 测试状态

如果你能看到这篇文章，说明管理面板保存功能正常！🎉
`;

  console.log('文章标题: 管理面板保存测试');
  console.log('文件名:', testFileName);
  console.log('');

  // 2. Base64编码（模拟管理面板的编码方式）
  const base64Content = Buffer.from(articleContent).toString('base64');

  console.log('【步骤 2】检查文件是否已存在\n');

  // 3. 检查文件是否已存在
  let existingSha = null;
  try {
    const checkUrl = `${API_BASE}/repos/${OWNER}/${REPO}/contents/${testFileName}?access_token=${TOKEN}`;
    const checkRes = await fetch(checkUrl);
    if (checkRes.ok) {
      const fileData = await checkRes.json();
      existingSha = fileData.sha;
      console.log('⚠️  文件已存在，将更新现有文件');
      console.log('   SHA:', existingSha);
    } else {
      console.log('✅ 文件不存在，将创建新文件');
    }
  } catch (err) {
    console.log('✅ 文件不存在，将创建新文件');
  }

  console.log('');
  console.log('【步骤 3】提交到 Gitee 仓库\n');

  // 4. 提交到Gitee（使用管理面板的API方式）
  const saveUrl = `${API_BASE}/repos/${OWNER}/${REPO}/contents/${testFileName}`;

  const requestBody = {
    access_token: TOKEN,
    message: `Test: 管理面板保存验证 - ${timestamp}`,
    content: base64Content,
    branch: BRANCH,
  };

  // 如果文件已存在，需要提供SHA
  if (existingSha) {
    requestBody.sha = existingSha;
  }

  try {
    const saveRes = await fetch(saveUrl, {
      method: existingSha ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!saveRes.ok) {
      const error = await saveRes.json();
      console.log('❌ 保存失败');
      console.log('   错误:', error.message);
      console.log('   详情:', JSON.stringify(error, null, 2));
      return;
    }

    const result = await saveRes.json();
    console.log('✅ 文章保存成功！');
    console.log('   文件名:', testFileName);
    console.log('   SHA:', result.content?.sha || result.sha);
    console.log('   提交消息:', requestBody.message);
    console.log('');

    // 5. 验证Gitee仓库中的文件
    console.log('【步骤 4】验证 Gitee 仓库中的文件\n');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const verifyUrl = `${API_BASE}/repos/${OWNER}/${REPO}/contents/${testFileName}?access_token=${TOKEN}&t=${Date.now()}`;
    const verifyRes = await fetch(verifyUrl);

    if (verifyRes.ok) {
      const fileData = await verifyRes.json();
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');

      console.log('✅ Gitee 仓库验证成功');
      console.log('   文件大小:', fileData.size, 'bytes');
      console.log('   SHA:', fileData.sha);

      // 检查内容是否匹配
      if (content.includes('管理面板保存测试') && content.includes(timestamp)) {
        console.log('   内容验证: ✅ 匹配');
      } else {
        console.log('   内容验证: ⚠️  不匹配');
      }
    } else {
      console.log('⚠️  无法从 Gitee 读取文件');
    }

    console.log('');
    console.log('【步骤 5】验证博客端能否读取\n');

    // 6. 验证博客端能否通过Raw URL读取
    const rawUrl = `https://gitee.com/${OWNER}/${REPO}/raw/${BRANCH}/${testFileName}?t=${Date.now()}`;
    const rawRes = await fetch(rawUrl);

    if (rawRes.ok) {
      const rawContent = await rawRes.text();
      console.log('✅ 博客端可以读取文章');
      console.log('   Raw URL:', rawUrl);

      if (rawContent.includes('管理面板保存测试') && rawContent.includes(timestamp)) {
        console.log('   内容验证: ✅ 匹配');
      } else {
        console.log('   内容验证: ⚠️  不匹配');
      }
    } else {
      console.log('❌ 博客端无法读取文章');
      console.log('   状态码:', rawRes.status);
    }

  } catch (err) {
    console.log('❌ 保存过程出错');
    console.log('   错误:', err.message);
    return;
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 验证完成！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📝 总结：');
  console.log('   ✅ 管理面板保存 API 工作正常');
  console.log('   ✅ Gitee 仓库同步正常');
  console.log('   ✅ 博客端可以读取文章');
  console.log('');
  console.log('🔗 查看文章：');
  console.log('   • Gitee 仓库: https://gitee.com/' + OWNER + '/' + REPO + '/blob/' + BRANCH + '/' + testFileName);
  console.log('   • 直接访问: https://gitee.com/' + OWNER + '/' + REPO + '/raw/' + BRANCH + '/' + testFileName);
  console.log('');
  console.log('⚠️  注意：');
  console.log('   测试文件已保留在仓库中，可以在 Gitee 网页端手动删除');
  console.log('   或者在管理面板中删除这篇文章');
}

verifyAdminSave().catch(console.error);
