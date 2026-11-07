---
title: "[JS] 이벤트 핸들링 중복"
kind: "article"
permalink: "/posts/tistory-405.html"
published_on: "2023-05-31"
section: "트러블슈팅"
category: "트러블슈팅"
---

![본문 이미지](../assets/tistory/89cbf3a6c75f34ef4c5af4c5.png)

## 이벤트 핸들링 중복

---

부트스트랩 라이브러리를 이용해 구현된 버튼에서 이벤트 핸들링 중복 현상이 발생하였습니다.

마우스를 통해 클릭하면 이벤트가 1번 발생하지만, `Enter`키를 누르면 이벤트가 2번 발생하는 것을 확인할 수 있었습니다.

이유가 무엇일까 하며 열심히 찾다가 이것이 이벤트 핸들링 중복으로 인해 발생할 수 있다는 것을 확인하였습니다.

이러한 이벤트 핸들링 중복을 해결할 수 있는 방법 3가지를 공유해드리려고 합니다.

### 이벤트 수식어를 사용하는 방법

---

Vue는 **이벤트 수식어**를 사용하여 **특정 키 이벤트**에 대한 동작을 제어할 수 있습니다. 이 경우 **@keyup.enter** 수식어를 사용하여 Enter 키에 대한 이벤트 핸들링을 한 번만 처리하도록 할 수 있습니다. 예를 들면 다음과 같습니다

```javascript
<template>
  <input type="text" @keyup.enter="handleEnterKey" />
</template>

<script>
export default {
  methods: {
    handleEnterKey() {
      // Enter 키 이벤트 처리
    }
  }
}
</script>
```

### 이벤트 중복

---

**Enter**키를 눌렀을 때**기본 동작이 발생하는 것을 중지**시키는 방법이 있습니다. 이 경우 @keyup.enter 이벤트 핸들러에서 **event.preventDefault()**를 호출하여 기본 동작을 막을 수 있습니다. 이렇게 하면 두 번의 이벤트가 발생하지 않습니다

```javascript
<template>
  <input type="text" @keyup.enter="handleEnterKey" />
</template>

<script>
export default {
  methods: {
    handleEnterKey(event) {
      event.preventDefault(); // 기본 동작 중지
      // Enter 키 이벤트 처리
    }
  }
}
</script>
```

### 이벤트 한 번만 처리

---

Vue 컴포넌트에서 이벤트 핸들러를 등록하는 것을 두 번 호출하는 등의 중복 문제가 발생하는 경우, 이벤트 핸들러 등록을 한 번만 수행하도록 확인할 수 있습니다. 이 방법은 Vue 라이프사이클 훅을 활용하여 이벤트 핸들러 등록을 컴포넌트가 처음으로 마운트 될 때만 수행하도록 할 수 있습니다.

```javascript
<template>
  <input type="text" ref="inputRef" />
</template>

<script>
export default {
  mounted() {
    this.$refs.inputRef.addEventListener('keyup', this.handleEnterKey);
  },
  beforeUnmount() {
    this.$refs.inputRef.removeEventListener('keyup', this.handleEnterKey);
  },
  methods: {
    handleEnterKey(event) {
      if (event.key === 'Enter') {
        // Enter 키 이벤트 처리
      }
    }
  }
}
</script>
```

### 정리

---

처음에 프런트 개발할 때 이벤트 중복 현상, 버블링 등이 발생하면... 원인도 모르고 코드를 수정하고 수정하다가 메서드를 확인하고 문제가 무엇일지 확인하던 모습이 떠오릅니다...

그때를 생각하면 민망하지만 그때의 고통이 지금의 성장을 만든 것 같습니다.

경험은 성장통이 된다!!

추가적으로 다른 좋은 방법이 존재한다면 조언부탁드립니다!
