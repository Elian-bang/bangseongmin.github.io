---
title: "[JS] JavaScript에서 맵 키 및 값을 배열로 변환"
kind: "article"
permalink: "/posts/tistory-397.html"
published_on: "2023-05-22"
section: "웹·프론트엔드"
category: "웹·프론트엔드 / JavaScript"
---

![본문 이미지](../assets/tistory/86754aace9a13926ced68d45.png)

## JavaScript에서 맵 키 및 값을 배열로 변환

---

변수에 데이터를 저장할 때 배열을 사용할 수 있지만, 배열을 통해 중복을 제거하는 작업은 추가적인 비용이 발생합니다.

중복을 제거하기 위해 가장 쉽게 선택할 수 있는 방법은 Map 이 있습니다.

Map은 key와 value 구조로 Unique한 Key와 중복이 가능한 Value의 구조를 가질 수 있습니다.

Map으로 데이터를 저장한 후 배열로 전환하는 방법은 무엇일지 알아봅시다.

## JavaScript에서 맵 키 및 값을 배열로 변환

---

Map의 Key와 Value를 배열로 전환하기 위한 방법은 다음과 같습니다.

1. Map에 Key Iterator(반복자)를 얻기 위해 `Map.keys()`를 사용
2. Map에 Value Iterator(반복자)를 얻기 위해 `Map.values()`를 사용
3. Iterator(반복자)를 배열로 전환하기 위해 `Array.from()`을 사용

```javascript
const map = new Map();
map.set('name', 'John');
map.set('age', 30);

// ✅ Convert Map values to an Array
const values = Array.from(map.values());

console.log(values); // 👉️ ['John', 30]
console.log(values.length); // 👉️ 2

// ✅ Convert Map keys to an Array
const keys = Array.from(map.keys()); // 👉️ ['name', 'age']
```

`Array.from` 메소드는 제공된 반복자를 배열로 전환해주고 새로운 배열의 인스턴스를 반환해줍니다.

> 반복자와 함께 확산 구문(...)을 사용할 때 컴파일러가 종종 불평하기 때문에 TypeScript를 사용할 때 권장되는 접근 방식입니다.

## 스프레드 구문을 사용하여 맵 키 및 값을 배열로 변환

---

Spread 구문을 사용하여 Map의 key와 value를 배열로 전환할 수 있습니다.

1. Map에 Key Iterator(반복자)를 얻기 위해 `Map.keys()`를 사용
2. Map에 Value Iterator(반복자)를 얻기 위해 `Map.values()`를 사용
3. 반복자 객체를 배열로 전환하기 위해 Spread 구문을 사용

```javascript
const map = new Map();
map.set('name', 'Tom');
map.set('age', 39);

// ✅ Convert Map values to an array
const values = [...map.values()];

console.log(values); // 👉️ ['Tom', 39]
console.log(values.length); // 👉️ 2

// ✅ Convert Map keys to an array
const keys = [...map.keys()];
console.log(keys); // 👉️ ['name', 'age']
```

확산 구문(...)을 사용하여 Map의 모든 키와 값을 두 개의 개별 배열로 압축 해제했습니다.

> Map의 Key와 Value을 배열로 변환할 때 가장 일반적으로 사용되는 접근 방식입니다.

다중 Map 객체는 다음과 같이 해결할 수 있습니다.

```javascript
const map1 = new Map();
map1.set('name', 'Tom');

const map2 = new Map();
map2.set('country', 'Chile');

const values = [...map1.values(), ...map2.values()];
console.log(values); // 👉️ ['Tom', 'Chile']

const keys = [...map1.keys(), ...map2.keys()];
console.log(keys); // 👉️ [ 'name', 'country' ]
```

Map 개체의 값을 압축 해제한 순서는 새 배열에서 유지됩니다.   

Map.forEach() 메서드를 사용하여 Map의 Key와 Value을 배열로 변환할 수도 있습니다.

## Map.forEach()를 사용하여 맵 키와 값을 배열로 변환

---

Map의 forEach를 사용하여 Map의 Key와 Value를 배열로 변환할 수 있습니다.

1. Map.forEach() 메서드를 사용하여 Map 반복
2. Array.push() 메서드를 사용하여 Map의 키와 값을 두 개의 개별 배열로 삽입

```javascript
const map1 = new Map();
map1.set('name', 'Tom');
map1.set('age', 30);
map1.set('country', 'Chile');

const values = [];

const keys = [];

map1.forEach((value, key) => {
  values.push(value);

  keys.push(key);
});

console.log(values); // 👉️ [ 'Tom', 30, 'Chile' ]

console.log(keys); // 👉️ [ 'name', 'age', 'country' ]
```

빈 배열을 저장하는 두 개의 변수(Key와 Value)를 선언하고 Map.forEach() 메서드를 사용하여 Map 객체를 반복했습니다.   

Map.forEach 메서드는 각 Key-Value 쌍에 대해 제공된 함수를 실행합니다.   

반복할 때마다 현재 Key를 Key 배열에, 현재 Value을 Value 배열에 넣습니다.   

이 접근 방식은 이전 두 가지 방식보다 더 장황하고 수동적입니다. 그러나 맵의 키와 값을 배열에 넣기 전에 처리해야 하는 경우 유용합니다.
