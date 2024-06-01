# Java操作音频

## 操作PCM总线设备（麦克风和扬声器）

```java
package com.secretary;

import javax.sound.sampled.AudioFileFormat;
import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.SourceDataLine;
import javax.sound.sampled.TargetDataLine;
import java.io.File;
import java.util.Timer;
import java.util.TimerTask;

@SuppressWarnings("JavaDoc")
public class Secretary {
    public static void main(String[] args) throws Exception {
        recording();
        play();
    }

    /**
     * 录音，并保存为wav文件
     */
    private static void recording() throws Exception {
        // 设置音频数据流为PCM
        AudioFormat.Encoding encoding = AudioFormat.Encoding.PCM_SIGNED;
        float rate = 41000f;// 设置采样略
        int sampleSize = 16;// 样本的比特
        int channels = 2;// 声道
        AudioFormat audioFormat = new AudioFormat(encoding, rate, sampleSize, channels, (sampleSize / 8) * channels, rate, true);

        TargetDataLine targetDataLine = AudioSystem.getTargetDataLine(audioFormat);
        // 打开PCM数据总线
        targetDataLine.open(audioFormat);
        // 启动录音设备
        targetDataLine.start();
        Timer timer = new Timer();

        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                try {
                    System.out.println("关闭录音");
                    targetDataLine.close();
                    timer.cancel();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }, 4 * 60 * 1000);

        // 初始化音频流
        AudioInputStream audioInputStream = new AudioInputStream(targetDataLine);
        System.out.println("开始录音");
        // 通过系统的本地声音系统，开始采集音频，并且格式化为WAV文件
        AudioSystem.write(audioInputStream, AudioFileFormat.Type.WAVE, new File("demo.wav"));
        System.out.println("文件保存完成");

        audioInputStream.close();
    }

    /**
     * 播放WAV格式的音频文件
     */
    private static void play() throws Exception {
        // 初始化音频流
        AudioInputStream audioInputStream = AudioSystem.getAudioInputStream(new File("demo.wav"));
        // 初始化PCM总线设备
        SourceDataLine dataLine = AudioSystem.getSourceDataLine(audioInputStream.getFormat());
        byte[] buff = new byte[1024];
        int len;
        // 打开PCM总线设备（扬声器）
        dataLine.open(audioInputStream.getFormat(), 1024);
        // 运行设备
        dataLine.start();
        while ((len = audioInputStream.read(buff, 0, buff.length)) > 0) {
            // 输出音频到PCM总线设备
            dataLine.write(buff, 0, len);
        }
        // 关闭流
        audioInputStream.close();
        dataLine.close();
    }
}

```

