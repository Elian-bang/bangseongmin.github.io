---
title: "클라우드 서비스 배포하기"
kind: "article"
permalink: "/posts/tistory-330.html"
published_on: "2023-01-22"
section: "프로젝트"
category: "프로젝트 / 게시판 서비스"
---

## 클라우드 서비스 배포하기

---

### 운영 환경 도커 컴포즈 및 profile 작성

---

AWS EC2 클라우드 서비스에 배포하기 전에 운영 환경에서 사용할 Docker Compose와 Profile을 작성해보려고 한다.

로컬 profile은 로컬호스트를 바라보고 있기 때문에 운영환경에서는 변경해주어야하고 운영환경에 맞는 도커 컴포즈 파일도 생성해주어야한다.

#### docker-compose

로컬에서 실행할 때 Redis나 DB 컨테이너를 띄워두고 Intellij를 이용해서 디버깅을 편하게 하면서 개발을 진행할 수 있도록 Spring boot를 띄워서 사용하였었다. 클라우드 서비스에 배포할 때는 Intellij로 띄우는 것이 아니라 Spring boot 컨테이너를 생성해주어야한다. 이전에 싱글 컨테이너로 Spring boot를 띄워주는 것처럼 추가로 띄워주어야 한다.

정리하면 Redis, Dababase, SpringBoot 3개에 컨테이너를 띄워주어야 한다.

```java
version: "3.8"                                          # 파일 규격 버전
services:                                               # 이 항목 밑에 실행하려는 컨테이너들을 정의
  pharmacy-recommendation-redis:                        # 서비스명
    container_name: pharmacy-recommendation-redis       # 컨테이너 명
    build:
      dockerfile: Dockerfile
      context: ./redis
    image: bangseongmin/pharmacy-recommendation-redis
    ports:
      - "6379:6379"
  pharmacy-recommendation-database:
    container_name: pharmacy-recommendation-database
    build:
      dockerfile: Dockerfile
      context: ./database
    image: bangseongmin/pharmacy-recommendation-database
    environment:
      - MARIADB_DATABASE=pharmacy-recommendation
      - MARIADB_ROOT_PASSWORD=${SPRING_DATASOURCE_PASSWORD}
    volumes:
      - ./database/config:/etc/mysql/conf.d
      - ./database/init:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"      # 접근 포트 설정 (컨테이너 외부:컨테이너 내부)
  pharmacy-recommendation-app:
    container_name: pharmacy-recommendation-app
    build: .             # 도커 파일이 있는 위치
    depends_on:          # DB, REDIS 컨테이너가 실행된 다음 WEB을 실행시킨다.
      - pharmacy-recommendation-database
      - pharmacy-recommendation-redis
    image: bangseongmin/pharmacy-recommendation-app
    environment:
      - SPRING_DATASOURCE_USERNAME=${SPRING_DATASOURCE_USERNAME}
      - SPRING_DATASOURCE_PASSWORD=${SPRING_DATASOURCE_PASSWORD}
      - SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}
      - KAKAO_REST_API_KEY=${KAKAO_REST_API_KEY}
    ports:
      - "80:8080"
    restart: always
```

로컬에서 사용했던 docker-compose와 redis와 database는 동일하다.

추가된 부분은 "pharmacy-recommendation-app" 부분이다.

* **build - 도커 파일이 있는 위치**  
  싱글 컨테이너로 실행했던 것처럼 Dockerfile를 이용해서 Springboot를 띄운다.
* **image: bangseongmin/pharmacy-recommendation-app - 도커 이미지명**
* **depends\_on - 컨테이너 실행 순서를 지정하는 것이다.**로컬에서 Spring boot를 띄울때 생각을 해보면 Redis와 DB를 먼저 떠있는 상태에서 Spring boot를 실행했던 것처럼 동일하게 Redis와 DB를 먼저 띄우고 Spring boot 컨테이너를 실행하게 한 것이다.
* **environment - 환경 변수 지정**intellij로 띄울 때 환경 변수를 지정한 것처럼 Springboot를 컨테이너로 띄울 때는 .env 파일을 이용하여 환경변수를 주입해주었었다.
* **ports - 포트 설정**브라우저에 기본 포트는 80 포트다. 해당 브라우저로 접근하면 컨테이너 내부로 Spring boot 기본 포트인 8080 포트로 포워딩을 해준다.
* **restart: always - 재시작 옵션**depends\_on은 실행 순서만 컨트롤한다. database와 redis가 실행가능한 상태인지까지는 확인하지 않는다. database와 redis가 실행가능한 상태가 아니어서 application이 간혹 실패하는 경우가 있다. restart를 always로 하여 그러한 경우에는 재시작하도록 지정해준것이다.

---

#### profile

```java
spring:
  config:
    activate:
      on-profile: prod

  datasource:
    driver-class-name: org.mariadb.jdbc.Driver
    url: jdbc:mariadb://pharmacy-recommendation-database:3306/pharmacy-recommendation
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    redis:
      host: pharmacy-recommendation-redis
      port: 6379
    jpa:
      hibernate:
        ddl-auto: validate # prod 배포시 validate
      show-sql: true

  pharmacy:
    recommendation:
      base:
        url: http://localhost/dir/ # aws ec2 ip 할당 받은 후 변경 예정
```

로컬 profile과 거의 유사하고 db 호스트 부분만 달라졌다.

* **db와 redis에 host 부분은 docker compose에 서비스명이다.**   
  도커 컴포즈에 명시된 서비스들은 각각 같은 네트워크에서 형성되고 컨테이너들끼리 통신을 할때 서비스명을 통해 통신하기 때문에 서비스 명을 명시한 것이다.
* **shorten url에 사용되는 base url은 로컬 호스트로 임시 조치한다.**AWS EC2를 생성하지 않은 상태이기 때문에 포트를 알 수 없기 때문에 생성하고 ip를 할당 받은 후 변경해주려 한다. 일단은 테스트를 위해서 localhost로 두려고 한다.

---

#### 테스트

도커 컴포즈를 실행하면 3개의 컨테이너가 띄워지고 Spring boot가 띄워지는 확인하기 위해 테스트해보려고 한다.

어플리케이션을 실행시키기 위해서 도커 파일을 이용해서 이미지 빌드하고 이미지를 컨테이너로 실행하게 된다.

도커 파일을 실행시키기 위해서는 app.jar가 있어야하므로 clean하고 gradle wrapper를 통해 재빌드해야한다.

재빌드하면서 전체 테스트 코드를 검증하기 때문에 Docker Desktop이 실행되어 있어야하고 app.jar가 정상적으로 생성되면 app.jar를 이용해서 도커 컴포즈에 명시해둔 서비스 명을 이용해서 이미지를 빌드하고 컨테이너를 실행시키면 된다.

다음과 같이 정상적으로 빌드가 성공하였다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

현재 실행중인 도커 컨테이너가 없는지 확인한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

도커 컴포즈 파일은 디폴트로 되어있기 때문에 다음과 같이 간단하게 실행가능하다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

* --build 옵션은 도커 컴포즈가 실행될 때 이미지가 존재하면 캐싱된 이미지를 그대로 사용하는데, 현재 소스가 변경이 되었기 때문에 이미지를 재빌드하기 위해서 빌드 옵션을 추가해준것이다.

Spring boot에서 에러가 발생하는 이유는 restart 옵션을 준 이유와 같이 DB 또는 redis 컨테이너가 실행되지 않았기 때문에 restart 옵션을 설정한 것이다.

다음과 같이 정상적으로 컨테이너가 실행되어 있고 Spring boot가 정상작동함을 확인할 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)
[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

브라우저에서 실행할때는 도커 컴포즈에 설정한대로 80 포트 즉 포트를 지정하지 않고 접근하면 된다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

### AWS 소개 및 EC2 생성

---

#### AWS EC2

EC2는 Elastic Compute Cloud에 약자이고 클라우드에서 제공되는 컴퓨터라고 생각하면 된다.

월별 750 시간까지 무료이고 elastic ip의 경우 1개는 무료이지만, 요금에 대한 주의사항은 참고해야한다.

#### **AWS EC2 인스턴스 생성**

인스턴스 생성하기 전에 가장 먼저 확인해야하는 것은 리전이다.

리전이란?

AWS의 서비스가 구동될 지역을 의미하고 AWS는 도시별로 클라우드 센터를 지어 해당 센터에서 구축된 가상머신들을 사용할 수 있는데, 이를 리전이라고 한다.

서울 리전이 생기기 전까지는 국내 서비스들은 도쿄 리전을 사용했다. 한국과 가장 가까운 지역이라 네트워크가 가장 빠르기 때문이다. 현재는 서울 리전이 존재하기 때문에 국내에서 서비스한다면 무조건 서울 리전을 선택하면 된다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**인스턴스 시작**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**AMI 선택**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

인스턴스 유형 선택

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**태그 추가**

인스턴스를 표현하는 이름이라고 생각하면 된다.

**키 페어 생성**

키 페어는 EC2 서버에 SSH 접속을 하기 위해 필수라서 생성해야 한다.   

새 키 페어 생성을 눌러 원하는 이름을 적고 생성한다. 아래 그림처럼 설정 후 생성하면 pharmacy-recommendation.pem 파일이 다운되며, ssh 환경에 접속하기 위해서는 해당 키 파일이 존재하는 위치로 가서 ssh 명령어를 실행하면 된다.   

한번 다운받은 후에는 재 다운 받을 수 없기 때문에 안전한 곳에 저장해준다. 인스턴스는 지정된 pem 키(비밀키)와 매칭되는 공개키를 가지고 있어, 해당 pem 키 외에는 접근을 허용하지 않는다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**네트워크 및 스토리지 선택**

보안 그룹은 방화벽을 의미한다. 이 보안 그룹은 굉장히 중요한 부분이므로 신중하게 설정을 해야한다.

ssh 트래픽은 aws ec2에 터미널로 접속할 때를 이야기 한다. pem키가 없으면 접속이 안되어서 전체 오픈(0.0.0.0/0)을 하는 경우가 종종 있으나, 실수로 깃허브 등에 pem 키가 노출되는 경우 위험하므로 pem키 관리와 지정된**IP(내 IP)에서만 ssh 접속이 가능하도록 구성하는 것이 안전**하다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

프리티어는 최대 30 까지 지원하기 때문에 해당 부분만 변경해준다. 볼륨 유형은 범용 SSD로 선택한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

설정하고 인스턴스 시작을 누르면 다음과 같이 인스턴스가 생성된다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)
[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

---

#### **고정 IP 설정**

인스턴스도 하나의 서버이기 때문에 IP가 존재하는데, 인스턴스 생성 시 항상 새로운 IP로 할당된다.

추가적으로 동일한 인스턴스를 중지하고 다시 시작할 때도 새로운 IP가 할당 된다.

이렇게 되면 매번 접속해야 하는 IP가 변경돼서 PC에서 접근할 때마다 IP의 주소를 확인해야 하는 번거로움이 발생한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

위 그림처럼 생성한 ec2 인스턴스의 퍼블릭 IP가 변경되는지 확인해보려면, 해당 인스턴스의 퍼블릭 IP를 확인 하고 인스턴스 재시작 후 IP를 확인해보면 된다.   

위에 탄력적 IP란은 설정해주지 않았기 때문에 비어있다.

**탄력적 IP 메뉴 접근**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

탄력적 IP 주소 할당을 클릭한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

옵션 변경없이 할당 버튼을 눌러 생성한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**탄력적 IP 주소 선택**

방금 생성한 탄력적 IP를 선택해서 연결을 시도한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**인스턴스 선택 및 연결**

설정 화면에 들어가면 내 인스턴스 목록을 선택할 수 있고 연결된 프라이빗 IP까지 선택 가능하다. 선택 완료후 연결을 누르면 자동으로 연결된다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**인스턴스 정보 확인**

탄력적 IP를 연결하고 다시 인스턴스 정보를 확인해보면 IP가 할당된 것을 볼 수 있다. 퍼블릭 IP 주소도 기존 값에서 탄력적 IP 주소로 자동으로 변경되었다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

AWS 프리티어에서는 무료로 EIP 1개를 사용할 수 있다.   

하지만, EIP를 만들어두고 사용하지 않거나, EC2에 연결해두었다고 해도 EC2가 Stop된 상태라면 과금이 발생한다.   

따라서, 반드시 Elastic ip를 만들어두고 할당을 하지 않은 상태라면 실행중인 ec2에 할당 혹은 Elastic ip 삭제해야 한다.   

EIP를 만들어두고 사용하지 않게되면 낭비되는 IP가 발생하기 때문에 과금을 발생시키는 것 같다.

**ec2 및 elastic ip 제거**

Elastic ip 주소 연결 해제를 먼저 진행한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

그 후 아래 그림과 같이 Elastic IP 주소 릴리즈를 진행한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

그럼 아래처럼, 더 이상 계정에 할당할 수 없고 리소스에 연결할 수 없다고 안내한다. 릴리즈 버튼을 클릭하여 완전히 삭제한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

다음으로는 ec2를 제거해보자.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

인스턴스 종료 버튼을 클릭하게 되면, 인스턴스 상태가 종료됨(terminated)로 변경되면 정상적으로 삭제가 된 것이다.

#### **보안 그룹 설정**

보안 그룹은 AWS에서 제공하는 방화벽 모음이다.   

서비스를 제공하는 애플리케이션이라면 상관 없지만 RDS처럼 외부에서 함부로 접근하면 안되는 인스턴스는 허용된 IP에서만 접근하도록 설정이 필요하다.   

인바운드(Inbound): 외부 -> 인스턴스 내부 허용   
아웃바운드(Outbound): 인스턴스 내부 -> 외부 허용

**현재 보안 그룹 확인**

인스턴스 정보의 보안 탭에서 현재 설정된 보안 그룹을 확인할 수 있다.   

위에서 생성한 인스턴스의 보안그룹을 해석해보자.   
인바운드 규칙을 보면, 22번 포트의 내 IP에 대해서는 TCP 연결을 허용한다는 의미로 인스턴스에 SSH 접속을 직접 하기 위해서는 지정된 IP만 허용을 해주었다.   

반면, 아웃바운드의 경우는 모든 IP에 대해서 연결을 허용해 주었다.   

여기서 나의 어플리케이션을 다른 사용자가 접속하여 사용할수 있게 하기 위해서는 인바운드 규칙을 추가 해야 한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**보안 그룹 수정**

보안그룹으로 이동하여, 방금 전에 EC2에서 설정되어있던 보안 그룹을 수정해보자.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

위처럼, 인바운드 규칙에서 인바운드 규칙 편집을 클릭해보자.  
규칙 추가 버튼을 클릭하여 인바운드 규칙을 추가한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

---

#### AWS 주의 사항

* [프리티어 참고](https://aws.amazon.com/ko/free/?all-free-tier.sort-by=item.additionalFields.SortRank&all-free-tier.sort-order=asc&awsf.Free%20Tier%20Types=*all&awsf.Free%20Tier%20Categories=*all)
* [탄력적 IP 주소에 대한 요금이 부과되는 이유](https://aws.amazon.com/ko/premiumsupport/knowledge-center/elastic-ip-charges/)

---

#### Refer

* <https://wonyong-jang.github.io/aws/2022/06/05/AWS-EC2-Elastic-IP.html>

[[AWS] EC2 인스턴스 생성 및 고정 IP를 이용한 클라우드 서비스 배포 - SW Developer

이번 글에서는 AWS의 EC2를 생성하고 Docker Compose를 이용하여 애플리케이션을 배포하는 과정을 다루려고 한다. AWS에서는 처음 가입한 날부터 1년동안 사용가능한 서버를 무료로 제공해 준다. 하지

wonyong-jang.github.io](https://wonyong-jang.github.io/aws/2022/06/05/AWS-EC2-Elastic-IP.html)

### 최종 배포하기

---

기존에 운영 서버 profile에 localhost로 설정했던 부분을 탄력적 IP로 변경해주어야 한다.

#### SSH를 통해 Amazon EC2에 접근하는 방법

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

* Window
  + [OpenSSH를 사용하여 Windows에서 연결(권장)](https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/openssh.html)
  + [PuTTY를 사용하여 Windows에서 Linux 인스턴스에 연결](https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/putty.html)
  + [Windows Subsystem for Linux를 사용하여 Windows에서 Linux 인스턴스에 연결](https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/WSL.html)

#### **연결**

**SSH 연결**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**git 설치**

```java
#Perform a quick update on your instance:
$ sudo yum update -y

#Install git in your EC2 instance
$ sudo yum install git -y

#Check git version
$ git version
```

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**도커, 도커 컴포즈 설치 및 시작**

**docker client와 server(docker daemon)간 통신 방식은 기본적으로 unix domain socket(IPC socket)을 사용하며, 내부적으로 /var/run/docker.sock파일을 사용하여 통신한다. 따라서, 아래와 같이 설치 후 권한을 부여한다.**

```java
//도커 설치  
$ sudo yum install docker
$ docker -v

// 도커 컴포즈 설치 
$ sudo curl -L https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose   

// 도커 시작하기     
$ sudo systemctl start docker

// 실행 권한 적용   
$ sudo chmod +x /usr/local/bin/docker-compose    
$ sudo chmod 666 /var/run/docker.sock
$ docker-compose -v
```

**# 도커 설치**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**# 도커 컴포즈 설치 및 도커 시작하기**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**# 실행 권한 적용**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

#### Docker Compose 파일이 존재하는 소스 내려받기

```java
$ git clone https://github.com/bang-star/Pharmacy-Recommendation.git
```

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**Docker 환경변수**

로컬에서 개발할 때, DB 계정 정보나 외부에 노출되면 안되는 값들을 따로 제외하여 관리하였고 이를 도커 컨테이너를 실행할 때 전달해주어야 하는데 이때 .ENV 파일을 사용할 수 있다.   

docker-compose를 사용할때 .env라는 파일에 환경변수를 사용하면 자동으로 참조하여 사용할 수 있다.   

이를 동일하게 EC2에서도 docker-compose파일이 있는 위치에 아래와 같이 환경변수 값들을 추가해 주어서 docker-compose 실행시 해당 값들을 참조하여 컨테이너를 실행시킬 수 있게 해준다.

```java
$ vi .env   

SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=
```

.env 파일 생성후 아래 명령어를 통해 값을 확인 가능하다.

```java
docker-compose config
```

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**JDK 설치 및 jar 파일 생성**

Amazon에서 제공하는 OpenJDK인 Amazon Coretto를 다운받아 간편하게 설치할 수 있다.

```java
# aws coreetto 다운로드
$ sudo curl -L https://corretto.aws/downloads/latest/amazon-corretto-17-x64-linux-jdk.rpm -o jdk17.rpm

# jdk11 설치
$ sudo yum localinstall jdk17.rpm
```

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

```java
// 테스트 케이스 제외하고, jar 파일 빌드만 진행
$ ./gradlew clean build -x test
```

Permission denied 권한 거부 에러가 발생한다면 gradlew에 대한 권한이 없기 때문에 발생하는 에러로 권한을 주면 해결된다.

```java
// 권한 등록
chmod +x gradlew

// 테스트 케이스 제외하고, jar 파일 빌드만 진행
$ ./gradlew clean build -x test
```

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**Docker 이미지 받고 Docker Compose 실행**

```java
$ docker-compose up --build
```

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

할당받은 EC2 IP를 통해 접속하게 되면, 정상적으로 애플리케이션을 접속하는 것을 확인할 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

---

#### 테스트

서비스가 정상동작하는지 테스트해보려 한다.

**약국 추천**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**길 안내**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

**로드뷰**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/330)

모든 기능이 정상동작함을 확인할 수 있다.
