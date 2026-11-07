---
title: "com.fasterxml.jackson.databind.exc.InvalidDefinitionException: Java 8 date/time type java.time.LocalDateTime not supported by default: add Module “com.fasterxml.jackson.datatype:jackson-datatype-jsr310” to enable handling…"
kind: "article"
permalink: "/posts/tistory-350.html"
published_on: "2023-03-11"
section: "트러블슈팅"
category: "트러블슈팅 / Jackson"
---

## com.fasterxml.jackson.databind.exc.InvalidDefinitionException: Java 8 date/time type java.time.LocalDateTime not supported by default: add Module “com.fasterxml.jackson.datatype:jackson-datatype-jsr310” to enable handling…

개발을 하다가 API 응답값에  LocalDateTime이 들어가면 이상하게 에러가 났다.... 

![본문 이미지](../assets/tistory/9214144cf289e236f2aee9d9.gif)

### What?

별탈 없이 개발을 이어가다가 서비스 로직이 변경되고 나서 API를 점검하고 있었다...

그런데 갑자기 나에게 이상한 메시지를 전달해주었다.

> **com.fasterxml.jackson.databind.exc.InvalidDefinitionException: Java 8 date/time type**  
> **java.time.LocalDateTime**  
> **not supported by default: add Module “com.fasterxml.jackson.datatype:jackson-datatype-jsr310” to enable handling…**

뭐지?? Redis에서 저장할 때 LocalDateTime을 사용하면서 발생하는 문제였는데 왜 API 호출해서도 발생하지?? 라는 생각이 들었다.... 여러가지 설정을 하다가 최근 작업하다가 편하게 사용하려고 등록한 Bean이 생각났다..

> 그 **빈이는** ObjectMapper

### How to Solve?

스프링에서 자바 객체를 직렬화/역직렬화 할때, 내부적으로 Jackson을 사용하는데, 자바 8에 도입된 LocalDateTime 타입으로 직렬화, 역직렬화할 때 이슈가 발생한다.

가장 쉽게 선택할 수 있는 방법이 ObjectMapper를 빈으로 등록하여 사용하는 방법이 있다.

그런데 해당 Bean을 등록하면 다음과 같은 에러가 발생한다.

> **com.fasterxml.jackson.databind.exc.InvalidDefinitionException: Java 8 date/time type**  
> **java.time.LocalDateTime**  
> **not supported by default: add Module “com.fasterxml.jackson.datatype:jackson-datatype-jsr310” to enable handling…**

default는 자바 8의 LocalDateTime을 지원하지 않는다. 그렇기 때문에 핸들링 할 수 있게 jsr-310 모듈을 추가하라고 알려주고 있다.

> ※ [JSR-310](https://jcp.org/aboutJava/communityprocess/pfd/jsr310/JSR-310-guide.html)  
> JSR(Java Specification Request)로 자바플랫폼의 자바 사양을 정의한 문서와 같다. 이중에서 310은 날짜와 시간에 관련된 API를 정의한다.

모든 문제에 해결방법은 다양하게 존재한다.

#### 방법 1) JSR 라이브러리 추가

라이브러리를 추가함으로써 쉽게 해결 가능하다.

```java
implementation 'com.fasterxml.jackson.datatype:jackson-datatype-jsr310'
implementation 'com.fasterxml.jackson.core:jackson-databind'
```

#### 방법 2) JavaTimeModule 등록

ObjectMapper에 JavaTimeMoudle을 등록해주면 간단하게 처리가 가능하다.

```java
@Configuration
public class ObjectMapper {

    @Bean
    public ObjectMapper objectmapper() {
    	ObjectMapper objectmapper = new ObjectMapper();
        objectmapper.registerModule(new JavaTimeModule());
        objectmapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return objectMapper;
    }
}
```

#### 방법 3) ObjectMapper를 사용하지 않는 방법

필자는 Redis에 Dto를 저장하고 사용하고 있기 때문에 ObjectMapper를 사용했었다. 하지만 이 방법보다는 **Jackson2JsonRedisSerializer** 을 이용하면 Redis에서는 Object를 쉽게 저장할 수 있다.

ObjectBean을 삭제하고 다음과 같이 사용하면 위와 같은 에러는 발생하지 않는다.

```java
public class UserCacheRepository {
    ....

    public void setUser(User user){
        this.redisTemplate.setValueSerializer(new Jackson2JsonRedisSerializer<User>(User.class));
        this.valueOperations = redisTemplate.opsForValue();

        try{
            String key = getKey(user.getUsername());
            valueOperations.set(key, user, CACHE_TTL);
            log.info("[UserCacheRepository save - success]  id: {}", user.getId());
        }catch (Exception e){
            log.error("[UserCacheRepository save - error] {}", e.getMessage());
        }
    }

}
```

다음과 같이 사용하면 간단하게 변형없이 저장하고 사용할 수 있기 때문에 필자는 3번 방법을 채택하였다.

> 개발을 하면서 매번 느끼는 것은 쉽게 결정하면 안된다는 것이다.  
>   
> ObjectMapper를 사용한 것뿐인데   
> 다른 서비스에 영향을 줄 것이라고 생각하지 못했다.  
>   
> 그런데 영향을 주고 있었네??  
>   
> 그렇기 때문에 쉽게 결정하면 안된다.  
>   
> 어떤 라이브러리를 사용하면 해당 라이브러리에 대한 이해가 필요하고  
> 해당 라이브러리를 구현하고 다른 서비스에 문제가 없는지  
> 테스트를 해보는 것이 중요할 것이라 판단된다.  
>   
> ![본문 이미지](../assets/tistory/aacc0cdcc144203c7911915d.gif)
