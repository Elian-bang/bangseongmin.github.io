---
title: "[항해99 - 7기] 같은 숫자는 싫어 - 알고리즘 스터디(5D)"
kind: "article"
permalink: "/posts/tistory-90.html"
published_on: "2022-05-18"
section: "학습 기록"
category: "학습 기록 / 프로그래머스"
---

#### **#P. 31: 같은 숫자는 싫어 (난이도 : 중)**

![본문 이미지](../assets/tistory/ecc4789b77ff6b605a9952c1.png)

프로그래머스 - 연습문제 : 같은 숫자는 싫어

* 풀이 방법  
  + 1. ArrayList을 이용한 풀이

```
public static int[] solution(int[] arr) {
    int[] answer = {};
    ArrayList<Integer> list = new ArrayList<Integer>();

    int value = -1;
    for(int i=0; i<arr.length;i++){
        if(arr[i] != value){
            list.add(arr[i]);
            value = arr[i];
        }
    }

    answer = new int[list.size()];
    for (int i=0; i<answer.length;i++){
        answer[i] = list.get(i);
    }

    return answer;
}
```
