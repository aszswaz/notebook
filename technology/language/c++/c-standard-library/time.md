# c标准库time.h

## time

**函数原型**

```c
extern time_t time (time_t *__timer) __THROW;
```

**作用**

获得当前时间的秒级时间戳

**示例**

```c
#include <stdio.h>
#include <time.h>

int main(void) {
    time_t tick;  //这是一个适合存储日历时间类型。
    tick = time(NULL);
    printf("%d\n", (int) tick);// 秒级时间戳
    return 0;
}
```

## localtime

**原型**

```c
extern struct tm *localtime (const time_t *__timer) __THROW;
```

**作用**

把秒级时间戳解析为tm结构

**示例**

```c
#include <stdio.h>
#include <time.h>

int main(void) {
    time_t tick;  //这是一个适合存储日历时间类型。
    struct tm *tm; //这是一个用来保存时间和日期的结构。

    char s[100];
    tick = time(NULL);
    tm = localtime(&tick);
    // 把tm结构按照指定的格式以及系统时区格式化为字符串，注意：如果缓冲区不足就会发生内存溢出
    strftime(s, sizeof(s), "%Y-%m-%d %H:%M:%S", tm);
    printf("%d\n", (int) tick);
    printf("%s\n", s);
    return 0;
}
```

## tm

**定义**

```c
struct tm {
  int tm_sec;			/* Seconds.	[0-60] (1 leap second) */
  int tm_min;			/* Minutes.	[0-59] */
  int tm_hour;			/* Hours.	[0-23] */
  int tm_mday;			/* Day.		[1-31] */
  int tm_mon;			/* Month.	[0-11] */
  int tm_year;			/* Year	- 1900.  */
  int tm_wday;			/* Day of week.	[0-6] */
  int tm_yday;			/* Days in year.[0-365]	*/
  int tm_isdst;			/* DST.		[-1/0/1]*/

# ifdef	__USE_MISC
  long int tm_gmtoff;		/* Seconds east of UTC.  */
  const char *tm_zone;		/* Timezone abbreviation.  */
# else
  long int __tm_gmtoff;		/* Seconds east of UTC.  */
  const char *__tm_zone;	/* Timezone abbreviation.  */
# endif
};
```

