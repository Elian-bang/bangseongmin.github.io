---
title: "[항해99 - 7기] 정수 제곱근 판별- 알고리즘 스터디(4D)"
kind: "article"
permalink: "/posts/tistory-84.html"
published_on: "2022-05-18"
section: "알고리즘"
category: "알고리즘 / 프로그래머스"
---

#### **#P. 25 : 정수 제곱근 판별 (난이도 : 중하)**

![본문 이미지](../assets/tistory/0b6196e68ae7038277c5a456.png)

* 풀이 방법  
  + 1. Math.sqrt와 Math.pow 활용

```
public static long solution(long n) {
    Double d = Math.sqrt(n);
    return d.intValue() == d ? (long) Math.pow(d + 1, 2):-1;
}
```
