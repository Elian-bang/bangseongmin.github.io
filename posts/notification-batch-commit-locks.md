---
title: "알림 배치가 조회수 갱신을 막은 이유"
kind: article
permalink: /posts/notification-batch-commit-locks.html
published_on: "2026-11-07"
section: "프로젝트"
category: "프로젝트 / 백엔드 실험"
---

공지 푸시를 누른 사용자가 상세 페이지를 열었지만 HTTP 500이 돌아왔다. 운영 로그에서 실패한 SQL은 본문을 읽는 `SELECT`가 아니라 조회수를 올리는 `UPDATE`였다. 배치가 같은 공지의 발송 완료를 기록하는 `UPDATE`는 이미 끝난 상태였다. 왜 조회수 갱신은 여전히 락을 기다렸을까? [운영 사건 기록](https://github.com/Elian-bang/notification-reliability-lab/blob/main/docs/gitbook/%EC%BB%A4%EB%B0%8B%EC%9D%84-%EC%95%88-%ED%95%9C-%ED%8A%B8%EB%9E%9C%EC%9E%AD%EC%85%98%EC%9D%B4-%ED%8E%98%EC%9D%B4%EC%A7%80%EB%A5%BC-%EC%A3%BD%EC%9D%B8-%EC%9D%B4%EC%95%BC%EA%B8%B0.md)

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

아래 표는 첫 공지의 완료 표시가 끝난 뒤에 상세 요청이 들어오는 경우다. 각 열은 왼쪽에서 오른쪽으로 진행한다.

| 조건과 요청 | 첫 공지 발송 직후 | 나머지 두 건을 발송하는 동안 | 배치 종료 |
|---|---|---|---|
| 일괄 커밋 · 배치 | 완료 표시 `UPDATE`로 행 락 획득 | 첫 공지의 행 락 유지 | 커밋하며 락 해제 |
| 일괄 커밋 · 상세 요청 | | 본문 `SELECT` 완료 후 조회수 `UPDATE` 대기 | 타임아웃 전에 락이 풀리면 갱신을 계속함 |
| 건별 커밋 · 배치 | 완료 표시 `UPDATE` 직후 커밋하며 락 해제 | 다음 공지 발송 | 바깥 트랜잭션 종료 |
| 건별 커밋 · 상세 요청 | | 본문 `SELECT` 후 조회수 `UPDATE` 실행 | |

별도 트랜잭션은 콜백이 정상 종료될 때 커밋된다. 첫 공지의 락이 풀리는 시점이 배치 마지막에서 첫 완료 표시 직후로 옮겨간다. 나머지 공지의 발송 방식과 순서는 두 조건에서 같았다. [실험 조건 코드](https://github.com/Elian-bang/notification-reliability-lab/blob/main/batch-server/src/main/java/dev/elian/lab/batch/incident/IncidentExperiment.java)

## 같은 부하에서 완료 표시의 커밋 시점만 바꿨다

운영에서 본 동작을 작은 환경에서 재현했다. 배치와 수신자 시뮬레이터를 별도 프로세스로 실행했다. 두 프로세스는 같은 MySQL을 쓰되 커넥션 풀은 따로 뒀다. 수신자가 배치와 같은 풀에서 커넥션을 기다리는 상황을 피하기 위해서다. [실험 저장소의 구성과 실행 방법](https://github.com/Elian-bang/notification-reliability-lab#실행)

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

표는 기존 재현 기록에 남은 중앙값이다. 당시 반복 횟수와 반복별 출력은 남아 있지 않다. 건별 커밋의 타임아웃 중앙값은 0건이었고, 배치 소요 시간의 중앙값은 두 조건 모두 24.2초였다. 조회 시도는 쿼리 실행 전에 센다. 요청이 막히면 같은 작업자가 다음 요청을 보내는 시점도 늦어지므로, 시도 수로 운영 응답 속도의 개선 폭을 판단할 수 없다. [재현 결과와 측정 범위](https://github.com/Elian-bang/notification-reliability-lab/blob/main/results/%EC%82%AC%EA%B1%B4%EC%9E%AC%ED%98%84_%EC%B2%98%EB%B0%A9%EB%B9%84%EA%B5%90.md)

### 타임아웃을 비교하기 전에 수신자 세션 값을 확인한다

첫 공지의 행 락은 코드상 약 16초 동안 유지될 것으로 계산했다. 비교표에 설정값으로 적힌 50초가 수신자 세션에 적용됐다면, 이 16초만으로는 타임아웃 3건을 설명하기 어렵다. Compose는 MySQL을 5초로 시작하고, 실험 실행기는 `SET GLOBAL`로 값을 바꾼다. 전역 설정을 바꿔도 이미 열린 수신자 연결에는 기존 세션 값이 남는다. 당시 사용한 연결마다 어떤 값이 적용됐는지는 확인하지 못했다. [Compose 설정](https://github.com/Elian-bang/notification-reliability-lab/blob/main/docker-compose.yml) · [실험 실행 코드](https://github.com/Elian-bang/notification-reliability-lab/blob/main/batch-server/src/main/java/dev/elian/lab/batch/incident/IncidentExperiment.java) · [MySQL 타임아웃 문서](https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_lock_wait_timeout)

다시 실행할 때는 수신자 시뮬레이터가 풀에서 받은 연결에서, 조회수 `UPDATE`를 실행하기 전에 아래 값을 확인해 기록한다. 두 조건에서 실제 세션 값이 같은지 먼저 확인한 뒤 콘솔의 타임아웃 건수(MySQL 오류 `1205`)를 비교한다.

```sql
SELECT CONNECTION_ID(), @@SESSION.innodb_lock_wait_timeout;
```
