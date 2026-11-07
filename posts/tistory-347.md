---
title: "[TIL] MySQL에 이모지를 저장하는 방법"
kind: "article"
permalink: "/posts/tistory-347.html"
published_on: "2023-03-05"
section: "TIL"
category: "TIL"
---

## MySQL에 이모지를 저장하는 방법

---

제로웨이스트 샵 서비스를 구현하면서 가게 설명에 이모지가 들어가는 경우가 있었다...

그런데 클라우드 타입에 MySQL을 사용하고 있는데 아래와 같은 에러가 발생하였다.

```java
Incorrect string value: '\xF0\x90\x8D\x83\xF0\x90...' for column 'content' at row 1
```

문제가 발생한 이유는 MySQL에 데이터베이스 테이블이 UTF-8을 3byte만 입력할 수 있도록 되어있는데 이모지는 4 byte를 사용해서 문제가 발생하는 것이다.

> [참고]  
> utf8mb4 는 표준 인코딩 방식이 아니며 MySQL 의 UTF-8 이 3 byte만 지원하는 문제를 해결하기 위한 땜질 처방입니다.  
> PostgreSQL 이나 Oracle, MS-SQL 등을 사용한다면 이런 문제를 고민할 필요가 없습니다.

이를 해결하기 위해 MySQL Charset을 변경해주어야한다. 로컬에서는 my.cnf 파일을 변경하여 해결할 수 있는데 데이터베이스를 직접적으로 설정하여 문제를 해결해보았다.

### **데이터베이스 생성시**

utf8mb4로 데이터베이스를 생성하면 MySQL database 생성시 character set과 collation을 utf8mb4로 해서 생성하면 된다.

```sql
CREATE DATABASE homestead CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON homestead.* TO 'homestead'@'localhost' IDENTIFIED BY 'secret';

flush privileges;
```

### **기존에 데이터베이스를 변경해야하는 경우**

기존에 만든 database 라면 encoding 을 변경해주어야 한다.

DBMS 를 사용하는 application 을 내리고 변경할 database 를 백업한 후에 아래 명령을 실행해서 인코딩을 변경합니다.

```sql
ALTER DATABASE homestead CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
```

### **my.cnf 설정**

로컬에서 일괄적으로 설정하고 싶다면 다음과 같이 설정하면 된다.

encoding handshake 없이 강제로 utf8mb4 를 사용하도록 하기 위해 mysql 서버 설정에 다음 내용을 추가하고 mysql 을 재구동하면 된다.

```sql
[mysqld]
collation-server = utf8mb4_unicode_ci
character-set-server = utf8mb4
skip-character-set-client-handshake
```

### **Java & JDBC**

Java URL에 useUnicode=true 을  추가해서도 해결할 수 있다.

```sql
jdbc:mysql://localhost:3306/your_database?useUnicode=true
```

MySQL JDBC 5.1.22(21?) 이하의 JDBC driver 를 사용할 경우 connection string 에 다음 내용 추가 필요해주어야 한다.

```sql
characterEncoding=UTF-8
```

> **필자는 기존 데이터베이스 테이블을 변경해야하기 때문에  
> 2번째 방법을 사용하여 해결하였다.  
>   
> 이모지를 저장할 때 문제가 생길 것이라 생각하지 못했지만**  
> **발생하더라도 쉽게 해결할 수 있었다!**  
>   
> **중요한 것은 문제를 해결하려는 노력만 필요할 뿐이다.**
