# c标准库sys/time.h

## timeval

**定义**

```c
struct timeval {
  __time_t tv_sec;		// 秒
  __suseconds_t tv_usec;	// 微秒
};
```

## gettimeofday

**原型**

```c
extern int gettimeofday (struct timeval *__restrict __tv, void *__restrict __tz) __THROW __nonnull ((1));
```

**作用**

获取秒和微秒时间戳

**示例**

```c
#include <sys/time.h>
#include <stdio.h>
#include <unistd.h>


int main() {

    struct timeval tv;
    gettimeofday(&tv, NULL);

    printf("second: %ld\n", tv.tv_sec); // 秒
    printf("millisecond: %ld\n", tv.tv_sec * 1000 + tv.tv_usec / 1000); // 毫秒
    printf("microsecond: %ld\n", tv.tv_sec * 1000000 + tv.tv_usec); // 徽秒

    sleep(3); // 让程序休眠3秒
    printf("---------------------sleep 3 second-------------------\n");

    gettimeofday(&tv, NULL);

    printf("second: %ld\n", tv.tv_sec); // 秒
    printf("millisecond: %ld\n", tv.tv_sec * 1000 + tv.tv_usec / 1000); // 毫秒
    printf("microsecond: %ld\n", tv.tv_sec * 1000000 + tv.tv_usec); // 徽秒

    return 0;
}
```

