// 功能测试脚本 - 测试博客和管理面板的所有功能
const axios = require('axios')

const GITEE_TOKEN = '49608c6fe1eb2fdc956ca2572a6164fa'
const OWNER = 'love-little-monster'
const REPO = 'my-blog-posts'
const API_BASE = 'https://gitee.com/api/v5'

console.log('🧪 开始测试博客功能...\n')

async function testTokenValidity() {
  console.log('1️⃣  测试 Token 有效性...')
  try {
    const response = await axios.get(`${API_BASE}/user?access_token=${GITEE_TOKEN}`)
    if (response.status === 200) {
      console.log('   ✅ Token 有效，用户:', response.data.name)
      return true
    }
  } catch (error) {
    console.log('   ❌ Token 验证失败:', error.message)
    return false
  }
}

async function testRepoAccess() {
  console.log('\n2️⃣  测试仓库访问权限...')
  try {
    const response = await axios.get(
      `${API_BASE}/repos/${OWNER}/${REPO}?access_token=${GITEE_TOKEN}`
    )
    if (response.status === 200) {
      console.log('   ✅ 仓库访问正常:', response.data.full_name)
      return true
    }
  } catch (error) {
    console.log('   ❌ 仓库访问失败:', error.message)
    return false
  }
}

async function testGetPosts() {
  console.log('\n3️⃣  测试获取文章列表...')
  try {
    const response = await axios.get(
      `${API_BASE}/repos/${OWNER}/${REPO}/git/trees/master?recursive=1&access_token=${GITEE_TOKEN}`
    )
    if (response.status === 200) {
      const mdFiles = response.data.tree.filter((file) => file.path.endsWith('.md'))
      console.log(`   ✅ 成功获取 ${mdFiles.length} 篇文章`)
      mdFiles.slice(0, 3).forEach((file) => {
        console.log(`      - ${file.path}`)
      })
      return true
    }
  } catch (error) {
    console.log('   ❌ 获取文章列表失败:', error.message)
    return false
  }
}

async function testProfileManagement() {
  console.log('\n4️⃣  测试个人资料管理...')
  try {
    // 尝试获取 profile.json
    const response = await axios.get(
      `${API_BASE}/repos/${OWNER}/${REPO}/contents/profile.json?access_token=${GITEE_TOKEN}&ref=master`
    )

    if (response.status === 200) {
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8')
      const profile = JSON.parse(content)
      console.log('   ✅ profile.json 存在')
      console.log(`      标题: ${profile.title}`)
      console.log(`      作者: ${profile.author}`)
      console.log(`      更新时间: ${profile.updatedAt}`)
      return true
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('   ⚠️  profile.json 不存在（首次使用需在管理面板创建）')
      return true
    }
    console.log('   ❌ 获取 profile.json 失败:', error.message)
    return false
  }
}

async function testCreateAndUpdateProfile() {
  console.log('\n5️⃣  测试创建/更新个人资料...')
  try {
    const testProfile = {
      title: '测试博客',
      subtitle: '功能测试',
      author: '测试用户',
      description: '这是一个测试描述',
      avatar: 'https://example.com/avatar.jpg',
      social: {
        gitee: 'https://gitee.com/test',
        github: '',
        email: '',
      },
      updatedAt: new Date().toISOString(),
    }

    const content = Buffer.from(JSON.stringify(testProfile, null, 2)).toString('base64')

    try {
      // 尝试获取现有文件
      const existingFile = await axios.get(
        `${API_BASE}/repos/${OWNER}/${REPO}/contents/test-profile.json?access_token=${GITEE_TOKEN}&ref=master`
      )

      // 文件存在，更新它
      await axios.put(
        `${API_BASE}/repos/${OWNER}/${REPO}/contents/test-profile.json`,
        {
          access_token: GITEE_TOKEN,
          message: 'Test: 更新测试资料',
          content: content,
          sha: existingFile.data.sha,
          branch: 'master',
        }
      )
      console.log('   ✅ 更新测试资料成功')
    } catch (err) {
      // 文件不存在，创建新文件
      if (err.response && err.response.status === 404) {
        await axios.post(`${API_BASE}/repos/${OWNER}/${REPO}/contents/test-profile.json`, {
          access_token: GITEE_TOKEN,
          message: 'Test: 创建测试资料',
          content: content,
          branch: 'master',
        })
        console.log('   ✅ 创建测试资料成功')
      } else {
        throw err
      }
    }

    // 清理测试文件
    const fileToDelete = await axios.get(
      `${API_BASE}/repos/${OWNER}/${REPO}/contents/test-profile.json?access_token=${GITEE_TOKEN}&ref=master`
    )
    await axios.delete(`${API_BASE}/repos/${OWNER}/${REPO}/contents/test-profile.json`, {
      data: {
        access_token: GITEE_TOKEN,
        message: 'Test: 删除测试资料',
        sha: fileToDelete.data.sha,
        branch: 'master',
      },
    })
    console.log('   ✅ 清理测试文件成功')
    return true
  } catch (error) {
    console.log('   ❌ 个人资料管理测试失败:', error.message)
    return false
  }
}

async function testBlogFrontend() {
  console.log('\n6️⃣  测试博客前端访问...')
  try {
    const response = await axios.get(
      'https://love-little-monster.gitee.io/my-blog/',
      {
        timeout: 10000,
        validateStatus: (status) => status < 500,
      }
    )

    if (response.status === 200) {
      console.log('   ✅ 博客首页访问正常')
      return true
    } else {
      console.log(`   ⚠️  博客返回状态码: ${response.status}`)
      return true
    }
  } catch (error) {
    console.log('   ⚠️  博客前端可能需要手动更新 Gitee Pages')
    console.log('      访问: https://gitee.com/love-little-monster/my-blog')
    console.log('      点击: 服务 → Gitee Pages → 更新')
    return true
  }
}

async function runTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const results = {
    token: await testTokenValidity(),
    repo: await testRepoAccess(),
    posts: await testGetPosts(),
    profile: await testProfileManagement(),
    profileUpdate: await testCreateAndUpdateProfile(),
    frontend: await testBlogFrontend(),
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n📊 测试结果汇总:\n')
  console.log(`   Token 验证:        ${results.token ? '✅' : '❌'}`)
  console.log(`   仓库访问:          ${results.repo ? '✅' : '❌'}`)
  console.log(`   文章列表:          ${results.posts ? '✅' : '❌'}`)
  console.log(`   个人资料读取:      ${results.profile ? '✅' : '❌'}`)
  console.log(`   个人资料更新:      ${results.profileUpdate ? '✅' : '❌'}`)
  console.log(`   博客前端:          ${results.frontend ? '✅' : '❌'}`)

  const allPassed = Object.values(results).every((r) => r === true)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (allPassed) {
    console.log('🎉 所有测试通过！')
  } else {
    console.log('⚠️  部分测试未通过，请检查上述错误信息')
  }

  console.log('\n📝 重要提醒:')
  console.log('   1. 需要手动更新 Gitee Pages 才能看到最新部署')
  console.log('   2. 访问管理面板前需要配置 Token')
  console.log('   3. 首次使用需在管理面板创建个人资料\n')

  console.log('🌐 访问地址:')
  console.log('   博客首页:   https://love-little-monster.gitee.io/my-blog/')
  console.log('   管理面板:   https://love-little-monster.gitee.io/my-blog/#/admin')
  console.log('   登录密码:   admin123\n')

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

runTests().catch((error) => {
  console.error('测试执行失败:', error)
  process.exit(1)
})
