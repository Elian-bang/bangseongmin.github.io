---
title: "JDK와 Connector/J 버전에 따른 Virtual Thread 처리량"
kind: article
permalink: /posts/virtual-thread-jdbc-pinning.html
published_on: "2026-11-07"
section: "프로젝트"
category: "프로젝트 / 백엔드 실험"
---

## 대량 발송이 다른 요청까지 느리게 만들었다

당시 메인 서버가 알림 발송도 맡았다. 한 서버에 두면 배포와 장애 추적이 단순하고, 별도 메시지 브로커를 운영할 필요도 없다. 다만 대량 알림을 보내는 동안 발송 작업과 일반 요청이 같은 서버 자원을 쓰면서 서비스 전체가 느려졌다. [알림 서비스 분리 기록](https://github.com/Elian-bang/resume/blob/master/payload/project.ts#L8-L23)

같은 서버에서 발송을 전용 작업 큐로 넘기고 동시 실행 수를 제한하는 방법도 있다. 일반 요청이 발송 완료를 기다리지 않게 할 수 있지만, CPU와 메모리는 계속 공유한다. 별도 발송 서버를 두면 발송 작업에 쓸 자원과 동시 처리량을 따로 조절할 수 있다. 그만큼 브로커와 발송 서버를 추가로 운영하고, 큐가 밀리거나 메시지가 재전달될 때 어떻게 처리할지도 정해야 한다. [RabbitMQ 신뢰성 가이드](https://www.rabbitmq.com/docs/reliability)

이 프로젝트에서는 대량 발송의 부하를 메인 서버에서 격리하고, 실패한 발송을 다시 처리할 수 있어야 했다. 그래서 메인 서버는 RabbitMQ에 발송 요청을 넣고, 별도 서버가 큐에서 요청을 가져와 외부 채널을 호출하도록 구성했다. [프로젝트의 RabbitMQ 선택 근거](https://github.com/Elian-bang/resume/blob/master/payload/project.ts#L15-L22)

## 발송 서버에서는 채널사 응답을 기다리는 시간이 길었다

발송 한 건은 대상 조회, 외부 채널사 API 호출, 발송 결과 기록 순서로 진행된다. 대부분의 시간은 채널사 응답을 기다리는 데 쓰였다. 플랫폼 스레드로 동기 호출하면 응답이 올 때까지 그 스레드는 다른 요청을 처리할 수 없다. 가상 스레드가 대기 중에 캐리어 스레드를 내어주면, 플랫폼 스레드 수를 크게 늘리지 않고도 여러 호출을 동시에 처리할 수 있다고 봤다. 그래서 분리한 발송 서버의 외부 API 호출에 가상 스레드를 적용했다. [최초 실험 설계](https://github.com/Elian-bang/virtual-thread-lab/blob/2c8f03bf0cc75a96fdf9522b8b7844c260f665b2/docs/%EC%84%A4%EA%B3%84.md#L3-L43)

![운영에서는 메인 서버의 알림 발송을 RabbitMQ 뒤 별도 발송 서버로 옮겼다. 실험에서는 앱의 DB 조회, 외부 응답을 대신하는 50ms 대기, DB 갱신을 비교하고, 대기만 있는 경로도 따로 측정했다.](../assets/virtual-thread-notification-flow.svg)

## 운영 자원 제약에서 발송 요청을 재현했다

운영에서는 발송 서버 분리와 조회·저장 방식 변경도 함께 진행했다. 가상 스레드로 바꾼 효과만 확인하기 위해, 당시 운영 앱과 같은 1 vCPU·1 GiB 제약을 걸고 동일한 요청을 플랫폼 스레드와 가상 스레드로 처리했다. 외부 API 응답 시간의 변동을 없애려고 호출은 50ms 대기로 대신했다. 대기만 하는 `/sleep`과 그 앞뒤에 JDBC 조회·갱신이 있는 `/send`를 나눠, DB 접근이 있어도 가상 스레드의 이점이 남는지 살펴봤다. [최초 실험 설계의 고정 조건](https://github.com/Elian-bang/virtual-thread-lab/blob/2c8f03bf0cc75a96fdf9522b8b7844c260f665b2/docs/%EC%84%A4%EA%B3%84.md#L34-L68)

첫 실험에서 대기만 있는 경로는 동시 요청이 많아지자 가상 스레드의 처리량이 더 높았다. 그런데 JDBC를 거치는 경로에서는 가상 스레드가 오히려 느렸다. DB 응답을 기다리는 동안 가상 스레드가 캐리어를 놓지 못하는 pinning이 원인일 수 있다고 보고, JDK와 Connector/J 버전을 각각 바꿔 확인했다. [첫 실험 기록](https://github.com/Elian-bang/virtual-thread-lab)

## 재측정 환경과 TPS 집계 기준

Spring Boot 3.3.4에서 Tomcat 플랫폼 스레드 상한을 200으로 뒀고, MySQL 8.0.46은 별도 컨테이너에서 실행했다. 부하 생성기는 응답이 돌아올 때마다 다음 요청을 보내 동시 요청 수를 일정하게 유지했다.

첫 측정에는 측정창이 닫힌 뒤 끝난 요청까지 TPS에 포함하는 문제가 있었다. 캐리어가 붙잡힌 위치를 확인할 JFR 스택도 남기지 못했다. 두 번째 실험에서는 워밍업 30초, 측정 60초로 고정하고 창 안에서 완료된 요청만 집계했다. 47개 조건을 매 반복마다 섞어 5회씩, 총 235회 실행했다. 아래 수치는 각 조건의 중앙값이다. [사전 설계](https://github.com/Elian-bang/virtual-thread-lab/blob/main/docs/%EC%84%A4%EA%B3%84-v2.md) · [반복별 원자료](https://github.com/Elian-bang/virtual-thread-lab/blob/main/results/v2/runs.csv)

## 50ms 대기 경로의 동시 요청별 처리량

| 동시 요청 | 플랫폼 스레드 TPS | 가상 스레드 TPS |
|---:|---:|---:|
| 100 | 1,906.9 | 1,847.0 |
| 500 | 3,552.7 | 6,878.1 |
| 2,000 | 3,572.9 | 6,049.7 |

동시 100에서는 처리량이 비슷했다. 동시 500부터는 플랫폼 스레드 모델의 처리량이 거의 늘지 않았고, 가상 스레드 모델은 더 많은 요청을 처리했다. 동시 500과 2,000에서 실행별 플랫폼 스레드 최대치를 모아 중앙값을 구하면 플랫폼 스레드 모델은 219개, 가상 스레드 모델은 22개였다. 이 수에는 JVM 내부 스레드도 포함된다. [v2 결과](https://github.com/Elian-bang/virtual-thread-lab/blob/main/results/%EA%B2%B0%EA%B3%BC-v2.md)

## JDK 21·25와 Connector/J 8.3.0·9.7.0 비교

동시 100, 커넥션 풀 50, 애플리케이션 락 없이 `/send`를 실행했다. 가상 스레드는 대기 중에 캐리어 스레드를 비울 수 있지만, pinning이 발생하면 그동안 캐리어가 다른 가상 스레드를 실행하지 못한다.

| JDK | Connector/J | 플랫폼 스레드 TPS | 가상 스레드 TPS | 가상 스레드 JFR pinning 누적 시간 |
|---|---|---:|---:|---:|
| 21 | 8.3.0 | 1,335.0 | 81.5 | 약 55,039ms |
| 21 | 9.7.0 | 1,329.5 | 1,265.2 | 0ms |
| 25 | 8.3.0 | 1,333.0 | 1,284.6 | 0ms |
| 25 | 9.7.0 | 1,328.1 | 1,278.9 | 0ms |

기준 조합의 JFR 이벤트에는 Connector/J의 `ReadAheadInputStream`을 거쳐 소켓을 읽는 스택이 남았다. 기준 조합에서 설정상 50ms였던 대기 구간은 앱에서 평균 614.1ms로 관측됐다. JDK나 드라이버 중 하나만 바꿔도 TPS 격차가 약 16.4배에서 1.04~1.05배로 좁혀졌고, 측정창의 pinning 이벤트는 관측되지 않았다. Connector/J 9.0의 락 변경과 JDK 24에 반영된 JEP 491이 각각 이 방향을 뒷받침한다. 실제로 비교한 JDK는 21과 25다. [JFR과 비교 결과](https://github.com/Elian-bang/virtual-thread-lab/blob/main/results/%EA%B2%B0%EA%B3%BC-v2.md) · [Connector/J 릴리스 노트](https://dev.mysql.com/doc/relnotes/connector-j/en/news-9-0-0.html) · [JDK 24의 JEP 491](https://docs.oracle.com/en/java/javase/24/migrate/significant-changes-jdk-24.html)

## 동시 요청 1,000개에서 발생한 행 락 경합

동시 1,000의 JDBC 경로는 부하 생성기 때문에 작업자들이 같은 순서로 같은 행을 갱신했다. 기준 조합의 플랫폼 스레드 모델에서 행 락 대기 누적 시간은 동시 100의 약 452초에서 약 4,578초로 늘었다. 여러 연결의 대기를 합한 값이다. 이 구간에서는 행 락 경합이 스레드 모델의 차이를 가릴 수 있어 위 비교의 근거에서 제외했다.

## 발송 경로에서 가상 스레드의 이점은 얼마나 남았나

대기만 있는 경로에서는 동시 요청 500개에서 가상 스레드가 약 1.9배 많은 요청을 처리했다. JDBC가 포함된 발송 경로에서는 JDK나 Connector/J를 바꿔 pinning이 사라진 조건에서도, 동시 요청 100개 기준 처리량은 플랫폼 스레드와 비슷했다. 같은 자원에서 외부 응답 대기를 효율적으로 처리할 수 있다는 기대는 대기만 있는 경로에서 확인했고, JDBC가 포함된 발송 경로의 처리량은 별도로 봐야 했다.

다음 실험에서는 작업자마다 다른 행에서 갱신을 시작하도록 부하 생성기를 바꾼 뒤, 동시 요청 1,000개에서 행 락 대기와 처리량을 다시 비교할 계획이다. [실험 저장소](https://github.com/Elian-bang/virtual-thread-lab)
