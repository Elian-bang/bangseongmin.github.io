---
title: "알림 배치의 UPDATE는 끝났는데 조회가 기다린 이유"
kind: article
permalink: /posts/notification-batch-commit-locks.html
published_on: "2026-11-07"
section: "프로젝트"
category: "프로젝트 / 백엔드 실험"
---

알림 발송 배치에서 첫 콘텐츠의 완료 표시는 발송 직후에 실행됐다. 그런데 첫 알림을 받고 상세 페이지에 들어온 사용자의 요청은 기다렸다. 상세 페이지 요청도 같은 행의 조회수를 `UPDATE`했고, 배치의 커밋은 뒤에 남은 콘텐츠 발송까지 모두 끝난 뒤에 일어났다.

## 일괄 커밋과 건별 커밋에서 발생한 조회 실패

개인 실험에서는 콘텐츠 3건을 순서대로 발송하게 하고, 건당 발송을 8초 대기로 모의했다. 첫 콘텐츠의 완료 표시를 쓴 뒤에도 두 건을 더 발송한다. 건당 8초를 기준으로 계산하면 첫 행은 커밋까지 약 16초 더 잠긴다. 수신자 12명은 첫 콘텐츠를 쉬지 않고 조회했다. [재현 구성과 정정](https://github.com/Elian-bang/notification-reliability-lab/blob/main/results/%EC%82%AC%EA%B1%B4%EC%9E%AC%ED%98%84_%EC%B2%98%EB%B0%A9%EB%B9%84%EA%B5%90.md)

| 실험에서 바꾼 것 | 조회 시도 | 실패 | 결과를 해석할 때 확인한 점 |
|---|---:|---:|---|
| 완료 표시 일괄 커밋 | 882 | 3 | 기준 |
| 완료 표시 건별 커밋 | 2,377 | 0 | 완료 표시 트랜잭션이 건별로 끝났다 |
| 조회수 갱신을 본문 조회에서 분리 | 832 | 3 | 조회수 갱신은 여전히 같은 행을 기다렸고, 실패하면 요청 전체가 실패로 집계됐다 |
| 커밋 후 푸시 변형 | 2,333 | 0 | 건별 커밋도 함께 켰고, 실험의 푸시 신호 시점은 같았다 |
| 락 대기 제한 단축 | 865 | 3 | 기존 수신자 연결에 설정이 적용됐는지 확인하지 못했다 |

독립적으로 확인할 수 있었던 변경은 완료 표시의 건별 커밋이다. 푸시 순서를 바꾼 변형의 실패 0건은 건별 커밋 효과와 분리할 수 없었다. 표에 남아 있는 값은 중앙값이고, 조회 시도는 쿼리 실행 전에 센 값이다. 응답을 기다린 뒤 다음 요청을 보내는 부하에서는 한 요청이 막히면 다음 시도도 늦어진다. 시도 수 증가를 사용자 지연 개선 수치로 해석할 수 없는 이유다. [처방 비교의 정정](https://github.com/Elian-bang/notification-reliability-lab/blob/main/results/%EC%82%AC%EA%B1%B4%EC%9E%AC%ED%98%84_%EC%B2%98%EB%B0%A9%EB%B9%84%EA%B5%90.md#정정-2026-09-14)

## request_id 인덱스 유무에 따른 데드락 건수

또 다른 실험에서는 알림 발송 배치의 갱신과 수신자의 토큰 갱신이 겹칠 때 데드락이 생기는지 봤다. MySQL 8.0에서 `request_id`로 상태를 바꾸는 UPDATE의 실행 계획을 비교했다.

```sql
UPDATE notification
SET status = 'SENT'
WHERE request_id = ?;
```

인덱스가 없을 때는 풀스캔에 `rows=3861`, 인덱스를 추가했을 때는 `rows=1`이었다. 이 값은 실행 계획의 추정 행 수다. `REPEATABLE READ`에서 스캔 범위가 넓어지면 갱신 대상 한 건보다 훨씬 넓은 범위를 잠글 수 있다. 인덱스가 있는 11개 구성은 각각 세 번씩 실행해 33회 모두 수신자 데드락이 0건이었다. 최종 비교에서 인덱스만 뺀 구성은 34건, 46건, 42건이었다. [최종 측정표](https://github.com/Elian-bang/notification-reliability-lab/blob/main/results/4%EB%8B%A8%EA%B3%84_%EC%B5%9C%EC%A2%85%EC%B8%A1%EC%A0%95.md) · [InnoDB의 SQL 문별 락](https://dev.mysql.com/doc/refman/8.0/en/innodb-locks-set.html)

인덱스 실험에서 확인한 실행 계획은 재현 환경의 것이다. 당시 운영 UPDATE의 실행 계획은 확인하지 못했다. 다음 재현에서 확인할 값은 연결별 락 대기 설정과 락 획득·해제 시점이다. [실험 저장소](https://github.com/Elian-bang/notification-reliability-lab)
