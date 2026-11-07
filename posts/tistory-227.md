---
title: "[JUnit] JUnit5에서 예외 테스트"
kind: "article"
permalink: "/posts/tistory-227.html"
published_on: "2022-11-02"
section: "프로그래밍"
category: "프로그래밍"
---

#### **💣 문제점**

> 토비의 스프링을 스프링 부트 버전으로 연습하다가 에러를 마주하게 되었다.  
> 기존에 사용했던 JUnit4 방식의 Exception 테스트가 JUnit5에서는 적용되지 않기 때문이다.

**User를 가져오는 get() 메서드**

```java
public User get(String id) throws SQLException {
    Connection c = dataSource.getConnection();

    PreparedStatement ps = c.prepareStatement("select * from users where id = ?");
    ps.setString(1, id);

    ResultSet rs = ps.executeQuery();
    rs.next();

    User user = new User();
    user.setId(rs.getString("id"));
    user.setName(rs.getString("name"));
    user.setPassword(rs.getString("password"));

    rs.close();
    ps.close();
    c.close();

    return user;
}
```

위 메서드에서 user를 가져오지 못한 경우, **EmptyResultDataAccessException** 예외가 발생하도록 만드는 작업이다.

#### **JUnit4**

```java
@Test(expected = "EmptyResultDataAccessException.class")
public void getUserFailure() throws SQLException, ClassNotFoundException {
    ApplicationContext context = new GenericXmlApplicationContext("applicationContext.xml");

    UserDao dao = context.getBean("userDao", UserDao.class);
    dao.deleteAll();
    assertThat(dao.getCount(), is(0));

    dao.get("unkown_id");
}
```

JUnit4에서는 위 코드와 같이 @Test 어노테이션에 expected 엘리먼트를 추가할 수 있었지만, JUnit5에서는 사용할 수 없는 기능이다. JUnit 4로 변경하면 테스트는 가능하지만, JUnit5에서도 이러한 문제를 해결할 수 있는 방법이 존재한다.

#### **JUnit5**

**1. assertThrows 메소드**

```java
@Test
public void getUserFailure() throws SQLException {
    ApplicationContext context = new GenericXmlApplicationContext("applicationContext.xml");

    UserDao dao = context.getBean("userDao", UserDao.class);
    dao.deleteAll();
    assertThat(dao.getCount(), is(0));

    // 이 메소드 실행 중에 예외가 발생해야 한다. 예외가 발생하지 않으면 테스트가 실패한다.
    assertThrows(EmptyResultDataAccessException.class, () -> {
        dao.get("unkown_id");
    });
}
```

**2. assertJ라이브러리**

```java
@Test
    public void getUserFailure() throws SQLException {
        ApplicationContext context = new GenericXmlApplicationContext("applicationContext.xml");

        UserDao dao = context.getBean("userDao", UserDao.class);
        dao.deleteAll();
        assertThat(dao.getCount(), is(0));

        // 이 메소드 실행 중에 예외가 발생해야 한다. 예외가 발생하지 않으면 테스트가 실패한다.
        assertThatThrownBy(() -> {
            dao.get("unkown_id");
        }).isInstanceOf(EmptyResultDataAccessException.class);
    }
```

> 이외에도 JUnit4에서 JUnit5으로 버전이   
> 상향되면서 사라진 기능이 많기 때문에   
> 필자는 assertJ 라이브러리를 사용하여  
> 그러한 문제를 해결하고 있다.   
> assertJ가 가독성도 좋고 Good!
