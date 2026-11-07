---
title: "[SNS 어플리케이션] 배포하기"
kind: "article"
permalink: "/posts/tistory-294.html"
published_on: "2022-12-28"
section: "프로젝트"
category: "프로젝트 / SNS 서비스 / 배포"
---

{% raw %}## 배포하기

---

### **FrontEnd 코드 추가하기**

---

프로젝트 내에서 한 번에 빌드되어 사용될 수 있도록 하기 위해 SNS-Service 프로젝트 파일 내부에서 Front-end 코드를 추가하여 개발하려 한다.

#### **플러그인 추가**

NodeJS 코드를 gradle 이용하여 build를 할 때 사용하는 플러그인이다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/294)

#### **Build.gradle 변경**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/294)

* NodeModule의 위치, Node의 버전와 다운로드할지 여부
* npmBuild는 프런트 엔드 코드(React)를 빌드를 할때 사용하는 명령어
* 필요한 프론트 엔드 코드를 실제 빌드가 되는 경로로 이동시켜주는 Copy Task
* Clean 발생 시 프론트 엔드 코드를 함께 Clean 시켜주는 Clean Task
* task들을 체인으로 걸어주었다.

로컬환경에서 빌드를 하려고 한다.

Spring Security는 매 요청마다 로그인이 되어있는지 확인하는데 이러한 작업은 현재 불필요하므로 gradle에서 잠시 제거해주고 회원가입과 로그인 작업에서 추가해주려 한다.

build를 진행하게 되면 다음과 같이 gradle-node-plugin이 추가되는 것을 볼 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/294)

프로그램을 실행하면 다음과 같이 리액트 코드가 실행됨을 확인할 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/294)

### **CloudType 설정하기**

---

#### **프로젝트 생성**

다음과 같이 프로젝트 명과 표시 명을 설정하며 생성할 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/294)

#### **GitActions를 이용해 CloudType 배포시나리오 만들기**

1. API Key 생성

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/294)

2. Github > Settings > Personal access tokens > Tokens(classic)을 통해 TOKEN을 발급

* repo와 admin:public\_key 체크

3. Github 해당 Repository > Settings > Secretes > Actions 으로 이동하여 CLOUDTYPE\_TOKEN 생성

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/294)

4. 동일한 경로에서 GHP\_TOKEN을 생성한다. 해당 Secret은 2번에서 발급받은 Key을 입력해 준다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/294)

5. 프로젝트에서. github 폴더 생성한 후 그 하위에 workflows 폴더를 생성하고 deploy.yml을 생성한 뒤 cloudtype 설정에 맞게 넣어주시면 됩니다.

```java
name: Deploy to cloudtype

on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Connect repository
        uses: cloudtype-github-actions/connect@v1
        with:
          token: ${{ secrets.CLOUDTYPE_TOKEN }}
          ghtoken: ${{ secrets.GHP_TOKEN }}
      - name: Deploy
        uses: cloudtype-github-actions/deploy@v1
        with:
          token: ${{ secrets.CLOUDTYPE_TOKEN }}
          project: sns
          stage: main
          file: ./.cloudtype/app.yaml
          yaml: |-
            name: sns-service
            app: java@17
            options:
              git:
                ref: ${{ github.ref }}
                url: git@github.com:${{ github.repository }}.git
              docbase: /docs
```

> with에 file은 환경 변수를 적용하기 위한 방법으로 cloudtype 프로젝트에 설정한 secret key 또는 환경 변수 값을 적용하기 위한 방법입니다.

6. 환경변수 연동을 위한 설정

```java
name: sns-service
app: java@17
options:
  buildenv:
    - name: DB_HOST
      value: DB_HOST
    - name: DB_PASSWORD
      value: DB_PASSWORD
    - name: DB_PORT
      value: DB_PORT
    - name: DB_USERNAME
      value: DB_USERNAME

context:
  git:
    url: https://github.com/bang-star/sns-service
    branch: main
```

이와 같이 설정을 완료하면 main 브랜치에 Push가 일어나면 자동으로 CloudType에 배포가 됩니다.

자세한 정보는 [CloudType Docs](https://docs.cloudtype.io/guide/introduction)를 참고해 주세요.

추가된 Front-end 코드를 main 브랜치에 commit and Push를 진행하면 다음과 같이 배포되는 것을 확인할 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/294){% endraw %}
