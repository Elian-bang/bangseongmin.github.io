---
title: "[항해99 - 7기] 제일 작은 수 제거하기- 알고리즘 스터디(4D)"
kind: "article"
permalink: "/posts/tistory-85.html"
published_on: "2022-05-18"
section: "알고리즘"
category: "알고리즘 / 프로그래머스 / 배열·문자열"
---

#### **#P. 26 : 제일 작은 수 제거하기 (난이도 : 중하)**

#### 

![본문 이미지](../assets/tistory/98c171d00e81478c4f5cf537.png)

#### 

* 풀이 방법  
  + 1. Arrays클래스 이용
  + 2. 반복문을 이용한 풀이법

```
public static int[] solution(int[] arr) {
    if (arr.length <= 1) return new int[]{-1};
    int min = Arrays.stream(arr).min().getAsInt();
    return Arrays.stream(arr).filter(i -> i != min).toArray();
}

public static int[] solution1(int[] arr) {
    int min = arr[0];
    int[] answer = new int[arr.length - 1];

    if (arr.length <= 1) {
        int[] answer2 = { -1 };
        return answer2;
    }


    for (int i = 0; i < arr.length; i++) {

        if (min > arr[i]) {
            min = arr[i];
        }

    }
    int index = 0;
    for (int j = 0; j < arr.length; j++) {
        if (min == arr[j]) {
            continue;
        } else {
            answer[index++] = arr[j];
        }

    }


    return answer;
}
```

####
