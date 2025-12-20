<template>
  <canvas ref="canvasRef" class="fluid-background"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animationId = null
let mouseX = -1000
let mouseY = -1000
let prevMouseX = -1000
let prevMouseY = -1000

// 流体模拟网格
let velocityX = []
let velocityY = []
let density = []
const gridSize = 40
let cols, rows

// 漂浮粒子
let particles = []

class Particle {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.vx = (Math.random() - 0.5) * 2
    this.vy = (Math.random() - 0.5) * 2
    this.size = Math.random() * 4 + 2
    this.life = Math.random() * 100 + 100
    this.maxLife = this.life
    this.hue = Math.random() * 60 + 140 // 绿色色调
  }

  update(velX, velY, cols, rows) {
    // 从流体网格获取速度
    const gridX = Math.floor(this.x / gridSize)
    const gridY = Math.floor(this.y / gridSize)

    if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
      const idx = gridX + gridY * cols
      this.vx += velX[idx] * 0.5
      this.vy += velY[idx] * 0.5
    }

    // 限制速度
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    if (speed > 5) {
      this.vx = (this.vx / speed) * 5
      this.vy = (this.vy / speed) * 5
    }

    this.x += this.vx
    this.y += this.vy
    this.life--

    // 添加一些随机运动
    this.vx *= 0.98
    this.vy *= 0.98
  }

  draw(ctx) {
    const alpha = (this.life / this.maxLife) * 0.8
    ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${alpha})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()

    // 添加光晕
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3)
    gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${alpha * 0.5})`)
    gradient.addColorStop(1, `hsla(${this.hue}, 70%, 60%, 0)`)
    ctx.fillStyle = gradient
    ctx.fillRect(
      this.x - this.size * 3,
      this.y - this.size * 3,
      this.size * 6,
      this.size * 6
    )
  }
}

function initFluid(canvas) {
  cols = Math.ceil(canvas.width / gridSize)
  rows = Math.ceil(canvas.height / gridSize)
  const size = cols * rows

  velocityX = new Array(size).fill(0)
  velocityY = new Array(size).fill(0)
  density = new Array(size).fill(0)
}

function addVelocity(x, y, dx, dy, canvas) {
  const gridX = Math.floor(x / gridSize)
  const gridY = Math.floor(y / gridSize)

  if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
    const idx = gridX + gridY * cols
    velocityX[idx] += dx
    velocityY[idx] += dy
    density[idx] += Math.abs(dx) + Math.abs(dy)
  }
}

function diffuse(b, x, x0, diff, dt, iterations = 4) {
  const a = dt * diff * (cols - 2) * (rows - 2)
  for (let iter = 0; iter < iterations; iter++) {
    for (let j = 1; j < rows - 1; j++) {
      for (let i = 1; i < cols - 1; i++) {
        const idx = i + j * cols
        x[idx] =
          (x0[idx] +
            a *
              (x[idx - 1] + x[idx + 1] + x[idx - cols] + x[idx + cols])) /
          (1 + 4 * a)
      }
    }
  }
}

function advect(b, d, d0, velX, velY, dt) {
  const dt0 = dt * (cols - 2)

  for (let j = 1; j < rows - 1; j++) {
    for (let i = 1; i < cols - 1; i++) {
      let x = i - dt0 * velX[i + j * cols]
      let y = j - dt0 * velY[i + j * cols]

      x = Math.max(0.5, Math.min(cols - 1.5, x))
      y = Math.max(0.5, Math.min(rows - 1.5, y))

      const i0 = Math.floor(x)
      const i1 = i0 + 1
      const j0 = Math.floor(y)
      const j1 = j0 + 1

      const s1 = x - i0
      const s0 = 1 - s1
      const t1 = y - j0
      const t0 = 1 - t1

      const idx = i + j * cols
      d[idx] =
        s0 * (t0 * d0[i0 + j0 * cols] + t1 * d0[i0 + j1 * cols]) +
        s1 * (t0 * d0[i1 + j0 * cols] + t1 * d0[i1 + j1 * cols])
    }
  }
}

function updateFluid(dt) {
  const visc = 0.0001
  const diff = 0.00001

  diffuse(1, velocityX, velocityX.slice(), visc, dt)
  diffuse(2, velocityY, velocityY.slice(), visc, dt)

  advect(1, velocityX, velocityX.slice(), velocityX, velocityY, dt)
  advect(2, velocityY, velocityY.slice(), velocityX, velocityY, dt)

  advect(0, density, density.slice(), velocityX, velocityY, dt)
  diffuse(0, density, density.slice(), diff, dt)

  // 衰减
  for (let i = 0; i < density.length; i++) {
    density[i] *= 0.99
    velocityX[i] *= 0.99
    velocityY[i] *= 0.99
  }
}

function drawFluid(ctx, canvas) {
  // 清空画布
  ctx.fillStyle = 'rgba(10, 14, 26, 0.1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 绘制流体密度
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const idx = i + j * cols
      const d = Math.min(density[idx], 1)

      if (d > 0.01) {
        const hue = 140 + d * 40
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${d * 0.4})`
        ctx.fillRect(i * gridSize, j * gridSize, gridSize, gridSize)
      }
    }
  }

  // 更新和绘制粒子
  particles = particles.filter((p) => p.life > 0)

  particles.forEach((p) => {
    p.update(velocityX, velocityY, cols, rows)
    p.draw(ctx)
  })

  // 在鼠标位置添加新粒子
  if (mouseX > 0 && mouseY > 0 && Math.random() < 0.3) {
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * 20
      particles.push(
        new Particle(
          mouseX + Math.cos(angle) * dist,
          mouseY + Math.sin(angle) * dist
        )
      )
    }
  }

  // 限制粒子数量
  if (particles.length > 500) {
    particles = particles.slice(-500)
  }

  // 绘制鼠标拖尾
  if (mouseX > 0 && mouseY > 0) {
    const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 100)
    gradient.addColorStop(0, 'rgba(66, 185, 131, 0.3)')
    gradient.addColorStop(0.5, 'rgba(52, 211, 153, 0.2)')
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(mouseX - 100, mouseY - 100, 200, 200)
  }
}

function animate(ctx, canvas) {
  updateFluid(0.1)
  drawFluid(ctx, canvas)
  animationId = requestAnimationFrame(() => animate(ctx, canvas))
}

function handleResize(canvas) {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  initFluid(canvas)
}

function handleMouseMove(e, canvas) {
  prevMouseX = mouseX
  prevMouseY = mouseY
  mouseX = e.clientX
  mouseY = e.clientY

  if (prevMouseX > 0 && prevMouseY > 0) {
    const dx = (mouseX - prevMouseX) * 5
    const dy = (mouseY - prevMouseY) * 5
    addVelocity(mouseX, mouseY, dx, dy, canvas)
  }
}

function handleTouchMove(e, canvas) {
  e.preventDefault()
  if (e.touches.length > 0) {
    prevMouseX = mouseX
    prevMouseY = mouseY
    mouseX = e.touches[0].clientX
    mouseY = e.touches[0].clientY

    if (prevMouseX > 0 && prevMouseY > 0) {
      const dx = (mouseX - prevMouseX) * 5
      const dy = (mouseY - prevMouseY) * 5
      addVelocity(mouseX, mouseY, dx, dy, canvas)
    }
  }
}

function handleMouseLeave() {
  mouseX = -1000
  mouseY = -1000
  prevMouseX = -1000
  prevMouseY = -1000
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  initFluid(canvas)

  // 添加一些初始流体
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const dx = (Math.random() - 0.5) * 10
    const dy = (Math.random() - 0.5) * 10
    addVelocity(x, y, dx, dy, canvas)
  }

  animate(ctx, canvas)

  const resizeHandler = () => handleResize(canvas)
  const mouseMoveHandler = (e) => handleMouseMove(e, canvas)
  const touchMoveHandler = (e) => handleTouchMove(e, canvas)

  window.addEventListener('resize', resizeHandler)
  window.addEventListener('mousemove', mouseMoveHandler)
  window.addEventListener('touchmove', touchMoveHandler, { passive: false })
  window.addEventListener('mouseleave', handleMouseLeave)

  onUnmounted(() => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    window.removeEventListener('resize', resizeHandler)
    window.removeEventListener('mousemove', mouseMoveHandler)
    window.removeEventListener('touchmove', touchMoveHandler)
    window.removeEventListener('mouseleave', handleMouseLeave)
  })
})
</script>

<style scoped>
.fluid-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -3;
  pointer-events: none;
}
</style>
