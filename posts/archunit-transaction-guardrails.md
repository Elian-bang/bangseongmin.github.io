---
title: "트랜잭션 리뷰 규칙을 CI로 옮기고, 규칙도 테스트했다"
kind: article
permalink: /posts/archunit-transaction-guardrails.html
published_on: "2026-11-07"
section: "프로젝트"
category: "프로젝트 / 백엔드 실험"
---

트랜잭션 안에서 외부 호출을 하면 응답을 기다리는 동안 앞서 얻은 락을 계속 보유할 수 있다. 알림 배치 문제를 살펴본 뒤, 이런 코드를 리뷰할 때마다 사람이 찾아내야 하는지 궁금했다. 개인 샘플 앱에서 ArchUnit과 CI로 규칙을 검사해 봤다. 첫 검사에서 발견한 문제는 앱 코드가 아니라 **검사 규칙을 검증하는 예제**에 있었다.

## 규칙이 통과했다면 무엇을 확인한 걸까

앱 코드가 통과한 이유는 두 가지일 수 있다. 코드가 규칙을 지켰을 수도 있고, 규칙이 검사할 코드를 제대로 찾지 못했을 수도 있다. 그래서 앱 검사와 별도로, 의도적으로 위반한 작은 코드에 규칙을 적용해 실제로 실패하는지 확인했다.

첫 실행에서 컨트롤러 클래스의 `@Transactional`을 찾는 규칙에 맞는 위반 예제가 없다는 것을 발견했다. 예제는 애너테이션을 메서드에만 붙이고 있었다. 별도의 검증 없이 앱 검사만 봤다면 이 규칙이 클래스 위반을 잡는지는 확인할 수 없었다. [규칙과 예제의 검증 범위](https://github.com/Elian-bang/backend-guardrails#확인한-것)

| 검증 | 샘플에서 확인한 것 |
|---|---|
| 위반 예제 | ArchUnit 검사 다섯 개와 런타임 쿼리 수 검사 한 개가 각각 준비한 위반 형태를 잡았다 |
| 정상 경계 예제 | 준비한 정상 예제에서 오탐이 없었다. 정상 경계 예제는 전체 8개이며 규칙별 적용 범위는 다르다 |
| CI 차단 | 같은 PR에서 직접 외부 호출을 추가한 커밋은 `BLOCKED`, 그 호출을 제거한 커밋은 `CLEAN`이었다 |

CI는 먼저 규칙 자체를 검사하고, 통과하면 앱을 검사한다. 규칙 파일과 앱 파일을 동시에 변경한 PR도 별도로 표시한다. 데모에서는 위반 커밋에서도 규칙 자체 검사는 통과했고 앱 검사만 실패했다. 같은 PR에서 위반 코드 한 곳을 제거한 뒤 앱 검사와 병합 상태가 함께 바뀌었다. [두 실행의 상태와 커밋](https://github.com/Elian-bang/backend-guardrails/blob/main/docs/CI-%ED%8C%8C%EC%9D%B4%ED%94%84%EB%9D%BC%EC%9D%B8.md)

## 실제로 놓치는 호출

대표 규칙 R3은 메서드에 직접 붙은 Spring `@Transactional`을 찾아 그 메서드가 직접 부르는 호출을 검사한다. `RestTemplate`, `WebClient` 등 목록에 있는 클라이언트의 직접 호출은 찾을 수 있다. 하지만 트랜잭션 메서드가 `NotificationSender`를 부르고, 그 안에서 프로젝트 자체의 `ChannelClient`가 외부 API를 호출하면 현재 규칙의 탐색 범위를 벗어난다. 클래스에 붙은 `@Transactional`이나 Spring Batch가 설정한 트랜잭션도 R3의 검사 대상에 들어가지 않는다. [R3 구현](https://github.com/Elian-bang/backend-guardrails/blob/main/guardrails/src/main/java/dev/elian/guard/rules/TransactionRules.java)

따라서 샘플에서의 오탐 0건은 준비한 경계 사례에 대한 결과다. 실제 프로젝트의 탐지율이나 오탐률을 측정한 값은 없다. 다음 실험에서는 간접 호출과 클래스 수준 트랜잭션을 위반 예제에 먼저 넣고, 추적 깊이를 늘릴 때 놓치는 사례와 잘못 막는 사례를 함께 비교하려 한다. [실험 저장소](https://github.com/Elian-bang/backend-guardrails)
