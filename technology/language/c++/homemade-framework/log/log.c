//
// Created by aszswaz on 2021/9/18.
//

#include "include/log.h"
#include <stdio.h>
#include <time.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <stdarg.h>

/**
 * 定义日志级别，和级别名称
 */
const LogLevel LOG_DEBUG_LEVEL = {0, "DEBUG"};
const LogLevel LOG_INFO_LEVEL = {1, "INFO"};
const LogLevel LOG_WARNING_LEVEL = {2, "WARNING"};
const LogLevel LOG_ERROR_LEVEL = {3, "ERROR"};

/**
 * 给日志等级上颜色
 */
static const char *coloring(const LogLevel *logLevel) {
    size_t strLength = strlen(logLevel->name);
    size_t newStrLen = strLength + 16;
    char *newStr = malloc(newStrLen);
    memset(newStr, 0, newStrLen);

    if (logLevel->level == CD_LOG_DEBUG_LEVEL.level) {
        snprintf(newStr, newStrLen, "\033[34m%s\033[0m", logLevel->name);
    } else if (logLevel->level == CD_LOG_INFO_LEVEL.level) {
        snprintf(newStr, newStrLen, "\033[32m%s\033[0m", logLevel->name);
    } else if (logLevel->level == CD_LOG_WARNING_LEVEL.level) {
        snprintf(newStr, newStrLen, "\033[33m%s\033[0m", logLevel->name);
    } else if (logLevel->level == CD_LOG_ERROR_LEVEL.level) {
        snprintf(newStr, newStrLen, "\033[31m%s\033[0m", logLevel->name);
    } else {
        strcpy(newStr, logLevel->name);
    }
    return newStr;
}

void log(
        const LogLevel *logLevel, const char *fileName, const char *functionName, int line,
        const char *message, ...
) {
    // 日志等级过滤
    if (logLevel->level < CD_CURRENT_LOG_LEVEL.level) {
        return;
    }
    // 获得秒的时间戳
    time_t currentTime = time(NULL);
    // 格式化时间戳
    char timerStr[20];
    strftime(timerStr, 20, "%Y-%m-%d %H:%M:%S", localtime(&currentTime));

    // 判断是否为终端
    if (isatty(STDOUT_FILENO)) {
        // 是终端就给日志等级染色
        const char *levelStr = coloring(logLevel);
        fprintf(stdout, "%s [%-15s] %-80s %s %5d: ",
                (char *) &timerStr, levelStr, fileName, functionName, line);
        free((void *) levelStr);
    } else {
        fprintf(stdout, "%s [%-7s] %-80s %s %5d: ",
                (char *) &timerStr, logLevel->name, fileName, functionName, line);
    }

    // 打印消息部分
    va_list args;
    va_start(args, message);
    vfprintf(stdout, message, args);
    va_end(args);

    fprintf(stdout, "\n");
}

char *int_to_string(int number) {
    int i = 0;//指示填充number_str
    char *number_str = malloc(10);
    memset(number_str, 0, 10);

    //如果number为负数，将number变正
    if (number < 0) {
        number = -number;
        number_str[i++] = '-';
    }
    //转换
    do {
        number_str[i++] = (char) (number % 10 + 48);//取number最低位 字符0~9的ASCII码是48~57；简单来说数字0+48=48，ASCII码对应字符'0'
        number /= 10;//去掉最低位
    } while (number);//number不为0继续循环

    number_str[i] = '\0';

    //确定开始调整的位置
    int j = 0;
    //如果有负号，负号不用调整
    if (number_str[0] == '-') {
        j = 1;//从第二位开始调整
        ++i;//由于有负号，所以交换的对称轴也要后移1位
    }
    //对称交换
    for (; j < i / 2; j++) {
        //对称交换两端的值 其实就是省下中间变量交换a+b的值：a=a+b;b=a-b;a=a-b;
        number_str[j] = (char) (number_str[j] + number_str[i - 1 - j]);
        number_str[i - 1 - j] = (char) (number_str[j] - number_str[i - 1 - j]);
        number_str[j] = (char) (number_str[j] - number_str[i - 1 - j]);
    }
    return number_str;
}
