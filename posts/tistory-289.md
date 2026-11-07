---
title: "[게시판 서비스 고도화] 보안 기능 고도화 - 환경 변수 사용"
kind: "article"
permalink: "/posts/tistory-289.html"
published_on: "2022-12-22"
section: "프로젝트"
category: "프로젝트 / 게시판 서비스 / 기능 고도화"
---

## **보안 기능 고도화 - 환경 변수 사용**

---

### Check The Issue

---

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

DB에 접근하는 비밀 정보 또는 카카오 OAuth 기술을 사용하기 위한 키값들을 사용해야한다.

그런데 해당 값을 그대로 넣은 상태로 Github에 Push하면 알몸 상태가 되어버린다...

모든 사람들이 나의 정보를 알게 되는 초유의 상태가 된다. 

이러한 문제를 해결하는 방법에 대해 알아보려 한다.

### 환경 변수는 어떻게 적용할까?

---

#### **프로퍼티 방법**

앱을 실행시키는 순간, 값을 직접 전달해주는 방법

1. CLI에서 입력하는 방법
2. Spring Boot 앱을 실행시키는 운영체제에 외부 환경변수를 등록하여 사용하는 방법

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

**Intellij IDE에 Run Configuration**

1. 다음과 같이 Modifity Options 버튼을 눌러 Enviroment variables를 활성화 시켜준다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

2. 다음과 같이 책자 환경 변수를 알맞게 설정해주면 된다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

#### **Intellij IDE Override configuration properties**

1. 다음과 같이 Modify options에서 Override Configuration 을 활성화시킨다.

2. properties(.yaml) 파일에서 설정한 환경변수 값에 경로를 설정하여 값을 지정할 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

#### **HashiCorp Vault 를 이용한 방법**

**위 두가지 방법을 이용해 Local 에서는 환경 변수를 설정할 수 있다. HasiCorp Vault 또한 로컬에서도 가능하지만, 배포된 서버에서도 사용가능한 방법 중 하나이다.**

1. HashiCorp 사이트에 접속하여 Download 버튼을 누른다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

2. OS에 맞게 파일을 설치한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

3. 설치한 경로에서 cmd 또는 shell을 통해 서버를 실행시킨다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

4. Vault 서버에 접근하기 위해서는 localhost:8200 포트로 접속하면 된다.

로그인하는 방식은 여러가지가 있는데, 쉽게 접근할수 있는 방법은 토큰 방식으로 서버를 킬때 CLI에 token이 제공된다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

4. CLI에서 RootT TOKEN을 확인하고 해당 서버에 접근한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

5. 다음과 같이 순서대로 진행하면 된다. 3번째 그림처럼 환경변수를 입력하면 사용할 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

5. 값은 CLI에서 바로 확인이 가능하다.

> **read** secret폴더/data/생성한 Secret Path

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

**6. 로컬에서도 접속이 가능하다. (환경변수를 등록이 되어야함)**

> PowerShell: $env:VAULT\_ADDR="http://127.0.0.1:8200"   
> cmd.exe: set VAULT\_ADDR=http://127.0.0.1:8200  
>   
> CMD 또는 Shell 에서 위에 설정 값을 입력하여 환경변수를 등록하고  
> vault 명령어를 사용한다.  
>   
> 명령어 - vault kv get secret/{Secret Path}

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

**7. Spring Project에 적용하기 위해서는 Vault Configuration 의존성이 필요하다.**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

8. Vault 의존성 설정를 함께 추가해주어야 한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)
[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

> `dependencyManagement` 변수를 참조하면 제대로 의존성을 가져오지 못하는 문제가 있다. 정확한 이유는 파악하지 못했으므로, `querydsl-apt` 의존성의 버전을 직접 입력하는 방식으로 해결하였다.

**8. application.yaml에 적용**

다음과 같이 vault에 추가적인 설정만으로 vault 설정이 가능하다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/289)

이외에도 Vault를 활용한 기능들은 다양하다. 실제 서비스에 Vault를 사용하기 위해서는 Vault를 위한 서버를 추가적으로 사용해야 한다. 이를 지원하는 않응 클라우드 서비스도 있기 때문에 이 방법을 서버에 적용하지는 않았다.

이유는 Cloudtype는 배포 환경에 설정으로 환경변수를 등록하여 사용하는 방법과 시크릿 코드 값을 프로젝트에 등록하여 사용하는 방법이 있기 때문이다.
