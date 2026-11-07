---
title: "[Spring] @Value와 @ConfigurationProperties의 사용법 및 차이"
kind: "article"
permalink: "/posts/tistory-315.html"
published_on: "2023-01-10"
section: "프로그래밍"
category: "프로그래밍"
---

Spring에서 프로퍼티에 값을 사용하는 방법은 여러가지가 있겠지만 대표적으로 많이 사용하는 방법은 @Value와 @ConfigurationProperties를 알아보려 한다.

## @Value vs @ConfigurationProperties

---

Spring에서 프로퍼티(application.properties 또는 yaml)에 설정한 값은 어플리케이션이 실행되면서 환경변수로 등록이 되고 사용하기 위한 방법으로 @Value와 @ConfigurationProperties 가 있다.

### @Value

---

@Value는 단일 값(Key: Value 형태)을 주입받기 위해 사용한다.  [이전 글](tistory-314.html)에서 살펴보았듯 값을 가져오기 위해서는 PropertyPlaceHolderConfigurer를 통해 ${}을 사용하는 방식과 SpEL을 통해 #{}을 이용하는 방식 크게 2가지를 사용할 수 있다. 

@Value를 이용해 값을 가져올 때에는 RelaxedBinding이라는 것이 적용되지 않는다. [Relaxed Binding](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#features.external-config.typesafe-configuration-properties.relaxed-binding)이란 프로퍼티 값의 이름이 조금 달라도 유연하게 바인딩을 시켜주는 규칙을 의미한다. 

예를 들어 다음과 같은 값이 프로퍼티에 있다고 하자.

```java
jwt:
  secret-key: asdf
  token.expired-time-ms: 30000
```

@Value 는 Relaxed Binding이 적용되지 않으므로 완벽히 일치하는 프로퍼티 이름으로만 값을 가져올 수 있다.

```java
@Value("${jwt.token.expired-time-ms}") public Long expiredTimeMs;
```

@Value의 특징을 정리하면

1. 단일 값을 주입받기 위해 사용된다.
2. RelaxedBinding이 적용되지 않는다.

### @ConfigurationProperties

---

@ConfigurationProperties는 프로퍼티에 있는 값을 클래스로 바인딩하기 위해 사용되는 어노테이션이다.

* 값의 바인딩을 위해 Setter
* 생성자로 바인딩을 위해 @ConstructorBinding

@ConfigurationProperties를 사용하기 위해서는 @EnableConfigurationProperties에 해당 클래스를 지정해주거나 @ConfigurationPropertiesScan를 통해 스캐닝의 대상이 되도록 해주어야 한다.     

@ConfigurationProperties는 기본적으로 RelaxedBinding이 적용된다. 예를 들어 위에서 봤던 프로퍼티 값을 불러오고자 한다면 다음과 같이 완전히 일치하게 적지 않아도 바인딩이 된다.

```java
@Getter
@Setter
@ConfigurationProperties(prefix = "jwt")
public class JwtTokenInfo {

    private final Long expiredTimeMs;

}
```

RelaxedBinding이 적용되는 규칙으로는 다음과 같은 것들이 있다. 이러한 4가지 표기법들은 @ConfigurationProperties로 값이 바인딩될 때 RelaxedBinding에 의해 올바르게 바인딩이 된다. 또한 @ConfigurationProperties는 클래스로 값을 바인딩하므로 한번에 여러 값을 바인딩 받을 수 있다. 하지만 @ConfigurationProperties에는 spEL이 사용될 수 없다는 단점이 있다.

| jwt.secret-key | properties와 yaml에 권장되는 표기법 |
| --- | --- |
| jwt.secretKey | 표준 카멜 케이스 문법 |
| jwt.serect\_key | 스네이크 케이스 문법 |
| JWT\_SECRET\_KEY | 시스템 환경 변수를 사용할 때 권장되는 표기법 |

## **@Value와 @ConfigurationProperties의 차이**

---

|  | **@Value** | **@ConfigurationProperties** |
| --- | --- | --- |
| **언제 사용하면 좋을까?** | 단일 값 주입하는 경우 | 클래스로 N개의 값을 바인딩해야하는 경우 |
| **여러 값의 처리** | 1개의 값만 주입 가능 | N 개의 값을 바인딩 가능 |
| **RelaxedBinding** | X | O |
| **spEL 적용** | O | X |

Spring에서는 여러 값을 바인딩받아야 하는 경우에 @ConfigurationProperties를 사용하도록 권장하고 있다.

또한 @ConfigurationProperties는 RelaxedBinding이 적용되므로 보다 유연하게 값을 바인딩할 수 있다.
