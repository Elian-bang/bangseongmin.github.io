---
title: "[항해99 - 7기] 하샤드 수 - 알고리즘 스터디(4D)"
kind: "article"
permalink: "/posts/tistory-87.html"
published_on: "2022-05-18"
section: "알고리즘"
category: "알고리즘 / 프로그래머스"
---

#### **#P. 28 : 제일 작은 수 제거하기 (난이도 : 중하)**

![본문 이미지](../assets/tistory/d526922948eb1be180505cd2.png)

* 풀이 방법  
  + 1. String 배열을 이용한 풀이
  + 2. 반복문을 이용한 풀이법

```
public static boolean solution(int n) {
    String[] str = String.valueOf(n).split("");
    int div = 0;
    for(String s : str){
        div += Integer.parseInt(s);
    }
    return n % div ==0 ? true:false;
}

// 401901
public static boolean solution2(int n) {
    int div = 0, x = n;
    while (n > 0){
        div += n%10;
        n/=10;
    }
    System.out.println(div);
    return x % div ==0 ? true:false;
}
```
