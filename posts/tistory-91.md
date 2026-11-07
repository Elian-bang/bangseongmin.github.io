---
title: "[항해99 - 7기] 두 개 뽑아서 더하기 - 알고리즘 스터디(5D)"
kind: "article"
permalink: "/posts/tistory-91.html"
published_on: "2022-05-18"
section: "알고리즘"
category: "알고리즘 / 프로그래머스"
---

#### **#P. 32: 두 개 뽑아서 더하기 (난이도 : 중)**

![본문 이미지](../assets/tistory/51f78c67ebb1beca0298ed6a.png)

프로그래머스 - 연습문제 : 두 개 뽑아서 더하기

* 풀이 방법  
  + 1. HashSet
  + 2. ArrayList
  + 3. 배열을 이용한 방법

```
public static int[] solution(int[] numbers) {
    // numbers의 길이는 2 이상 100 이하
    Set<Integer> set = new HashSet<>();
    Arrays.sort(numbers);
    for(int i=0; i<numbers.length-1;i++){
        for(int j=i+1; j<numbers.length;j++){
            int val = numbers[i] + numbers[j];
            if(!set.contains(val))
                set.add(numbers[i] + numbers[j]);
        }
    }

    return set.stream().sorted().mapToInt(i->i).toArray();
}

public static int[] solution2(int[] numbers){
    ArrayList<Integer> list = new ArrayList<>();
    for(int i=0; i<numbers.length;i++){
        for(int j=i+1; j<numbers.length;j++){
            int val = numbers[i] + numbers[j];
            if(!list.contains(val))
                list.add(numbers[i] + numbers[j]);
        }
    }
    Collections.sort(list);
    return list.stream().mapToInt(i->i).toArray();
}

public static int[] solution3(int[] numbers){
    int[] answer = new int[numbers.length+1];
    int idx = 0;
    for(int i=0; i<numbers.length;i++){
        for(int j=i+1; j<numbers.length;j++){
            int val = numbers[i] + numbers[j];
            if(Arrays.stream(answer).anyMatch(value -> value != val))
                answer[idx++] = val;
        }
    }
    Arrays.sort(answer);
    return answer;
}
```
