# fopen

Open a file.

**header file:** stdio.h

**function prototype:**

```c
FILE *fopen(const char *filename, const char *mode);
```

filename: file path.

mode: access mode. Several allowed values are as follows.

| value | describe                                                     |
| ----- | ------------------------------------------------------------ |
| r     | Opens for reading. If the file doesn't exist or can't be found, the **`fopen`** call fails. |
| r+    | Opens for both reading and writing. The file must exist.     |
| w     | Opens an empty file for writing. If the given file exists, its contents are destroyed. |
| w+    | Opens an empty file for both reading and writing. If the file exists, its contents are destroyed. |
| a     | Opens for writing at the end of the file (appending) without removing the end-of-file (EOF) marker before new data is written to the file. Creates the file if it doesn't exist. |
| a+    | Opens for reading and appending. The appending operation includes the removal of the EOF marker before new data is written to the file. The EOF marker isn't restored after writing is completed. Creates the file if it doesn't exist. |

**return value:** If successful, returns pointer to the file. Returns null on failure.

**example code:**

````c
#include <stdio.h>

int main() {
    FILE *file = fopen("demo.txt", "r+");
    int exit_code = 0;
    if (!file) {
        perror("demo.txt");
        exit_code = 1;
        goto finally;
    }
    
    ...
    
finally:
    if (file) fclose(file);
    return exit_code;
}
````

# fwrite

Write data to the file.

**header File:** stdio.h.

**function prototype:**

```c
size_t fwrite(const void *ptr, size_t size, size_t nmemb, FILE *file);
```

ptr: data memory pointer.

size: the size of the element.

nmemb: the number of elements.

file: file pointer.

**example code:**

```c
#include <stdio.h>

#define array_size 2

typeof struct People {
    char name[10];
    int age;
} People;

int main() {
    People[array_size] peoples = [{"Jack", 10}, {"Joni", 16}];
    FILE *file;
    int exit_code = 0;
    size_t len = 0;
    
    file = fopen("demo.bin", "a+");
    if (!file) {
        perror("demo.bin");
        exit_code = 1;
        goto finally;
    }
    
    len = fwrite(peopies, sizeof(People), array_size, file);
    if (len != array_size) {
        perror("demo.bin");
        exit_code = 1;
        goto finally;
    }
    
finally:
    if (file) fclose(file);
    return exit_code;
}
```

