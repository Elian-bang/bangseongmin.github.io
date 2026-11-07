---
title: "[게시판 서비스] 데모"
kind: "article"
permalink: "/posts/tistory-263.html"
published_on: "2022-12-09"
section: "프로젝트"
category: "프로젝트 / 게시판 서비스 / 기본 기능 구현"
---

## **데모**

---

### **깃헙 릴리즈**

---

#### **Check The Issue**

![본문 이미지](../assets/tistory/ba3a0af82193adcb27019a06.png)

프로젝트의 README.md 파일을 작성하지 않은 상태여서 작성하여 Pull Request로 만들어두었다.

[![본문 이미지](../assets/tistory/c1fad0e1e847f5d926d65cb3.png)](https://github.com/bang-star/fastcampus-project-board/pull/61)

---

#### **Create Tag**

> 태그의 종류는 2가지 입니다.  
> 첫번째 **lightweight 태그**는 **이름만** 붙여 특정 커밋에 대한 포인터 역할만 합니다.  
> 두번째 **annotated 태그**는 깃 데이터베이스에 완전한 객체로 저장되어 태그한 사람의 **이름과 이메일, 날짜, 태그 메시지 등**을 함께 저장할 수 있습니다.  
>   
> 일반적으로는 annotated 태그를 생성하는게 권장되지만, 임시로 태그를 생성한다거나 추가적인 정보를 제공하고 싶지 않을 때에는 lightweight 태그를 사용 할 수도 있습니다.

![본문 이미지](../assets/tistory/1a98950ed3a9dec6aa844766.png)

tag 명은 v1.0.0으로 설정하였다.

조금 더 좋은 태그 명을 작성하고 싶은 경우에는 [소프트웨어 버전 작성](https://www.google.com/search?q=software+versioning&ei=rLKSY-7THeuk2roPusCq-AE&ved=0ahUKEwju2eH20uv7AhVrklYBHTqgCh8Q4dUDCA8&uact=5&oq=software+versioning&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQAzIFCAAQgAQyBQgAEIAEMgUIABCABDIECAAQHjIECAAQHjIECAAQHjIECAAQHjIECAAQHjIECAAQHjIECAAQHjoKCAAQRxDWBBCwAzoECAAQQzoHCAAQgAQQDUoECEEYAEoECEYYAFC4BFimGGDwGWgDcAF4AIABfogBmgaSAQMwLjeYAQCgAQHIAQrAAQE&sclient=gws-wiz-serp)을 검색하시면 많은 정보를 얻을 수 있습니다.

![본문 이미지](../assets/tistory/d25f614fe829166d11fd049c.png)

해당 태그를 Push하여 완성된 버전임을 표시할 수 있습니다.

---

#### **Releases**

**Github에서 TAG를 확인하고 이를 기준으로 Releases 할 수 있습니다.**

![본문 이미지](../assets/tistory/a7689c55ed6582c527f5b929.png)

![본문 이미지](../assets/tistory/b3317df76a2d6df03cf708d9.png)

> **옵션**  
> **1. Set as a pre-release** : 릴리즈를 하기는 하지만 완전히 완성된 버전으로 보는게 아니라 테스트로 미리 올리는 것으로 별도의 색으로 관리된다.  
> **2. Create a discussion for this Release** : 현재 Release에 대한 discussion을 열 수 있는데, 여러가지 연동해서 글을 작성할 수 있다.

**Release 시 다양한 Github 프로젝트를 참고하여 자세하게 작성할 수 있다.**

**예시로 Spirng boot 3.0을 참고할 수 있습니다.**

**새로운 기능, 변경된 오류 등 이슈를 태그하여 상세하게 새로운 버전에 대해 명세할 수 있습니다.**

![본문 이미지](../assets/tistory/3a26fc13db7891b68a7d7162.png)

**Release 생성된 화면**

![본문 이미지](../assets/tistory/26875d2d975fb564d44e7590.png)

---

#### **Release는 어떤 의미가 있을까?**

> 어떤 한 방점을 찍은 것으로 개발을 진행다가 문제가 생겼을 때 가장 최신에 안전한 버전이 무엇인가라고 했을 때 태그를 통해 확인할 수 있다. 그래서 태그를 기준으로 배포를 새로하여 빠르게 Rollback 이 가능하게 된다.

### **배포 - Heroku**

---

#### **Cloud Service - Heroku**

> Heroku는 Java, Node.js, Python등 여러 언어를 지원하는 **Paas** 클라우드 서비스이고, 인프라 구간은 신경쓰지 않는 클라우드 기반의 어플리케이션 플랫폼 정도로 생각하시면 됩니다. **PasS**에서 유명한 플랫폼이 **kubernetes**가 있다면 서비스에는 **Heroku**가 있습니다. 개발자들이 개발 목적으로 또는 Mockup을 만들거나 테스트용 시스템을 올려서 웹 상에다가 빠르게 사용해보고자 할 때 **무료**로 사용할 수 있는 서비스 중 하나가 **Heroku** 였지만, 현재는 11.29일 이후로 무료 버전은 [종료](https://techrecipe.co.kr/posts/44931)되었습니다.  
>   
> **※ Paas란?**  
> 서비스형 플랫폼(Platform as a Service, PaaS)은 클라우드 컴퓨팅 서비스 분류 중 하나다. 일반적으로 앱을 개발하거나 구현할 때, 관련 인프라를 만들고 유지보수하는 복잡함 없이 애플리케이션을 개발, 실행, 관리할 수 있게 하는 플랫폼을 제공한다. SaaS의 개념을 개발 플랫폼에도 확장한 방식으로, 개발을 위한 플랫폼을 구축할 필요 없이, 필요한 개발 요소를 웹에서 쉽게 빌려쓸 수 있게 하는 모델이다.

[![본문 이미지](../assets/tistory/0ba49057c2af00f9b719b8ac.png)](https://www.heroku.com/)

#### **브랜치 생성**

Heroku cloud에 배포하기 위해서는 추가적인 설정 파일을 넣어주어야하기 때문에 해당 작업을 위해 브랜치를 생성합니다.

![본문 이미지](../assets/tistory/9253b058a693ce507b21846d.png)

Baranch For Heroku

#### **Heroku 를 이용한 배포**

**1. New Pipeline**

회원가입 완료 후 오른쪽 위에 New 버튼에서 New Pipeline을 선택합니다.

> pipeline은 heroku에서 일어나는 일련에 테스트, 빌드와 배포 동작을 연결지어 놓은 것이다.

![본문 이미지](../assets/tistory/aa6891278277611e0a25a5cb.png)

**2. Create New Pipeline**

Github 연동이 안되어 계신분은 연동을 시키면 되는데 빨간색 문구가 나오셨다면 당황하지 마시고 새로고침 눌러주세요. 필자는 새로고침을 해결되었습니다. 연결이 되신 분들은 원하는 프로젝트를 연결시켜주시고 Create Pipeline 버튼을 눌러주세요.

![본문 이미지](../assets/tistory/66fb23533af9d3d23a2456de.png)

**3. 생성된 Pipeline 확인**

> STAGING : 테스트 단계  
> PRODUCTION : 서비스 단계

![본문 이미지](../assets/tistory/663bbbda4aa5faf547b28864.png)

**4. PRODUCTION에 Add APP**

![본문 이미지](../assets/tistory/cbd85956d1f97e8231b24db2.png)

**5. PRODUCTION OPTION**

![본문 이미지](../assets/tistory/595717a1eb30eb6614ea0b68.png)

**6. Resource Setting**

ClearDB MySQL을 사용할 것이다.

![본문 이미지](../assets/tistory/d177398719a60ed1459a49fa.png)

**ClearDB MySQL 시스템에 어떻게 접근할까?**

**1. ClearDB MySQL 정보를 통한 방법**

![본문 이미지](../assets/tistory/df58f79d25a1598f65a3d1db.png)

위 정보를 기반으로 조합해서 만드는 방법이 있지만, 복잡하다.

**2. Heroku CLI 도구를 설치하여 명령어를 사용하여 정보를 알아내는 방법 ✔️**

아래와 같이 환경 변수 세팅은 이미 만들어져있다.

![본문 이미지](../assets/tistory/213834016d6a70cf73f560f7.png)

**7. DB 연결**

새로운 프로파일은 만들어 연결할 것이다.

![본문 이미지](../assets/tistory/5485eebd46898353082e091f.png)

프로파일 이름을 heroku로 지정하면 이 부분을 추가적인 설정 파일로 읽게 되고,

만약 중복된 설정이 있다면 위에 코드가 우선권을 갖기 때문에 덮어쓰게 된다.

**설정**

* username과 password는 이미 URI에 포함되어 있으므로 제거
* 테스트 데이터를 넣을 수 있도록 ddl-auto는 create, sql.init.mode는 always으로 전환

![본문 이미지](../assets/tistory/ba7cb9fe65c203a929217f0d.png)

**8. **헤로쿠 설치****

Heroku 셋팅을 보기 위해 Heroku를 설치해야하므로 OS에 맞게 설치하면 된다.

[![본문 이미지](../assets/tistory/616e4e03b5fa05592c7e8db8.png)](https://dashboard.heroku.com/apps)

설치가 되었다면

![본문 이미지](../assets/tistory/5fda4024caf56040d55ee689.png)

명령어를 입력하면 Heroku 홈페이지가 뜨게 되는데, 로그인을 해주면 된다.

![본문 이미지](../assets/tistory/bc7e50d8bc5899ae72793017.png)

로그인이 된 상태

**9. Gradle Build**

* 루트 패키지에 **Procfile**을 생성하고 다음 명령어를 넣어주면 된다.

> web: java $JAVA\_OPTS -Dserver.port=$PORT -Dspring.profiles.active=heroku -jar build/libs/project-board-v1.1.0.jar

jar 파일은 build > libs > 에 존재하고, jar 파일명이 다를 경우 build.gradle에서 version을 변경하여 주시면 된다.

버전이 변경된 이유는 Heroku 기능이 추가되었으므로 버전업이 된것이다.

* **루트 패키지에 system.properties 파일 생성**

> java.runtime.version=17

* **build.gradle에 Heroku 설정 추가**

> jar{  
>     manifest {  
>         attributes('Main-Class': 'com.fastcampus.projectboard.FastCampusProjectBoardApplication')  
>     }  
> }

### **배포 - CloudType**

---

Heroku는 월 5$ 이상 비용이 발생할 가능성이 있어 대체재로 **CloudType**을 선택하게 되었습니다.

[![본문 이미지](../assets/tistory/f3caca0034b792dd183fa5cc.png)](https://cloudtype.io/)

#### **데이터베이스 클라우드**

**1. 사용 가능한 데이터베이스 검색**

![본문 이미지](../assets/tistory/ab9265a4a7b31fcf41ce795c.png)

**2. DB 생성**

![본문 이미지](../assets/tistory/a361d3e116cb1defd149e292.png)

**3. DB 정보 확인**

![본문 이미지](../assets/tistory/18607f961705319953189dca.png)

추가적인 설정은 프로젝트에 톱니바퀴 버튼을 눌러서 DB 명과 Username, Password 설정이 가능합니다.

![본문 이미지](../assets/tistory/debea4eff413c3365bc38fab.png)

---

#### **배포할 Github 프로젝트 선택**

필자는 Spring Boot 프로젝트이기 때문에 Spring Boot 프로젝트를 추가하였다.

![본문 이미지](../assets/tistory/70218b0c8dbb14b614020fa1.png)

1. GitHub 프로젝트 선택

![본문 이미지](../assets/tistory/ced2156e5d40d92086ac7bf8.png)

2. Github 프로젝트 연동

![본문 이미지](../assets/tistory/fd9c8c183812a28171a7a175.png)

**3. Github 프로젝트 연동을 위한 설정**

현재 기준 Java 18버전까지 지원해주고 있습니다. 대박...

![본문 이미지](../assets/tistory/08e7d18097509e7691737bda.png)

**4. Spring Boot 서버 배포하기**

![본문 이미지](../assets/tistory/f576283d956417551253badd.png)
![본문 이미지](../assets/tistory/f1dcdeda02d306e28ae653f3.png)

#### **서버 실행 로그**

![본문 이미지](../assets/tistory/17ae67339809f7de8afad0f6.png)

cloudtype에 장점은 개발자가 겪을 수 있는 문제를 실시간으로 질문할 수 있다는 점이다.

[![본문 이미지](../assets/tistory/7afb8740b1c79757ed4f7979.png)](https://discord.com/channels/820252852693368892/1010344427304276120)

이와 같이 디스코드를 통해 직접 소통할 수 있는 창구가 열려 있으며 한국에서 만든 무료 서비스라는 점이 가장 큰 장점이다. 단점으로는 레퍼런스가 적다는 단점이 존재한다. 그래서 많은 사용자들이 사용하면서 널리 알려졌으면 좋겠다!

기본 사용 방법은 유튜브와 노션을 통해 제공하고 있으며 실시간으로 소통하며 발전할 수 있는 서비스라고 생각한다.

### **총 정리 - 데모**

---

[![본문 이미지](../assets/tistory/6bfda938e4da33797037adc9.png)](https://port-0-fastcampus-project-board-11er1a24lbgm75c3.gksl2.cloudtype.app/)

cloudtype를 통해 배포를 완료하여 테스트를 완료한 상태이다.
