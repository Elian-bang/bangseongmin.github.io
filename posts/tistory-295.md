---
title: "[SNS 어플리케이션] 회원가입 및 로그인 기능 테스트 작성하기"
kind: "article"
permalink: "/posts/tistory-295.html"
published_on: "2022-12-29"
section: "프로젝트"
category: "프로젝트 / SNS 서비스 / 기능 구현"
---

## **회원가입 및 로그인 기능 테스트 작성하기**

---

**TDD(Test Driven Development)**

요구사항에 맞춰서 테스트를 먼저 작성하고 이를 통과하기 위한 최소한의 코드를 작성하여 테스트를 통과시키고 이를 요구사항에 맞춰서 다시 제대로 동작하도록 리팩터링 하는 방식으로 짧은 개발 사이클을 반복해서 개발하는 방법론 중 하나이다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/295)

장점은 테스트를 작성함으로써 디버깅 시간이 단축되고 추가적인 스펙 구현을 할 때 앞서 작성한 테스트 코드가 있으므로 보다 안정적으로 테스트를 작성할 수 있다. 

단점은 테스트 양이 많고 테스트 코드가 먼저 선행되어야 하므로 생산성이 저하될 수 있다는 단점이 있다. 

### **회원가입 및 로그인 기능 분석**

---

#### **회원가입**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/295)

username과 password를 통해 회원가입이 가능하다.

요구사항을 바탕으로 오른쪽 그림과 같은 Sequence Diagram을 그려 회원가입이 성공하는 경우와 실패하는 경우를 생각해낼 수 있다.

#### **로그인**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/295)

username과 password를 통해 로그인이 가능하다.

요구사항을 바탕으로 Sequence Diagram을 그려보면 3 가지 상황을 가정해볼 수 있다.

로그인이 성공한 경우, 로그인 실패하는 경우는 아이디가 존재하지 않을 때와 패스워드가 일치하지 않은 경우이다.

### **Controller 테스트**

---

#### **회원가입**

**회원가입이 성공하는 경우**

```java
@Test
public void 회원가입() throws Exception {
    String username = "username";
    String password = "password";

    when(userService.join(username, password)).thenReturn(mock(User.class));

    mvc.perform(post("/api/v1/users/join")
            .contentType(MediaType.APPLICATION_JSON)
            // TODO : add request body
            .content(objectMapper.writeValueAsBytes(UserJoinRequest.of(username, password)))
    ).andDo(print())
            .andExpect(status().isOk());
}
```

**회원가입이 실패하는 경우**

```java
@Test
public void 회원가입시_이미_회원가입된_username으로_회원가입을_하는경우_에러반환() throws Exception{
    String username = "username";
    String password = "password";

    when(userService.join(username, password)).thenThrow(new SnsApplicationException(ErrorCode.DUPLICATED_USERNAME, ""));

    mvc.perform(post("/api/v1/users/join")
                    .contentType(MediaType.APPLICATION_JSON)
                    // TODO : add request body
                    .content(objectMapper.writeValueAsBytes(UserJoinRequest.of(username, password)))
            ).andDo(print())
            .andExpect(status().isConflict());
}
```

#### 

---

#### **로그인**

**로그인이 성공하는 경우**

```java
@Test
public void 로그인() throws Exception {
    String username = "username";
    String password = "password";

    when(userService.login(username, password)).thenReturn("test_token");

    mvc.perform(post("/api/v1/users/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    // TODO : add request body
                    .content(objectMapper.writeValueAsBytes(UserLoginRequest.of(username, password)))
            ).andDo(print())
            .andExpect(status().isOk());
}
```

**로그인시 아이디가 존재하지 않는 경우**

```java
@Test
public void 로그인시_회원가입이_안된_username_입력할경우_에러반환() throws Exception {
    String username = "username";
    String password = "password";

    when(userService.login(username, password)).thenThrow(new SnsApplicationException(ErrorCode.USER_NOT_FOUND));

    mvc.perform(post("/api/v1/users/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    // TODO : add request body
                    .content(objectMapper.writeValueAsBytes(UserLoginRequest.of(username, password)))
            ).andDo(print())
            .andExpect(status().isNotFound());
}
```

**로그인시 패스워드가 틀린 경우**

```java
@Test
public void 로그인시_틀린_password를_입력한경우_에러반환() throws Exception {
    String username = "username";
    String password = "password";

    when(userService.login(username, password)).thenThrow(new SnsApplicationException(ErrorCode.INVALID_PASSWORD));

    mvc.perform(post("/api/v1/users/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    // TODO : add request body
                    .content(objectMapper.writeValueAsBytes(UserLoginRequest.of(username, password)))
            ).andDo(print())
            .andExpect(status().isUnauthorized());
}
```

### **Service 테스트**

---

#### **회원가입**

**회원가입이 성공하는 경우**

```java
@Test
void 회원가입이_정상적으로_동작하는_경우() {
    String username = "username";
    String password = "password";

    // mocking
    when(userEntityRepository.findByUsername(username)).thenReturn(Optional.empty());
    when(encoder.encode(password)).thenReturn("encrypt_password");
    when(userEntityRepository.save(any())).thenReturn(UserEntityFixture.get(username, password));

    Assertions.assertDoesNotThrow(() -> userService.join(username, password));
}
```

**회원가입이 실패하는 경우**

```java
@Test
void 회원가입시_username으로_회원가입한_유저가_이미_존재하는_경우() {
    String username = "username";
    String password = "password";

    UserEntity fixture = UserEntityFixture.get(username, password);

    // mocking
    when(userEntityRepository.findByUsername(username)).thenReturn(Optional.of(fixture));
    when(encoder.encode(password)).thenReturn("encrypt_password");
    when(userEntityRepository.save(any())).thenReturn(Optional.of(fixture));

    SnsApplicationException e = Assertions.assertThrows(SnsApplicationException.class, () -> userService.join(username, password));
    Assertions.assertEquals(ErrorCode.DUPLICATED_USERNAME, e.getErrorCode());
}
```

---

#### **로그인**

**로그인이 성공하는 경우**

```java
@Test
void 로그인이_정상적으로_동작하는_경우() {
    String username = "username";
    String password = "password";

    UserEntity fixture = UserEntityFixture.get(username, password);

    // mocking
    when(userEntityRepository.findByUsername(username)).thenReturn(Optional.of(fixture));
    when(encoder.matches(password, fixture.getPassword())).thenReturn(true);
    Assertions.assertDoesNotThrow(() -> userService.login(username, password));
}
```

**로그인시 아이디가 존재하지 않는 경우**

```java
@Test
void 로그인시_username으로_회원가입한_유저가_존재하지_않는_경우() {
    String username = "username";
    String password = "password";

    // mocking
    when(userEntityRepository.findByUsername(username)).thenReturn(Optional.empty());

    SnsApplicationException e = Assertions.assertThrows(SnsApplicationException.class, () -> userService.login(username, password));
    Assertions.assertEquals(ErrorCode.USER_NOT_FOUND, e.getErrorCode());
}
```

**로그인시 패스워드가 틀린 경우**

```java
@Test
void 로그인시_password가_틀린_경우() {
    String username = "username";
    String password = "password";
    String wrongPassword = "wrongPassword";

    UserEntity fixture = UserEntityFixture.get(username, password);

    // mocking
    when(userEntityRepository.findByUsername(username)).thenReturn(Optional.of(fixture));

    SnsApplicationException e = Assertions.assertThrows(SnsApplicationException.class, () -> userService.login(username, wrongPassword));
    Assertions.assertEquals(ErrorCode.INVALID_PASSWORD, e.getErrorCode());
}
```
