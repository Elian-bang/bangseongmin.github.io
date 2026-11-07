---
title: "[TroubleShooting] error occurs while validating. io.jsonwebtoken.security.signatureexception: jwt signature does not match locally computed signature. jwt validity cannot be asserted and should not be trusted."
kind: "article"
permalink: "/posts/tistory-343.html"
published_on: "2023-02-18"
section: "트러블슈팅"
category: "트러블슈팅"
---

## error occurs while validating. io.jsonwebtoken.security.signatureexception: jwt signature does not match locally computed signature. jwt validity cannot be asserted and should not be trusted.

---

### When?

JWT Token Secret Key 값이 날라갔다... 이유는 외장하드가 날아가서 환경변수 값이 함께 날아가버렸다...

그래서 임시로 아무 값이나 넣었더니 다음과 같은 에러가 발생하였다...

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/343)

### How to Solve?

해결은 간단하다... 기존과 동일하게 128자의 문자를 base64로 인코딩하면 된다.

이유는 현재 HS256 알고리즘을 사용하기 때문에 Secret key는 64Byte 이상이 되어야 한다.
