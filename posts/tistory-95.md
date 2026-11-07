---
title: "[항해99 - 7기] 문자열 내림차순으로 배치하기 - 알고리즘 스터디(5D)"
kind: "article"
permalink: "/posts/tistory-95.html"
published_on: "2022-05-18"
section: "알고리즘"
category: "알고리즘 / 프로그래머스"
---

#### **#P. 36: 문자열 내림차순으로 배치하기 (난이도 : 중)**

![본문 이미지](../assets/tistory/2e3fdaae9ef500dd0e8518ff.png)

프로그래머스 - 연습문제 :&nbsp;문자열 내림차순으로 배치하기

* 풀이 방법  
  + 1.Array.sort를 이용한 방법

```
public static String solution(String s) {
    String[] str = s.split("");

    Arrays.sort(str, Comparator.reverseOrder());
    StringBuilder sb = new StringBuilder();
    for (String c: str) {
        sb.append(c);
    }
    return sb.toString();
}
```
