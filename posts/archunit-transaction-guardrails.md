---
title: "ArchUnit으로 트랜잭션 안의 외부 호출 검사하기"
kind: article
permalink: /posts/archunit-transaction-guardrails.html
published_on: "2026-11-07"
section: "프로젝트"
category: "프로젝트 / 백엔드 실험"
---

좌석 예약을 저장한 뒤 외부 채널에 확인 알림을 보내는 샘플을 만들었다. 두 작업을 같은 트랜잭션에 넣으면, 좌석을 갱신할 때 얻은 락을 가진 채 채널 응답을 기다릴 수 있다. 이런 호출이 PR에 들어왔을 때 테스트로 잡을 수 있는지 궁금했다. [샘플 저장소](https://github.com/Elian-bang/backend-guardrails)

## 예약 메서드에 직접 외부 호출을 넣었다

검사가 막아야 할 코드를 먼저 만들었다. 데모 PR에서 `BookingFacade.book()`에 `@Transactional`을 붙이고, 예약을 저장한 직후 `RestTemplate.getForObject()`를 직접 호출하게 했다. 아래는 위반 커밋의 핵심 줄이다.

```java
@org.springframework.transaction.annotation.Transactional
public Booking book(Long showId, String seatNo, String customerId) {
    Booking booking = bookingService.reserve(showId, seatNo, customerId);
    new org.springframework.web.client.RestTemplate()
            .getForObject("https://channel.example/send", String.class);
    notificationSender.sendBookingConfirmed(
            booking.getId(), customerId, "예약이 확정되었습니다. 좌석 " + seatNo);
    return booking;
}
```

`reserve()`가 끝난 뒤에도 `book()`의 트랜잭션은 열린 상태다. 검사가 찾아야 할 줄은 그다음 `getForObject()` 호출이다. [위반 커밋의 BookingFacade](https://github.com/Elian-bang/backend-guardrails/blob/4d03867/sample/monolith/src/main/java/dev/elian/mono/booking/service/BookingFacade.java)

## 애너테이션이 붙은 메서드의 직접 호출을 검사했다

ArchUnit 규칙 R3은 Spring의 `@Transactional`이 메서드에 직접 붙어 있는지 확인한다. 그다음 `getMethodCallsFromSelf()`로 그 메서드 안의 직접 호출을 꺼낸다. 호출 대상 타입이 `RestTemplate`, `WebClient` 등 규칙의 목록에 들어 있으면 위반으로 기록한다. 구현에서 검사 대상과 조건을 연결하는 부분은 아래 세 줄이다.

```java
methods()
        .that().areAnnotatedWith(TX)
        .should(notCall(OUTBOUND, "외부 시스템 호출"))
```

`TX`는 Spring 애너테이션의 전체 이름이고 `OUTBOUND`는 검사할 클라이언트 타입 목록이다. 정상 경계 예제에는 트랜잭션 밖에서 외부 클라이언트를 호출하는 코드를, 위반 예제에는 트랜잭션 안에서 직접 호출하는 코드를 넣었다. CI의 `rules-selftest`에서 이 예제들로 규칙 자체를 검사한 뒤, `app-check`에서 샘플 앱의 클래스를 검사한다. [R3 구현](https://github.com/Elian-bang/backend-guardrails/blob/main/guardrails/src/main/java/dev/elian/guard/rules/TransactionRules.java) · [CI 워크플로](https://github.com/Elian-bang/backend-guardrails/blob/main/.github/workflows/guardrails.yml)

## 위반 예제와 정상 예제로 규칙을 먼저 검사했다

CI는 Java 21에서 두 명령을 실행한다. `RuleSelfTest`는 준비한 위반 예제가 실제로 규칙에 걸리는지 확인한다. `FixtureMatrixTest`는 위반 예제 외에 정상 예제와 알려진 미탐 사례도 따로 센다. R3의 경우 트랜잭션 안에서 외부 클라이언트를 직접 호출하는 코드는 위반이고, 트랜잭션 밖의 호출은 정상이다. 다른 메서드를 거쳐 외부 클라이언트를 부르는 예제는 현재 규칙이 놓치는 사례로 기록한다. [CI 워크플로](https://github.com/Elian-bang/backend-guardrails/blob/main/.github/workflows/guardrails.yml) · [예제별 판정 코드](https://github.com/Elian-bang/backend-guardrails/blob/main/sample/monolith/src/test/java/dev/elian/mono/guard/FixtureMatrixTest.java)

```bash
mvn -B -pl guardrails,sample/monolith test -Dtest=RuleSelfTest -Dsurefire.failIfNoSpecifiedTests=false
mvn -B -pl guardrails,sample/monolith test -Dtest=FixtureMatrixTest -Dsurefire.failIfNoSpecifiedTests=false
```

처음에는 컨트롤러 규칙을 검사할 때 위반 예제가 부족하다는 것도 발견했다. 규칙은 클래스에 붙은 `@Transactional`을 찾는데, 당시 예제는 메서드에만 붙어 있었다. 앱이 검사를 통과하더라도 해당 규칙을 실제로 검증했다는 근거가 없어서, 클래스 수준의 위반 예제를 별도로 뒀다. [규칙 자체 테스트와 확인 결과](https://github.com/Elian-bang/backend-guardrails#확인한-것)

## 같은 PR에서 실패와 통과를 확인했다

규칙 자체 검사를 통과하면 CI는 아래 명령으로 앱 전체 테스트를 실행한다. 이 단계의 `GuardrailTest`는 테스트용 예제를 빼고 샘플 앱의 클래스만 읽어 차단 규칙을 적용한다. [앱 검사 코드](https://github.com/Elian-bang/backend-guardrails/blob/main/sample/monolith/src/test/java/dev/elian/mono/guard/GuardrailTest.java)

```bash
mvn -B -pl guardrails,sample/monolith test
```

위반 커밋에서 규칙 자체 검사는 통과했고 앱 검사만 실패했다. 실패 로그에는 `BookingFacade.book(...)`이 `RestTemplate.getForObject`를 트랜잭션 안에서 호출했다고 나왔다. 다음 커밋에서는 `book()`의 애너테이션과 데모용 직접 호출을 제거했다. 예약 저장의 트랜잭션은 `BookingService.reserve()`에 남겨뒀다. `reserve()`가 반환되면 `BookingFacade`가 확인 알림을 보낸다. [수정 커밋의 BookingFacade](https://github.com/Elian-bang/backend-guardrails/blob/b8d5af8/sample/monolith/src/main/java/dev/elian/mono/booking/service/BookingFacade.java)

| 같은 PR의 변경 | 규칙 자체 검사 | 앱 검사 | 병합 상태 |
|---|---|---|---|
| 트랜잭션 안에 `RestTemplate` 직접 호출 추가 | 통과 | 실패 | [BLOCKED](https://github.com/Elian-bang/backend-guardrails/actions/runs/33655737527) |
| 바깥 트랜잭션과 데모용 직접 호출 제거 | 통과 | 통과 | [CLEAN](https://github.com/Elian-bang/backend-guardrails/actions/runs/33656299608) |

## 호출을 한 단계 감싸면 검사에서 빠진다

`book()`이 `NotificationSender`를 호출하고, 그 안에서 프로젝트의 `ChannelClient`가 외부 요청을 보내는 경로를 생각해 보자. R3이 `book()`에서 보는 호출 대상은 `NotificationSender`다. 규칙은 그 내부를 따라가지 않으며, 프로젝트의 `ChannelClient`도 검사 목록에 없다. 클래스에 붙은 `@Transactional`과 Spring Batch가 만든 트랜잭션 역시 이 규칙이 선택하는 메서드 범위 밖이다. 앞선 알림 배치 재현의 트랜잭션은 `TransactionTemplate`으로 시작하므로 이 R3 규칙으로는 잡히지 않는다. CI에서 확인한 차단 범위는 메서드에 Spring `@Transactional`이 붙고 목록의 클라이언트를 직접 부르는 경우다. [검증한 범위와 한계](https://github.com/Elian-bang/backend-guardrails#확인하지-않은-것--한계)
