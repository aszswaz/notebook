# Shared memory

Shared memory is essentially carried out through the file system, and the purpose of data sharing between processes is achieved by reading and writing files.

However, unlike general file read and write operations, shared memory read and write operations are performed on a piece of logical memory, and the operating system kernel will synchronsize the memory with the file, thereby greaty improving the read and write efficiency.

Next, we illustrate all this with an example.

Let's start by writing a program whose function is to periodically generate a random string and write it to shared memory.

mmap-write.c:

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>
#include <time.h>
#include <signal.h>

#define FILE_NAME "memory.bin"
#define FILE_SIZE 32
#define CONTENT "Hello World"
// File Permissions.
#define PERMISSION S_IRUSR | S_IWUSR | S_IRGRP | S_IROTH
// Open the file in read-write mode, or create the file if it does not exist.
#define FILE_MODE O_CREAT | O_RDWR
#define FILE_ERROR(expression) \
    if (expression) { \
        perror(FILE_NAME); \
        code = EXIT_FAILURE; \
        goto finally; \
    }

static char running = 1;

/**
 * Random ascii characters.
 */
static void rand_string(char *ptr, size_t len) {
    memset(ptr, 0, len);
    const char min = 65, max = 90;
    int result;
    for (int i = 0; i < len; i++) {
        // Set a random seed.
        srand48(time(NULL));
        result = (rand() % (max - min + 1)) + min;
        ptr[i] = result;
    }
    printf("%s\n", ptr);
}

void exit_hander() {
    running = 0;
}

void signal_exit(int sig) {
    exit_hander();
}

int main() {
    int code = EXIT_SUCCESS;
    char *addr;
    int fd;

    atexit(exit_hander);
    signal(SIGTERM, signal_exit);
    signal(SIGINT, signal_exit);
    signal(SIGKILL, signal_exit);

    // Open or create a file in the `/dev/shm` directory.
    fd = shm_open(FILE_NAME, FILE_MODE, PERMISSION);
    FILE_ERROR(fd == -1);

    /*
     * If the file size in the file metadata is smaller than the required shared memory size,
     * it will cause the shared memory write to fail, resulting in a bit segmentation fault.
     * Therefore, we need to modify the file size in the metadata through the `ftruncate` function, commonly known as `hole punching`.
     */
    FILE_ERROR(ftruncate(fd, FILE_SIZE));

    printf("Allocate shared memory.\n");
    // Allocate shared memory.
    addr = mmap(NULL, FILE_SIZE, PROT_WRITE, MAP_SHARED, fd, 0);
    FILE_ERROR(addr == MAP_FAILED);
    printf("shared memory pointer: %p\n", addr);

    while (running) {
        rand_string(addr, FILE_SIZE);
        sleep(5);
    }

finally:
    printf("finally\n");
    if (fd != -1) {
        close(fd);
        shm_unlink(FILE_NAME);
    }
    if (addr != MAP_FAILED) munmap(addr, FILE_SIZE);
    return code;
}
```

Then, we write another program for reading shared memory.

mmap-read.c:

```c
#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>
#include <signal.h>

#define FILE_NAME "memory.bin"
#define FILE_SIZE 32
#define CONTENT "Hello World"
#define PERMISSION S_IRUSR | S_IWUSR | S_IRGRP | S_IROTH
#define FILE_MODE O_RDONLY
#define FILE_ERROR(expression) \
    if (expression) { \
        perror(FILE_NAME); \
        code = EXIT_FAILURE; \
        goto finally; \
    }

static int running = 1;

void exit_hander() {
    running = 0;
}

void signal_exit(int sig) {
    exit_hander();
}

int main() {
    char *buf;
    int fd;
    int code = EXIT_SUCCESS;

    atexit(exit_hander);
    signal(SIGINT, signal_exit);
    signal(SIGTERM, signal_exit);
    signal(SIGKILL, signal_exit);

    fd = shm_open(FILE_NAME, FILE_MODE, PERMISSION);
    FILE_ERROR(fd == -1);

    // Create a memory map to an existing file.
    buf = mmap(NULL, FILE_SIZE, PROT_READ, MAP_SHARED, fd, 0);
    FILE_ERROR(buf == MAP_FAILED);
    printf("shared memory pointer: %p\n", buf);

    while (running) {
        printf("%s\n", buf);
        sleep(5);
    }

finally:
    printf("finally");
    if (fd != -1) close(fd);
    if (buf != MAP_FAILED) munmap(buf, FILE_SIZE);
    return code;
}
```

Compile the program.

```bash
$ gcc mmap-write.c -o mmap-write && gcc mmap-read.c -o mmap-read
```

We first execute `mmap-write`.

```bash
$ ./mmap-write
Allocate shared memory.
shared memory pointer: 0x7f7e59293000
ORELLNMPAPQFWKHOPKMCOQHNWNKUEWHS
QMGBBUQCLJJIVSWMDKQTBXIXMVTRRBLJ
...
```

Execute `mmap-read` again.

```bash
$ ./mmap-read
shared memory pointer: 0x7f3157983000
ORELLNMPAPQFWKHOPKMCOQHNWNKUEWHS
QMGBBUQCLJJIVSWMDKQTBXIXMVTRRBLJ
...
```

Obviously, although the logical memory addresses are different, the content is the same, which is shared memory.

<font color="red">It should be noted that the size of the shared memory cannot be smaller than the file size recorded in the metadata of the file, but it can be larger than the space actually occupied by the file. We can modify the metadata through `ftruncate` to avoid program crashes.</font>