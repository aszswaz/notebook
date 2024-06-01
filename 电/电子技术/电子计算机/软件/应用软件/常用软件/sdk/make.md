# Introduction

[GNU Make](https://www.gnu.org/software/make/) is a tool which controls the generation of executables and other non-source files of a program from the program's source files.

Make gets its knowledge of how to build your program from a file called the *makefile*, which lists each of the non-source files and how to compute it from other files. When you write a program, you should write a makefile for it, so that it is possible to use Make to build and install the program.

# Basic grammar

```makefile
# Global variable definitions.
# build directory.
BUILD_DIR = build
# Build instructions. "@" means not to print the command being executed.
CC=@gcc -o3 -g3 -ggdb -Werror -Wextra
# The executable program that needs to be built.
example=$(BUILD_DIR)/example

all: $(BUILD_DIR) \
	$(example) \

$(BUILD_DIR):
	@mkdir $(BUILD_DIR)

$(example): example.c
	$(CC) $< -o $@

# Usually because of the need for incremental compilation, the name of the rule is associated with the filename entry. Take the "clean" rule as an example, it is used to delete the files generated when building the project, it does not need to have a file association, but if there is a file or folder named "clean" in the root directory of the project, this rule will fail to execute. We need to declare via ".PHONY" that the "clean" rule does not need to be associated with the file.
.PHONY: clean
clean:
	@rm -rf $(BUILD_DIR)
```

