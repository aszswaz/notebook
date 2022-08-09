# Get file information

The "stat" function is used to get file information.

**header file:** sys/stat.h

**function prototype:**

```c
int stat(const char *pathname, struct stat *statbuf);
```

**return value:**

Returns 0 on success, -1 on failure.

**struct stat:**

```c
struct stat {
    // ID of device containing file
    dev_t st_dev;
    // Inode number
    ino_t st_ino;
    // File type and mode
    mode_t st_mode;
    // Number of hard links
    nlink_t st_nlink;
    // User ID of owner
    uid_t st_uid;
    // Group ID of owner
    gid_t st_gid;
    // Device ID (if special file)
    dev_t st_rdev;
    //  Total size, in bytes
    off_t st_size;
    // Block size for filesystem I/O
    blksize_t st_blksize;
    // Number of 512B blocks allocated
    blkcnt_t st_blocks;
};
```

# sparse file

`sparse file` allows more efficient use of filesystem space when the file content is mostly empty. Its principle is to represent the blocks occupied by the file through the metadata of the file.

 We can create a `sparse file` via `dd`:

```bash
$ dd if=/dev/zero of=sparse-files.raw bs=1 count=0 seek=50M
# Check the file size.
$ ls -lh sparse-files.raw
-rw-r--r-- 1 xxx xxx 50M Aug  9 14:04 sparse-files.raw
$ du -h sparse-files.raw
0
```

From the above results, we can see that the file sizes displayed by `ls` and `du` are inconsistent, because `ls` shows the file size recorded in the metadata of the file, and `du` shows the file size block size. We demonstrate this difference using `C` code:

```c
#include <sys/stat.h>
#include <sys/statvfs.h>
#include <stdio.h>
#include <math.h>

#define FILE_NAME "sparse-files.raw"

int main() {
    struct stat statbuf;
    struct statvfs statvfsbuf;

    if (stat(FILE_NAME, &statbuf)) {
        perror(FILE_NAME);
        return 1;
    }

    if (statvfs(FILE_NAME, &statvfsbuf)) {
        perror(FILE_NAME);
        return 1;
    }

    printf("ls file size: %ld mb\n", statbuf.st_size / 1024 / 1024);
    // The file will be cut into several 512B blocks, usually, st_size = st_blocks * 512, but if the file has holes, then st_size > st_blocks * 512.
    printf("du file size: %d mb\n", (int) ceil(statbuf.st_blocks * 512.0 / 1024.0 / 1024.0));

    return 0;
}
```

The execution result is as follows:

```bash
$ gcc demo.c -o demo -lm
# before populating the data.
$ ./demo
ls file size: 50 mb
du file size: 0 mb
# After filling 30mb of data.
$ ./demo
ls file size: 50 mb
du file size: 30 mb
```

The file size of `sparse file` is not limited by the size of the disk. For example, we can create a `sparse file` with a size of 500GB on a disk with a size of only 256GB:

```bash
$ dd if=/dev/zero of=sparse-files.raw bs=1 count=0 seek=500GB
```

In addition to `dd`, we can also use the `ftruncate` function to create a `sparse file`:

```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

#define FILE_NAME "sparse-files.raw"
#define FILE_ERROR(expression) \
    if (expression) { \
        perror(FILE_NAME); \
        exit_code = EXIT_FAILURE; \
        goto finally; \
    }

int main() {
    char buf[BUFSIZ];
    int fd;
    int exit_code = 0;
    struct stat file_stat;
    size_t write_size = 0, current_write = 0;
    size_t buffer_size = 0, len;

    if (!access(FILE_NAME, F_OK)) {
        // file exists
        FILE_ERROR(remove(FILE_NAME));
    }

    /*
     * O_CREAT：Create the file if it does not exist.
     * O_WRONLY: Open for writing only.
     * When creating a file, set file permissions:
     * S_IRUSR: Readable by the file owner.
     * S_IWUSR: File owner writable.
     * S_IRGRP: Readable by users in the same group as the owner of the file.
     * S_IROTH: Readable by other users.
     * S_IRWXU: This is equivalent to ‘(S_IRUSR | S_IWUSR | S_IXUSR)’.
     * If no permission is set, the default value is S_IRWXU.
     */
    fd = open(FILE_NAME, O_CREAT | O_WRONLY, S_IRUSR | S_IWUSR | S_IRGRP | S_IROTH);
    FILE_ERROR(fd == -1);
    // In the file metadata, set the file size.
    FILE_ERROR(ftruncate(fd, 50 * 1024 * 1024));
    memset(&buf, 1, BUFSIZ);
    FILE_ERROR(stat(FILE_NAME, &file_stat));

    write_size = file_stat.st_size - (10 * 1024 * 1024);
    fprintf(stdout, "sparse file size: %ld mb, write size: %ld mb\n", file_stat.st_size / 1024 / 1024, write_size / 1024 / 1024);

    while (current_write < write_size) {
        buffer_size = (current_write + BUFSIZ) < write_size ? BUFSIZ : write_size - current_write;
        len = write(fd, buf, BUFSIZ);
        current_write += buffer_size;
        FILE_ERROR(len == -1);
    }

finally:
    if (fd != -1) close(fd);
    return exit_code;
}
```

Execute the program and check the file size:

```bash
$ gcc demo.c -o demo && demo
sparse file size: 50 mb, write size: 40 mb
$ du -h sparse-files.raw && ls -lh sparse-files.raw
41M	sparse-files.raw
-rw-r--r-- 1 xxx xxx 50M Aug  9 15:39 sparse-files.raw
```

<font color="red">It should be noted that it is best not to use `fwrite` in the C standard library to write data to `sparse file`, which will cause errors in the `stat.st_size` metadata of the file. The sample code is as follows.</font>

```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <sys/stat.h>

#define FILE_NAME "sparse-files.raw"
#define FILE_ERROR(expression) \
    if (expression) { \
        perror(FILE_NAME); \
        exit_code = EXIT_FAILURE; \
        goto finally; \
    }

int main() {
    char buf[BUFSIZ];
    FILE *file;
    int exit_code = 0;
    struct stat file_stat;
    size_t write_size = 0, current_write = 0;
    size_t buffer_size = 0, len;

    file = fopen(FILE_NAME, "a+");
    FILE_ERROR(!file);
    FILE_ERROR(fseek(file, 0, SEEK_SET));
    memset(&buf, 1, BUFSIZ);
    FILE_ERROR(stat(FILE_NAME, &file_stat));

    write_size = file_stat.st_size + (10 * 1024 * 1024);
    fprintf(stdout, "sparse file size: %ld mb, write size: %ld mb\n", file_stat.st_size / 1024 / 1024, write_size / 1024 / 1024);

    while (current_write < write_size) {
        buffer_size = (current_write + BUFSIZ) < write_size ? BUFSIZ : write_size - current_write;
        len = fwrite(&buf, buffer_size, 1, file);
        current_write += buffer_size;
        FILE_ERROR(len != 1);
    }

finally:
    if (file) fclose(file);
    return exit_code;
}
```

execute program:

```bash
$ dd if=/dev/zero of=sparse-files.raw bs=1 count=0 seek=50M
$ gcc demo.c -o demo && ./demo
sparse file size: 50 mb, write size: 60 mb
$ ls -lh sparse-files.raw
-rw-r--r-- 1 xxx xxx 110M Aug  9 16:37 sparse-files.raw
```

Obviously, the file size in the file metadata is directly accumulated.