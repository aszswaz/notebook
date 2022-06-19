# CUDA

**CUDA**（**C**ompute **U**nified **D**evice **A**rchitecture，**统一计算架构**[[1\]](https://zh.wikipedia.org/zh-cn/CUDA#cite_note-1)）是由英伟达[NVIDIA](https://zh.wikipedia.org/wiki/NVIDIA)所推出的一种集成技术，是该公司对于[GPGPU](https://zh.wikipedia.org/wiki/GPGPU)的正式名称。透过这个技术，用户可利用NVIDIA的[GeForce 8](https://zh.wikipedia.org/wiki/GeForce_8)以后的GPU和较新的[Quadro](https://zh.wikipedia.org/wiki/Quadro) [GPU](https://zh.wikipedia.org/wiki/GPU)进行计算。亦是首次可以利用GPU作为C-编译器的开发环境。NVIDIA营销的时候[[2\]](https://zh.wikipedia.org/zh-cn/CUDA#cite_note-2)，往往将编译器与架构混合推广，造成混乱。实际上，CUDA可以兼容[OpenCL](https://zh.wikipedia.org/wiki/OpenCL)或者自家的C-编译器。无论是CUDA C-语言或是OpenCL，指令最终都会被驱动程序转换成PTX代码，交由显示核心计算。

# 安装

```bash
$ sudo pacman -S cuda
```



# Hello World

通过 CUDA 用 GPU 输出“Hello World”

```bash
#include <stdio.h>
#include <cuda_runtime.h>
#include <unistd.h>

/**
  * 添加 __global__ 标志，表示该函数在 GPU 执行
  */
 __global__ void Demo() {
     printf("Hello World\n");
}

/**
 * CUDA GPU 调用演示程序。程序的 CPU 执行部分称为 host 端，程序的 GPU 部分为 device 端
 */
int main() {
    printf("Start...\n");

    // host 向 device 端发起函数调用。<<<x, t>>> x 每个线程执行该函数 x 次，t 为执行这个函数所使用线程，这个函数总的执行次数为 x * y 次
    Demo<<<1, 10>>>();

    printf("waiting device\n");
    // host 等待 device 执行完毕
    cudaDeviceSynchronize();
    sleep(10);
    // 销毁程序在 device 所有资源占用，比如在显卡的独立内存中，程序的内存占用
    cudaDeviceReset();
    return 0;
}
```

用 nvcc 编译程序：

```bash
# -arch sm_50 指定 GPU 架构，不同显卡型号会有所不同，
$ nvcc -I/opt/cuda/include -arch sm_50 demo.cu -o main
```

执行：

```bash
$ ./main
Start...
waiting device
Hello World
Hello World
Hello World
Hello World
Hello World
Hello World
Hello World
Hello World
Hello World
Hello World
```

监控 GPU 的执行状态

```bash
$ nvidia-smi
Sun Jun 19 23:26:31 2022       
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 515.48.07    Driver Version: 515.48.07    CUDA Version: 11.7     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  NVIDIA GeForce ...  Off  | 00000000:01:00.0 Off |                  N/A |
| N/A   40C    P0    N/A /  N/A |     28MiB /  2048MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+
                                                                               
+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|    0   N/A  N/A       834      G   /usr/lib/Xorg                       2MiB |
|    0   N/A  N/A     88708      C   ./main                             21MiB |
+-----------------------------------------------------------------------------+
```

