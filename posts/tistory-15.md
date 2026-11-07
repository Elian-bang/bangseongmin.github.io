---
title: "[백준] 10926번 - ??! (자바)"
kind: "article"
permalink: "/posts/tistory-15.html"
published_on: "2022-04-07"
section: "학습 기록"
category: "학습 기록 / 백준"
---

* **문제**

![본문 이미지](../assets/tistory/75e407e96e34c01d59f36184.png)

* **간략설명**

**- 입력된 문장에 "??!" 문자열을 연결시키는 문제입니다.**

* **풀이**

**- 방법 1(Scanner 클래스)**

![본문 이미지](../assets/tistory/d4fa3d4ca1aa17f669ebd5b1.png)

**- 방법2(BufferedReader와 StringBuilder)**

**StringBuilder 을 사용한 이유는 String은 불변의 속성을 갖는다는 점입니다.**

**StringBuilder은 가변으로 값을 할당할 수 있기 때문에 사용하였습니다.**

![본문 이미지](../assets/tistory/28392fcd0671ab75650b1491.png)

**아래와 같이 방법1과 방법2는 성능차이가 큰 것을 보실 수 있습니다.**

**방법 1은 204ms**

**방법 2은 136ms**

![본문 이미지](../assets/tistory/469cf6a7aa646b6a076faa6a.png)

* **정리**

**모르고 작성하면 모르겠지만 알고 나면 달라지는 코딩 행복합니다!**

* **참고**

![본문 이미지](../assets/tistory/66f9faab9ba1a5ca7372f5ff.png)

**출처 :<https://ifuwanna.tistory.com/221>**
