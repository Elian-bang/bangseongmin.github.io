---
title: "[SQL] MySQL에서 MUL이란 무엇이며 어떻게 설정할까?"
kind: "article"
permalink: "/posts/tistory-266.html"
published_on: "2022-12-10"
section: "컴퓨터 과학"
category: "컴퓨터 과학"
---

## **MUL KEY**

![본문 이미지](../assets/tistory/3c926472c730871b5f7ab68f.png)

---

### **MUL KEY는 무엇일까?**

MySQL에 [공식 문서](https://dev.mysql.com/doc/refman/8.0/en/show-columns.html)에 따르면 다음과 같이 설명되어있다.

> **If Key is MUL, the column is the first column of a nonunique index in which multiple occurrences of a given value are permitted within the column.**

유니크하지 않은 인덱스(=중복 가능)의 첫번째 컬럼을 나타낸다고 합니다. 

보통은 외래키(FK)일 것이고, 여러 열을 묶어서 Unique 인덱스를 구성한 경우 그 인덱스 자체는 중복이 불가능하지만 인덱스를 구성하는 각각의 컬럼을 중복된 값을 가질 수 있다면 MUL이 된다.

만약 Key가 PRI, UNI, MUL이 중복되어 해당된다면 PRI > UNI > MUL 순에 우선순위를 갖는다고 한다.

### **MUL KEY는 어떻게 설정할까?**

INDEX를 설정하면 MUL로 표시할 수 있다.

즉 INDEX를 생성하면 된다.

#### **인덱스**

> 인덱스(index)는  테이블의 동작속도(조회)를 높여주는 자료구조로 테이블에서 원하는 데이터를 쉽고 빠르게 찾기 위해 사용합니다. 이러한 인덱스는 자주 사용되는 필드 값으로 만들어진 원본 테이블의 사본이라고 생각할 수 있습니다.  
>   
> MySQL은 데이터를 검색할 때 첫 번째 필드부터 차례대로 테이블 전체를 검색합니다.  
> 따라서 테이블이 크면 클수록 데이터를 탐색하는 시간도 많이 늘어나게 됩니다.  
>    
> 하지만 인덱스를 사용하면 테이블 전체를 읽지 않아도 되므로, 검색과 질의에 대한 처리가 빠르게 이루어집니다.  
> 이러한 인덱스는 사용자가 직접 접근할 수는 없으며, 검색과 질의에 대한 처리에서만 사용됩니다.  
>    
> 이렇게 인덱스가 설정된 필드 값을 포함한 데이터의 삽입, 삭제, 수정 작업이 원본 테이블에서 이루어질 경우, 인덱스도 함께 수정되어야 합니다. 따라서 인덱스가 설정된 테이블의 처리 속도가 느려질 수 있습니다.  
>   
> **인덱스는 수정보다는 검색이 자주 사용되는 테이블에서 사용하는 것이 더 좋습니다.**

---

#### **인덱스 특징**

인덱스는 하나 혹은 여러 개의 컬럼에 대해 설정할 수 있다. (단일 여러개 또는 여러컬럼을 묶어 복합인덱스)

WHERE절을 사용하지 않고 인덱스가 걸린 컬럼을 조회하는 것은 성능에 아무런 영향이 없다.

---

#### **ORDER BY와 GROUP BY에 대한 INDEX**

INDEX는 ORDER BY와 GROUP BY에도 영향을 끼치는데 다음과 같은 경우에는 INDEX를 타지 않는다.

* **ORDER BY 인덱스컬럼1, 컬럼2 :** 복수의 키에 대해서 ORDER BY를 사용한 경우
* **WHERE 컬럼1=`값` ORDER BY 인덱스 컬럼 :** 연속하지 않은 컬럼에 대해 ORDER BY를 실행한 경우
* **ORDER BY 인덱스컬럼1 DESC, 인덱스컬럼2 ASC :** DESC와 ASC를 혼합해서 사용한 경우
* **GROUP BY 컬럼1 ORDER BY 컬럼2 :** GROUP BY와 ORDER BY의 컬럼이 다른 경우
* **ORDER BY ABS(컬럼) :** ORDER BY 절에 다른 표현을 사용한 경우

---

#### **다중 컬럼 인덱스**

다중 컬럼 인덱스는 **두개 이상의 필드를 조합해서 생성한 INDEX**이다. 1번째 조건과 이를 만족하는 2번째 조건을 함께 INDEX해서 사용한다. (MySQL은 INDEX에 최대 15개 컬럼으로 구성 가능)

다중 컬럼 인덱스는 **단일 컬럼 인덱스 보다 더 비효율적으로 INDEX/UPDATE/DELETE를 수행하기 때문에 신중**해야한다.

때문에 가급적 UPDATE가 안되는 값을 선정해야한다.

---

#### **단일인덱스와 다중 컬럼 인덱스의 차이점**

**단일 인덱스**

```sql
CREATE TABLE table(
    id INT(10) NOT NULL auto_increment,
    uid VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    PRIMARY KEY('id'),
    key idx_name(name),
    key idx_address(address)
)
```

**다중 인덱스**

```sql
CREATE TABLE table(
    id INT(10) NOT NULL auto_increment,
    uid VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    PRIMARY KEY('id'),
    key idx_name(name, address)    
)
```

**예시 1**

```sql
SELECT * FROM table WHERE name='강호동' AND address='마산시';
```

**단일 인덱스에 경우** 각각 컬럼(name),(address)에 INDEX가 걸려있기 때문에 MySQL은 name컬럼과 address컬럼을 보고 둘 중에 어떤 컬럼의 수가 더 빠르게 검색되는지 판단 후 빠른쪽을 먼저 검색하고 그 다음 다른 컬럼을 검색하게 된다.

**다중 인덱스에 경우** 바로 원하는 값을 찾는데 그 이유는 INDEX를 저장할 때 name과 address를 같이 저장하기 때문이다. 즉, name과 address의 값을 같이 색인하고 검색에서도 '강호동마산시'로 검색을 시도하게 된다.

이렇게 사용할 경우 단일인덱스보다 다중 인덱스가 더 빠른 검색을 할 수 있다. 그렇지만 다중 컬럼 인덱스를 아래와 같이 사용하면 INDEX를 타지 않는다.

**예시 2**

```sql
SELECT * FROM table WHERE address='마산시';
```

이 경우에는 다중 컬럼 인덱스로 설정되어 있던 name이 함께 검색이 되지 않으므로 INDEX의 효과를 볼 수가 없다.   

하지만 **조건값을 name='강호동'으로 준다면 B\*Tree 자료구조 탐색으로 인해 name컬럼은 인덱스가 적용된다.**

예를들어 key idx\_name(name, address, age) 일때 WHERE name = ? AND address = ? 는 인덱스가 적용되지만 WHERE name = ? AND age = ? 에서 age 컬럼은 인덱스 적용이 되지 않는다.   

**다중 컬럼 인덱스를 사용할 때는 INDEX로 설정해준 제일 왼쪽컬럼이 WHERE절에 사용되어야 한다.**

---

#### **⭐설계 방법 팁!**

* 무조건 많이 설정하지 않는다. (한 테이블당 3~5개가 적당 목적에 따라 상이)
* 조회시 자주 사용하는 컬럼
* 고유한 값 위주로 설계
* 카디널리티가 높을 수록 좋다 (= 한 컬럼이 갖고 있는 중복의 정도가 낮을 수록 좋다.)
* INDEX 키의 크기는 되도록 작게 설계
* PK, JOIN의 연결고리가 되는 컬럼
* 단일 인덱스 여러 개 보다 다중 컬럼 INDEX 생성 고려
* UPDATE가 빈번하지 않은 컬럼
* JOIN시 자주 사용하는 컬럼
* INDEX를 생성할 때 가장 효율적인 자료형은 정수형 자료(가변적 데이터는 비효율적)

---

#### **인덱스 문법**

**인덱스 생성**

```sql
# 단일 인덱스
CREATE INDEX 인덱스이름 ON 테이블이름(필드이름1)

# 다중 컬럼 인덱스
CREATE INDEX 인덱스이름 ON 테이블이름(필드이름1, 필드이름2, ...)
```

**인덱스 조회**

```sql
SHOW INDEX FROM 테이블이름
```

**UNIQUE 인덱스 생성(중복 값을 허용하지 않는 인덱스)**

```sql
# 단일 인덱스
CREATE UNIQUE INDEX 인덱스 이름 ON 테이블이름(필드이름1)

# 다중 컬럼 인덱스
CREATE UNIQUE INDEX 인덱스 이름 ON 테이블이름(필드이름1, 필드이름2, ...)
```

**인덱스 정렬(인덱스 생성 시점에 필드의 정렬방식 설정)**

```sql
CREATE INDEX 인덱스이름 ON 테이블이름 (필드이름 DESC)
CREATE INDEX 인덱스이름 ON 테이블이름 (필드이름 ASC)
```

**인덱스 삭제**

```sql
ALTER TABLE 테이블이름 DROP INDEX 인덱스이름;
```

**인덱스 수정**

```sql
ALTER TABLE 테이블이름 ADD (UNIQUE)INDEX 인덱스이름(컬럼명1, 컬럼명2...);
```
