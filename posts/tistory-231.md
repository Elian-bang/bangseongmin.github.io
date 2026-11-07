---
title: "[토비의 스프링] 테스트 - UserDaoTest 개선"
kind: "article"
permalink: "/posts/tistory-231.html"
published_on: "2022-11-08"
section: "Java·Spring"
category: "Java·Spring / 토비의 스프링 / 테스트"
---

![본문 이미지](../assets/tistory/5688fbabb026ea38a9306a7b.jpg)

토비의 스프링

* 본 내용은 토비의 스프링을 공부하며 정리한 내용입니다.

---

### **테스트 검증의 자동화**

#### **첫 번째 문제점인 테스트 결과의 검증**

> **가정**add()에 전달한 User 오브젝트에 담긴 사용자 정보와 get()을 통해 다시 DB에서 가져온 User 오브젝트의 정보가 서로 정확히 일치한다.  
>  **추론**정확히 일치한다면 모든 정보가 빠짐없이 DB에 등록됐고, 이를 다시 DB에서 정확히 가져왔다는 사실을 알 수 있다.

**모든 테스트는 성공과 실패의 두 가지 결과를 가질 수 있다.**

1. **테스트 에러**테스트가 진행되는 동안에 에러가 발생해서 실패하는 경우
2. **테스트 실패**테스트 작업 중에 에러가 발생하지 않았지만 그 결과가 기대한 것과 다르게 나오는 경우

* **테스트 중에 에러가 발생하는 것은 쉽게 확인이 가능하다.**

> **콘솔에 에러 메시지와 긴 호출 스택 정보가 출력되기 때문이다.**

테스트가 실패하는 것은 별도의 확인 작업과 그 결과가 있어야만 알 수 있다. 기존의 테스트 코드에서는 get()에서 가져온 결과를 사람이 눈으로 확인하도록 단순히 콘솔에 출력하기만 했는데, 이번에는 테스트 코드에서 결과를 직접 확인하고, 기대한 결과와 달라서 실패했을 경우에는 "테스트 실패"라는 메시지를 출력하도록 만들어보자. 그리고 모든 확인 작업을 통과하면 그때는 "테스트 성공"이라고 출력하도록 하겠다. 그러고 보면 기존에 출력했던 "조회 성공"이라는 메시지는 사실 get() 메소드가 에러 없이 끝났다는 의미이지 조회 테스트가 모두 성공했다는 뜻은 아니었다.

**리스트 2-2. 수정 전 테스트 코드**

```java
System.out.println(user2.getName());
System.out.println(user2.getPassword());
System.out.println(user2.getId() + "조회 성공");
```

**리스트 2-3. 수정 후 테스트 코드**

```java
if(!user.getName().equals(result.getName())){
    System.out.println("테스트 실패 (name)");
}else if(!user.getPassword().equals(result.getPassword())){
    System.out.println("테스트 실패 (password)");
}else{
    System.out.println("조회 테스트 성공");
}
```

**🔎 코드 분석**

> 1. add()에 전달한 User 오브젝트와 get()을 통해 가져오는 User 오브젝트의 값을 비교해서 일치하는지 확인  
> 2. 만약 다른 값이 있다면 그때는 테스트가 실패했다고 출력하고 테스트가 종료된다. 실패원인을 분석하기 위해 name과 password 둘 중 어떤 것 때문에 실패했는지를 알 수 있도록 뒤에 간단히 필드 이름을 추가해서 표시해줬다.  
> 3. 모든 비교가 다 성공적으로 끝나면 테스트가 성공했다고 메시지를 출력하도록 한다.  
>   
> 이 테스트는 UserDao의 두 가지 기능이 정상적으로 동작하는지를 언제든지 손쉽게 확인할 수 있게 해준다. 따라서 이 코드의 동작에 영향을 미칠 수 있는 어떤 변화라도 생기면 언제든 다시 실행해볼 수 있다. 스프링 프레임워크 대신 다른 프레임워크나 기술로 전환하는 큰 변화가 일어나더라도 UserDao가 전과 같이 정상적으로 동작하는지 확인하는 것은 이 테스트 한 번이면 충분한다.

자동화된 테스트를 위한 xUnit 프레임워크를 만든 **켄트 벡**은 **"테스트란 개발자가 마음 편하게 잠자리에 들 수 있게 해주는 것"**이라고 했다.  

만들어진 코드의 기능을 모두 점검할 수 있는 **포괄적인 테스트(comprehensive test)**를 만들면서부터는, 개발한 애플리케이션은 이후에 어떤 과감한 수정을 하고 나서도 테스트를 모두 돌려보고 나면 안심이 된다. 혹은 테스트를 통해 그 변경에 영향을 받는 부분이 정확히 확인된다면 빠르게 조치를 취할 수 있다.

**💡 요약**

> 개발 과정에서, 또는 유지보수 하면서 기존 애플리케이션 코드에 수정을 할 때 마음의 평안을 얻고, 자신이 만지는 코드에 대해 항상 자신감을 가질 수 있으며, 새로 도입한 기술의 적용에 문제가 없는지 확인할 수 있는 가장 좋은 방법은 빠르게 실행 가능하고 스스로 테스트 수행과 기대하는 결과에 대한 확인까지 해주는 코드로 된 자동화된 테스트를 만들어두는 것이다.

---

### **테스트의 효율적인 수행과 결과 관리**

#### **💣 현재 코드의 문제점**

> main() 메소드로 만든 테스트는 테스트로서 필요한 기능을 모두 갖춘 셈이다. 하지만 좀 더 편리하게 테스트를 수행하고 편리하게 결과를 확인하려면 단순한 main() 메소드로는 한계가 있다.  
>   
> 1. main 메소드를 이용한 테스트 작성 방법만으로는 애플리케이션 규모가 커지고 테스트 개수가 많아지면 테스트를 수행하는 일이 점점 부담이 될 것이다.  
>   
> => 일정한 패턴을 가진 테스트를 만들 수 있고, 많은 테스트를 간단히 실행시킬 수 있으며, 테스트 결과를 종합해서 볼 수 있고, 테스트가 실패한 곳을 빠르게 찾을 수 있는 기능을 갖춘 테스트 지원 도구와 그에 맞는 테스트 작성 방법이 필요하다.

#### **JUnit 테스트로 전환**

**JUnit은 프레임워크다.**

> 프레임워크의 기본 동작원리가 제어의 역전(IoC)이다. 개발자가 만든 클래스에 대한 제어 권한을 넘겨받아서 주도적으로 애플리케이션의 흐름을 제어한다. 개발자가 만든 클래스의 오브젝트를 생성하고 실행하는 일은 프레임워크에 의해 진행된다.  
>   
> => **프레임워크에서 동작하는 코드는 main() 메소드도 필요 없고 오브젝트를 만들어서 실행시키는 코드를 만들 필요도 없다.**

---

#### **테스트 메소드 전환**

**기존에 만들었던 main() 메소드 테스트는 프레임워크에 적용하기엔 적합하지 않다.**

> 테스트가 main() 메소드로 만들어졌다는 건 제어권을 직접 갖는다는 의미이기 때문이다. 그러므로 main() 메소드에 있던 테스트 코드를 일반 메소드로 옮겨야 한다.

**리스트 2-4. JUnit 프레임워크에서 동작할 수 있는 테스트 메소드로 전환**

```java
@Test
public void addAndGet() throws SQLException {
    ApplicationContext context = new GenericXmlApplicationContext("applicationContext.xml");
    UserDao userDao = context.getBean("userDao", UserDao.class);

    User user = new User();
    user.setId("0");
    user.setName("seongminBang");
    user.setPassword("1234");

    userDao.add(user);

    System.out.println(user.getId() + " Enroll Success");

    User result = userDao.get("0");
    assertEquals("0", result.getId());

    if(!user.getName().equals(result.getName())){
        System.out.println("테스트 실패 (name)");
    }else if(!user.getPassword().equals(result.getPassword())){
        System.out.println("테스트 실패 (password)");
    }else{
        System.out.println("조회 테스트 성공");
    }
}
```

> **JUnit 프레임워크가 요구하는 조건**  
> 1. 메소드가 public으로 선언  
> 2. 메소드에 @Test라는 어노테이션을 붙여주는 것

---

#### **검증 코드 전환**

테스트의 결과를 검증하는 if/else 문장을 JUnit이 제공하는 방법을 이용해 전환해보자.

if문은 처음 add()에 사용했던 user 오브젝트의 name 값과 get()에서 가져온 result 오브젝트의 name 값이 같으면 다음으로 넘어가고, 아니면 테스트가 실패하게 한다.

```java
if(!user.getName().equals(result.getName())){ ... }
```

이 if 문장의 기능을 JUnit이 제공해주는 assertThat이라는 스태틱 메소드를 이용해 다음과 같이 변경할 수 있다.

```java
assertThat(result.getName(), is(user.getName()));
```

```java
assertThat(result.getPassword(), is(user.getPassword()));
```

**🔎 코드 분석**

> **assertThat() 메소드**는 첫 번째 파라미터의 값을 뒤에 나오는 매처(matcher)라고 불리는 조건으로 비교해서 일치하면 다음으로 넘어가고, 아니면 테스트가 실패하도록 만들어준다.  
> **is() 메소드**는 매처의 일종으로 equals()로 비교해주는 기능을 가졌다.

JUnit은 예외가 발생하거나 assertTaht()에서 실패하지 않고 테스트 메소드의 실행이 완료되면 테스트가 성공했다고 인식한다. "테스트 성공"이라는 메시지가 굳이 출력할 필요는 없다. JUnit이 테스트를 실행하고 나면 결과를 다양한 방법으로 알려주기 때문이다.

💡 **참고**

> assertThat()은 Hamcrest라이브러리는 JUnit 4 라이브러리에 포함되어 있었는데 JUnit 5로 오면서 빠지게된 라이브러리로 사용할 경우 의존성을 추가해주어야 한다.  
>   
> 방법 1. spring-boot-starter-test는 전부 포함하고 있다.  
> 방법 2. Hamcrest-All은 AssertThat과 Is를 모두 포함하고 있다.  
>   
> Hamcrest 보다 AssertJ를 사용하면 조금 더 가독성있는 코드를 만들 수 있다.

**리스트 2-5. JUnit을 적용한 UserDaoTest**

```java
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;

public class UserDaoTest {

    @Test
    public void addAndGet() throws SQLException {
        ApplicationContext context = new GenericXmlApplicationContext("applicationContext.xml");
        UserDao userDao = context.getBean("userDao", UserDao.class);

        User user = new User();
        user.setId("2");
        user.setName("customer1");
        user.setPassword("customer1");
        userDao.add(user);

        User result = userDao.get(user.getId());

        assertThat(result.getName(), is(user.getName()));
        assertThat(result.getPassword(), is(user.getPassword()));
    }
}
```

---

#### **JUnit 테스트 실행**

스프링 컨테이너와 마찬가지로 JUnit 프레임워크도 자바 코드로 만들어진 프로그램이므로 어디선가 한 번은 JUnit 프레임워크르 시작시켜 줘야 한다. 어디에든 main() 메소드를 하나 추가하고, 그안에 JUnitCore 클래스의 main 메소드를 호출해주는 간단한 코드를 넣어주면 된다. 메소드 파라미터에는 @Test 테스트 메소드를 가진 클래스의 이름을 넣어준다.

**리스트 2-6. JUnit을 이용해 테스트를 실행해주는 main() 메소드**

```java
import org.junit.runner.JUnitCore;

public static void main(String[] args){
    JUnitCore.main("com.dao.UserDaoTest");
}
```

이 클래스를 실행하면 다음과 같은 메시지가 출력될 것이다.

```java
JUnit version x.x
Time: x.xxx
OK (1 test)
```

테스트를 실행하는데 걸린 시간과 테스트 결과, 그리고 몇 개의 테스트 메소드가 실행됐는지 알려준다. 만약 코드에 이상이 있어서 assertThat() 의 검증에서 실패하면 다음과 같은 메시지가 나올 것이다.

```java
JUnit version x.x
Time: x.xxx
There was 1 failture:
1) addAndGet(com.dao.UserDaoTest)
java.lang.AssertionError:
Expected: is "XXX"
     got: null
     ...
FAILURES!!!

Tests run: 1, Failures: 1
```

****🔎**출력 결과 분석**

> 테스트가 실패하면 OK 대신 FAILURES!! 라는 내용이 출력되고, 총 수행한 테스트 중에서 몇 개의 테스트가 실패했는지 보여준다. 출력된 메시지를 잘 살펴보면 실패한 테스트는 UserDaoTest 클래스의 addAndGet() 메소드이고, 실패한 이유는 "박성철"이라는 값을 원했는데 실행해보니 null이 나왔다는 것임을 알 수 있다. 함께 출력된 호출 스택을 살펴보면 실패한 원인이 무엇이고 테스트 코드에서 검증에 실패한 위치는 어디인지도 확인할 수 있다.  
>   
> JUnit은 assertThat()을 이용해 검증을 했을 때 기대한 결과가 아니면 AssertionError를 던진다. 따라서 assertThat()의 조건을 만족하지 못하면 테스트는 더 이상 진행되지 않고 JUnit은 테스트가 실패했음을 알게 된다. 테스트 수행 중에 일반 예외가 발생한 경우에도 마찬가지로 테스트 수행은 중단되고 테스트는 실패한다.
