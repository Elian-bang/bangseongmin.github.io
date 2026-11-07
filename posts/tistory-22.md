---
title: "[백준 - 1일차] 14681번 - 사분면 고르기(자바)"
kind: "article"
permalink: "/posts/tistory-22.html"
published_on: "2022-04-07"
section: "알고리즘"
category: "알고리즘 / 백준"
---

* **문제**

![본문 이미지](../assets/tistory/b5ef2efb4ec2b398341080c8.png)

---

* **간단 설명**

**1. X, Y 좌표를 입력받아 사분면을 고르는 문제입니다.**

**혹시.. 기억 안나신다고요??!! 그래서 제가 준비했습니다!!**

**- 1사분면 : X > 0, Y > 0**

**- 2사분면 : X < 0, Y > 0**

**- 3사분면 : X > 0, Y < 0**

**- 4사분면 : X < 0, Y <0**

**2) 순서**

**(1 단계) X, Y값을 입력받는다.**

**(2 단계) 입력된 X, Y값에 따라 사분면을 출력한다.**

* **풀이**

**- 방법 1(Scanner)**

![본문 이미지](../assets/tistory/424023a80afcca22d10a77c9.png)

**- 방법 2(BufferedReader)**

![본문 이미지](../assets/tistory/7f3c2ef310e4d739e1d06ed8.png)

* **성능 비교**

**방법 1 - 204ms**

**방법 2 - 124ms**

![본문 이미지](../assets/tistory/babf2f413e51b2f9da740d12.png)

* **정리**

**작성하면서 느낀것은 성능이 고정되어 가는 느낌이네요ㅎㅎ**
