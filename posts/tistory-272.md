---
title: "[DB] PostSQL 설치"
kind: "article"
permalink: "/posts/tistory-272.html"
published_on: "2022-12-14"
section: "데이터베이스"
category: "데이터베이스"
---

![본문 이미지](../assets/tistory/3e0558ce569c8d0b912704d8.png)

### **PostgreSQL 설치**

---

1. 공식 홈페이지에서 Download 버튼을 클릭한다.

[![본문 이미지](../assets/tistory/6bb2ed5d6b485b1e6263ccea.png)](https://www.postgresql.org/)

2. 본인 PC에 맞는 OS를 선택한다.

![본문 이미지](../assets/tistory/aea7b8b2935db3e1f193c087.png)

3. Download the installer 클릭

![본문 이미지](../assets/tistory/6806e7c72ae858eeb5fd2017.png)

4. 원하는 버전을 선택하여 설치한다.

![본문 이미지](../assets/tistory/fee04a06915b4124eb2d2855.png)

5. 설치 과정

![본문 이미지](../assets/tistory/ce1692134b7af982c2a7d7e3.png)

![본문 이미지](../assets/tistory/59843062fd2b4b6375991d12.png)

![본문 이미지](../assets/tistory/7a4a126ad0ec426c86fc5a6c.png)

6. SQL Shell을 사용하여 PostgreSQL 접속

![본문 이미지](../assets/tistory/ad08614ba5c2971946e145b2.png)

다음과 같이 Shell CLI가 뜨게된다.

![본문 이미지](../assets/tistory/c8cc50e9d1ace305d4b263ca.png)

* Server 는 별도의 서버가 아닌 자신의 로컬호스트 이므로 Enter키를 입력한다.
* Database 의 이름은 기본으로 제공하는 postgres에 접속할 것이기 때문에 Enter키를 입력한다.
* Port 번호는 설치시 PostgreSQL의 기본포트인 5432 포트로 설정하였기 때문에 Enter키를 입력한다.
* Username 은 현재 관리자계정인 postgres만 존재하므로 postgres 아이디로 접속하기 위해 Enter키를 입력한다.
* postgres 사용자의 암호는 설치시 관리자계정인 postgres의 암호로 postgres로 설정하였으므로 postgres를 입력한다

로그인이 성공하면 다음과 같은 화면이 뜨게 될 것이다.

![본문 이미지](../assets/tistory/40fee85432d9826b545cccd0.png)

> select \* from pg\_tables; // 현재 postgres 데이터베이스에 있는 테이블 조회

![본문 이미지](../assets/tistory/bc4c7282bd6f8c4688bccf52.png)

7. pgAdmin4을 사용하여 PostgreSQL 접속

1. pgAdmin4 프로그램 실행

![본문 이미지](../assets/tistory/ef6d13c3c697c5c121ced7a1.png)

2. 비밀번호를 입력한다.

![본문 이미지](../assets/tistory/27307c9bbc66cd7627345771.png)

3. 비밀번호를 입력하면 정상적으로 접속이 가능하다.

![본문 이미지](../assets/tistory/027494a720049195b9c4f043.png)

4. Databases에 데이터베이스를 선택하고 Tools에 Query Tool을 선택

![본문 이미지](../assets/tistory/390fb04a1acfd86444230801.png)

5. 테스트 쿼리를 실행한다(F5 또는 ▶을 선택)

![본문 이미지](../assets/tistory/67a037b50f979ee53662b3c8.png)
