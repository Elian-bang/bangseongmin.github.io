---
title: "[게시판 서비스] 세부 기능 개발 - 인증 구현"
kind: "article"
permalink: "/posts/tistory-262.html"
published_on: "2022-12-08"
section: "프로젝트"
category: "프로젝트 / 게시판 서비스"
---

## **인증 기능 구현**

---

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/262)

> 인증 기능 구현과 기능을 사용하는 것이 중요하기 때문에 회원가입 페이지는 제외시키도록 하겠다.

### **🩺 Ready**

---

인증 구현 시 많은 변경점이 발생할 것으로 예상된다.

그래서 인증 기능을 구현하기 전에 현재 상태 점검을 위해 모든 테스트 파일을 실행하여 상태를 확인할 필요가 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/262)

모든 테스트 클래스 실행 결과 : 정상 작동

### **⚙️** **시큐리티 설정**

---

Spring Security는 공식 문서에 [**Spring Security without the WebSecurityConfigurerAdapter**](https://spring.io/blog/2022/02/21/spring-security-without-the-websecurityconfigureradapter)를 참고하여 개발을 진행하였습니다.

#### **Configuring HttpSecurity**

> **HttpSecurity**는 Spring Security에 각종 설정을 맡고 있습니다.  **Security Filter Chain**에서 요청에 접근할 수 있기 때문에(요청이 security filter chain 거침) 인증, 인가 서비스와 **Secure headers, CSRF protection** 등 같은 **Security Features** 를 사용한다. 취약점에 대한 보안이 필요할 경우 HttpSecurity 설정을 사용해야 한다.  
>   
> 쉽게 말해 Security를 태워서 Spring Security 관리하에 두고 인증과 권한 체크를 하는 부분이다.  
> - 리소스(URL) 접근 권한 설정  
> - 인증 전체 흐름에 필요한, Login, Logout 페이지 인증완료 후 페이지 인증 실패 시 이동 페이지 등등 설정  
> - 인증 로직을 커스텀하기 위한 커스텀 필터 설정  
> - 기타 csrf, 강제 https 호출 등등 거의 모든 스프링 시큐리티의 설정

**Before**

```java
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        return http
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .formLogin().and()
                .build();
    }
}
```

> 현재 시큐리티가 적용은 되어있었는데 당장 인증기능을 사용하지 않더라도 미리 사용할 항목들이 있어서 미리 적용을 했었던 부분으로 모든 Request에 대해서 permitAll을 해줌으로써 특별한 인증이 필요하지 않게끔 구현이 되어 있는 상태이다.

**After**

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

    return http
            .authorizeHttpRequests(auth -> auth
                    .mvcMatchers(
                            HttpMethod.GET,
                            "/",
                            "/articles",
                            "/articles/search-hashtag"
                    ).permitAll()
                    .anyRequest().authenticated()
            )
            .formLogin().and()
            .build();
}
```

**변경 사항**

> 1. 전체 페이지 허용 → 루트 페이지, 게시판 페이지, 해시태그 전용 검색 페이지에 대해서만 인증 X 없이 가능  
> 2. 루트 페이지, 게시판 페이지, 해시태그 전용 검색 페이지를 제외한 페이지들에 대해서 인증 O 필요

---

#### **Configuring WebSecurity**

> antMatchers에 파라미터로 넘겨주는 **endpoints**는 **Spring Security Filter Chain**을 거치지 않기 때문에 '인증' , '인가' 서비스가 모두 적용되지 않는다. 또한 Security Context를 설정하지 않고, Security Features(Secure headers, CSRF protecting 등)가 사용되지 않는다. Cross-Site-Scripting(XSS), content-sniffing에 대한 endpoints 보호가 제공되지 않는다. 일반적으로 로그인 페이지, public 페이지 등 인증, 인가 서비스가 필요하지 않은 endpoint에 사용한다.  
>   
> WebSecurity, HttpSecurity에 모두 설정을 한 경우 WebSecurity가 HttpSecurity보다 우선적으로 고려되기 때문에 HttpSecurity에 인가 설정은 무시된다.  
>   
> 쉽게 말하면 Spring Security 검사에서 제외하는 대상이다.

**Basic**

```java
@Bean
public WebSecurityCustomizer webSecurityCustomizer() {
    // static resource, css - js
    return (web) -> web.ignoring().antMatchers("/css");
}
```

**General**

```java
@Bean
public WebSecurityCustomizer webSecurityCustomizer() {
    // static resource, css - js
    return (web) -> web.ignoring().requestMatchers(PathRequest.toStaticResources().atCommonLocations());
}
```

> 개발이 확장되면서 더 다양한 정적 리소스를 담을 수 있게 되는데, 변경이 생길 때마다 바꿔줘야하는 문제가 발생할 수 있는데 이에 대한 보편적인 경로를 미리 정해둔 곳이 있다. Spring에서 지원하는 PathRequest.toStaticResources().atCommonLocations()를 사용하면 보통 정적 리소스를 담는 위치들을 미리 정해놓았다. 개발자가 직접 지정하지 않아도 간단하게 넣을 수 있게 추가된다. 

> Spring Security를 본격적으로 사용하기 때문에   
> 사용자 정보를 가져오는 부분을 다시 구현해야 한다.

#### **UserDetailsService**

> UserDetailsService 인터페이스를 구현하여 실제 인증 데이터를 가져오는 서비스 로직을 구현한다.  
> 기존에 인메모리에 저장을 하였다면 이제는 DB에 저장을 하는 구현이다.  
>   
> Spring Security 인증 후에 로그인 한 객체의 정보를 받아올 수 있는 방법 여러가지가 있다.  
> 1. Bean을 통해 사용자 정보를 가져오는 방법  
> 2. Controller에서 사용자 정보를 얻는 방법  
> 3. Principal을 이용한 방법  
> 중에서  Principal을 이용한 방법을 사용하였다.

```java
@Bean
public UserDetailsService userDetailsService(UserAccountRepository userAccountRepository){
    return username -> userAccountRepository
            .findById(username)
            .map(UserAccountDto::from)
            .map(BoardPrincipal::from)
            .orElseThrow(() -> new UsernameNotFoundException("유저를 찾을 수 없습니다. - username: "+ username));
}
```

#### **Principal**

> Principal은 자바의 표준 시큐리티 기술로, 로그인이 된 상태라면 계정 정보를 담고 있다.  
> 즉 인증을 하였을때 얻을 수 있는 추가적인 정보(DB로부터 알수있는 정보)를 Customizing한 것이라고 볼 수있다.  
>   
> **1 단계. UserDetails 구현**  
> UserDetails에 세부 구현이 불필요하다면 UserDetails에 대한 보편적 구현체인 User 클래스를 사용하는 방법이 있다. 이를 상속받아 사용하지 않는 이유는 현재 프로젝트와 어울리지 않는 내용이 있고, 그외 필요하지 않은 설정들이 많이 있기 때문에 사용하지 않기 때문에 직접 구현하는 방법을 선택함.  
>   
> **2. 권한**현재 권한에 대한 기능이 없기 때문에 따로 만들지 않았지만, 필드는 추가해두어야 하기 때문에 필드를 추가하고 권한에 대해 설정한 적이 없기 때문에 권한을 ENUM 클래스로 생성하여 동일한 권한을 줄 수 있도록 설정.  
> `ROLE\_`은 Spring Security에 권한 표현을 하는 문자열 규칙이다.

```java
public record BoardPrincipal(
        String username,
        String password,
        Collection<? extends GrantedAuthority> authorities,
        String email,
        String nickname,
        String memo
) implements UserDetails {

    public static BoardPrincipal of(String username, String password, String email, String nickname, String memo) {
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
                memo
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


    public enum RoleType {
        USER("ROLE_USER");

        @Getter private final String name;

        RoleType(String name) {
            this.name = name;
        }
    }

}
```

#### **PasswordEncoder**

Spring Security 인증 기능을 이용하기 위해서는 반드시 PasswordEncoder를 등록해주어야 한다.

```java
@Bean
public PasswordEncoder passwordEncoder(){
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
}
```

> PasswordEncoder에 대한 설정은 Factory로부터 위임해서 가지고 오도록 설정하여 Spring Security가 제공하는 암호화 모듈을 그대로 사용하게 된다.

#### 🚨 **Warning**

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/262)

> 현재 WebSecurity를 통해 정적 파일 리소스를 인가해주었는데, 이러한 방법을 대신하여 HttpSecurity에서 설정하라는 경고가 발생하고 있다.    
>   
> **이유는?** 사실상 위와 같이 설정을 하여도 문제가 없겠지만, ignore해버리면 이 부분에 대해서 Security에 아무런 기능을 이용하지 않게되므로 CSRF와 같은 보안 공격에 대한 방어 기능이나 다른 공격에 대해서 취약해진다는 문제가 발생한다. httpSecurity에 들어가게 되면 보안 기능이 적용되기 때문이다.

**\* 변경된 SecurityConfig**

```java
package com.fastcampus.projectboard.config;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        return http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
                        .mvcMatchers(
                                HttpMethod.GET,
                                "/",
                                "/articles",
                                "/articles/search-hashtag"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin().and()
                .logout()
                    .logoutSuccessUrl("/").and()
                .build();
    }

    @Bean
    public UserDetailsService userDetailsService(UserAccountRepository userAccountRepository){
        return username -> userAccountRepository
                .findById(username)
                .map(UserAccountDto::from)
                .map(BoardPrincipal::from)
                .orElseThrow(() -> new UsernameNotFoundException("유저를 찾을 수 없습니다. - username: "+ username));
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

}
```

### **Security 설정으로 영향을 받는 부분**

---

#### **JpaConfig**

**인증 기능이 구현되었기 때문에 인증된 사용자로부터 사용자 정보를 받을 수 있게 되었다.**

```java
@EnableJpaAuditing
@Configuration
public class JpaConfig {

    @Bean
    public AuditorAware<String> auditorAware(){
        return () -> Optional.ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getPrincipal)
                .map(BoardPrincipal.class::cast)
                .map(BoardPrincipal::getUsername);
    }
}
```

> Spring Security를 사용할 때, SecurityContextHolder가 Security에 대한 모든 정보를 가지고 있다.  
> 1. SecurityContextHolder로부터 SecurityContext를 불러온다.  
> 2. SecurityContext에는 Authentication 정보가 있는데, 이중에서 인증된 정보인지 확인하여 필터링한다.  
> 3. Authentication에서 Principal 정보(보편적인 Principal)를 가져온다. 즉 UserDetailService에 구현체  
> 4. Principal 정보는 Object로 넘어오게 되는데 이를 구현한 BoardPrincipal 형태로 타입 캐스팅한다.  
> 5. BoardPrincipal 에서 Username정보를 불러오는 과정이다.

#### **JpaRepositoryTest**

아래와 같이 insert 시 에러가 발생하는 것을 볼 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/262)

> 현상 : createdBy가 들어가지 않았다.   
> UserDetailsService에서 Repository로부터 데이터를 가져오게 변경되었다. userAccountRepository가 제대로 Bean으로 등록되어 있지 않거나 이 안에 어떤 인증 데이터가 들어가지 않아 생성이 실패한 것이다.

```java
@EnableJpaAuditing
@TestConfiguration
public static class TestJpaConfig{
    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> Optional.of("artist");
    }
}
```

> 문제는 Security이지만 그보다 AuditorAware가 문제가 된 것이므로 이 부분을 테스트 때만 Security가 무시하게 만들어 테스트가 통과하도록 할 것이다.

#### **테스트를 위한 SecurityConfig 변경**

```java
@Import(SecurityConfig.class)
public class TestSecurityConfig {

    @MockBean private UserAccountRepository userAccountRepository;

    @BeforeTestMethod
    public void securitySetUp() {
        given(userAccountRepository.findById(anyString())).willReturn(Optional.of(UserAccount.of(
                "artistTest",
                "pw",
                "artist-test@email.com",
                "artist-test",
                "test memo"
        )));
    }

}
```

> DB에 직접적으로 접근하여 테스트를 진행하지 않으므로 테스트용 계정을 만들어서 사용하기 위한 설정이다.

현재 테스트 코드에서는 아래와 같이 SecurityConfig를 사용하고 있는데 TestSecurityConfig으로 치환하려 한다.

TestSecurityConfig를 부르면 Controller 테스트에서 Security 인증과 관련된 테스트 Feature를 추가하기 위해 필요한 내용들을 한 곳에 모으려 한다. 이렇게 되면 Test코드에서는 UserAccountRepository MockBean으로 표현할 수 없으므로 Test 코드에서는 UserAccountRepository를 쓸 수 있다는 것을 감춰져버린다는 단점이 있지만, UserAccountRepository를 Controller Layer에서 사용하지 않는다면 상관없다. TestSecurityConfig에서 UserAccountRepository를 사용한 이유는 Security Layer에  userDetailsService에서 불렸던 부분이다. Controller 테스트에서 UserAccountRepository가 있어야 하는데 맥락에는 맞지 않는 문제를 해결할 수 있는 방법이기도 하다.

```java
// AS-IS
@DisplayName("View 컨트롤러 - 게시글")
@Import({SecurityConfig.class, FormDataEncoder.class})
@WebMvcTest(ArticleController.class)
class ArticleControllerTest {
}

// TO-BE
@DisplayName("View 컨트롤러 - 게시글")
@Import({TestSecurityConfig.class, FormDataEncoder.class})
@WebMvcTest(ArticleController.class)
class ArticleControllerTest {
}
```

변경을 하여도 인증이 필요한 부분은 여전히 테스트에 실패한다.

#### **@WithMockUser**

Controller Layer에서 인증정보를 받아서 추가로 수행하는 것이 없을 때 사용할 수 있는 방법이다.

SecurityConfig에 userDetailService를 이용하지 않았기 때문에 userDetailService를 Mocking하지 않는 장점이 있지만, 실제로 있는 사용자 정보를 이용할 수 없다는 단점이 있다.

```java
@WithMockUser
@DisplayName("[view][GET] 게시글 페이지 - 정상 호출, 인증된 사용자")
@Test
public void givenNothing_whenRequestingArticleView_thenReturnsArticleView() throws Exception {
    // Given
    Long articleId = 1L;
    long totalCount = 1L;
    given(articleService.getArticleWithComments(articleId)).willReturn(createArticleWithCommentsDto());
    given(articleService.getArticleCount()).willReturn(totalCount);

    // When & Then
    mvc.perform(get("/articles/" + articleId))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
            .andExpect(view().name("articles/detail"))
            .andExpect(model().attributeExists("article"))
            .andExpect(model().attributeExists("articleComments"))
            .andExpect(model().attributeExists("articleComments"))
            .andExpect(model().attribute("totalCount", totalCount));
    then(articleService).should().getArticleWithComments(articleId);
    then(articleService).should().getArticleCount();
}
```

#### **@WithUserDetails**

게시글 생성, 수정, 삭제와 같은 기능 테스트를 위해서 실제 인증된 데이터를 테스트를 할 필요가 있다. 이럴 때는 WithUserDetails를 통해 가상에 유저정보를 사용하여 테스트하는 방법이다. 실제 데이터에 영향이 가지 않도록 하기 위함

```java
@WithUserDetails(value = "artistTest", setupBefore = TestExecutionEvent.TEST_EXECUTION)
@DisplayName("[view][POST] 새 게시글 등록 - 정상 호출")
@Test
void givenNewArticleInfo_whenRequesting_thenSavesNewArticle() throws Exception {
    // Given
    ArticleRequest articleRequest = ArticleRequest.of("new title", "new content", "#new");
    willDoNothing().given(articleService).saveArticle(any(ArticleDto.class));

    // When & Then
    mvc.perform(
                    post("/articles/form")
                            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                            .content(formDataEncoder.encode(articleRequest))
                            .with(csrf())
            )
            .andExpect(status().is3xxRedirection())
            .andExpect(view().name("redirect:/articles"))
            .andExpect(redirectedUrl("/articles"));
    then(articleService).should().saveArticle(any(ArticleDto.class));
}
```

> setupBefore을 TEST\_EXECUTION을 사용하여 테스트를 실행하기 직전에 수행되도록 설정  
> userDetailsServiceBeanName 을 설정하여 원하는 Bean을 설정가능(Bean이 1개일때는 생략 가능)

#### **🙋‍♀ Controller 에서 게시글 삭제와 같이 인증 정보가 필요한 경우, 어떻게 해야할까?**

1. SecuritContextHolder.getContext().getAuthentication()을 사용하여 해결

2. @AuthenticationPrincipal  어노테이션을 이용한 방법 ✔︎

```java
@PostMapping ("/{articleId}/delete")
public String deleteArticle(
        @PathVariable Long articleId,
        @AuthenticationPrincipal BoardPrincipal boardPrincipal
) {
    articleService.deleteArticle(articleId, boardPrincipal.getUsername());

    return "redirect:/articles";
}
```

위 방법대로 로직과 테스트를 변경하면 된다.
