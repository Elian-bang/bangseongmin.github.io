---
title: "[Spring] 설정 값 분리의 필요성과 @Value의 사용법 및 동작 과정"
kind: "article"
permalink: "/posts/tistory-314.html"
published_on: "2023-01-10"
section: "Java·Spring"
category: "Java·Spring / Spring"
---

## 설정 값 분리의 필요성

---

### 🔥 Why ?

개발을 진행하다 보면 데이터베이스 연결 정보나 외부 API 주소 등과 같은 메타 정보를 관리해야 한다. 해당 메타정보들을 클래스 파일에 넣어 사용할 수 있겠지만 다음과 같은 이유로 프로퍼티 파일(properties, yaml, yml)로 분리해서 관리할 것을 권장한다.

#### **환경에 따라 유연하게 값을 설정할 수 있음**

일반적으로 로컬 환경, 운영 환경 등으로 환경에 따라 서로 다른 데이터베이스 서버와 도구들을 사용한다. 만약 환경에 따라 다른 값을 자바 코드만으로 설정해주려면 상당히 번거롭고 중복되는 코드가 상당히 많아진다. 그래서 설정값은 별도의 파일(properties 또는 yaml)로 분리하고, 자바 코드에서는 환경 정보에 맞는 설정값을 불러오도록 하면 상당히 유용하다.

#### **초기값을 설정할 수 있음**

불러오는 설정 값에 초기값을 지정해줄 수 있는데, 이를 통해 설정한 값이 불러지지 않은 경우에 대비할 수 있으며 테스트 작성을 용이하게 할 수 있다. 즉, 초기값을 설정함으로써 테스트 작성에 유연하고 안전하게 개발을 할 수 있는 것이다.

#### **불필요한 컴파일을 줄일 수 있음**

프로퍼티를 분리하지 않는다면 값이 클래스 안에 있을 것이다. 만약 값이 수정되면 소스코드가 변하는 것이므로 다시 컴파일을 해주어야 할 것이다. 하지만 설정 파일을 분리하고 @Value로 참조하게 한다면 불필요한 컴파일없이 주입되는 값을 변경할 수 있다.

## @Value의 사용법과 처리 및 동작 과정

---

### @Value 사용법

---

@Value로 메타 정보를 가져오는 방법으로는 PropertyPlaceHolderConfigurer를 통해 ${}을 사용하는 방식과 SpEL을 통해 #{}을 이용하는 방식 크게 2가지가 있다.

#### PropertyPlaceHolderConfigurer를 통한 수동 변환

PropertyPlaceHolderConfigurer은 빈 팩토리 후처리기로 매번 빈 오브젝트가 만들어진 직후에 오브젝트의 내용이나 오브젝트 자체를 변경하는 빈 후처리기와 달리 빈 설정 메타정보가 모두 준비됐을 때 빈 메타정보 자체를 조작하기 위해 사용된다.

예를 들어 database.url 과 같이 properties에 작성된 키 값을 ${}안에 넣어주면 Spring이 PropertyPlaceHolderConfigurer를 통해 초기화 작업 중에 해당 값을 실제 값으로 치환한다. 

```java
# application.yaml
database.className=org.mariadb.jdbc.Driver
database.username = artist
database.password = artist

# Java Code
@Value("${database.username}") private String username;
@Value("${database.password}") private String password;
```

이러한 방법은 대체할 위치를 치환자로 지정해두고, 별도의 후처리기가 값을 변경해주기를 기대하기 때문에 수동적이다. 그래서 초기 빈 메타정보에는 ${database.username}와 같은 문자열이 등록되어 있다. 스프링 컨테이너가 설정 파일에서 대체할 적절한 키 값을 찾지 못하면 해당 문자열이 그대로 남아있게 된다. 그래서 치환자의 값이 변경되지 않더라도 예외가 발생하지 않으므로 SpEL을 통한 능동 변환을 권장한다.   

초기에는 PropertyPlaceHolderConfigurer를 사용하는 방식을 사용했어야 했지만 Spring 3부터 SpEL을 지원하면서 이를 이용하는 방식을 권장하고 있다. 최근 Spring의 버전이 높아지고, 이러한 문제를 개선한 PropertySourcesPlaceholderConfigurer가 등장하면서 적절한 값을 찾지 못하면 에러가 발생하도록 수정되었지만 그래도 수동적인 방법보다는 빈에서 값을 꺼내는 SpEL이 권장된다.

#### SpEL 을 통한 능동 변환

SpEL은 스프링 3.0에서 처음 소개된 스프링 전용 표현식 언어로 다른 빈 오브젝트나 프로퍼티에 손쉽게 접근할 수 있다. SpEL은 기본적으로 #{} 안에 표현식을 넣도록 되어있는데, user.name이라는 표현식은 이름이 user인 빈의 name 프로퍼티를 의미한다. SpEL은 일반 프로그래밍 언어 수전에 가까운 강력한 표현식 기능을 지원한다. 다른 빈의 프로퍼티에 접근가능할 뿐만 아니라 메소드 호출도 가능하고 다양한 연산도 지원하며 클래스 정보에도 접근할 수 있다. 심지어 생성자를 호출해서 객체를 생성할 수도 있다.   

SpEL(Spring Expression Language)를 이용하는 방법은 프로퍼티의 대체 위치를 설정해두고 빈 팩토리 후처리기가 바꿔주기를 기다리는 수동적인 방법과 달리 다른 빈 오브젝트에 직접 접근할 수 있는 표현식을 이용해 원하는 프로퍼티 값을 능동적으로 가져온다.

```java
# application.yaml
database.className=org.mariadb.jdbc.Driver
database.username = artist
database.password = artist

# Java Code
@Value("#{environment['database.username']}") private String username;
@Value("#{environment['database.password']}") private String password;
```

 environment 라는 이름의 빈으로부터 해당 키에 해당하는 값을 읽어온다는 의미로 가져오는 bean은 Properties 타입 등의 빈이 될 수 있다. SpEL을 이용하면 오타와 같은 실수가 있을 때 에러 검증이 가능하다는 장점이 있어 이름을 잘못 적는 실수가 있어도 예외가 발생하지 않는 ${} 기반의 프로퍼티 치환자 방식보다는 SpEL의 사용을 권장한다.

참고해야 할 것은 @Value 어노테이션은 스프링 컨테이너가 참조하는 정보를 의미할 뿐이지 그 자체로 값을 넣어주는 것은 아니다. Spring 컨테이너 밖에서 사용된다면 @Value 어노테이션이 무시된다.

### 타입 변환

---

설정 파일의 내용은 모두 텍스트로 작성된다. 값을 넣을 프로퍼티 타입이 스트링이라면 아무런 문제가 없지만 그 외의 타입인 경우라면 타입을 변경하는 과정이 필요하다. 이를 위해 스프링은 다음의 2가지 종류의 타입 변환 서비스를 제공한다.

#### PropertyEditory

디폴트로 사용되는 타입 변환기는 java.beans의 PropertyEditor 인터페이스를 구현한 것이다. PropertyEditor는 원래 GUI 개발 환경을 위해 개발되었지만 XML에 작성된 내용이나 @Value의 String 값에서 프로퍼티 타입으로 변경하기 위해 사용된다.

PropertyEditory는 boolean, Boolean, int, Integer ... 등의 기본 타입의 변환과 배열의 변환 외에도 Charset, Class, Currency, File, Locale, Pattern, Resource, Timezone, URI, URL 등의 변환을 제공한다. 

예를 들어 다음과 같은 String을 URI로 받을 수 있다는 것이다.

```java
# application.yaml
database.url=jdbc:mariadb://localhost/security?characterEncoding=utf-8

# Java Code
@Value("${database.url}") private URI url;
```

다양한 타입으로 변환이 가능한 이유는 각각의 타입 변환기를 Spring이 구현해두었기 때문이다. 예를 들어 String을 URI로 바꾸는 경우에는 URIEditor, Charset으로 바꾸는 경우에는 CharsetEditor가 사용되는 것이다.

만약 Spring이 지원하지 않는 타입의 오브젝트를 직접 값으로 주입하고 싶다면, PropertyEditory 인터페이스를 구현해서 직접 변환기를 구현할 수 있다. 물론 권장하는 방법은 아니다. 이러한 방법 대신에 빈을 등록하고 DI 받는 방법이 있기 때문이다. 또한 PropertyEditory는 내부적으로 상태값을 관리하기 때문에 멀티쓰레드 환경에서 사용이 불가능하며 String <-> Object 관계의 변환만 가능하다는 단점이 있다.

#### ConversionService

스프링 3.0부터는 PropertyEditory 대신 사용할 수 있는 ConversionService를 지원하기 시작했다. ConversionService는 자바빈에서 사용해오던 PropertyEditory와 달리 스프링이 직접 제공하는 타입 변한 API이다.

ConversionService는 변환기의 작성이 간편하며 PropertyEditory와 달리 멀티쓰레드 환경에서 공유해 사용될 수 있다는 장점이 있다. 만약 우리가 conversionService라는 이름의 빈으로 ConversionService 타입의 빈을 등록하면 스프링 컨테이너가 이를 자동인식해서 PropertyEditor를 대신해 사용한다.

예를 들어 String을 int로 바꾸는 경우에 직접 만든 Converter를 사용하려면 다음과 같이 구현할 수 있다.

```java
 @Configuration
 public class ConverterConfig {

    @Bean
    public ConversionServiceFactoryBean conversionService () {
        final ConversionServiceFactoryBean conversionServiceFactoryBean = new ConversionServiceFactoryBean();
        conversionServiceFactoryBean.setConverters(converters());
        return conversionServiceFactoryBean;
    }

    @Bean
    public Set<Converter> converters() {
        final Set<Converter> set = new HashSet<>();
        set.add(new CustomConverter());
        return set;
    }
}

@Component
public class CustomConverter implements Converter<String, Integer> {
    public Integer convert(String username) {
       try{
          return Integer.parseInt(username);
       } catch (NumberFormatException e) {
           return 0;
       }
    }
}
```

물론 Spring에서 거의 모든 Conversion 기능을 제공해주기 때문에 거의 사용할 일이 없을 것이다. 하지만 특별하게 값을 변환해주어야 하는 경우라면 위와 같이 CustomConverter를 만들어 등록하면 될 것이다.
