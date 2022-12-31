# 查询各班分数最高的学生，如果一个班级中出现多名学生都是最高分，则一同获取

首选准备数据表和数据：

```mysql
# 准备题目所需的数据表和数据

# 班级
CREATE TABLE class (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL COMMENT '班级名称'
) AUTO_INCREMENT = 10000
  CHARSET = 'utf8mb4';

# 学生
CREATE TABLE student (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  class_id BIGINT NOT NULL COMMENT '班级 ID',
  name VARCHAR(255) NOT NULL COMMENT '学生姓名',
  age TINYINT UNSIGNED NOT NULL COMMENT '学生年龄',

  FOREIGN KEY (class_id) REFERENCES class(id) ON DELETE RESTRICT ON UPDATE CASCADE
) AUTO_INCREMENT = 10000
  CHARSET = 'utf8mb4';

# 成绩
CREATE TABLE score (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL COMMENT '学生 ID',
  score INT UNSIGNED NOT NULL COMMENT '学生成绩',

  FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE RESTRICT ON UPDATE CASCADE
) AUTO_INCREMENT = 10000
  CHARSET = 'utf8mb4';

# TODO: 插入数据
INSERT INTO class (id, name) VALUES
    (10001, '五年级 1 班'),
    (10002, '五年级 2 班'),
    (10003, '五年级 3 班');

# 一班学生
INSERT INTO student (id, class_id, name, age) VALUES
    (10001, 10001, '张三', 22),
    (10002, 10001, '李四', 22),
    (10003, 10001, '王五', 22),
    (10004, 10001, '老六', 22),
    (10005, 10001, '权秒可', 22),
    (10006, 10001, '朱白枫', 22);

# 二班学生
INSERT INTO student (id, class_id, name, age) VALUES
    (10007, 10002, '封可言', 22),
    (10008, 10002, '黎慕灵', 22),
    (10009, 10002, '许常红', 22),
    (10010, 10002, '张幼男', 22),
    (10011, 10002, '蒲秀媚', 22),
    (10012, 10002, '桂香露', 22);

# 三班学生
INSERT INTO student (id, class_id, name, age) VALUES
    (10013, 10003, '方熙熙', 22),
    (10014, 10003, '宋平霞', 22),
    (10015, 10003, '寇歌玲', 22),
    (10016, 10003, '庾若云', 22),
    (10017, 10003, '邵欣合', 22),
    (10018, 10003, '杨元灵', 22);

# 学生成绩
INSERT INTO score (student_id, score) VALUES
    (10001, 02),
    (10002, 16),
    (10003, 92),
    (10004, 92),
    (10005, 01),
    (10006, 69),
    (10007, 07),
    (10008, 78),
    (10009, 91),
    (10010, 55),
    (10011, 81),
    (10012, 40),
    (10013, 36),
    (10014, 62),
    (10015, 42),
    (10016, 20),
    (10017, 43),
    (10018, 26);
```

本次解题为了逻辑清晰明了，采用临时表缓存数据，解决方案如下：

```mysql
# 解答

# 获取三个表的全局数据
CREATE TEMPORARY TABLE tmp_data SELECT
    c.id as 'class_id',
    c.name as 'class',
    s1.id as 'student_id',
    s1.name as 'name',
    s1.age as 'age',
    s2.score as 'score'
    FROM class c
    INNER JOIN student s1 ON c.id = s1.class_id
    INNER JOIN score s2 ON s2.student_id = s1.id;

# 获取每个班级最高成绩
CREATE TEMPORARY TABLE tmp_highest_score SELECT
    d.class_id, MAX(d.score) AS score
    FROM tmp_data d
    GROUP BY d.class_id;

# 获取对应的学生信息
SELECT
    d.class AS class,
    d.name AS name,
    d.age AS age,
    d.score AS score
    FROM tmp_data d
    INNER JOIN tmp_highest_score hs ON d.score = hs.score AND d.class_id = hs.class_id;

DROP TABLE tmp_data;
DROP TABLE tmp_highest_score;
```

执行结果如下

```txt
class               name      age   score
五年级 1 班    王五        22      92
五年级 1 班    老六        22      92
五年级 2 班    许常红    22      91
五年级 3 班    宋平霞    22      62
```

