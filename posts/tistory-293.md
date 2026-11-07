---
title: "[SNS 어플리케이션] 개발환경 구성하기"
kind: "article"
permalink: "/posts/tistory-293.html"
published_on: "2022-12-28"
section: "프로젝트"
category: "프로젝트 / SNS 서비스 / 기획·설계"
---

## 개발환경 구성하기

---

### **기술 스택 및 Spring Boot Project 만들기**

![본문 이미지](../assets/tistory/8319001a2764b800a53d6e23.png)

### **개발 도구**

* Intellij IDEA Ultimate
* Git Kraken
* Github

**1. Github에 Repository를 생성**

![본문 이미지](../assets/tistory/3cd5c7a960f266047c484a13.png)

**2. Gitkraken에서 Repository를 Clone**

![본문 이미지](../assets/tistory/5e3148e0cba74b0835f6f0a9.png)

해당 Repository에 아무런 파일이 존재하지 않기 때문에 이를 위해 GitKraken에서 README.md 파일을 생성하여 최초 커밋을 만들어준다.

**3. Intellij IDE를 통해 동일한 경로에 Spring 프로젝트를 생성해주면 된다.**

![본문 이미지](../assets/tistory/0f79aacd9064a8c8eb37ef23.png)

**4. .gitignore 설정**

![본문 이미지](../assets/tistory/a81821592213ac0ea1fa33be.png)

**5. 프로젝트 실행**

![본문 이미지](../assets/tistory/aa4543c554650b0cc893aec5.png)

다음과 같이 url 속성을 명시되어 있지 않고 데이터베이스에 관한 설정이 되어 있지 않다는 에러가 발생하고 있다.

이는 JPA에서 연결할 DB를 찾지 못하여 발생한 에러이다.

![본문 이미지](../assets/tistory/56ec9b823ce254a7ce6c338c.png)

DataSource를 자동으로 찾아주는 기능을 중단시키면 이를 해결할 수 있다.

![본문 이미지](../assets/tistory/826d0ec967fb70a9e7259d5c.png)

이와 같이 처리한 이유는 commit 시 문제가 발생하지 않도록 하게 하기 위함이다.
