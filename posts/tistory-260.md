---
title: "[Intellij] OpenJDK 64-Bit Server VM warning: Options -Xverify:none and -noverify were deprecated in JDK 13 and will likely be removed in a future release."
kind: "article"
permalink: "/posts/tistory-260.html"
published_on: "2022-12-07"
section: "트러블슈팅"
category: "트러블슈팅 / Java·JVM"
---

## **Intellij Warning**

---

Intellij IDE로 Spring Boot Application을 실행하면 다음과 같은 에러가 뜨는 것을 경험하였다.

![본문 이미지](../assets/tistory/6a0b75e192f2bc0d2b2a11a5.png)

**오류 메시지**

OpenJDK 64-Bit Server VM warning: Options -Xverify:none and - noverify were deprecated in JDK 13 and will likely be removed in a future release.

**원인**

JDK 13에서 -Xverify:none과 -noverify 옵션이 제거되면서 발생하는 오류라고 한다.

**해결 방법**

* Intellij Build Configuration에서 **Enable launch optimization**을 체크 해제 하는 방법

![본문 이미지](../assets/tistory/58839ae66c7a0736ee00f483.png)

현재 2022.1.4버전을 사용하는 필자는 UI가 변경되어 이러한 화면을 찾을 수 없었다.

최신 버전을 사용하는 필자는 아래와 같이 설정이 가능하다.

![본문 이미지](../assets/tistory/24faa3fee7e62a4448fbd5a2.png)

위와 같이 설정을 마치면, 아래와 같이 경고가 사라지는 것을 볼 수 있다.

![본문 이미지](../assets/tistory/3827ff88171655ffa8c87d2e.png)

이외에도 다양한 옵션 설정이 가능하다.

[![본문 이미지](../assets/tistory/ff229b4b261da35cb65ce1e1.png)](https://www.jetbrains.com/help/idea/run-debug-configuration-spring-boot.html#configuration-tab)

**참고**

* <https://www.baeldung.com/jvm-tiered-compilation>
* <https://www.jetbrains.com/help/idea/run-debug-configuration-spring-boot.html#configuration-tab>
