---
title: "[프로그래머스] 신고 결과 받기"
kind: "article"
permalink: "/posts/tistory-155.html"
published_on: "2022-09-16"
section: "알고리즘"
category: "알고리즘 / 프로그래머스 / 구현·시뮬레이션"
---

#### 문제 : 2022 KAKAO BLIND RECRUITMENT - 신고 결과 받기

**문제 설명**

신입사원 무지는 게시판 불량 이용자를 신고하고 처리 결과를 메일로 발송하는 시스템을 개발하려 합니다. 무지가 개발하려는 시스템은 다음과 같습니다.

* 각 유저는 한 번에 한 명의 유저를 신고할 수 있습니다.
  + 신고 횟수에 제한은 없습니다. 서로 다른 유저를 계속해서 신고할 수 있습니다.
  + 한 유저를 여러 번 신고할 수도 있지만, 동일한 유저에 대한 신고 횟수는 1회로 처리됩니다.
* k번 이상 신고된 유저는 게시판 이용이 정지되며, 해당 유저를 신고한 모든 유저에게 정지 사실을 메일로 발송합니다.
  + 유저가 신고한 모든 내용을 취합하여 마지막에 한꺼번에 게시판 이용 정지를 시키면서 정지 메일을 발송합니다.

다음은 전체 유저 목록이 ["muzi", "frodo", "apeach", "neo"]이고, k = 2(즉, 2번 이상 신고당하면 이용 정지)인 경우의 예시입니다.

![본문 이미지](../assets/tistory/4e6b8d7fefb89fcf3ad25ed3.png)

각 유저별로 신고당한 횟수는 다음과 같습니다.

![본문 이미지](../assets/tistory/da67e6eb9f36e276dc565b59.png)

위 예시에서는 2번 이상 신고당한 "frodo"와 "neo"의 게시판 이용이 정지됩니다. 이때, 각 유저별로 신고한 아이디와 정지된 아이디를 정리하면 다음과 같습니다.

![본문 이미지](../assets/tistory/03b8858b9c94e058648e6251.png)

따라서 "muzi"는 처리 결과 메일을 2회, "frodo"와 "apeach"는 각각 처리 결과 메일을 1회 받게 됩니다.   

이용자의 ID가 담긴 문자열 배열 id\_list, 각 이용자가 신고한 이용자의 ID 정보가 담긴 문자열 배열 report, 정지 기준이 되는 신고 횟수 k가 매개변수로 주어질 때, 각 유저별로 처리 결과 메일을 받은 횟수를 배열에 담아 return 하도록 solution 함수를 완성해주세요.

**제한사항**

* 2 ≤ id\_list의 길이 ≤ 1,000
  + 1 ≤ id\_list의 원소 길이 ≤ 10
  + id\_list의 원소는 이용자의 id를 나타내는 문자열이며 알파벳 소문자로만 이루어져 있습니다.
  + id\_list에는 같은 아이디가 중복해서 들어있지 않습니다.
* 1 ≤ report의 길이 ≤ 200,000
  + 3 ≤ report의 원소 길이 ≤ 21
  + report의 원소는 "이용자id 신고한id"형태의 문자열입니다.
  + 예를 들어 "muzi frodo"의 경우 "muzi"가 "frodo"를 신고했다는 의미입니다.
  + id는 알파벳 소문자로만 이루어져 있습니다.
  + 이용자id와 신고한id는 공백(스페이스)하나로 구분되어 있습니다.
  + 자기 자신을 신고하는 경우는 없습니다.
* 1 ≤ k ≤ 200, k는 자연수입니다.
* return 하는 배열은 id\_list에 담긴 id 순서대로 각 유저가 받은 결과 메일 수를 담으면 됩니다.

**입출력 예**

![본문 이미지](../assets/tistory/c3c0d2fbfc889ddb396a72bf.png)

**문제 풀이**

k 이상 신고받은 사람을 기준으로 신고한 사람과 신고 받은 사람에게 보낼 메시지 수를 배열로 반환하는 문제이다.

```java
import java.util.*;

class Solution {
    public int[] solution(String[] id_list, String[] report, int k) {
        int[] answer = new int[id_list.length];

        // 1. 중복 제거
        HashSet<String> reportSet = new HashSet<String>();
        for(String rep : report) reportSet.add(rep);

        // 2. notifyListHash 만들기
        HashMap<String, ArrayList<String>> notifyListHash = new HashMap<>();

        // 2-1. 신고를 당한 사람과 신고한 사람을 파싱
        for(String rep : reportSet){
            int blankIdx = rep.indexOf(" ");
            String reporter = rep.substring(0, blankIdx);       // 신고자
            String reportee = rep.substring(blankIdx+1);        // 신고 당한자

            // notifyList에 신고당한자 ID가 없다면 null, 있다면 기존값 불러오기
            ArrayList<String> reporterList = notifyListHash.getOrDefault(reportee, null);

            // reporterList가 null이면 새로 만들어준다.
            if(reporterList == null) reporterList = new ArrayList<>();
            // reporterList에 신고자 등록
            reporterList.add(reporter);
            // notifyListHash에 List를 수정
            notifyListHash.put(reportee, reporterList);
        }

        // 3. notifyListHash를 기반으로 reporterHash 만들기
        HashMap<String, Integer> reporterHash = new HashMap<>();
        for(ArrayList<String> notifyList : notifyListHash.values()){
            if(notifyList.size() >= k){
                for(String reporter : notifyList)
                    reporterHash.put(reporter, reporterHash.getOrDefault(reporter, 0)+1);
            }
        }

        // 4. reporterHash를 기반으로 answer 배열을 채운다.
        for(int i=0; i<id_list.length;i++){
            answer[i] = reporterHash.getOrDefault(id_list[i], 0);
        }

        return answer;
    }
}
```

---

> 이 문제는 상당히 오랜 시간이 걸렸다...  
>   
> Hash를 사용해야 하는 것은 알았지만,  
> 어떻게 해야할지 막막하고 막막하였다.  
>   
> 그래서 너무 많은 시간을 허비않지 않도록 하기 위해   
> 인강을 참조하여 해결하였다.

[참고 영상] [**신고 결과 받기 - 자바 java 카카오 문제 풀이**](https://youtu.be/ncCUNOJUn9Q)
