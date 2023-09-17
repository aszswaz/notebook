# MP3

## 版权声明

本文所有内容均摘抄自：[MP3文件结构解析(超详细)](https://blog.csdn.net/u010650845/article/details/53520426)

## 简述

MP3全称为MPEG Audio Layer 3，它是一种高效的计算机音频编码方案，它以较大的压缩比将音频文件转换成较小的扩展名为.mp3的文件，基本保持源文件的音质，MP3是**ISO/MPEG**标准的一部分，

ISO/MPEG标准描述了使用高性能感知编码方案的音频压缩，此标准一直在不断更新以满足“质高量小”的追求，现已形成MPEG Layer1、Layer2、Layer3三种音频编解码方案，分别对应MP1、MP2、MP3 这三种声音文件

MPEG(Moving Picture Expert Group)是ISO下的一个动态图像专家组，它指定的MPEG标准广泛的应用于各种多媒体中，MPEG标准包括视频和音频标准，其中音频标准已制定出MPEG-1、MPEG-2、MPEG-2 ACC、MPEG-4。MPEG-1和MPEG-2标准使用同一个音频编解码族Layer1、2、3，MP3绝大多数使用的是MPEG1标准。

MP3音频压缩包含编码和解码两部分，编码是将原始信号转换成电平信号的过程，解码即是逆过程，MP3 采用了**感知音频编码（PerceptualAudio Coding）**这一失真算法。人耳感受声音的频率范围是20Hz-20kHz，MP3截掉了大量的冗余信号和无关的信号，<span style="color: green">编码器通过**混合滤波器组**将原始声音变换到频率域，利用心理声学模型，估算刚好能被察觉到的噪声水平，</span>再经过量化，转换成**Huffman**编码，形成MP3位流。解码器要简单得多，它的任务是从编码后的谱线成分中，经过反量化和逆变换，提取出声音信号。

MP3文件数据由多个帧组成，帧是MP3文件最小组成单位。每个帧又由帧头、附加信息和声音数据组成。每个帧播放时间是0.026秒，其长度随位率的不同而不等。有些MP3文件末尾有些额外字节存放非声音数据的说明信息。

## 文件结构

<span style="color: green">MP3文件大体上分为三个部分：ID3V2+音频数据+ID3V1</span>

![https://img-blog.csdn.net/20161208164502786?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208164502786)

## ID3V2解析

ID3V2一共有四个版本，ID3V2.1/2.2/2.3/2.4，目前流行的播放软件一般只支持第三版即ID3V2.3，由于ID3V1记录在文件的末尾处，ID3V2就只能记录在文件的首部了，也是因为这个原因，对ID3V2的操作比ID3V1要慢，而且ID3V2的结构比ID3V1的结构复杂的多，但是ID3V2可以记录更多的信息，长度可变。

ID3V2.3由一个标签头和若干个标签帧或者一个扩展标签头组成，至少要有一个标签帧，每一个标签帧记录一种信息，例如作曲、标题等

## 标签头

位于文件开始处，长度为10字节，结构如下：

char Header[3];   //  必须为“ID3”否则认为标签不存在

char Ver;         // 版本号ID3V2.3 就记录3

char Revision;     // 副版本号此版本记录为0

char Flag;        // 标志字节，只使用高三位，其它位为0

char Size[4];      // 标签大小

注：标签大小，不能确定具体包括哪些内容，解析歌曲文件后，发现没有哪些字节之和会等于该值，详见下面的实例分析

标志字节一般为0，定义如下(abc000000B)

a：表示是否使用Unsynchronisation

b：表示是否有扩展头部，一般没有，所以一般也不设置

c：表示是否为测试标签，99.99%的标签都不是测试标签，不设置

标签大小共四个字节，每个字节只使用低7位，最高位不使用恒为0，计算时将最高位去掉，得到28bit的数据，计算公式如下：

Size=(Size[0]&0x7F) \* 0x200000+(Size[1]&0x7F) \* 0x400+(Size[2]&0x7F) \* 0x80 + (Size[3] & 0x7F)

以《金南玲 - 逆流成河.mp3》为例，使用WinHex工具打开如下，读者可自己对照上述结构，本章结束会给出详细的结构分析

![https://img-blog.csdn.net/20161208164729477?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208164729477)

## 标签帧

每个标签帧都有10个字节的帧头(和标签头不是一个东西，虽然他们刚好都是10字节，标签头只有一个，每个标签帧都有一个帧头)和至少一个字节的内容构成，标签帧与标签头/其他标签帧无特殊字节分割，只能通过帧头信息来确定帧内容的大小。

帧头长度10字节，定义如下：

```c
char ID[4];  // 标识帧，说明其内容，例如作者/标题等

char Size[4]; // 帧内容的大小，不包括帧头，不得小于1

char Flags[2]; // 标志帧，只定义了6 位
```

标识帧，常见的内容如下：

TIT2=标题

TPE1=作者

TALB=专集

TRCK=音轨格式：N/M 其中N为专集中的第N首，M为专集中共M首，N和M为ASCII 码表示的数字

TYER=年代是用ASCII 码表示的数字

TCON=类型直接用字符串表示

COMM=备注格式："eng\0备注内容"，其中eng 表示备注所使用的自然语言

帧内容大小，计算公式如下：

<span style="color: green">Size = Size[0] \* 0x100000000 + Size[1] \* 0x10000+ Size[2] \* 0x100 +Size[3];</span>

标志帧，使用每个字节的高三位，其他位均为0(abc00000B xyz00000B)

a -- 标签保护标志，设置时认为此帧作废

b -- 文件保护标志，设置时认为此帧作废

c -- 只读标志，设置时认为此帧不能修改

x -- 压缩标志，设置时一个字节存放两个BCD 码表示数字

y-- 加密标志

z-- 组标志，设置时说明此帧和其他的某帧是一组

![https://img-blog.csdn.net/20161208164828073?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208164828073)

## 音频数据解析

每个帧都有一个帧头，长度是四个字节，帧后面可能有2字节的CRC校验，取决于帧头的第16位，为0则无校验，为1则有校验，后面是可变长度的附加信息，对于标准的MP3文件来说，其长度是32字节，紧接其后的是压缩的声音数据，当解码器读到此处时就进行解码了。

![https://img-blog.csdn.net/20161208164907480?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208164907480)

## 数据帧帧头

帧头长4字节，结构如下：

```c
typedef FrameHeader {
unsigned int sync:11;                        //同步信息

unsigned int version:2;                      //版本

unsigned int layer: 2;                           //层

unsigned int error protection:1;           // CRC校验

unsigned int bitrate_index:4;              //位率

unsigned int sampling_frequency:2;         //采样频率

unsigned int padding:1;                    //帧长调节

unsigned int private:1;                       //保留字

unsigned int mode:2;                         //声道模式

unsigned int mode extension:2;        //扩充模式

unsigned int copyright:1;                           // 版权

unsigned int original:1;                      //原版标志

unsigned int emphasis:2;                  //强调模式

}HEADER, *LPHEADER;
```

详细说明：

![https://img-blog.csdn.net/20161208165008543?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208165008543)

## 帧长度与真大小

帧大小即每帧的采样数，表示一帧数据中采样的个数，该值是恒定的，如下表所示：

![https://img-blog.csdn.net/20161208165049075?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208165049075)

帧长度是压缩时每一帧的长度，包括帧头的4个字节。它将填充的空位也计算在内。Layer 1的一个空位长4字节，Layer 2和Layer 3的空位是1字节。当读取MPEG文件时必须计算该值以便找到相邻的帧。注意：因为有填充和比特率变换，帧长度可能变化

计算公式如下：

Layer 1：Len(字节) = ((每帧采样数/8*比特率)/采样频率)+填充*4

Layer2/3：Len(字节) = ((每帧采样数/8*比特率)/采样频率)+填充

例：MPEG1 Layer3 比特率128000，采样率44100，填充0，帧长度为：((1152 / 8 \* 128K) / 44.1K + 0 = 417字节

## 帧持续时间

计算公式：

每帧持续时间(毫秒) = 每帧采样数 / 采样频率 \* 1000

例：1152 / 441000 \* 1000 = 26ms

## 帧数据

在帧头后边是Side Info(姑且称之为通道信息)。对标准的立体声MP3文件来说其长度为32字节。当解码器在读到上述信息后，就可以进行解码了。

对于mp3来说现在有两种编码方式，一种是CBR，也就是固定位率，固定位率的帧的大小在整个文件中都是是固定的（公式如上所述），只要知道文件总长度，和从第一帧帧头读出的信息，就都可以通过计算得出这个mp3文件的信息，比如总的帧数，总的播放时间等等，要定位到某一帧或某个时间点也很方便，这种编码方式不需要文件头，第一帧开始就是音频数据。另一种是VBR，就是可变位率，VBR是XING公司推出的算法，所以在MP3的FRAME里会有“Xing"这个关键字（也有用"Info"来标识的，现在很多流行的小软件也可以进行VBR压缩，它们是否遵守这个约定，那就不得而知了），它存放在MP3文件中的第一个有效帧的数据区里，它标识了这个MP3文件是VBR的。同时第一个帧里存放了MP3文件的帧的总个数，这就很容易获得了播放总时间，同时还有100个字节存放了播放总时间的100个时间分段的帧索引，假设4分钟的MP3歌曲，240S，分成100段，每两个相邻INDEX的时间差就是2.4S，所以通过这个INDEX，只要前后处理少数的FRAME，就能快速找出我们需要快进的帧头。其实这第一帧就相当于文件头了。不过现在有些编码器在编码CBR文件时也像VBR那样将信息记入第一帧，比如著名的lame，它使用"Info"来做CBR的标记。

## VBR头文件

VBR文件头位于MP3文件中第一个有效帧的数据区，详细结构如下：

![https://img-blog.csdn.net/20161208165309687?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208165309687)

## ID3V1解析

ID3 V1.0标准并不周全，存放的信息少，无法存放歌词，无法录入专辑封面、图片等。V2.0是一个相当完备的标准，但给编写软件带来困难，虽然赞成此格式的人很多，在软件中真正实现的却极少。绝大多数MP3仍使用ID3 V1.0标准。此标准是将MP3文件尾的最后128个字节用来存放ID3信息。

![https://img-blog.csdn.net/20161208165346366?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208165346366)

## 附录

### 帧标识

AENC：Audioencryption

APIC：Attached picture

COMM：Comments

COMR：Commercial

ENCR：Encryptionmethod registration

EQUA：Equalization

ETCO：Event timingcodes

GEOB：Generalencapsulated object

GRID：Groupidentification registration

IPLS：Involvedpeople list

LINK：Linkedinformation

MCDI：Music CDidentifier

MLLT：MPEGlocationlookup table

OWNE：Ownership

PRIV：Private

PCNT：Playcounter

POPM：Popularimeter

POSS：Positionsynchronisation

RBUF：Recommendedbuffer size

RVAD：Relativevolume adjustment

RVRB：Reverb

SYLT：Synchronizedlyric/text

SYTC：Synchronizedtempo codes

TALB：Album/Movie/Showtitle

TBPM：BPM(beats perminute)

TCOM：Composer

TCON：Content type

TCOP：Copyrightmessage

TDAT：Date

TDLY：Playlistdelay

TENC：Encoded by

TEXT：Lyricist/Textwriter

TFLT：Filetype

TIME：Time

TIT1：Content groupdeion

TIT2：Title/songname/contentdeion

TIT3：Subtitle/Deionrefinement

TKEY：Initial key

TLAN：Language(s)

TLEN：Length

TMED：Media type

TOAL：Originalalbum/movie/show title

TOFN：Originalfilename

TOLY：Originallyricist(s)/text writer(s)

TOPE：Originalartist(s)/performer(s)

TORY：Originalrelease year

TOWN：Fileowner/licensee

TPE1：Leadperformer(s)/Soloist(s)

TPE2：Band/orchestra/accompaniment

TPE3：Conductor/performerrefinement

TPE4：Interpreted,remixed, or otherwise modified by

TPOS：Partof a set

TPUB：Publisher

TRCK：Tracknumber/Position in set

TRDA：Recordingdates

TRSN：Internetradio station name

TRSO：Internetradio station owner

TSIZ：Size

TSRC：ISRC(internationalstandard recording code)

TSSE：Software/Hardwareand settings used for encoding

TYER：Year

TXXX：Userdefinedtext information

UFID：Unique fileidentifier

USER：Terms of use

USLT：Unsychronizedlyric/text tranion

WCOM：Commercialinformation

WCOP：Copyright/Legalinformation

WOAF：Officialaudio file webpage

WOAR：Officialartist/performer webpage

WOAS：Officialaudio source webpage

WORS：Officialinternet radio station homepage

WPAY：Payment

WPUB：Publishersofficial webpage

WXXX：UserdefinedURL link

### 音乐类型

0="Blues";

1="ClassicRock";

2="Country";

3="Dance";

4="Disco";

5="Funk";

6="Grunge";

7="Hip-Hop";

8="Jazz";
9="Metal";
10="NewAge";
11="Oldies";
12="Other";
13="Pop";
14="R&B";
15="Rap";
16="Reggae";
17="Rock";
18="Techno";
19="Industrial";
20="Alternative";
21="Ska";
22="Deathl";
23="Pranks";
24="Soundtrack";
25="Euro-Techno";
26="Ambient";
27="Trip-Hop";
28="Vocal";
29="Jazz+Funk";
30="Fusion";
31="Trance";
32="Classical";
33="Instrumental";
34="Acid";
35="House";
36="Game";
37="SoundClip";
38="Gospel";
39="Noise";
40="AlternRock";
41="Bass";
42="Soul";
43="Punk";
44="Space";
45="Meditative";
46="InstrumentalPop";
47="InstrumentalRock";
48="Ethnic";
49="Gothic";
50="Darkwave";
51="Techno-Industrial";
52="Electronic";
53="Pop-Folk";
54="Eurodance";
55="Dream";
56="SouthernRock";
57="Comedy";
58="Cult";
59="Gangsta";
60="Top40";
61="ChristianRap";
62="Pop/Funk";
63="Jungle";
64="NativeAmerican";
65="Cabaret";
66="NewWave";
67="Psychadelic";
68="Rave";
69="Showtunes";
70="Trailer";
71="Lo-Fi";
72="Tribal";
73="AcidPunk";
74="AcidJazz";
75="Polka";
76="Retro";
77="Musical";
78="Rock&Roll";
79="HardRock";

80="Folk";
81="Folk-Rock";
82="NationalFolk";
83="Swing";
84="FastFusion";
85="Bebob";
86="Latin";
87="Revival";
88="Celtic";
89="Bluegrass";
90="Avantgarde";
91="GothicRock";
92="ProgessiveRock";
93="PsychedelicRock";
94="SymphonicRock";
95="SlowRock";
96="BigBand";
97="Chorus";
98="EasyListening";
99="Acoustic";
100="Humour";
101="Speech";
102="Chanson";
103="Opera";
104="ChamberMusic";
105="Sonata";
106="Symphony";
107="BootyBass";
108="Primus";
109="PornGroove";
110="Satire";
111="SlowJam";
112="Club";
113="Tango";
114="Samba";
115="Folklore";
116="Ballad";
117="PowerBallad";
118="RhythmicSoul";
119="Freestyle";
120="Duet";
121="PunkRock";
122="DrumSolo";
123="Acapella";
124="Euro-House";
125="DanceHall";

126="Goa";
127="Drum&Bass";
128="Club-House";
129="Hardcore";
130="Terror";
131="Indie";
132="BritPop";
133="Negerpunk";
134="PolskPunk";
135="Beat";
136="ChristianGangstaRap";
137="Heavyl";
138="Blackl";
139="Crossover";
140="ContemporaryChristian";
141="ChristianRock";
142="Merengue";
143="Salsa";
144="Trashl";
145="Anime";
146="JPop";
147="Synthpop";

## 实例分析

## 歌曲信息

![https://img-blog.csdn.net/20161208165518222?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208165518222)

### 结构解析

#### 标签头

![https://img-blog.csdn.net/20161208165559879?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208165559879)

标签头：10字节，00H-09H

![https://img-blog.csdn.net/20161208165626395?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208165626395)

标签大小：

Size = (Size[0] & 0x7F) \* 0x200000 + (Size[1]&0x7F) \* 0x400+(Size[2]&0x7F) \* 0x80 + (Size[3] & 0x7F)

=(0x07 & 0x7F) \*0x400+(0x34 & 0x7F) \* 0x80+(0x60 & 0x7F)

=0x1C00 + 0x1A00 + 0x60

=0x3660 = 13920

### TSSE标签帧

![https://img-blog.csdn.net/20161208165716179?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208165716179)

![https://img-blog.csdn.net/20161208165740101?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208165740101)

#### COMM标签帧

![https://img-blog.csdn.net/20161208165813774?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208165813774)

![https://img-blog.csdn.net/20161208165829321?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208165829321)

帧内容大小：

Size = Size[0] \* 0x100000000 + Size[1] \* 0x10000+ Size[2] \* 0x100 + Size[3]

=0x02 \* 0x100 + 0x07

=0x207=519

#### TALB标签帧

![https://img-blog.csdn.net/20161208165919477?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208165919477)

![https://img-blog.csdn.net/20161208165944994?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208165944994)

#### TPE1标签帧

![https://img-blog.csdn.net/20161208170132887?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208170132887)

![https://img-blog.csdn.net/20161208170157744?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208170157744)

#### TPOS标签帧

![https://img-blog.csdn.net/20161208170243497?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208170243497)

![https://img-blog.csdn.net/20161208170302623?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208170302623)

#### TRCK标签帧

![https://img-blog.csdn.net/20161208170340902?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208170340902)

![https://img-blog.csdn.net/20161208170352530?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208170352530)

#### APIC标签帧

![https://img-blog.csdn.net/20161208170431590?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208170431590)

此处省略N多字节………

![https://img-blog.csdn.net/20161208170448234?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208170448234)

![https://img-blog.csdn.net/20161208170506844?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208170506844)

帧内容大小：

Size = Size[0] \* 0x100000000 + Size[1] \* 0x10000 + Size[2] \* 0x100 + Size[3]

=0x01 \* 0x10000+0xD3 \* 0x100+0xD7

=0x10000+0xD300+0xD7

=0x1D3D7=119767

#### 未知数据

不清楚该段数据具体作用，目测是填充字节。

![https://img-blog.csdn.net/20161208170548470?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208170548470)

#### 音频数据

![https://img-blog.csdn.net/20161208170623736?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208170623736)

![https://img-blog.csdn.net/20161208170640939?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMDY1MDg0NQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center](image/MP3/20161208170640939)

帧头解析：

FF=<span style="color: red">11111111 红色</span>

FB=<span style="color: red">111</span><span style="color: black">1 1</span><span style="color: #00B050">01</span><span style="color: #7030A0">1</span> <span style="color: red">红色</span><span style="color: black">黑色</span><span style="color: #00B050">绿色</span><span style="color: #7030A0">紫色</span>

E0=<span style="color: blue">1110</span> <span style="color: #4F6228">00</span><span style="color: #C00000">0</span><span style="color: #FFC000">0</span> <span style="color: blue">蓝色</span><span style="color: #4F6228">橄榄色</span><span style="color: #C00000">深红色</span><span style="color: #FFC000">橙色</span>

00=<span style="color: gray">00</span><span style="color: #92D050">00</span><span style="color: #002060">0</span><span style="color: #663300">0</span><span style="color: #FF0066">00</span> <span style="color: gray">白色</span><span style="color: #92D050">浅绿色</span><span style="color: #002060">深蓝色</span><span style="color: #663300">褐色</span><span style="color: #FF0066">粉红色</span>

红色：11位，同步信息，所有位均为1，第一个字节恒为FF

黑色：2位，版本，MPEG1

绿色：2位，层，Layer3

紫色：1位，无CRC校验

蓝色：4位，位率，单位是kbps，320

橄榄色：2位，采样频率，44.1K

深红色：1位，用来调整文件头长度，无需调整

橙色：1位，保留字，未使用

白色：2位，表示声道模式，立体声Stereo

浅绿色：2位，声道模式为Joint Stereo时才使用

深蓝色：1位，文件是否合法，不合法

褐色：1位，是否原版，非原版

粉红色：2位，用于声音经降噪压缩后再补偿的分类，未定义

根据以上信息可计算：

帧长度=帧头+通道信息+帧内容= ((1152/8*320)/44.1=1044字节

每帧持续时间=1152/44.1*1000=26.12ms

因为该歌曲为CBR即固定位率歌曲，所以每帧的数据长度都是1044字节，26ms。

#### 其他数据
该歌曲无ID3V1信息。

最后的320字节，题主也是笨笨的没弄懂其具体含义~

## 说明
能够读到这里的读者，我不得不对你的求知精神与耐心表示肯定，希望这篇文章对您有所帮助

word文档下载地址：http://download.csdn.net/detail/u010650845/9705899
