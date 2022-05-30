//
// Created by aszswaz on 2021/9/18.
//

#ifndef CONQUER_DOCKER_CD_LOG_H
#define CONQUER_DOCKER_CD_LOG_H

/**
 * 程序当前的log等级
 */
#define CURRENT_LOG_LEVEL CD_LOG_INFO_LEVEL

/**
 * 定义各个日志级别的宏调用
 */
#define LOG_DEBUG(...) cd_log(&CD_LOG_DEBUG_LEVEL, __FILE__, __FUNCTION__, __LINE__, __VA_ARGS__)
#define LOG_INFO(...) cd_log(&CD_LOG_INFO_LEVEL, __FILE__, __FUNCTION__, __LINE__, __VA_ARGS__)
#define LOG_WARNING(...) cd_log(&CD_LOG_WARNING_LEVEL, __FILE__, __FUNCTION__, __LINE__, __VA_ARGS__)
#define LOG_ERROR(...) cd_log(&CD_LOG_ERROR_LEVEL, __FILE__, __FUNCTION__, __LINE__, __VA_ARGS__)

/**
 * log等级
 */
typedef struct LogLevel {
    /**
     * 级别
     */
    const char level;
    /**
     * 级别名称
     */
    const char *name;
} LogLevel;

/**
 * 定义log的级别和级别名称
 */
extern const LogLevel CD_LOG_DEBUG_LEVEL;
extern const LogLevel CD_LOG_INFO_LEVEL;
extern const LogLevel CD_LOG_WARNING_LEVEL;
extern const LogLevel CD_LOG_ERROR_LEVEL;

/**
 * 打印log
 */
void log(
      const LogLevel *logLevel, const char *fileName, const char *functionName, int line,
      const char *message, ...
);

/**
 * 数值转换为字符串
 */
char *int_to_string(int number);

#endif //CONQUER_DOCKER_CD_LOG_H
