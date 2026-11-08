---
title: "알림 배치가 커밋할 때까지 조회수 갱신이 기다렸다"
kind: article
permalink: /posts/notification-batch-commit-locks.html
published_on: "2026-11-07"
section: "프로젝트"
category: "프로젝트 / 백엔드 실험"
---

공지 푸시는 정상적으로 발송됐지만, 푸시를 누르고 들어온 상세 페이지 요청에서 MySQL 락 대기 타임아웃이 발생했다. 상세 페이지는 본문을 읽고 같은 공지의 조회수를 올린다. 배치도 같은 행에 발송 완료를 기록했다. 두 요청이 같은 행에서 만났는데, 배치의 완료 표시 `UPDATE`가 이미 끝난 뒤에도 상세 페이지가 기다렸다. [공지 푸시 재현 기록](https://github.com/Elian-bang/notification-reliability-lab/blob/main/results/%EC%82%AC%EA%B1%B4%EC%9E%AC%ED%98%84_%EC%B2%98%EB%B0%A9%EB%B9%84%EA%B5%90.md)

## 상세 페이지는 조회수를 올릴 때 멈췄다

재현 코드에서 배치는 `content_item`의 상태를 갱신한다. 수신자 코드는 같은 `seq`로 본문을 조회한 뒤 조회수를 올린다. 두 코드에서 쓰는 SQL을 순서대로 보면 어느 문장에서 기다리는지 알 수 있다.

```sql
-- 배치: 공지 발송 완료 기록
UPDATE content_item SET status = 'SENT', sent_at = NOW(6) WHERE seq = ?;

-- 상세 페이지: 본문 조회 후 조회수 갱신
SELECT seq, title, view_count FROM content_item WHERE seq = ?;
UPDATE content_item SET view_count = view_count + 1 WHERE seq = ?;
```

InnoDB에서 일반 `SELECT`는 커밋된 스냅샷을 읽을 수 있다. 다음 `UPDATE`는 같은 행을 써야 하므로 배치가 잡은 락을 기다린다. 배치 쪽 SQL 실행이 끝나도, 그 SQL을 실행한 트랜잭션이 커밋될 때까지 락은 유지된다. [수신자 재현 코드](https://github.com/Elian-bang/notification-reliability-lab/blob/main/apps/receiver-sim/index.js) · [InnoDB의 일반 조회](https://dev.mysql.com/doc/refman/8.0/en/innodb-consistent-read.html) · [커밋과 락 해제](https://dev.mysql.com/doc/refman/8.0/en/innodb-autocommit-commit-rollback.html)

## 완료 표시를 쓰는 트랜잭션만 분리했다

`ContentPushJob.run()`은 바깥 트랜잭션 하나에서 공지 세 건을 처리한다. 각 공지를 발송한 뒤 `markDone()`을 호출한다. 기존에는 `markDone()`이 같은 트랜잭션에서 SQL을 실행했으므로 첫 공지의 행은 나머지 두 건의 발송이 끝날 때까지 잠겼다. 재현에서는 건당 발송을 8초 대기로 대신했다. 첫 완료 표시부터 커밋까지 남은 약 16초는 이 설정으로 계산한 값이다. [배치 재현 코드](https://github.com/Elian-bang/notification-reliability-lab/blob/main/batch-server/src/main/java/dev/elian/lab/batch/incident/ContentPushJob.java)

건별 커밋에서는 `markDone()`의 SQL을 `PROPAGATION_REQUIRES_NEW`로 시작한 별도 트랜잭션에서 실행했다. 재현 코드의 두 분기에서 핵심 줄을 발췌했다.

```java
// 일괄 커밋: 바깥 트랜잭션에서 완료 표시
jdbc.update(sql, c.seq());

// 건별 커밋: 완료 표시용 트랜잭션을 따로 시작
tx(TransactionDefinition.PROPAGATION_REQUIRES_NEW)
        .executeWithoutResult(s -> jdbc.update(sql, c.seq()));
```

```text
일괄 커밋  첫 공지 완료 UPDATE ─── 두 번째 발송 ─── 세 번째 발송 ─── COMMIT
           └────────────────── 첫 공지의 행 락 유지 ────────────────────┘
건별 커밋  첫 공지 완료 UPDATE → COMMIT ─── 두 번째 발송 ─── 세 번째 발송
```

별도 트랜잭션은 콜백이 정상 종료될 때 커밋된다. 첫 공지의 락이 풀리는 시점이 배치 마지막에서 첫 완료 표시 직후로 옮겨간다. 나머지 공지의 발송 방식과 순서는 두 조건에서 같았다. [실험 조건 코드](https://github.com/Elian-bang/notification-reliability-lab/blob/main/batch-server/src/main/java/dev/elian/lab/batch/incident/IncidentExperiment.java)

## 같은 부하에서 완료 표시의 커밋 시점만 바꿨다

배치와 수신자 시뮬레이터를 별도 프로세스로 실행했다. 두 프로세스는 같은 MySQL을 쓰되 커넥션 풀은 따로 뒀다. 수신자가 배치와 같은 풀에서 커넥션을 기다리는 상황을 피하기 위해서다. [실험 저장소의 구성과 실행 방법](https://github.com/Elian-bang/notification-reliability-lab#실행)

재현 모드의 실행 순서는 다음과 같다.

1. 각 조건을 시작하기 전에 공지 데이터를 다시 넣고, 공지 3건과 발송 1건당 8초 대기를 유지한다.
2. 배치가 첫 공지에 대한 부하 시작 신호를 보내면 수신자 시뮬레이터 12개 작업자가 그 공지의 상세 요청을 반복한다. 각 작업자는 응답을 받은 뒤 다음 요청을 시작한다. 재현 코드의 시작 신호는 두 조건 모두 배치가 발송 루프에 들어가기 전에 보낸다.
3. `AS-IS`에서는 완료 표시를 바깥 트랜잭션에 남긴다. `FIX-1`에서는 완료 표시만 별도 트랜잭션에서 커밋한다. 두 실행의 수신자 통계에서 MySQL 락 대기 타임아웃을 비교한다.

저장소에서 MySQL, 배치 JAR, 수신자 시뮬레이터를 준비한 뒤 아래 명령으로 재현 모드를 실행한다. 빈 DB에서는 먼저 README의 `sweep` 모드를 실행해 수신자가 읽는 `experiment_control` 행을 만들어야 한다. 결과를 볼 때는 콘솔에서 `AS-IS`와 `FIX-1`의 타임아웃 값을 비교한다. [실행 전제와 명령](https://github.com/Elian-bang/notification-reliability-lab#실행) · [조건별 실행과 집계 코드](https://github.com/Elian-bang/notification-reliability-lab/blob/main/batch-server/src/main/java/dev/elian/lab/batch/incident/IncidentExperiment.java)

```bash
java -jar batch-server/target/batch-server-0.1.0.jar --lab.mode=incident
```

| 완료 표시 방식 | 조회 시도 | 락 대기 타임아웃 | 배치 소요 |
|---|---:|---:|---:|
| 일괄 커밋 | 882 | 3 | 24.2초 |
| 건별 커밋 | 2,377 | 0 | 24.2초 |

표는 기존 재현 기록에 남은 중앙값이다. 반복별 출력과 당시 반복 횟수는 기록에 남아 있지 않다. 건별 커밋에서는 락 대기 타임아웃이 관측되지 않았고, 배치 소요는 두 조건 모두 24.2초였다. 조회 시도는 쿼리 실행 전에 세므로, 요청이 막히면 그 수신자가 다음 요청을 보내는 시점도 늦어진다. 이 표로 알 수 있는 건 재현 조건의 타임아웃 건수다. 락의 실제 보유 시간과 운영 요청의 지연 개선 폭은 이 실험에서 측정하지 않았다. [재현 결과와 측정 범위](https://github.com/Elian-bang/notification-reliability-lab/blob/main/results/%EC%82%AC%EA%B1%B4%EC%9E%AC%ED%98%84_%EC%B2%98%EB%B0%A9%EB%B9%84%EA%B5%90.md)
