<template>
  <canvas ref="canvasRef" class="simple-background"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animationId = null
let particles = []
let mouseX = -1000
let mouseY = -1000

class Particle {
  constructor(canvas) {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.size = Math.random() * 2 + 1
    this.speedX = (Math.random() - 0.5) * 0.3
    this.speedY = (Math.random() - 0.5) * 0.3
    this.opacity = Math.random() * 0.5 + 0.3
    this.hue = Math.random() * 40 + 140 // 绿色调
    this.canvas = canvas
  }

  update() {
    // 简单的漂浮运动
    this.x += this.speedX
    this.y += this.speedY

    // 边界循环
    if (this.x < 0) this.x = this.canvas.width
    if (this.x > this.canvas.width) this.x = 0
    if (this.y < 0) this.y = this.canvas.height
    if (this.y > this.canvas.height) this.y = 0

    // 轻微的鼠标排斥（而不是吸引，避免头晕）
    if (mouseX > 0 && mouseY > 0) {
      const dx = this.x - mouseX
      const dy = this.y - mouseY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 150) {
        const force = (150 - distance) / 150
        this.x += (dx / distance) * force * 2
        this.y += (dy / distance) * force * 2
      }
    }
  }

  draw(ctx) {
    ctx.fillStyle = `hsla(${this.hue}, 60%, 60%, ${this.opacity})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

function initParticles(canvas) {
  particles = []
  const particleCount = Math.floor((canvas.width * canvas.height) / 8000)

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(canvas))
  }
}

function drawBackground(ctx, canvas) {
  // 半透明清空，产生拖尾效果
  ctx.fillStyle = 'rgba(10, 14, 26, 0.05)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 更新和绘制粒子
  particles.forEach((particle) => {
    particle.update()
    particle.draw(ctx)
  })

  // 绘制粒子之间的连线（静态，不移动）
  ctx.strokeStyle = 'rgba(66, 185, 131, 0.1)'
  ctx.lineWidth = 1

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 120) {
        const opacity = (1 - distance / 120) * 0.15
        ctx.strokeStyle = `rgba(66, 185, 131, ${opacity})`
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.stroke()
      }
    }
  }

  // 鼠标附近的静态光晕（不跟随移动）
  if (mouseX > 0 && mouseY > 0) {
    const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 80)
    gradient.addColorStop(0, 'rgba(66, 185, 131, 0.15)')
    gradient.addColorStop(1, 'rgba(66, 185, 131, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(mouseX, mouseY, 80, 0, Math.PI * 2)
    ctx.fill()
  }
}

function animate(ctx, canvas) {
  drawBackground(ctx, canvas)
  animationId = requestAnimationFrame(() => animate(ctx, canvas))
}

function handleResize(canvas) {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  initParticles(canvas)
}

function handleMouseMove(e) {
  mouseX = e.clientX
  mouseY = e.clientY
}

function handleMouseLeave() {
  mouseX = -1000
  mouseY = -1000
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

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  initParticles(canvas)
  animate(ctx, canvas)

  const resizeHandler = () => handleResize(canvas)
  window.addEventListener('resize', resizeHandler)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseleave', handleMouseLeave)
  window.addEventListener('touchmove', handleTouchMove)

  onUnmounted(() => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    window.removeEventListener('resize', resizeHandler)
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseleave', handleMouseLeave)
    window.removeEventListener('touchmove', handleTouchMove)
  })
})
</script>

<style scoped>
.simple-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -3;
  pointer-events: none;
}
</style>
