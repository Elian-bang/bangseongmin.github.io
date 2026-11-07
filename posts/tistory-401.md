---
title: "[TIL] Success is going from failure to failure without a loss of enthusiasm"
kind: "article"
permalink: "/posts/tistory-401.html"
published_on: "2023-05-25"
section: "학습·회고"
category: "학습·회고 / TIL"
---

![본문 이미지](../assets/tistory/e41875f1158d12d25fa17cc0.jpg)

## Success is going from failure to failure without a loss of enthusiasm

---

데이터베이스 개편은 거의 끝나고 추가적인 작업은 동료가 맡고 어제부터 구현을 시작했습니다.

데이터베이스 개편을 하면서 로직이 많이 바뀐 것 같아 끝이나지 않을 것이라고 생각했는데...

생각보다 빠르게 구현을 어느정도 마무리하였고 오후부터 테스트를 진행하였습니다.

그런데 고민이 생겼습니다.

데이터를 조회하는 기능에서 어쩔 때는 일부를 출력하고 어느 때에는 전체를 반환해주고 싶었습니다.

이럴 때는 어떻게 해야할까 하면서 여러가지 방법을 시도해 해보았습니다.

### VO 분리

기본 VO 구조를 추상화하여 다음과 같이 케이스 마다 다르게 반환하도록 분리하였습니다.

```java
public abstract class postVO {

    public class insert extends postVO {}
    public class update extends postVO {}
    public class search extends postVO {}
    public class delete extends postVO {}
}
```

조회 때 사용하는 VO는 동일한데 분리를 하기 위해 조회 클래스를 분리시키고 데이터가 필요하지 않을 때는 @JsonIgnore을 통해 조회 시 반환되지 않도록 하고, 데이터가 필요할 때는 반환되도록 하였습니다.

```java
public abstract class postVO {

    private String name;
    private String hpNo;

    public class insert extends postVO {}
    public class update extends postVO {}
    public class search extends postVO {
    	@JsonIgnore
    	private String name;
        @JsonIgnore
    	private String hpNo;
    }

    public class searchAll extends postVO {
    	private String name;
    	private String hpNo;
    }

    public class delete extends postVO {}
}
```

그런데 ... 이것이 잘되지 않아 동일하게 반환되는 현상을 발견할 수 있었습니다...

### Builder 를 통해 재생성

쿼리를 통해 조회한 데이터를 빌더를 이용해 필요한 데이터만 넣어 인스턴스가 생성되도록 변경하였습니다.

```java
public PostVO.Simple getSimple(item) {
    return PostVO.builder()
    .name(item.name)
    .hpNo(item.hpNo)
    .build();
}
```

데이터는 정상적으로 반환되었습니다. 그런데 ... null이라고 표시되었기 때문에 원치 않은 결과였습니다...

### 정리

컨트롤러에서 동일한 VO로 반환하는데 일부만 반환되도록 하고 싶다면 어떻게 해야할까요?

```java
@RequiredArgsConstructor
@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;

    @GetMapping("/daily-post-counts")
    public PostVO getPost(DailyPostCountRequest request) {
        return postService.getPost(request);
    }
}
```

1) 이름과 전화번호만 반환

```javascript
console.log(result) => name= "", hpNo=""
```

2) PK, 이름과 전환번호, 작성자 등 반환

```javascript
console.log(result) => seq ="", name= "", hpNo="", registerId=""
```

위와 같이 일부분만 보내고 싶다면... 어떻게 해야할까요??

알고 있습니다.. 가장 쉬운 방법은 컨트롤러를 바꾸는 방법이라는 것을... 하지만 한 개의 컨트롤러에서도 가능할까요?
