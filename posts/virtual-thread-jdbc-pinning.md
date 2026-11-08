---
title: "JDK와 Connector/J 버전에 따른 Virtual Thread 처리량"
kind: article
permalink: /posts/virtual-thread-jdbc-pinning.html
published_on: "2026-11-07"
section: "프로젝트"
category: "프로젝트 / 백엔드 실험"
---

DB를 쓰지 않는 50ms 대기 경로에서는 동시 요청 500개에서 가상 스레드가 플랫폼 스레드보다 약 1.9배 많은 요청을 처리했다. 같은 앱의 JDBC 경로에서는 JDK 21과 Connector/J 8.3.0 조합에서 결과가 뒤집혔다. 플랫폼 스레드는 1,335.0 TPS, 가상 스레드는 81.5 TPS였다.

## 재측정 환경과 TPS 집계 기준

앱은 1 vCPU·1 GiB, Spring Boot 3.3.4, Tomcat 플랫폼 스레드 상한 200으로 고정했다. DB는 별도 컨테이너의 MySQL 8.0.46이었다. `/sleep`은 50ms만 대기하고, `/send`는 JDBC로 조회한 뒤 50ms 대기하고 다시 JDBC로 갱신한다. 부하 생성기는 동시 요청 수를 유지하면서 응답이 돌아오면 다음 요청을 보냈다.

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

다음 실험에서는 작업자마다 다른 행에서 갱신을 시작하도록 부하 생성기를 바꾼 뒤, 동시 요청 1,000개에서 행 락 대기와 처리량을 다시 비교할 계획이다. [실험 저장소](https://github.com/Elian-bang/virtual-thread-lab)
