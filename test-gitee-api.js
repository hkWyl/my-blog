#!/usr/bin/env node

/**
 * Gitee API 测试脚本
 * 用于验证 Token 和 API 是否正常工作
 */

const TOKEN = process.argv[2] || '49608c6fe1eb2fdc956ca2572a6164fa';
const API_BASE = 'https://gitee.com/api/v5';
const OWNER = 'love-little-monster';
const REPO = 'my-blog-posts';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 Gitee API 测试开始');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function test() {
  console.log('【步骤 1】验证 Token 有效性');
  console.log('Token:', TOKEN.substring(0, 20) + '...');

  try {
    const userUrl = `${API_BASE}/user?access_token=${TOKEN}`;
    const userRes = await fetch(userUrl);

    if (userRes.ok) {
      const userData = await userRes.json();
      console.log('✅ Token 有效');
      console.log('   用户名:', userData.login || userData.name);
      console.log('   ID:', userData.id);
    } else {
      const error = await userRes.json();
      console.log('❌ Token 无效');
      console.log('   错误:', error.message);
      console.log('\n请检查:');
      console.log('   1. Token 是否正确');
      console.log('   2. Token 是否已过期');
      console.log('   3. Token 是否有正确的权限（projects）');
      return;
    }
  } catch (err) {
    console.log('❌ 网络错误:', err.message);
    return;
  }

  console.log('\n【步骤 2】检查仓库访问权限');
  console.log('仓库:', `${OWNER}/${REPO}`);

  try {
    const repoUrl = `${API_BASE}/repos/${OWNER}/${REPO}?access_token=${TOKEN}`;
    const repoRes = await fetch(repoUrl);

    if (repoRes.ok) {
      const repoData = await repoRes.json();
      console.log('✅ 仓库访问成功');
      console.log('   仓库名:', repoData.name);
      console.log('   权限:', repoData.permissions || '未知');
    } else {
      const error = await repoRes.json();
      console.log('❌ 仓库访问失败');
      console.log('   错误:', error.message);
      console.log('\n请检查:');
      console.log('   1. 仓库名是否正确');
      console.log('   2. Token 是否有该仓库的访问权限');
      return;
    }
  } catch (err) {
    console.log('❌ 网络错误:', err.message);
    return;
  }

  console.log('\n【步骤 3】获取文件列表');

  try {
    const treeUrl = `${API_BASE}/repos/${OWNER}/${REPO}/git/trees/master?recursive=1&access_token=${TOKEN}`;
    const treeRes = await fetch(treeUrl);

    if (treeRes.ok) {
      const treeData = await treeRes.json();
      const mdFiles = treeData.tree.filter(f => f.path.endsWith('.md'));
      console.log('✅ 文件列表获取成功');
      console.log('   总文件数:', treeData.tree.length);
      console.log('   Markdown 文件:', mdFiles.length);
      console.log('   文件列表:');
      mdFiles.forEach(f => {
        console.log('      -', f.path);
      });
    } else {
      const error = await treeRes.json();
      console.log('❌ 文件列表获取失败');
      console.log('   错误:', error.message);
      return;
    }
  } catch (err) {
    console.log('❌ 网络错误:', err.message);
    return;
  }

  console.log('\n【步骤 4】测试文件写入权限');
  console.log('尝试创建测试文件...');

  try {
    const testFileName = 'test-api-' + Date.now() + '.md';
    const testContent = `# API 测试文件\n\n这是自动生成的测试文件，用于验证 API 写入权限。\n\n创建时间: ${new Date().toLocaleString('zh-CN')}`;
    const base64Content = Buffer.from(testContent).toString('base64');

    const createUrl = `${API_BASE}/repos/${OWNER}/${REPO}/contents/${testFileName}`;
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: TOKEN,
        message: 'Test: API 写入测试',
        content: base64Content,
        branch: 'master'
      })
    });

    if (createRes.ok) {
      const result = await createRes.json();
      console.log('✅ 文件创建成功');
      console.log('   文件名:', testFileName);
      console.log('   SHA:', result.content.sha);
      console.log('   查看:', `https://gitee.com/${OWNER}/${REPO}/blob/master/${testFileName}`);

      // 删除测试文件
      console.log('\n【步骤 5】清理测试文件');
      const deleteRes = await fetch(createUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: TOKEN,
          message: 'Test: 删除测试文件',
          sha: result.content.sha,
          branch: 'master'
        })
      });

      if (deleteRes.ok) {
        console.log('✅ 测试文件已清理');
      } else {
        console.log('⚠️  测试文件清理失败，请手动删除:', testFileName);
      }
    } else {
      const error = await createRes.json();
      console.log('❌ 文件创建失败');
      console.log('   错误:', error.message);
      console.log('\n可能的原因:');
      console.log('   1. Token 没有写入权限');
      console.log('   2. Token 类型错误（需要 projects 权限）');
      return;
    }
  } catch (err) {
    console.log('❌ 网络错误:', err.message);
    return;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 所有测试通过！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n管理面板应该能正常保存文章了。');
  console.log('\n如果管理面板还是不能保存，请:');
  console.log('   1. 打开浏览器开发者工具（F12）');
  console.log('   2. 切换到 Console 标签');
  console.log('   3. 尝试保存文章');
  console.log('   4. 把控制台的错误信息发给我');
}

test().catch(console.error);
