<template>
  <canvas ref="canvasRef" class="plasma-background"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animationId = null
let particles = []
let mouseX = 0
let mouseY = 0
let time = 0

class Particle {
  constructor(x, y, canvas) {
    this.x = x
    this.y = y
    this.vx = (Math.random() - 0.5) * 0.5
    this.vy = (Math.random() - 0.5) * 0.5
    this.size = Math.random() * 3 + 1
    this.canvas = canvas
    this.maxDistance = 120
    this.attractionStrength = 0.00005
  }

  update(mouseX, mouseY) {
    // 粒子自然运动
    this.x += this.vx
    this.y += this.vy

    // 鼠标吸引力
    const dx = mouseX - this.x
    const dy = mouseY - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < this.maxDistance) {
      const force = (this.maxDistance - distance) / this.maxDistance
      this.vx += dx * this.attractionStrength * force
      this.vy += dy * this.attractionStrength * force
    }

    // 限制速度
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    if (speed > 2) {
      this.vx = (this.vx / speed) * 2
      this.vy = (this.vy / speed) * 2
    }

    // 边界反弹
    if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1
    if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1

    // 保持在边界内
    this.x = Math.max(0, Math.min(this.canvas.width, this.x))
    this.y = Math.max(0, Math.min(this.canvas.height, this.y))
  }

  draw(ctx) {
    ctx.fillStyle = `rgba(66, 185, 131, ${0.6 - this.size * 0.1})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

function initParticles(canvas) {
  particles = []
  const particleCount = Math.floor((canvas.width * canvas.height) / 15000)

  for (let i = 0; i < particleCount; i++) {
    particles.push(
      new Particle(Math.random() * canvas.width, Math.random() * canvas.height, canvas)
    )
  }
}

function drawPlasma(ctx, canvas, time) {
  // 清空画布
  ctx.fillStyle = 'rgba(10, 14, 26, 0.4)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 绘制等离子效果
  const imageData = ctx.createImageData(canvas.width, canvas.height)
  const data = imageData.data

  for (let y = 0; y < canvas.height; y += 4) {
    for (let x = 0; x < canvas.width; x += 4) {
      // 等离子算法
      const value =
        Math.sin(x * 0.01 + time) +
        Math.sin(y * 0.01 + time) +
        Math.sin((x + y) * 0.01 + time) +
        Math.sin(Math.sqrt(x * x + y * y) * 0.01 + time)

      const normalized = (value + 4) / 8
      const index = (y * canvas.width + x) * 4

      // 绿色等离子
      data[index] = normalized * 30 // R
      data[index + 1] = normalized * 185 + 50 // G
      data[index + 2] = normalized * 131 + 20 // B
      data[index + 3] = normalized * 100 // A
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // 更新和绘制粒子
  particles.forEach((particle) => {
    particle.update(mouseX, mouseY)
    particle.draw(ctx)
  })

  // 绘制粒子连线
  ctx.strokeStyle = 'rgba(66, 185, 131, 0.15)'
  ctx.lineWidth = 1

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 100) {
        const opacity = (1 - distance / 100) * 0.3
        ctx.strokeStyle = `rgba(66, 185, 131, ${opacity})`
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.stroke()
      }
    }
  }

  // 鼠标光晕效果
  if (mouseX > 0 && mouseY > 0) {
    const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 150)
    gradient.addColorStop(0, 'rgba(66, 185, 131, 0.3)')
    gradient.addColorStop(0.5, 'rgba(52, 211, 153, 0.15)')
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
}

function animate(ctx, canvas) {
  time += 0.01
  drawPlasma(ctx, canvas, time)
  animationId = requestAnimationFrame(() => animate(ctx, canvas))
}

function handleResize(canvas, ctx) {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  initParticles(canvas)
}

function handleMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
}

function handleTouchMove(e) {
  if (e.touches.length > 0) {
    mouseX = e.touches[0].clientX
    mouseY = e.touches[0].clientY
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return

  // 设置画布大小
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // 初始化粒子
  initParticles(canvas)

  // 开始动画
  animate(ctx, canvas)

  // 添加事件监听
  const resizeHandler = () => handleResize(canvas, ctx)
  window.addEventListener('resize', resizeHandler)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('touchmove', handleTouchMove)

  // 清理函数
  onUnmounted(() => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    window.removeEventListener('resize', resizeHandler)
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('touchmove', handleTouchMove)
  })
})
</script>

<style scoped>
.plasma-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -3;
  pointer-events: none;
}
</style>
