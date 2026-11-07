---
title: "[Java] Record 알아보기"
kind: "article"
permalink: "/posts/tistory-248.html"
published_on: "2022-12-03"
section: "Java·Spring"
category: "Java·Spring / Java·JVM"
---

![본문 이미지](../assets/tistory/41265cbc32d7f27da4c35e87.jpg)

### **Record**

---

* 레코드(record)란 "데이터 클래스"이며 순수하게 데이터를 보유하기 위한 특수한 종류의 클래스
* 불변(immutable) 데이터 객체를 쉽게 생성할 수 있도록 하는 새로운 유형의 클래스
* 간결하고 가볍기 때문에 Entity 혹은 DTO 클래스를 생성할때 사용하면 유용
* JDK14에서 preview로 등장하여 JDK16에서 정식 스펙으로 포함

### **필요한 이유**

---

데이터를 한쪽에서 다른 한쪽으로 전달하기 위해서만 사용되는 데이터 전송 객체(혹은 DTO)를 생각해보자.

이런 객체를 사용하는 이유는?

* 다양한 집계 연산을 수행한 후의 결과를 담아두기 위해
* 외부 시스템과 통신 시에 필요하지 않은 데이터를 제거하여 대역폭 사용량을 줄이기 위해
* 세부 구현을 노출시키지 않기 위해
* 변경되지 말아야 하는 API 설계 상의 이유
* etc

이를 제대로 구현하기 위해서는 (Lombok이나 IDE의 도움을 받을 수도 있지만) 아래와 같이 게터(getter 혹은 accessor), equals(), hashCode(), toString() 처럼 계속 똑같은 구조의 코드를 반복해서 작성해야 했습니다.

**일반적인 Java Class**

```java
public final class Author {

  private final String name;
  private final String genre;    

  public Author(String name, String genre) {
    this.name = name;
    this.genre = genre;  
  }

    public String getName() {
        return name;
    }

    public String getGenre() {
        return genre;
    }

    @Override
    public boolean equals(Object o) {
      ...
    }

    @Override
    public int hashCode() {
      ...
    }

    @Override
    public String toString() {
      ...
    }
}
```

Java 14 이전에는 클래스마다 수십 줄의 지루한 코드를 만들어야하는 문제가 있었다.

**Record Class**

```java
public record Author(String name, String genre) {}
```

자바 14 이후부터 레코드(Record)라는 구문이 프리뷰 기능으로 추가되었고, 자바 16부터는 공식 기능이 되었다.

열거형과 마찬가지로 자바 클래스의 특별한 한 종류라고 바라볼 수 있다. 마치 클래스의 생성자와 같이 매개변수를 나열하면 되는데, 여기서는 이를 컴포넌트(component)라고 부른다.

```java
record 레코드명(컴포넌트1, 컴포넌트2, ...) { }
```

### **일반적인 Class와 차이점은?**

---

#### **차이점**

* Record는 다른 클래스를 상속받을 수 없다.
* Record는 인스턴스 필드를 선언할 수 없다(정적 필드는 가능하다).
* Record는 abstract로 선언할 수 없으며 암시적으로 final로 선언된다.
* Record의 컴포넌트는 암시적으로 final로 선언된다.

#### **비슷한 점**

* 클래스 내에서 Record를 선언할 수 있다. 중첩된 Record는 암시적으로 static으로 선언된다.
* 제네릭 Record를 만들 수 있다.
* Record는 클래스처럼 인터페이스를 구현할 수 있다.
* new 키워드를 사용하여 Record를 인스턴스화할 수 있다.
* Record의 본문(body)에는 정적필드, 정적 메서드, 정적 이니셜라이저, 생성자, 인스턴스 메소드, 중첩 타입(클래스, 인터페이스, 열거형 등)을 선언할 수 있다.
* Record나 Record의 각 컴포넌트에 어노테이션을 달 수 있다.

```java
// 레코드
public record Book(String title, String author, String isbn) { }

// 클래스
// 암시적으로 추상 클래스인 java.lang.Record를 상속받는다.
public final class Book extends java.lang.Record {
    // 레코드의 각 컴포넌트는 내부에서 private final인 인스턴스 필드로 선언된다.
    private final String title;
    private final String author;
    private final String isbn;

    // 레코드 내부에서 표준 생성자(canonical constructor)가 만들어진다.
    // 암시적으로 선언된 표준 생성자의 접근 제어자는 레코드의 접근 제어자와 동일하다.
    public Book(String title, String author, String isbn) {
        super();
        this.title = title;
        this.author = author;
        this.isbn = isbn;
    }

    // 기본 구현 toString(), hashCode(), equals()은 원하면 변경할 수 있다.
    @Override
    public final String toString() {
        // 내부 구현의 정확한 문자열 포맷은 향후 변경될 수도 있다.
        return "Book[" + this.title + ", " + this.author + ", " + this.isbn + "]";
    }

    // 암시적 구현은 동일한 컴포넌트로부터 생성된 두 레코드는 해시 코드가 동일해야 한다.
    @Override
    public final int hashCode() {
        // 구현에 사용되는 정확한 알고리즘은 정해지지 않았으며 향후 변경될 수 있다.
        int result = title == null ? 0 : title.hashCode();  
        result = 31 * result + (author == null ? 0 : author.hashCode());  
        result = 31 * result + (isbn == null ? 0 : isbn.hashCode());  
        return result;  
    }

    // 암시적 구현은 두 레코드의 모든 컴포넌트가 서로 동일하면 true를 반환한다.
    @Override
    public final boolean equals(Object o) {
        // 구현에 사용되는 정확한 알고리즘은 정해지지 않았으며 향후 변경될 수 있다.
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Book book = (Book) o;
        return Objects.equals(title, book.title) && Objects.equals(author, book.author) && Objects.equals(isbn, book.isbn);
    }

    // 컴포넌트명과 동일한 게터(getter)가 선언된다.
    public String title() {
        return this.title;
    }

    public String author() {
        return this.author;
    }

    public String isbn() {
        return this.isbn;
    }
}
```

### **컴팩트 생성자(Compact Constructor)**

---

별도의 초기화 로직이 필요하다면 레코드 안에 표준 생성자를 만들 수 있다. 내부에는 final로 선언된 인스턴스 필드가 있어서 생성자 안에서 모두 초기화해야 합니다.

```java
public record Book(String title, String author, String isbn) {    
    // 물론 이렇게 다른 생성자를 추가할 수도 있다.
    public Book(String title, String isbn) {
        this(title, "Unknown", isbn);
    }

    public Book(String title, String author, String isbn) {
        // 조금 더 복잡한 초기화 로직 ...
    }
}
```

이러한 표준 생성자 말고도 컴팩트 생성자를 사용할 수 있다. 아래와 같이 생성자 매개변수를 받는 부분이 사라진 형태입니다. 개발자가 일일이 명시적으로 인스턴스 필드를 초기화하지 않아도 컴팩트 생성자의 마지막에 초기화 구문이 자동으로 삽입된다. 표준 생성자와는 달리 컴팩트 생성자 내부에서는 인스턴스 필드에 접근을 할 수가 없으며, 접근하려고 하면 "final 변수 'x'에 값을 할당할 수 없습니다."와 같은 에러 메시지를 볼 수 있습니다.

```java
public record Book(String title, String author, String isbn) {
    // public Book(String title, String author, String isbn) { ... }과 동일
    public Book {
        Objects.requireNonNull(title);
        Objects.requireNonNull(author);
        Objects.requireNonNull(isbn);
        // this.title = title;
        // this.author = author;
        // this.isbn = isbn;
    }

    // 여전히 아래와 같이 표준 생성자와 컴팩트 생성자를 혼용해서 쓸 수 있다.
    public Book(String title, String isbn) {
        this(title, "Unknown", isbn);
    }
}
```

따라서 컴팩트 생성자에는 컴포넌트로 넘어온 객체를 불변으로 만들거나, 불변식(invariant)을 만족하는지 검사하는(예를 들어서 위와 같이 null이 넘어오지는 않았는지) 등의 작업을 하기에 적합합니다. [메일링 리스트](https://mail.openjdk.java.net/pipermail/amber-spec-experts/2020-July/002254.html)에서 발견한 설계자의 의도는 다음과 같습니다.

> **개빈 비어만(Gavin Bierman)이 말하는 컴팩트 생성자의 의도**보통 레코드 클래스에 표준 생성자를 명시적으로 제공해야 하는 이유는 인수의 값을 검증하거나 정규화하기 위함이다. 레코드 클래스 선언의 가독성을 높이기 위해서 이러한 검증/정규화용 코드만 필요한 새로운 형태의 소형화된(compact) 표준 생성자 선언을 제공한다. 예시는 다음과 같습니다.  
>
> ```java
> record Rational(int num, int denom) { 
> 	Rational {
>     	// 기약분수로 만들기 위해서 분모와 분자를 최대공약수(GCD)로 나눈다.
> 		int gcd = gcd(num, denom);
> 		num /= gcd;
> 		denom /= gcd;
> 	}
> }
> ```
>
> 컴팩트 생성자 선언의 의도는 생성자 본문에 검증/정규화용 코드만 넣어야 한다는 것이다. 나머지 초기화 코드는 컴파일러가 자동으로 수행한다. 매개변수 목록은 레코드의 컴포넌트 목록에서 가져오기 때문에 컴팩트 생성자 선언에 필요하지 않다. 달리 말하면, 위의 선언은 기존 생성자의 형태를 사용하는 아래의 선언과 같다.
>
> ```java
> record Rational(int num, int denom) { 
> 	Rational(int num, int demon) {
> 		// 검증/정규화(Validation/Normalization)
> 		int gcd = gcd(num, denom);
> 		num /= gcd;
> 		denom /= gcd;
> 		// 초기화
> 		this.num = num;
> 		this.denom = denom;
> 	}
> }
> ```

**Refer**

* <https://dzone.com/articles/jdk-14-records-for-spring-devs>
* <https://blog.hexabrain.net/399>
