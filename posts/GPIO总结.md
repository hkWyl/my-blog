---
title: GPIO 总结11
date: 2025-12-19
categories: [嵌入式开发, 单片机]
tags: [GPIO, GD32, 单片机, 嵌入式, 硬件编程, STM32]
excerpt: 详细介绍 GD32F4xx 系列单片机的 GPIO 配置模式、工作原理、MOS管原理以及实际使用方法。
---

# GPIO总结

## 概念

​		 以GD32F4xx系列单片机为例，输入输出接口，有8组（A-H）每组16个IO口（0-15），并且还包含12个PI端口

## 可配置模式

#### 四种输入模式

​		模拟输入、浮空输入、下拉输入、上拉输入

#### 四种输出模式

​		开漏输出、推挽输出、复用开漏输出、复用推挽输出

定义：

|          值           |     含义     |           官方解释           |
| :-------------------: | :----------: | :--------------------------: |
|     GPIO_MODE_AIN     |   模拟输入   |      analog input mode       |
| GPIO_MODE_IN_FLOATING |   浮空输入   |     floating input mode      |
|     GPIO_MODE_IPD     |   下拉输入   |     pull-down input mode     |
|     GPIO_MODE_IPU     |   上拉输入   |      pull-up input mode      |
|   GPIO_MODE_OUT_OD    |   开漏输出   | GPIO output with  open-drain |
|   GPIO_MODE_OUT_PP    |   推挽输出   | GPIO output with  push-pull  |
|   GPIO_MODE_OUT_OD    | 复用开漏输出 | AFIO output with  open-drain |
|   GPIO_MODE_OUT_PP    | 复用推挽输出 | AFIO output with  push-pull  |

### 输入模式时

​		该GPIO为输入模式时，所有GPIO都能选择上拉还是下拉。

​		用户可选择配置输出速度和驱动模式（推挽和开漏）

​					  推挽：![image-20221129153233042](https://kx-image.oss-cn-chengdu.aliyuncs.com/image-20221129153233042.png)

​		当输入高电平时，上方mos管导通，下方mos管截止，则输出高电平。输入低电平时，下方mos管导通，上方mos管截止，则输出低电平。

​		注：以上不仅限于mos管，也可以是两只三极管。

​				开漏：

![image-20221129153725621](https://kx-image.oss-cn-chengdu.aliyuncs.com/image-20221129153725621.png)

​		开漏，可理解为不输出电压，若需要输出低电压时，则输入引脚接地，控制输出高电平则处于浮空状态，既不输入高电平也不输入低电平，为高阻态，这种方式适合外设电压比单片机电压低的时候。

备用模式：当端口配置为备用模式时，每个端口都可配置16个备用功能。

### 下拉输入模式

​		当单片机处于下拉输入，输入电路中的下拉电阻使能，施密特触发器使能。当管脚接上了线时，它的作用是和浮空输入（上拉和下拉禁用，输出电平不定）一样的；但当管脚悬空时，管脚电平会被下拉至低电平，此时单片机只能接收到低电平。

### 上拉输入模式

​		当单片机处于上拉输入，输入电路中的上拉电阻使能，施密特触发器使能。现象和下拉输入是相反的，就是当管脚悬空时，管脚电平会被上拉至高电平，此时单片机只能接收到高电平。

### 输入模式内部原理图

![image-20221129183619588](https://kx-image.oss-cn-chengdu.aliyuncs.com/image-20221129183619588.png)

当电阻上面的开关打开时此时处于上拉模式，当电阻下面的开关打开时，处于下拉模式。

### 输出模式内部原理图

![image-20221129183817212](https://kx-image.oss-cn-chengdu.aliyuncs.com/image-20221129183817212.png)

当推挽输出时，两个MOS管均有效，输出高电平时下面的MOS管导通，输出低电平时上面的MOS管导通。

当开漏输出时，两个MOS管只有下面的导通，与外部上拉电阻构成开漏输出电路。

### 模拟模式内部原理图

![image-20221129192301501](https://kx-image.oss-cn-chengdu.aliyuncs.com/image-20221129192301501.png)

模拟输出，输入什么输出什么，其中的EDS保护是 "静电保护"，作用是保护元器件。

### 备用模式（复用模式：复用推挽、复用开漏）

![image-20221129202059045](https://kx-image.oss-cn-chengdu.aliyuncs.com/image-20221129202059045.png)

可作为第二功能使用。

### 不同工作模式的使用场景

1.输入模式（GPIO_MODE_IN_FLOATING）

```c
// 配置GPIOA的Pin 0为输入模式
gpio_init(GPIOA, GPIO_MODE_IN_FLOATING, GPIO_OSPEED_50MHZ, GPIO_PIN_0);
```

此模式适用于读取外部设备的信号，例如传感器的输出信号。

2.推挽输出模式（GPIO_MODE_OUT_PP）：

```c
// 配置GPIOB的Pin 5为推挽输出模式
gpio_init(GPIOB, GPIO_MODE_OUT_PP, GPIO_OSPEED_50MHZ, GPIO_PIN_5);
```

此模式适用于驱动其他外部设备，例如LED灯或继电器。

3.开漏输出模式（GPIO_MODE_OUT_OD）：

```c
// 配置GPIOC的Pin 2为开漏输出模式
gpio_init(GPIOC, GPIO_MODE_OUT_OD, GPIO_OSPEED_50MHZ, GPIO_PIN_2);
```

此模式适用于与其他设备进行电平转换或开漏输出，通常需要使用外部上拉电阻。

4.复用功能模式（GPIO_MODE_AF_PP或GPIO_MODE_AF_OD）：

```c
// 配置GPIOA的Pin 9为复用功能模式，推挽输出
gpio_init(GPIOA, GPIO_MODE_AF_PP, GPIO_OSPEED_50MHZ, GPIO_PIN_9);
```

此模式适用于连接到外部设备的引脚，如UART通信、SPI接口、PWM输出等。

## MOS管

​		MOS管又称场效应管，MOS管分为 N 沟道和 P 沟道。MOS管有三个极，分别是源极（S）、漏极（D）、栅极（G），且大类可分为 "P沟道MOS管" 和 "N沟道MOS管" 或者 "增强型" 和 "耗尽型"，我们平常使用的MOS管大部分是指 "增强型"。

<img src="https://kx-image.oss-cn-chengdu.aliyuncs.com/image-20221129165421253.png" alt="image-20221129165421253" style="zoom: 67%;" />

#### 工作原理

PMOS管：

P沟道增强型场效应晶体管：

​		P沟道硅MOS管在N型硅衬底上有两个P+区，源极和漏极，它们之间不通导，源极上加有足够的正电压(栅极接地)时，栅极下的N型硅表面呈现P型反型层，成为连接源极和漏极的沟道。

​		P沟道耗尽型场效应晶体管：N型硅衬底表面不加栅压就已存在P型反型层沟道，加上适当的偏压，可使沟道的电阻增大或减小。

P沟型工作条件：

​		漏极D接负极，源极S接正极，栅极G负电压时，导电沟道建立，P沟道MOS管开始工作。

NMOS管：

​		N沟道增强型MOS管：在一块掺杂浓度较低的P型硅衬底上，有两个高掺杂浓度的N+区，并且有金属铝引出两个电极，分别是漏极D和源极S，在漏——源极间的绝缘层上有一个铝电极（通常是多晶硅），是栅极G。在衬底上有一个电极B。

 		由MOS管构成的集成电路称为MOS集成电路，由NMOS组成的电路就是NMOS集成电路，由PMOS管组成的电路就是PMOS集成电路，由NMOS和PMOS两种管子组成的互补MOS电路，即CMOS电路。

N沟型工作条件：

​		漏极D接正极，源极S接负极，栅极G正电压时导电沟道建立，N沟道MOS管开始工作。

## 逻辑门电路

### 与门

逻辑功能：

由一只两只二极管管构成：有0为0，全1为1

逻辑标识和逻辑电路图：

![image-20221129180805741](https://kx-image.oss-cn-chengdu.aliyuncs.com/image-20221129180805741.png)

### 或门

逻辑功能：

由一只两只二极管管构成：有1为1，全0为0

逻辑标识和逻辑电路图：

![image-20221129181042455](https://kx-image.oss-cn-chengdu.aliyuncs.com/image-20221129181042455.png)

### 非门

逻辑功能：

由一只NPN管构成：入1为0，入0为1

逻辑标识和逻辑电路图：

![image-20221129181752400](https://kx-image.oss-cn-chengdu.aliyuncs.com/image-20221129181752400.png)

当输入端如果输入1时(高电平5V)，三极管会进入饱和状态，集电极和发射极压降很小（0.3V左右，接近于0V），就像是开关闭合，所以输出端Y为低电平。

当输入端输入0时(低电平0V)，三极管就会进入截止状态，输出端就会输出为1(高电平5V)。

## 使用及方法

​		端口输入：

1、使能 GPIO 端口时钟
2、初始化 GPIO 目标引脚为输入模式
3、检测输入

```c
/*************************************GPIO的配置***************************************/
rcu_periph_clock_enable(RCU_GPIOA);		//GPIOA时钟使能
gpio_mode_set(GPIOA, GPIO_MODE_OUTPUT, GPIO_PUPD_NONE, GPIO_PIN_4);		//设置GPIO的模式
gpio_output_options_set(GPIOA, GPIO_OTYPE_PP, GPIO_OSPEED_50MHZ, GPIO_PIN_4);		//设置GPIO输出类型和速率
gpio_input_bit_get(GPIOA, GPIO_PIN_1);		//检测是否输入
```

​		端口输出：

```c
/******************************配置GPIO***********************************************/
rcu_periph_clock_enable(RCU_GPIOB);			//GPIOB时钟使能
gpio_mode_set(GPIOB, GPIO_MODE_OUTPUT, GPIO_PUPD_NONE, GPIO_PIN_4);		//设置GPIO的模式(将B4引脚配置成上拉输出)
gpio_output_options_set(GPIOB, GPIO_OTYPE_PP, GPIO_OSPEED_50MHZ, GPIO_PIN_4);//设置GPIO输出类型和速率
/******************************第一种**************************************************/
gpio_bit_reset(GPIOB, GPIO_PIN_4);			//引脚输出低电平
gpio_bit_set(GPIOB, GPIO_PIN_4);			//引脚输出高电平
/******************************第二种**************************************************/
gpio_bit_write(GPIOB, GPIO_PIN_4, RESET);		//引脚输出低电平
gpio_bit_write(GPIOB, GPIO_PIN_4, SET);			//引脚输出高电平
/*************************第三种，每访问一次会取一次反(例如LED闪烁，等价于：led = ~led)****/
gpio_bit_toggle(GPIOB, GPIO_PIN_4)；
```
