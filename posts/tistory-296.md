---
title: "[SNS 어플리케이션] 회원가입과 로그인 기능 구현"
kind: "article"
permalink: "/posts/tistory-296.html"
published_on: "2022-12-29"
section: "프로젝트"
category: "프로젝트 / SNS 서비스 / 기능 구현"
---

## 회원가입과 로그인 기능 구현

---

**회원가입과 로그인 Sequence diagram**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/296)

### **회원가입**

---

#### **Controller**

```java
@PostMapping("/join")
public Response<UserJoinResponse> join(@RequestBody UserJoinRequest request){
    User user = userService.join(request.getUsername(), request.getPassword());
    return Response.success(UserJoinResponse.fromUser(user));
}
```

#### **Service**

```java
@Transactional
public User join(String username, String password){
    // 회원가입하려는 username으로 회원가입된 user가 있는지
    userEntityRepository.findByUsername(username).ifPresent(it -> {
        throw new SnsApplicationException(ErrorCode.DUPLICATED_USERNAME, String.format("%s is duplicated", username));
    });

    // 회원가입 진행 = user 등록
    UserEntity userEntity = userEntityRepository.save(UserEntity.of(username, encoder.encode(password)));
    return User.fromEntity(userEntity);
}
```

### **로그인**

---

#### **Controller**

```java
@PostMapping("/login")
public Response<UserLoginResponse> login(@RequestBody UserLoginRequest request){
    String token = userService.login(request.getUsername(), request.getPassword());
    return Response.success(new UserLoginResponse(token));
}
```

#### **Service**

```java
public String login(String username, String password) {
    // 회원가입 여부 체크
    UserEntity userEntity = userEntityRepository.findByUsername(username)
            .orElseThrow(() -> new SnsApplicationException(ErrorCode.USER_NOT_FOUND, String.format("%s not founded", username)));

    // 비밀번호 체크
    if(!encoder.matches(password, userEntity.getPassword())){
        throw new SnsApplicationException(ErrorCode.INVALID_PASSWORD);
    }

    // 토큰 생성
    String token = JwtTokenUtils.generateToken(username, secretKey, expiredTimeMs);

    return token;
}
```

### **정리**

---

1. 클라이언트에게 전달되는 응답 값 통일성 향상

> 로그인과 회원가입에 경우 반환되는 데이터가 다르다. 프론트 엔드 개발자와 협업 시 생산성을 떨어뜨릴 수 있기 때문에 통일하여 반환되는 데이터 형식을 통일되도록 하였다.

2. 에러 코드 가독성 항샹

> 각 기능에서 발생할 수 있는 에러를 효율적으로 관리하기 위해 에러 코드를 Enum 클래스와 메시지를 클래스로 관리하고 ControllerAdvice 클래스를 생성하여 전역에서 발생할 수 있는 예외를 처리하였다.

3. JWT 토큰

> 사용자의 username, key 값과 유효기간을 설정하여 암호화 알고리즘을 통해 JWT 토큰 생성함.
