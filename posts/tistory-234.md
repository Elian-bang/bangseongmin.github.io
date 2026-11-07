---
title: "[JUnit] JUnit 5 사용법"
kind: "article"
permalink: "/posts/tistory-234.html"
published_on: "2022-11-09"
section: "프로그래밍"
category: "프로그래밍"
---

> 토비의 스프링을 공부하면서 코드가 JUnit 4로 되어 있어 어려움을 겪을 때가 많았다.  
> JUnit 5에서는 어떻게 사용해야하는지 어떻게 개발하면 좋을지 알아보기 위해 작성하게 되었다.

---

### **기본 Annotation**

#### @BeforeAll과 @BeforeEach

@BeforeAll

* 해당 어노테이션이 설정된 메소드가 현재 클래스의 모든 테스트 메소드보다 먼저 실행된다.
* 해당 메서드는 static이어야 한다.
* JUnit4의 @BeforeClass와 동일하다

@BeforeEach

* 해당 어노테이션이 설정된 메소드가 각 테스트 메소드 전에 실행된다.
* JUnit4의 @Before와 동일하다.

```java
@BeforeAll
static void setup() {
    log.info("@BeforeAll - executes once before all test methods in this class");
}

@BeforeEach
void init() {
    log.info("@BeforeEach - executes before each test method in this class");
}
```

#### @DisplayName과 @Disabled

@DisplayName

* 테스트 클래스 또는 테스트 메소드의 이름을 정의할 수 있다.

@Disable

* 테스트 클래스 또는 메소드를 비활성화할 수 있다.
* JUnit4의 @Ignore와 동일하다.

```java
@DisplayName("Single test successful")
@Test
void testSingleSuccessTest() {
    log.info("Success");
}
@Test
@Disabled("Not implemented yet")
void testShowSomething() {
}
```

#### @AfterEach와 @AfterAll

@AfterEach

* 해당 annotation 이 달린 메서드가 현재 클래스의 모든 테스트 메소드보다 이후에 실행된다.
* 해당 메서드는 static 이어야 한다.
* JUnit4의 @AfterClass 와 동일하다.

@AfterAll

* 해당 annotation 이 달린 메서드가 각 테스트 메서드 이후에 실행된다.
* JUnit4의 @After와 동일

---

### Assertions와 Assumptions

#### Assertions

* org.junit.jupiter.api.Assertions로 변경됨
* **assertTrue**, **assertThat** etc

```java
@Test
void lambdaExpressions() {
  assertTrue(Stream.of(1, 2, 3)
    .stream()
    .mapToInt(i -> i)
    .sum() > 5, () -> "Sum should be greater than 5");
}
```

* **assertAll**
  + assertAll()을 사용하여 assertions 을 그룹화하여 그룹 내에서 실패한 assertions 을 MultipleFailuresError 와 함께 기록할 수 있다. 즉, 실패의 정확한 위치를 정확히 파악할 수 있기 때문에 보다 복잡한 assertions 을 만들어도 안전하게 사용할 수 있다.

```java
@Test
void groupAssertions() {
  int[] numbers = {0, 1, 2, 3, 4};
  assertAll("numbers",
      () -> assertEquals(numbers[0], 1),
      () -> assertEquals(numbers[3], 3),
      () -> assertEquals(numbers[4], 1)
  );
}
```

#### Assumptions

* 특정 조건이 충족되는 경우에만 테스트를 실행하는 데 사용된다.
* 일반적으로 테스트가 제대로 실행되기 위해 필요한 외부 조건에 사용된다.
* 테스트와 직접적인 관련은 없다.
* assumptions 이 실패하면 TestAbortedException이 발생하고 테스트는 수행되지 않는다.
* assumeTrue(), assumeFalse(), and assumingThat()

```java
@Test
void trueAssumption() {
  assumeTrue(5 > 1);
  assertEquals(5 + 2, 7);
}
@Test
void falseAssumption() {
  assumeFalse(5 < 1);
  assertEquals(5 + 2, 7);
}
@Test
void assumptionThat() {
  String someString = "Just a string";
  assumingThat(
      someString.equals("Just a string"),
      () -> assertEquals(2 + 2, 4)
  );
}
```

### Exception Test

#### assertThrows

* 발생한 예외의 세부 사항을 확인

```java
@Test
void shouldThrowException() {
    Throwable exception = assertThrows(UnsupportedOperationException.class, () -> {
    	throw new UnsupportedOperationException("Not supported");
    });

    assertEquals(exception.getMessage(), "Not supported");
}
```

* 예외 유형의 유효성을 검사

```java
@Test
void assertThrowsException() {
    String str = null;
    assertThrows(IllegalArgumentException.class, () -> { Integer.valueOf(str); });
}
```

### Test Suites

#### @SelectPackages

* Test Suites 를 실행할 때 선택할 패키지 이름 지정

```java
@RunWith(JUnitPlatform.class)
@SelectPackages("com.baeldung")
public class AllUnitTest {}
```

#### @SelectClasses

* Test Suites 를 실행할 때 선택할 클래스 지정

```java
@RunWith(JUnitPlatform.class)
@SelectClasses({AssertionTest.class, AssumptionTest.class, ExceptionTest.class})
public class AllUnitTest {}
```

### Dynamic Tests

#### @TestFactory

* 해당 어노테이션이 설정된 메소드는 동적 테스트를 위한 test factory 메소드이다.
* 런타임에 생성된 테스트 케이스를 선언하고 실행할 수 있다.
* @TestFactory 메소드는 private 또는 static 이면 안된다.
* 테스트 수는 동적이며, ArrayList 크기에 따라 달라진다.
* @TestFactory 메소드는 Stream, Collection, Iterable 또는 Iterator를 반환해야 한다.

```java
@TestFactory
public Stream<DynamicTest> translateDynamicTestsFromStream() {
  return in.stream()
    .map(word ->
        DynamicTest.dynamicTest("Test translate " + word, () -> {
          int id = in.indexOf(word);
          assertEquals(out.get(id), translate(word));
        })
  );
}
```

### ETC

#### @Nested

* 해당 annotation 이 달린 클래스는 중첩된 비정적(non-static) 테스트 클래스 임을 나타낸다.
* 테스트 클래스 안에서 내부 클래스(Inner Class)를 정의해 테스트를 계층화할 수 있다.
* 내부 클래스로 정의하기 때문에 부모 클래스의 멤버 필드에 접근할 수 있고, Before/After 와 같은 테스트 생명주기에 관계된 메소드들도 계층에 맞게 동작한다.

#### @Tag

* 테스트 필터링을 위한 태그를 선언할 수 있다.

#### @ExtendWith

* 사용자 정의 확장명을 등록하는 데 사용된다.

#### @RepeatedTest

* 해당 테스트를 반복 실행할 수 있다.

---

**참고**

* [JUnit 5 공식 문서](https://junit.org/junit5/docs/current/user-guide/)
* [Baeldung](https://www.baeldung.com/junit-5)
