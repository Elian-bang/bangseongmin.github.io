---
title: "[항해99 - 7기] 내적 - 알고리즘 스터디(3D)"
kind: "article"
permalink: "/posts/tistory-69.html"
published_on: "2022-05-17"
section: "알고리즘"
category: "알고리즘 / 프로그래머스 / 배열·문자열"
---

**#P. 15 : 내적  (난이도 : 중하)**

* 이 문제는 정수형 배열의 곱의 합을 계산하는 문제이다.
* 다른 문제들에 비해 간단한 문제이다.

![본문 이미지](../assets/tistory/1123cb1e4f13a1c26240daca.png)

프로그래머스 - 연습문제 : 내적

```
public static int solution(int[] a, int[] b) {
    int sum = 0;
    for(int i=0; i<a.length;i++){
        sum += a[i] * b[i];
    }
    return sum;
}
```
