---
title: "[Firebase] Firebase Hosting"
kind: "article"
permalink: "/posts/tistory-427.html"
published_on: "2023-07-16"
section: "프로그래밍"
category: "프로그래밍"
---

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

## Firebase Hosting

---

Vue 언어를 공부하면서 간단하게 프론트 서버를 호스팅해보려고 합니다.

프론트 서버를 호스팅할 수 있는 무료 서버가 많은데 그중 이번에 Firebase를 이용해보려고 합니다.

### Firebase를 선택한 이유

---

#### 인증 시스템 지원

직접 서버로 개발할 겨우 많은 시간이 들어갈 수 있는데, 이를 Firebase는 모두 제공해주고 있다.

#### NoSQL 기반의 데이터베이스

다른 데이터베이스들과 다르게 RTSP(Real Time System Protocol) 방식의 데이터베이스를 지원하고 있다. RTSP는 실시간으로 데이터를 전송해주는 방식으로 이 방식을 사용하면 소켓 기반 서버를 만들어서 통신하는 것보다 훨씬 코드양이 줄게되어 코드 몇줄로도 원하는 구성을 만들 수 있습니다.

#### 콘솔 제공

앱의 서버를 만들게 되면 리눅스 FTP, MySQL, Node.JS 혹은 Spring 서버, 푸시보내기 API만 구축할 것이 아니라 이 모든 것을 관리할 수 있는 관리자 페이지가 필요한데 Firebase 는 이를 지원해주고 있다.

#### Analytics 제공

* Analytics는 다수의 사용자가 앱을 어떻게 사용하는지에 대한 통계 정보를 가지고 있다.
* 추적할 수 있는 정보는 앱의 현재 접속자, 오류 통계, 사용자 유지율, 고객들의 앱 업데이트 상태, 사용자들이 특정 페이지에 머문 시간, 이벤트 등을 확인할 수 있다.
* 이런 데이터들을 수집하면 사용자가 어떤 페이지에서 흥미를 잃었고 어떤 페이지가 인기가 많은지 등을 찾아낼 수 있으며 맞춤 마케팅을 할 수 있다.

### 사용법

---

1. firebase 를 검색하시고 **Firebase - Google**을 클릭해주세요.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

**2. 로그인을 해주시고 시작하기를 눌러주세요.**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

**3. 프로젝트 추가**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

**4. 프로젝트명 입력**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

**5. Google Analytics 이용여부 설정**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

**6. Firebase SDK 추가**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

npm 을 통해 직접 설치하는 방법과 script를 통해 사용하는 방법이 있습니다.

firebaseConfig 파일을 입력해주셔야 하는데 해당 Key값이 유출되면 위험하기 때문에 해당 정보는 .evn 파일에 입력하여 주시고 Firebase에서 제공한 방법과 같이 사용하셔도 되시고 아래와 같이 파일을 분리하여 사용하실 수도 있습니다.

```javascript
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: [REDACTED],
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
};

export default firebaseConfig;
```

```javascript
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueCookies from 'vue-cookies'
import VueCompositionAPI from '@vue/composition-api'
import { initializeApp } from "firebase/app";
import firebaseKey from "@/firebaseKey";

initializeApp(firebaseKey);

Vue.use(VueCompositionAPI);
Vue.config.productionTip = false

// default options config: { expires: '1d', path: '/', domain: '', secure: '', sameSite: 'Lax' }
Vue.use(VueCookies);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
```

**7. Firebase CLI 설치**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

> [참고] 사용하고 있는 NPM 버전이 지원되지 않는다고 에러가 발생할 경우, `nvm use {version}`을 통해 버전을 업데이트 해주실수 있습니다.  
>   
> 만약 [NVM](https://github.com/coreybutler/nvm-windows/releases)을 설치하지 않으셨다면 설치해주시면 됩니다.

**8. Firebase 호스팅 배포**

아래 설명을 따라해보시면 배포를 하실 수 있습니다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

```bash
firebase login
```

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

Firebase 로그인 시도

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

구글 계정 연동

허용해주시면 끝!!

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

```bash
firebase init
```

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

firebase 기능 선택

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

프로젝트 선택

위에서 이미 프로젝트를 생성하였으므로 생성하신 프로젝트를 선택해주시면 됩니다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

빌드 파일의 위치 선택 default 값은 public 폴더입니다.

싱글 페이지 웹인가? YES

Github deploy를 사용할 것인지? No

index.html에 덮어쓸까? No

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

이와 같이 설명하면 모든 게 끝이 났습니다!! 그러면 다음과 같이 Firebase 설정 파일이 생성됩니다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

```bash
firebase deploy
```

이번엔 진짜 마지막 배포!!

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/427)

> [참고] Vue 같은 경우 build 하면 dist 파일에 빌드 파일이 생성되므로 firebase.json 파일에 public 을 dist로 변경해주시면 됩니다.
