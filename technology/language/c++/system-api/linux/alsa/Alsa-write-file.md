# 通过ALSA声音系统，从麦克风获取音源并保存到文件

1.  查看输出设备

    ```bash
    $ arecord -L
    null
        Discard all samples (playback) or generate zero samples (capture)
    samplerate
        Rate Converter Plugin Using Samplerate Library
    speexrate
        Rate Converter Plugin Using Speex Resampler
    jack
        JACK Audio Connection Kit
    oss
        Open Sound System
    pulse
        PulseAudio Sound Server
    speex
        Plugin using Speex DSP (resample, agc, denoise, echo, dereverb)
    upmix
        Plugin for channel upmix (4,6,8)
    vdownmix
        Plugin for channel downmix (stereo) with a simple spacialization
    default
        Default ALSA Output (currently PulseAudio Sound Server)
    sysdefault:CARD=PCH
        HDA Intel PCH, Generic Analog
        Default Audio Device
    front:CARD=PCH,DEV=0
        HDA Intel PCH, Generic Analog
        Front output / input
    usbstream:CARD=PCH
        HDA Intel PCH
        USB Stream Output
    ```

    <span style="color: green">一般`hw:0`或者`default`表示默认声卡设备。</span>

2.  编写 linux_pcm_save.c 文件

    ```c
    /*
     进行音频采集，采集pcm数据并直接保存pcm数据
     音频参数：
    	 声道数：		2
    	 采样位数：	16bit、LE格式
    	 采样频率：	44100Hz
    */
    #include <stdio.h>
    #include <stdlib.h>
    #include <alsa/asoundlib.h>
    #include <signal.h>
    
    FILE *pcm_data_file=NULL;
    int run_flag=0;
    void exit_sighandler(int sig)
    {
        run_flag=1;
    }
    
    int main(int argc, char *argv[])
    {
        int i;
        int err;
        char *buffer;
        int buffer_frames = 128;
        unsigned int rate = 44100;// 常用的采样频率: 44100Hz 、16000HZ、8000HZ、48000HZ、22050HZ
        snd_pcm_t *capture_handle;// 一个指向PCM设备的句柄
        snd_pcm_hw_params_t *hw_params; //此结构包含有关硬件的信息，可用于指定PCM流的配置
    
        /*注册信号捕获退出接口*/
        signal(2,exit_sighandler);
    
        /*PCM的采样格式在pcm.h文件里有定义*/
        snd_pcm_format_t format=SND_PCM_FORMAT_S16_LE; // 采样位数：16bit、LE格式
    
        /*打开音频采集卡硬件，并判断硬件是否打开成功，若打开失败则打印出错误提示*/
        if ((err = snd_pcm_open (&capture_handle, argv[1],SND_PCM_STREAM_CAPTURE,0))<0)
        {
            printf("无法打开音频设备: %s (%s)\n",  argv[1],snd_strerror (err));
            exit(1);
        }
        printf("音频接口打开成功.\n");
    
        /*创建一个保存PCM数据的文件*/
        if((pcm_data_file = fopen(argv[2], "wb")) == NULL)
        {
            printf("无法创建%s音频文件.\n",argv[2]);
            exit(1);
        }
        printf("用于录制的音频文件已打开.\n");
    
        /*分配硬件参数结构对象，并判断是否分配成功*/
        if((err = snd_pcm_hw_params_malloc(&hw_params)) < 0)
        {
            printf("无法分配硬件参数结构 (%s)\n",snd_strerror(err));
            exit(1);
        }
        printf("硬件参数结构已分配成功.\n");
    
        /*按照默认设置对硬件对象进行设置，并判断是否设置成功*/
        if((err=snd_pcm_hw_params_any(capture_handle,hw_params)) < 0)
        {
            printf("无法初始化硬件参数结构 (%s)\n", snd_strerror(err));
            exit(1);
        }
        printf("硬件参数结构初始化成功.\n");
    
        /*
            设置数据为交叉模式，并判断是否设置成功
            interleaved/non interleaved:交叉/非交叉模式。
            表示在多声道数据传输的过程中是采样交叉的模式还是非交叉的模式。
            对多声道数据，如果采样交叉模式，使用一块buffer即可，其中各声道的数据交叉传输；
            如果使用非交叉模式，需要为各声道分别分配一个buffer，各声道数据分别传输。
        */
        if((err = snd_pcm_hw_params_set_access (capture_handle,hw_params,SND_PCM_ACCESS_RW_INTERLEAVED)) < 0)
        {
            printf("无法设置访问类型(%s)\n",snd_strerror(err));
            exit(1);
        }
        printf("访问类型设置成功.\n");
    
        /*设置数据编码格式，并判断是否设置成功*/
        if ((err=snd_pcm_hw_params_set_format(capture_handle, hw_params,format)) < 0)
        {
            printf("无法设置格式 (%s)\n",snd_strerror(err));
            exit(1);
        }
        fprintf(stdout, "PCM数据格式设置成功.\n");
    
        /*设置采样频率，并判断是否设置成功*/
        if((err=snd_pcm_hw_params_set_rate_near (capture_handle,hw_params,&rate,0))<0)
        {
            printf("无法设置采样率(%s)\n",snd_strerror(err));
            exit(1);
        }
        printf("采样率设置成功\n");
    
        /*设置声道，并判断是否设置成功*/
        if((err = snd_pcm_hw_params_set_channels(capture_handle, hw_params,2)) < 0)
        {
            printf("无法设置声道数(%s)\n",snd_strerror(err));
            exit(1);
        }
        printf("声道数设置成功.\n");
    
        /*将配置写入驱动程序中，并判断是否配置成功*/
        if ((err=snd_pcm_hw_params (capture_handle,hw_params))<0)
        {
            printf("无法向驱动程序设置参数(%s)\n",snd_strerror(err));
            exit(1);
        }
        printf("参数设置成功.\n");
    
        /*使采集卡处于空闲状态*/
        snd_pcm_hw_params_free(hw_params);
    
        /*准备音频接口,并判断是否准备好*/
        if((err=snd_pcm_prepare(capture_handle))<0)
        {
            printf("无法使用音频接口 (%s)\n",snd_strerror(err));
            exit(1);
        }
        printf("音频接口准备好.\n");
    
        /*配置一个数据缓冲区用来缓冲数据*/
        buffer=malloc(128*snd_pcm_format_width(format)/8*2);
        printf("缓冲区分配成功.\n");
    
        /*开始采集音频pcm数据*/
        printf("开始采集数据...\n");
        while(1)
        {
            /*从声卡设备读取一帧音频数据*/
            if((err=snd_pcm_readi(capture_handle,buffer,buffer_frames))!=buffer_frames)
            {
                printf("从音频接口读取失败(%s)\n",snd_strerror(err));
                exit(1);
            }
            /*写数据到文件*/
            fwrite(buffer,(buffer_frames*2),sizeof(short),pcm_data_file);
    
            if(run_flag)
            {
                printf("停止采集.\n");
                break;
            }
        }
    
        /*释放数据缓冲区*/
        free(buffer);
    
        /*关闭音频采集卡硬件*/
        snd_pcm_close(capture_handle);
    
        /*关闭文件流*/
        fclose(pcm_data_file);
        return 0;
    }
    ```

3.  编译

    ```bash
    $ gcc -o main linux_pcm_save.c -lasound
    ```

    <span style="color: green">如果使用cmake，需要如下配置</span>CMakeList.txt文件

    ```cmake
    cmake_minimum_required(VERSION 3.19)
    project(memorize_english_every_day C)
    
    set(CMAKE_C_STANDARD 99)
    
    add_executable(${PROJECT_NAME} linux_pcm_save.c)
    
    # 查找并添加ALSA的动态库
    find_package(ALSA REQUIRED)
    if(ALSA_FOUND)
        include_directories(${ALSA_INCLUDE_DIRS})
        target_link_libraries(${PROJECT_NAME} ${ALSA_LIBRARIES})
    endif(ALSA_FOUND)
    ```

4.  运行

    ```bash
    # 使用 hw:0 声卡，或者 default 也可以，采集到的音源存储到 test.pcm 文件
    $ ./main default test.pcm
    # 俺 ctrl + c 退出程序后，播放音源文件
    $ ffplay -ar 44100 -channels 2 -f s16le -i test.pcm
    ```

    <span style="color: red">如果出现`command not found: ffplay`，请先安装 ffmpeg 包。刚刚安装时在 zsh 环境下，直接复制命令可能出现`zsh: command not found:ffplay -ar 44100 -channels 2 -f s16le -i test.pcm `，先手敲一次命令即可</span>

