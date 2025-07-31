# Introduction

The `exec` function os used to load and execute instruactions in an executable file, and is usually used in conjunction with `fork`.

man page: [https://man7.org/linux/man-pages/man3/exec.3.html](https://man7.org/linux/man-pages/man3/exec.3.html)

# Function prototype

```c
#include <unistd.h>

int execl(const char *pathname, const char *arg, .../*, (char *) NULL*/);
int execlp(const char *file, const char *arg, .../*, (char *) NULL*/);
int execle(const char *pathname, const char *arg, .../*, (char *) NULL, char *const envp[]*/);
int execv(const char *pathname, char *const argv[]);
int execvp(const char *file, char *const argv[]);
int execvpe(const char *file, char *const argv[], char *const envp[]);
```

# Principle

The exec() family of functions replaces the current process with a new one. The program has a new stack, heap, initialized or uninitialized data segment.

# Example

Create a child process and establish the pipe.

```c
#include "utils.h"
#include <unistd.h>

#define STAND_ERROR(experssion, prefix) \
    if (experssion) { \
        perror(prefix); \
        return EXIT_FAILURE; \
    }

int main(int argc, char *const *argv) {
    const char *shell;
    pid_t sub_pid;
    int code;
    int pipefd[2];
    int errpipe[2];
    char buff[BUFSIZ];

    // Create pipe.
    STAND_ERROR(pipe(pipefd) == -1, "pipe");
    STAND_ERROR(pipe(errpipe) == -1, "error pipe");
    printf("father pid: %d\n", getpid());
    shell = login_shell();
    printf("father: login shell: %s\n", shell);
    sub_pid = fork();
    STAND_ERROR(sub_pid == -1, "fork");

    if (sub_pid == 0) {
        close(STDIN_FILENO);
        close(STDOUT_FILENO);
        close(STDERR_FILENO);

        // Redirect pipe.
        STAND_ERROR(dup2(pipefd[0], STDIN_FILENO), "dup2 pipefd[0]");
        STAND_ERROR(dup2(pipefd[1], STDOUT_FILENO), "dup2 pipefd[1]");
        STAND_ERROR(dup2(errpipe[1], STDERR_FILENO), "dup2 errpipe[1]");

        close(pipefd[0]);
        close(pipefd[1]);
        close(errpipe[0]);
        close(errpipe[1]);

        STAND_ERROR(execl(shell, shell, "-c", "echo \"$0 pid: $$\" 1>&2", NULL), "");
    } else {
        close(errpipe[1]);

        printf("father: son pid: %d\n", sub_pid);
        // Read the information sent by the child process through the pipe.
        read(errpipe[0], buff, BUFSIZ);
        printf("father: son message: %s\n", buff);
    }

    return EXIT_SUCCESS;
}
```

