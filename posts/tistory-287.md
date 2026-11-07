---
title: "[게시판 서비스 고도화] 인증 기능 고도화"
kind: "article"
permalink: "/posts/tistory-287.html"
published_on: "2022-12-17"
section: "프로젝트"
category: "프로젝트 / 게시판 서비스 / 기능 고도화"
---

## **인증 기능 고도화**

---

### **들어가기**

---

현재 데이터베이스에 저장된 회원정보를 통해 로그인을 하고 있다. 

로그인을 하기위한 각종 정보들이 DB에 담겨져 있다. 그러면 로그인 요청을 받거나 게시판에 글을 쓰거나 하는 여러가지 기능을 사용할 때 데이터베이스에 직접 바라보고 데이터를 가져와서 인증을 통과시키거나 하는 작업들을 수행했었다.

이러한 작업을 직접하지 않고 카카오 OAuth2.0 인증 기능을 사용하려고 한다.

기존 방식대로 인증을 하게 되면 복잡한 서비스를 하게 될 때 각종 회원의 개인 정보와 같은 민감 정보를 직접 관리한다는 의미가 된다. 현재 게시판 서비스에는 많은 정보를 들고 있지 않지만, 개인을 식별하기 위한 민감 정보(실명, 전화번호, 이메일, 주소, 금융 서비스를 위한 계좌 및 카드 정보 등)는 보안이 필요해지면서 중 법적인 문제에서 자유롭지 못하게 된다. 국가에서 제공한 법적인 가이드라인을 따라서 조취를 취해야하고 보안에 신경을 써주어야 한다. 

만약 운영하고 있는 서비스에 회원정보가 외부 해커에 의해 공격을 받게 되어 개인정보들이 유출된다면 회사 입장에서는 치명이 큰 문제가 될 것이다. 이러한 문제점들을 극복하기 위해서 OAuth라는 인증 기술을 사용하려 한다.

인증 주체가 자신의 서비스가 아닌 신뢰할 수 있는 큰 서비스에 인증 기술을 가져다 사용하는 것이다. 인증 주체, 인증 책임을 직접 지지 않고, 외부 서비스에 위임하는 것이다. 큰 서비스에 인증 기술을 위임하면서 신규 사용자는 우리의 서비스에 별도 회원가입 없이 자유롭게 사용해진다.

OAuth 기술을 사용하는 방법은 한 가지가 아니다. 

* 인증을 온전히 큰 서비스에 맡기는 방법
* 큰 서비스에 인증은 위임하지만 정보를 읽어들인 다음에는 데이터베이스에 저장하는 방법 ✔️

인증 주체는 큰 서비스에 넘기고 큰 서비스로부터 로그인을 한 뒤에는 그 정보 일부를 회원 테이블에 동기화시켜 가입을 시키는 방식으로 작업을 하려 한다. 기존에 비즈니스 로직이 크게 바뀌지 않는 한도 내에서 인증 서비스만 우리의 데이터베이스 인증 방식에서 큰 서비스에 인증 방식으로 전환하려 한다.

### Check The Issue

---

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

현재 코드에 문제가 있었다. OAuth를 통해 로그인한 사용자 정보를 DB에 저장하는 작업 등에서 AuditingField에 일부가 원활하게 동작하지 않을 것이다. 이유는 private로 지정하였기 때문에 사용자 정보를 직접적으로 넣어주어야 하기 때문이다. 이를 위해 private 접근자를 protected로 변경해주면 간단하게 해결가능해진다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

### **카카오톡 로그인 API**

---

#### **애플리케이션 등록하기**

1. 애플리케이션 등록하기 위해서 Kakao Developers 사이트를 로그인해야 한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

2. 내 애플리케이션으로 이동한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

3. 내 애플리케이션 페이지에서 애플리케이션 추가하기 버튼을 누른다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

4. 다음과 같이 로고와 앱 이름, 사업자명을 입력하고 저장하기를 누른다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

5. 다음과 같이 생성된 애플리케이션을 확인할 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

---

#### **Rest API 키 확인**

애플리케이션 페이지에서 REST API 키를 확인할 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

> 네이티브 앱 키 : 앱 개발에서 사용하는 키  
> JavaScript 키 : 프론트 엔드에서 사용하는 키  
> Admin 키 : 관리자 화면에서 사용하는 키

---

#### **사이트 도메인 등록**

**1. 애플리케이션 페이지에서 플랫폼 설정하기를 누른다**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

2. 플랫폼 설정 페이지에서 원하는 플랫폼을 선택한다.

현재 구현하는 서비스는 웹 서비스이므로 웹 서비스를 선택하였다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

4. 사이트 도메인을 등록하고 기본 도메인 정보를 확인한 후, 저장 버튼을 클릭한다.

* 로컬에서 테스트를 하고 있으므로 도메인 명을 `http://localhost:8080` 입력할 수 있다.
* cloudtype에 배포한 주소를 추가적으로 입력할 수 있다.

로컬과 서비스 도메인을 등록하여 로컬과 서비스 환경에서 모두 테스트가 가능해졌다.

기본 도메인은 현재 로컬 서비스로 되어있는데 추후에 배포된 서버에 도메인으로 변경하는 것이 좋다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

---

#### **Redirect URI 등록**

> Redirect URI는 카카오 서버에서 인증이 마치고 본인의 서비스로 돌아올때 사용할 URI를 의미합니다.  
> 즉 인증을 마친 후에 되돌아올 서비스의 URI를 의미합니다.

Spring Security OAuth 클라이언트 기술을 쓰고 있다면 기본값이 이미 정해져 있다.

[[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/core.html#oauth2login-sample-redirect-uri)

> **규칙.** {baseUrl}/login/oauth2/code/{registrationId}  
> **예시.** localhost:8080/login/oauth2/code/google

위와 같이 이미 정해져 있고, 설정을 통해 수정이 가능하다.

1. **Web** 사이트 도메인 하단에 `**등록하러 가기`**를 클릭합니다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

2. **`Redirect URI 등록`** 버튼을 클릭한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

3. Redirect URI를 입력하고 저장해준다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

> **규칙** - {baseUrl}/login/oauth2/code/{registrationId}  
> **\* baseUrI는 테스트 환경에 맞게 localhost:8080과 배포 서버 domain에 맞춰 작성해주면 된다.**  
> **\* registrationId는 OAuth 인증 기능을 제공해주는 서비스 Provider Id(고유 식별자)를 지정해주면 된다.**  
> registrationId는 임의로 정하는 것이고 몇 가지는 이미 정해져 있는게 있는데  
> github, facebook 같은 경우는 spring security OAuth가 이미 알고 있는 Id이다.  
> 카카오는 한국에서는 유명하지만.. Spring 커뮤니티에서는 모르기 때문에 따로 등록을 해줘야한다.

---

#### **동의항목 설정**

**카카오에서 제공해주는 회원 정보를 접근할 수 있는데 서비스를 운영하기 위해서 필요한 정보는 이용 동의를 통해 받을 수 있다.**

**1. 메뉴에서 동의항목을 눌러준다.**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

**2. 서비스에 필요한 열람 정보를 설정한다.**

카카오에서 수집하여 관리하고 있는 개인 정보 목록을 열람할 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

**3. 동의 항목 설정시 동의 단계와 동의 목적을 설정한다.**

설계한 도메인을 기준으로 동의 단계를 설정하고, 필요한 목적을 작성해주시면 됩니다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

카카오 로그인 기능에서는 필수 동의를 하나만 선택할 수 있고, 나머지는 정보는 선택 동의를 통해 받을 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

---

#### **Client Secret Key 확인**

**1. 메뉴에서 보안을 선택합니다.**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

2. 코드 생성을 클릭하고 생성 버튼을 눌러주면 생성된다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

3. 다음과 같이 생성된 Client Secret을 확인할 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

---

#### **의존성 추가**

1. OAuth2 Client를 선택한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

* **OAuth2 Client** 는 다른 인증 서비스 서버를 접근할때 사용
* **OAuth2 Resource Server** 는 자신의 서비스를 OAuth2 인증 서버로 개발할때 사용

2. build.gradle에 의존성을 추가해준다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

---

#### **Spring Property 설정**

설정은 크게 2가지로 registration과 provider로 나뉜다.

이때 이러한 서비스를 제공하는 서비스 제공자를 provider라고 부른다. 즉 OAuth2.0 서비스를 제공하는 공급자

어떤 서비스 공급자를 사용할지 정의할때 식별자로 id(provider id)를 사용한다. 이미 등록되어있는 서비스 공급자라면 Spring boot 프로젝트 내부에 저장되어 있어 해당 서비스 OAuth 인증 기술을 사용하는 필요로하는 기본적인 설정이 이미 설정되어 있다.

* **registration** - 사용할 OAuth 공급자 Id를 설정하고 기본 설정정보를 설정한다.
  + [Spring Security OAuth doc](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/core.html) 
    - yaml 파일에 특징으로 `{}`이 단순 문자열로 인식되어 특수한 문자열을 인식되게 하기 위해서는 ""을 넣어주어야한다.
  + [authorization-grate-type](https://oauth.net/2/grant-types/)
  + [카카오 API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
* **provider**
  + **authorization-uri : 권한 확인**
  + **token-uri : 토큰 갱신**
  + **user-info-uri : 유저 정보 획득**
  + **user-name-attribute : 고유 값 설정**

```java
  security:
    oauth2:
      client:
        registration:
          kakao:
            client-id: id
            client-secret: key
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/kakao"
            client-authentication-method: POST
        provider:
          kakao:
            authorization-uri: https://kauth.kakao.com/oauth/authorize
            token-uri: https://kauth.kakao.com/oauth/token
            user-info-uri: https://kapi.kakao.com/v2/user/me
            user-name-attribute: id
```

### **회원 도메인이 인증 없는 상태에서 회원 정보를 저장할 수 있게 수정하기**

---

회원 서비스를 DB 인증 방식으로 사용하고 있는데 인증 부분을 카카오에게 위임하려 한다.

카카오부터 인증을 받았는데, 서비스는 여전히 DB로 부터 인증정보를 받는 구조이기 때문에 인증받은 정보는 DB에 존재하지 않아 인증이 필요한 서비스를 사용할 수 없다.

#### **해결 방법**

1. OAuth 인증 서버로 부터 받은 인증 정보를 DB에 저장하고 사용하는 방법 ✔️

2. 매번 인증한 뒤에도 인증 정보가 필요할 때마다 OAuth 서버에 요청하는 방법

2번 방법은 불필요한 반복이 계속 반복되는 단점이 있기 때문에 1번 방법을 통해 해결하려 한다.

처음 인증은 카카오 OAuth를 통해 하고 인증정보는 DB에 저장하여 사용하는 것이다. 즉 회원 테이블은 여전히 필요하다.

필요한 유저정보는 다 받게 하고 있다.

```java
private UserAccount(String userId, String userPassword, String email, String nickname, String memo) {
    this.userId = userId;
    this.userPassword = userPassword;
    this.email = email;
    this.nickname = nickname;
    this.memo = memo;
}
```

Auditing Field에 있는 createdAt과 modifiedAt은 자동으로 들어가지만 createdBy와 modifiedBy 즉 생성자, 수정자는 인증 정보로부터 얻어야 한다. 인증을 한 상태에서는 로그인한 사용자가 있어 닉네임이나 아이디를 통해 넣을 수 있지만 로그인을 한 상태도 아니고 로그인을 했다 하더라도 카카오 서버를 통해 로그인을 한 것이기 때문에 유저 정보가 DB에 없어 createdBy와 modifiedBy는 사용할 수 없는 상태이다. 저장할 때 정보를 담아줘야 하는데 Spring Boot에 Auditing 기술은 알아낼 방법이 없다. 즉 인증정보가 없는 상황에서 저장할 수 방안이 필요하다.

```java
@Getter
@ToString
@EntityListeners(AuditingEntityListener.class)
@MappedSuperclass
public abstract class AuditingFields {

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    @CreatedDate
    @Column(nullable = false, updatable = false)
    protected LocalDateTime createdAt;             // 생성일시

    @CreatedBy
    @Column(nullable = false, updatable = false, length = 100)
    protected String createdBy;                    // 생성자

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    @LastModifiedDate
    @Column(nullable = false)
    protected LocalDateTime modifiedAt;            // 수정일시

    @LastModifiedBy
    @Column(nullable = false, length = 100)
    protected String modifiedBy;                  // 수정자

}
```

생성 시에는 생성자와 수정자는 동일하다.

```java
private UserAccount(String userId, String userPassword, String email, String nickname, String memo, String createdBy) {
    this.userId = userId;
    this.userPassword = userPassword;
    this.email = email;
    this.nickname = nickname;
    this.memo = memo;
    this.createdBy = createdBy;
    this.modifiedBy = createdBy;
}
```

이와 같이 생성자에 필드를 추가함으로써 해결이 가능하다.

하지만.. 도메인 코드를 변경하여 예하 서비스 코드에 영향을 주게 된다. 정답은 아니다.

생성자를 통해 접근하는 것이 아닌 팩토리 메소드를 통해 접근하고 있으므로 팩토리 메소드만 추가해주면 된다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

### **카카오 인증 응답 정보 확인, 정의하기**

---

인증 정보가 기본 Spring Security 인증 정보뿐만 아니라 OAuth2 인증 기술로 사용할 수 있도록 할 것이다.

#### **Principal에 OAuth2User 적용**

```java
public record BoardPrincipal(
        String username,
        String password,
        Collection<? extends GrantedAuthority> authorities,
        String email,
        String nickname,
        String memo,
        Map<String, Object> oAuth2Attributes
) implements UserDetails, OAuth2User {

    public static BoardPrincipal of(String username, String password, String email, String nickname, String memo) {
        return of(username, password, email, nickname, memo, Map.of());
    }

    public static BoardPrincipal of(String username, String password, String email, String nickname, String memo, Map<String, Object> oAuth2Attributes) {

        /**
         * 지금은 인증만 하고 권한을 다루고 있지 않아서 임의로 세팅한다.
         * by Mr.Bang 2022.12.14
         */
        Set<RoleType> roleTypes = Set.of(RoleType.USER);

        return new BoardPrincipal(
                username,
                password,
                roleTypes.stream()
                        .map(RoleType::getName)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toUnmodifiableSet())
                ,
                email,
                nickname,
                memo,
                oAuth2Attributes
        );
    }

    public static BoardPrincipal from(UserAccountDto dto) {
        return BoardPrincipal.of(
                dto.userId(),
                dto.userPassword(),
                dto.email(),
                dto.nickname(),
                dto.memo()
        );
    }

    public UserAccountDto toDto() {
        return UserAccountDto.of(
                username,
                password,
                email,
                nickname,
                memo
        );
    }


    @Override public String getUsername() { return username; }
    @Override public String getPassword() { return password; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }


    @Override public String getName() { return username; }
    @Override public Map<String, Object> getAttributes() { return oAuth2Attributes; }

    public enum RoleType {
        USER("ROLE_USER");

        @Getter private final String name;

        RoleType(String name) {
            this.name = name;
        }
    }

}
```

> **1. Map<String, Object>에서 왜 Object 타입을 사용할까?**OAuth2 인증 서비스마다 제공해주는 인증 정보들이 Resful하게 만들어져 있어서 JSON으로 받는다고 하더라도 구조가 다다르기 때문에 어떤 구조든 Key, Value구조로 내려준다면 받아들일 수 있도록 하기 위함이다.  
>   
> 이는 매번 타입 체크를 못하고 타입 캐스팅을 해줘야하고 타입 안정성을 적절히 활용할 수 없다는 단점이 있지만  
> 어떤 서비스 Provider가 제공하는 것이라도 OAuth 기술을 사용할 수 있게 열어둔 것이다.

---

#### **인증 응답 정보 확인 및 테스트**

카카오 OAuth2 방식으로 로그인을 할 때 RESTAPI로 내려주는 응답 구조이다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

```java
@SuppressWarnings("unchecked") // TODO: Map -> Object 변환 로직이 있어 제네릭 타입 캐스팅 문제를 무시한다. 더 좋은 방법이 있다면 고려할 수 있음.
public record KakaoOAuth2Response(
        Long id,
        LocalDateTime connectedAt,
        Map<String, Object> properties,
        KakaoAccount kakaoAccount
) {
    public record KakaoAccount(
            Boolean profileNicknameNeedsAgreement,
            Profile profile,
            Boolean hasEmail,
            Boolean emailNeedsAgreement,
            Boolean isEmailValid,
            Boolean isEmailVerified,
            String email
    ) {
        public record Profile(String nickname) {
            public static Profile from(Map<String, Object> attributes) {
                return new Profile(String.valueOf(attributes.get("nickname")));
            }
        }

        public static KakaoAccount from(Map<String, Object> attributes) {
            return new KakaoAccount(
                    Boolean.valueOf(String.valueOf(attributes.get("profile_nickname_needs_agreement"))),
                    Profile.from((Map<String, Object>) attributes.get("profile")),
                    Boolean.valueOf(String.valueOf(attributes.get("has_email"))),
                    Boolean.valueOf(String.valueOf(attributes.get("email_needs_agreement"))),
                    Boolean.valueOf(String.valueOf(attributes.get("is_email_valid"))),
                    Boolean.valueOf(String.valueOf(attributes.get("is_email_verified"))),
                    String.valueOf(attributes.get("email"))
            );
        }

        public String nickname() { return this.profile().nickname(); }
    }

    public static KakaoOAuth2Response from(Map<String, Object> attributes) {
        return new KakaoOAuth2Response(
                Long.valueOf(String.valueOf(attributes.get("id"))),
                LocalDateTime.parse(
                        String.valueOf(attributes.get("connected_at")),
                        DateTimeFormatter.ISO_INSTANT.withZone(ZoneId.systemDefault())
                ),
                (Map<String, Object>) attributes.get("properties"),
                KakaoAccount.from((Map<String, Object>) attributes.get("kakao_account"))
        );
    }

    public String email() { return this.kakaoAccount().email(); }
    public String nickname() { return this.kakaoAccount().nickname(); }
}
```

데이터가 정확히 표현되었고, 어떻게 작동하는지 확인하기 위해 테스트 코드를 작성하려 한다.

```java
@DisplayName("DTO - Kakao OAuth 2.0 인증 응답 데이터 테스트")
class KakaoOAuth2ResponseTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @DisplayName("인증 결과를 Map(deserialized json)으로 받으면, 카카오 인증 응답 객체로 변환한다.")
    @Test
    void givenMapFromJson_whenInstantiating_thenReturnsKakaoResponseObject() throws Exception {
        // Given
        String serializedResponse = """
                {
                    "id": 1234567890,
                    "connected_at": "2022-01-02T00:12:34Z",
                    "properties": {
                        "nickname": "홍길동"
                    },
                    "kakao_account": {
                        "profile_nickname_needs_agreement": false,
                        "profile": {
                            "nickname": "홍길동"
                        },
                        "has_email": true,
                        "email_needs_agreement": false,
                        "is_email_valid": true,
                        "is_email_verified": true,
                        "email": "test@gmail.com"
                    }
                }
                """;
        Map<String, Object> attributes = mapper.readValue(serializedResponse, new TypeReference<>() {});

        // When
        KakaoOAuth2Response result = KakaoOAuth2Response.from(attributes);

        // Then
        assertThat(result)
                .hasFieldOrPropertyWithValue("id", 1234567890L)
                .hasFieldOrPropertyWithValue("connectedAt", ZonedDateTime.of(2022, 1, 2, 0, 12, 34, 0, ZoneOffset.UTC)
                        .withZoneSameInstant(ZoneId.systemDefault())
                        .toLocalDateTime()
                )
                .hasFieldOrPropertyWithValue("kakaoAccount.profile.nickname", "홍길동")
                .hasFieldOrPropertyWithValue("kakaoAccount.email", "test@gmail.com");
    }
}
```

> **1. DTO 테스트를 통해 특정 데이터를 받는 동작이 제대로 구현되었는지 확인  
> 2. MultiLine String을 이용하여 JSON형식으로 응답 데이터 표현  
> 3. Jackson ObjectMapper를 이용하여 데이터를 attribute에 저장**

#### **Reference**

* [OAuth2User](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/oauth2/core/user/OAuth2User.html)
* [Java - MultiLine String](https://www.baeldung.com/java-multiline-string)

### **OAuth 2.0 보안 설정**

---

#### **람다식 접근**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

Security코드에서 연속적으로 메소드가 호출되는 방식인 **Method Chaining**이 일어나고 있다. authorizeHttpReqeust는 내부에 람다식을 사용하여 보안설정을 하고 있는데, 이 방식은 Spring Security 5.2에서 등장한 방식이다.

**람다식이 도입된 이유**

1. **들여쓰기(indent)**  
   Method Chaining 방식은 사람마다 선호하는 들여쓰기 스타일이 다르기 때문에 IDE가 일관된 규칙으로 정리정돈을 할 수가 없다. 람다식은 메소드에 안에 파라미터가 들어가는 부분은 규칙을 가지고 있다. 즉 일관된 규칙을 적용할 수 있다.
2. **기능 구분**  
   Method Chaiing 방식은 기능과 기능 사이에 구분이 없어 and() 메소드가 필요하다. 람다식 방식은 세부적인 기능들이 람다식 내부에서 감싸지기 때문에 and() 메소드를 사용할 필요가 없어진다.

### **OAuth2.0 UserService 구현**

---

#### **기본 OAuth2.0 인증 처리 구현체 사용하고 카카오 인증 정보를 회원으로 등록하기**

DB 인증 방식에 대한 userDetailsService가 있는 것처럼, OAuth2방식을 위한 oAuth2UserService가 필요하다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

OAuth2UserService를 빈으로 등록하여 securityFilterChain에서 사용할 수 있다.[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

> **toString() vs valueOf()**  
> toString()은 문자열로만 반환해준다면, valueOf()는 null 인지 체크하고 null인 경우 문자열로 null를 반환해준다.  
> 즉 valueOf()는 null safe 로직이 추가된 것이다.

### **기본 인증 서비스 로직 구현**

---

OAuth로 인증을 마치면 인증 정보를 DB에 저장해야 회원인 것처럼 인지가 되어 글쓰기, 수정 등에 작업을 수행할 수 있다. 그런데 아직 UserAccountService 로직이 없다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

> **searchUser에 Optional을 사용하는 이유**  
> Optional아닌 UserAccountDto로 반환할 경우 get() 또는 orElseGet() 등 통해 Null인 경우에 에러 조치를 할 수 있지만 하지 않는다. 즉 searchUser를 통해 찾아낸 회원정보가 어떤 예외를 처리할지를 이 서비스에서 처리하지 않겠다는 의미이다. 다른 서비스 로직에서 searchUser()를 호출할 때 예외처리를 하도록 하여 서비스 로직에 따라 다른 처리를 할 수 있도록 하기 위해서이다.  
>   
> 예를 들면 searchUser()는 인증이라는 특수성을 빼고 보았을 때 DB에 접근하는 로직이다. DB에 존재하지 않을 경우, EntityNotFoundException으로 처리하면 된다. 이는 맞긴하지만, SecurityConfig에서 사용할 때는 UsernameNotFoundException이 발생한다. DB에 존재하는지가 아닌 인증에 문제가 있다는 에러를 발생시키고 있다.  
> UsernameNotFoundException는 Spring Security가 제공하는 인증 에러로 Spring Security가 이를 인식해서 조리있게 알맞는 에러 문제를 처리해주기 때문이다.  
>   
> 정리하면 서비스 코드를 사용하는 입장에 따라 다룰 수 있는 예외가 달라질 경우에는 직접 처리를 로직을 담당하지 않고 상위로 전파할 수 있고, Optional을 사용함으로써 값에 대한 책임을 호출자에게 위임할 수 있다.

### **뷰 구현**

---

#### **카카오 로그인 버튼 이미지 준비**

**로그인 버튼은 카카오 개발 페이지에 도구에 리소스 다운로드를 통해 받을 수 있습니다.**

[[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)](https://developers.kakao.com/tool)
[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

#### **카카오 로그인 버튼 구현**

**다음과 같이 로그인 버튼 이미지를 넣어 버튼을 만들 수 있다.**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

서비스를 통해 바로 사용할 경우 다음과 같은 에러가 발생할 것이다.

이유는 서비스를 활서오하시키지 않았기 때문이다. 아래 그림과 같이 서비스를 활성화시키면 정상작동 한다.

[[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)](https://developers.kakao.com/docs/latest/ko/kakaologin/trouble-shooting)
[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/287)

---

#### **로그인 후 노출하는 유저 정보 변경: ID → 닉네임**

**카카오 OAuth 인증을 통해 로그인한 경우, 아이디 값은 적절치 않은 형태이므로**

**principal 객체에 접근하여 nickname 값(이름)을 사용한다.**

```java
# AS-IS
<attr sel="#username" sec:authorize="isAuthenticated()" sec:authentication="name" />
# TO-BE
<attr sel="#username" sec:authorize="isAuthenticated()" sec:authentication="principal.nickname" />
```
