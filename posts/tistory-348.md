---
title: "[Trouble Shooting] MySQL 테이블 강제 삭제"
kind: "article"
permalink: "/posts/tistory-348.html"
published_on: "2023-03-10"
section: "트러블슈팅"
category: "트러블슈팅"
---

![본문 이미지](../assets/tistory/537dcdb0e69a067c114ca2f0.gif)

## MySQL 테이블 강제 삭제

사이드 프로젝트를 진행하면서 재미있는 것은 날씨처럼 매번 바뀐다... 

연관관계가 A에서 A`가 되고 A`가 B가 되기도 한다... B가 어느 순간 필요하지 않을 때가 발생한다...

기획의 중요성을 다시한번 느끼게 되었다.. 

![본문 이미지](../assets/tistory/bb9a997d885a17b8ffba0b7b.gif)

### **What?**

서비스 로직이 변동되면서 도메인 구조를 변경하였다. 그런데 자동으로 반영되서 새로 만들어지겠지? 라는 생각으로 개발을 하였는데 그렇지 않고... 변경 이전에 도메인이 유지되고 있었다. 추가된 필드는 추가되고 필요하지 않는 필드가 여전히 남아있었다...

테이블을 삭제하고 다시해야지 했는데... 외래키때문에 삭제하지 못한다는 에러가 발생하였다...

```sql
mysql> DELETE TABLE [테이블명] or TRUNCATE [테이블명]

ERROR 1217 (23000): Cannot delete or update a parent row: a foreign key constraint fails
```

### How?

해당 원인의 문제는 MySQL에서 위험하니까 안돼! 되돌릴 수 없는 강을 건너지마! 라고 경고를 해주는 것이다..

**나는 위험하지 않고 필요하지 않으니까 삭제해줘!** 라는 강단이 필요하다.

```sql
// 1. 체크 해제
mysql> SET foreign_key_checks = 0

// 2. 테이블 삭제
mysql> DROP TABLE [테이블명]

// 3. 다시 체크 설정
mysql> SET foreign_key_checks = 1;
```

![본문 이미지](../assets/tistory/9cf433a0035b49d549af531c.gif)
