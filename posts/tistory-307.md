---
title: "[약국 길찾기 서비스] Get Ready With Me"
kind: "article"
permalink: "/posts/tistory-307.html"
published_on: "2023-01-06"
section: "프로젝트"
category: "프로젝트 / 약국 길찾기"
---

![본문 이미지](../assets/tistory/7c9cff8fe9b9da12b4e9341d.png)

## **프로젝트 준비**

---

### **프로젝트 실패 요인**

* **핵심 비즈니스 기능 외에 부가기능에 집중**
* **이 프로젝트의 핵심 비즈니스 기능은 약국 길찾기 서비스**상대적으로 우선순위가 낮은 로그인 기능과 프론트 화면은 부가 기능이다.   
  프론트 화면이나 로그인 기능은 보안이나 고객 경험에 직결되는 부분이기 때문에 중요한 기능이긴 하지만 프로젝트의 핵심 비즈니스 기능인 "약국 길찾기 서비스"가 고객에게 런칭되고 고객이 부정적인 피드백을 준다면 실패한 프로젝트가 될 것이다.
* **프로젝트에 반드시 필요한 프레임워크 및 라이브러리 외에 기술 스택 도입**기술스택은 먼저 결정하고 프로젝트를 진행하는 경우가 많다. 관련 없는 기술 스택에 집중하면 핵심 비즈니스 로직에 우선순위가 밀려나게 되고 관련 없는 기술 스택에 더 집중하고 시간을 소비하게 될 것이다.  
  예시) 프론트는 React, Vue.js 를 대부분 많이 사용하므로 프로젝트에 도입하자  
           요즘 쿠버네티스가 유행하니까 프로젝트에 도입해보자.  
           Kafka를 공부해고 싶었는데 프로젝트에 도입해보자.  

  **이로인해 다음과 같은 문제가 발생할 수 있다.  
  1. 핵심 비즈니스와 관련 없는 기술 스택에 더 집중****2. 최종 배포 일정이 지연 및 중단되는 경우가 발생**

### **프로젝트 성공 요인**

* **MVP(Minimum Variable Product)로 최소한의 기능만을 구현**새 프로젝트를 런칭하고 빠르게 아이디어를 검증하고 개선해 나가기 위한 전략으로 많이 사용된다.
* **비즈니스 핵심 기능 구현에 집중하며, 부가 기능은 최소한의 노력으로 개발**
* 핵심 기능인 추천 서비스 로직에 집중하며, 부가 기능인 로그인 및 View 등을 최소한의 노력만으로 구현
* 빠르게 구현이 가능한 HandleBars를 이용하여 View 구성
* **Docker 및 Docker-Compose 를 이용하여 빠르게 클라우드 서비스 배포**
* **고객에게 중요한 피드백을 빠르게 받고 아이디어 검증 가능**
* **핵심 비즈니스 기능이 검증된 후 부가 기능을 추가 배포 및 아키텍처 확장이 유연함**

## **요구사항 분석**

---

[외부 API(카카오 주소 검색 API)](https://developers.kakao.com/docs/latest/ko/local/dev-guide)와 [공공 데이터(약국 현황 정보)](https://www.data.go.kr/data/15065023/fileData.do)를 활용함으로써 혼자 개발하고 마무리 되는 프로젝트가 아닌 실제 서비스 가능한 수준의 프로젝트를 경험해본다.   

추천된 약국의 길 안내는 [카카오 지도 및 로드뷰 바로가기 URL](https://apis.map.kakao.com/web/guide/#routeurl)로 제공된다.   

약국 도메인이 아닌 자신만의 추천 서비스 구현이 가능해질 것이며, [카카오 키워드 장소 검색 API](https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-category)를 이용하여 약국 외에 편의점, 지하철역, 음식점 등 다른 도메인으로 적용 가능함을 확인할 수 있다.    
즉 다른 도메인의 데이터 또는 API가 존재한다면 자신만의 추천 서비스를 구현해 볼 수 있다.

### **약국 찾기 서비스 요구사항**

* 약국 현황 데이터(공공 데이터)를 관리하고 있다라고 가정하고, 약국 현황 데이터는 위도 경도의 위치 정보 데이터를 가지고 있다.
* 해당 서비스로 주소 정보를 입력하면 위치 기준에서 가까운 약국 3곳을 추천한다.
* 주소는 도로명 주소 또는 지번을 입력하여 요청 받는다.
  + 정확한 주소를 입력 받기 위해 [Kakao 우편번호 서비스](https://postcode.map.daum.net/guide)를 이용한다.
* 주소는 정확한 상세 주소(동, 호수)를 제외한 주소 정보를 이용하여 추천한다.
  + EX) 서울 성북구 종암로 10길
* 입력받은 주소를 위도, 경도로 변환하여 기존 약국 데이터와 비교 및 가까운 약국을 찾는다.
  + 지구는 평면이 아니기 때문에, 구면에서 두 점 사이의 최단 거리 구하는 공식이 필요하다.
  + 두 위 경도 좌표 사이의 거리를 [haversine formula](https://en.wikipedia.org/wiki/Haversine_formula)로 계산한다.
  + 지구가 완전한 구형이 아니므로 오차가 발생할 수 있다.
* 입력한 주소 정보에서 정해진 반경(10km) 내에 있는 약국만 추천한다.
* 추출한 약국 데이터는 길안내 URL 및 로드뷰 URL로 제공한다.
  + 길안내 URL : <https://map.kakao.com/link/map/우리회사,37.402056,127.108212>
  + 로드뷰 URL : <https://map.kakao.com/link/roadview/37.402056,127.108212>
* 길안내 URL은 고객에게 제공되기 때문에 가독성을 위해 shorten url로 제공한다.
* shorten url에 사용되는 Key 값은 인코딩하여 제공한다.
  + ex) http://localhost:8080/dir/nqxtxd
  + bas62 를 통한 인코딩
* shorten url의 유효 기간을 30일로 제한한다.

## **프로젝트 설계**

---

### **System Architecture**

[원문에서 이미지 보기](https://to-be-a-artist.tistory.com/307)

### **Service Flow**

[원문에서 이미지 보기](https://to-be-a-artist.tistory.com/307)

### **Feature List**

* Spring Data JPA를 이용한 CRUD 메소드 구현하기
* Spock를 이용한 테스트 코드 작성
* Testcontainers를 이용하여 독립 테스트 환경 구축하기
* 카카오 주소검색 API 연동하여 주소를 위도, 경도로 변환하기
* 추천 결과를 카카오 지도 URL로 연동하여 제공하기
* 공공 데이터를 활용하여 개발하기 (약국 현황 데이터)
* Handlebars 이용한 간단한 View 만들기
* 도커를 사용하여 다중 컨테이너 애플리케이션 만들기
* 어플리케이션을 클라우드 서비스에 배포하기
* Spring retry를 이용한 재처리 구현하기 (카카오 API의 네트워크 오류 등에 대한 재처리)
* base62를 이용한 shorten url 개발하기 (길안내 URL)
* redis를 이용하여 성능 최적화하기

### **Tech Stack**

* JDK 17
* Spring Boot 2.7.7
* Spring Data JPA
* Gradle
* Handlebars
* Lombok
* Github
* Docker
* AWS EC2
* Redis
* MariaDB
* Spock
* Testcontainers
