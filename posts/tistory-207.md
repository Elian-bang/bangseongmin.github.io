---
title: "[백준] 재귀의 귀재"
kind: "article"
permalink: "/posts/tistory-207.html"
published_on: "2022-10-19"
section: "학습 기록"
category: "학습 기록 / 백준"
---

* [재귀 - 25501번, 재귀의 귀재](https://www.acmicpc.net/problem/25501)

[25501번: 재귀의 귀재

각 테스트케이스마다, isPalindrome 함수의 반환값과 recursion 함수의 호출 횟수를 한 줄에 공백으로 구분하여 출력한다.

www.acmicpc.net](https://www.acmicpc.net/problem/25501)

---

### **문제**

정휘는 후배들이 재귀 함수를 잘 다루는 재귀의 귀재인지 알아보기 위해 재귀 함수와 관련된 문제를 출제하기로 했다.

팰린드롬이란, 앞에서부터 읽었을 때와 뒤에서부터 읽었을 때가 같은 문자열을 말한다. 팰린드롬의 예시로 AAA, ABBA, ABABA 등이 있고, 팰린드롬이 아닌 문자열의 예시로 ABCA, PALINDROME 등이 있다.

어떤 문자열이 팰린드롬인지 판별하는 문제는 재귀 함수를 이용해 쉽게 해결할 수 있다. 아래 코드의 isPalindrome 함수는 주어진 문자열이 팰린드롬이면 1, 팰린드롬이 아니면 0을 반환하는 함수다.

```cpp
public class Main{
    public static int recursion(String s, int l, int r){
        if(l >= r) return 1;
        else if(s.charAt(l) != s.charAt(r)) return 0;
        else return recursion(s, l+1, r-1);
    }
    public static int isPalindrome(String s){
        return recursion(s, 0, s.length()-1);
    }
    public static void main(String[] args){
        System.out.println("ABBA: " + isPalindrome("ABBA"));
        System.out.println("ABC: " + isPalindrome("ABC"));
    }
}
```

정휘는 위에 작성된 isPalindrome 함수를 이용하여 어떤 문자열이 팰린드롬인지 여부를 판단하려고 한다.

구체적으로는, 문자열 S$S$를 isPalindrome 함수의 인자로 전달하여 팰린드롬 여부를 반환값으로 알아낼 것이다. 더불어 판별하는 과정에서 recursion 함수를 몇 번 호출하는지 셀 것이다.

정휘를 따라 여러분도 함수의 반환값과 recursion 함수의 호출 횟수를 구해보자.

### **입력과 출력**

* 입력  
  첫째 줄에 테스트케이스의 개수 T가 주어진다. (1 ≤ T ≤ 1000)  
  둘째 줄부터 T개의 줄에 알파벳 대문자로 구성된 문자열 S가 주어진다. (1 ≤ |S| ≤ 1000)
* 출력  
  각 테스트케이스마다, isPalindrome 함수의 반환값과 recursion 함수의 호출 횟수를 한 줄에 공백으로 구분하여 출력한다.

### **알고리즘**

이 문제는 recursion과 isPalindrome 함수는 주어진다. 그렇기 때문에 더더욱 간단한 문제가 된다.

isPalindrome 의 결과 값과 recursion 함수의 호출 횟수를 함께 출력하는 문제로

이를 위해 static 변수를 선언하는 것이 가장 중요하다.

1. recursion의 호출 횟수를 알기 위해서는 recursion 메소드에 static 변수를 증가시킨다.
2. isPalindrome 을 호출할 때마다 다른 값을 출력해야하므로 메소드 호출 전 static 변수를 초기화시켜줘야한다.

정리하면

1. 입력 횟수 N을 입력받는다.
2. 문자열을 입력받는다.
3. static 변수를 초기화시킨다.
4. isPalindrome 을 호출시킨다.
5. isPalindrome에서 recursion 메소드를 호출할때마다 static 변수가 증가시킨다.
6. 2번 과정을 N번만큼 반복한다.

### **풀이**

#### **풀이 1 : [Scanner+System.out.println()]**

```cpp
import java.util.Scanner;

public class Main{
    static int count = 0;

    public static int recursion(String s, int l, int r){
        count++;
        if(l >= r) return 1;
        else if(s.charAt(l) != s.charAt(r)) return 0;
        else return recursion(s, l+1, r-1);
    }
    public static int isPalindrome(String s){
        return recursion(s, 0, s.length()-1);
    }
    public static void main(String[] args){
        Scanner in = new Scanner(System.in);

        int N = in.nextInt();
        in.nextLine();          // 개행 제거

        for(int i=0; i < N; i++){
            String temp = in.nextLine();
            count = 0;
            int result = isPalindrome(temp);
            System.out.println(result + " " + count);
        }
    }
}
```

#### **풀이 2 : [BufferedReader + InputStreamReader +System.out.println()]**

```cpp
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Main{
    static int count = 0;

    public static int recursion(String s, int l, int r){
        count++;
        if(l >= r) return 1;
        else if(s.charAt(l) != s.charAt(r)) return 0;
        else return recursion(s, l+1, r-1);
    }
    public static int isPalindrome(String s){
        return recursion(s, 0, s.length()-1);
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        int N = Integer.parseInt(br.readLine());

        for(int i=0; i < N; i++){
            String temp = br.readLine();
            count = 0;
            int result = isPalindrome(temp);
            System.out.println(result + " " + count);
        }
    }
}
```

#### **풀이 3 : [BufferedReader + InputStreamReader + StringBuilder]**

```cpp
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class Main{
    static int count = 0;

    public static int recursion(String s, int l, int r){
        count++;
        if(l >= r) return 1;
        else if(s.charAt(l) != s.charAt(r)) return 0;
        else return recursion(s, l+1, r-1);
    }
    public static int isPalindrome(String s){
        return recursion(s, 0, s.length()-1);
    }
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));

        int N = Integer.parseInt(br.readLine());

        StringBuilder sb = new StringBuilder();
        for(int i=0; i < N; i++){
            String temp = br.readLine();
            count = 0;
            int result = isPalindrome(temp);
            sb.append(result + " " + count).append("\n");
        }

        System.out.println(sb);
    }
}
```

---

### **성능**

![본문 이미지](../assets/tistory/937dac4a2ab12e2b73da259e.png)

**채점 번호 : 50717173  -  방법 3 : BufferedReader + StringBuilder**

**채점 번호 : 50717155  -  방법 2 : BufferedReader + **System.out.println****

**채점 번호 : 50717124****-  방법 1 : Scanner + System.out.println**
