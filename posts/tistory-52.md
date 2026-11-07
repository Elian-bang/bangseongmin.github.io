---
title: "[항해99 - 7기] 항해 5일차 - 핵심 쏙쏙 Git 3주차"
kind: "article"
permalink: "/posts/tistory-52.html"
published_on: "2022-05-13"
section: "학습 기록"
category: "학습 기록 / 항해99"
---

![본문 이미지](../assets/tistory/3587bc9f3c5d27183148afde.gif)

항해 5일차!! 드디어 5꽉!! 이다!!

월, 화, 수, 목, 금 을 꽉 채웠다!!!!

그렇지만 항해99는 주말도 한다!!

언제든 다시 한다!! 죽지 않는 항해!! 

---

#### 3주차

**[수업 목표]**

1. 협업을 위한 작업 관리 스킬을 익힙니다- PR과 commit 되돌리기, 임시 저장
2. 협업하기 좋은 사람이 되기 위해 기본 협업 매너를 익힙니다.
3. Github 으로 다른 사람과 소통합니다 - 내 포트폴리오, 오픈소스

**[목차]**

1. 예고편
2. 내 작업을 반영해주시겠어요? - PR
3. 최신 commit 고치기(amend)
4. commit 되돌리기(revert, reset)
5. 변경사항 임시 보관(stash)
6. 작업으로 의사소통하기
7. 코드리뷰로 서로에게 피드백 주기
8. Git 프로젝트 관리(.gitignore, README)
9. Github에서 정보 얻기 - 개발자의 SNS
10. 오픈소스 사용방법
11. Github으로 나를 드러내자
12. 총정리
13. 숙제

---

#### **1. 예고편**

**(1) 복습**

* 협업할 때는 많은 경우, 아래의 단계를 따릅니다.
  + 1단계. 누가 이 작업 할 것인지 정한다. - Issue
  + 2단계. 각자 맡은 것을 작업한다. - Branch
  + 3단계. 각자 작업을 프로젝트에 합친다. - merge
  + (경우에 따라). 작업한 내용을 리뷰하고 최종적으로 프로젝트에 반영한다. - PR 후 merge
* issue 는 내가 할 작업, 기능 추가, 버그 리포트 등 여러 방식으로 사용할 수 있습니다.
* 협업을 하기 위해 issue 를 만들어 누가 작업할지 정하고, 브랜치를 만들어 작업할 공간을 나눕니다.
* 브랜치(branch)는 특정 commit 에서 갈라져나와 작업할 수 있습니다. 우리는 기능별로 이름을 만들어주어 브랜치에 작업해줍니다.
* 작업할 브랜치로 바꾸는 것을 체크아웃(checkout)이라고 합니다. 체크아웃된 브랜치에만 commit 이 반영됩니다.
* 브랜치의 작업 내역 commit 들을 다른 branch 로 반영(합치기)는 것을 Merge(머지, 병합) 이라고 부릅니다. 개발할 때는 기준이 되는 기본 브랜치를 정해놓고 해당 브랜치에 내용을 merge합니다.
* Merge 하는 과정에서 같은 파일이 동일한 부분이 수정된 게 발견되면 **Merge conflict(병합 충돌)** 이 발생합니다.
* Git 이 똑똑하게 충돌을 파악할 수 있도록 파일 내용을 고쳐서 충돌 내역을 보여줍니다.
* tracking 한다는 것은 로컬 repo와 원격 repo의 특정 브랜치를 연결해주는 것입니다.
* push와 pull 은 기본적으로 tracking(추적)되고 있는 브랜치를 기준으로 commit 내역을 반영합니다.

**(2) 오늘 배울 것**

1. **협업을 위한 작업(commit) 관리**
   * 협업할 때 자주 일어나는 시나리오를 상상해보며, 내 작업을 반영해달라고 요청하는 PR과 commit 을 되돌리고 임시로 저장하는 방법을 배워보겠습니다.
   * 👀 주요 키워드 : PR, commit 되돌리기 - amend, revert, reset , 작업내역 임시 저장 - stash
2. **Git 프로젝트 관리 - 협업 매너**
   * 당신과 꼭 협업하고 싶어요! 협업하고 싶은 사람이 되려면 어떻게 해야할까요? 먼저 의사소통이 잘~되어야겠죠?
   * 좋은 작업내역을 남기기 위해 commit 단위 관리, 메시지 작성과 다른 사람에게 프로젝트 소개하는 방법을 알아봅니다.
   * 👀 주요 키워드 : commit 메시지 컨벤션, gitignore, README
3. **오픈소스로 정보 탐색하고 함께 즐기기**
   * 개발자들은 진짜 개발 정보를 어떻게 찾을까요? 맛집 탐방 🍽️ 하면서 내 미식세계를 넓혀가는 것처럼 좋은 코드를 많이 보고 참여할 수록 내 코드도 좋아집니다!
   * Github 에서 내가 참고하기 좋은 코드, 기술 트렌드 정보를 얻는 방법을 알아봅니다. 오픈소스가 무엇인지도 소개할게요!
   * **👀** 주요 키워드 : github exprore , 오픈소스(open source)
4. **Github 으로 개발자인 나를 나타내자 - 포트폴리오**
   * 개발자들 명함과 이력서에 왜 Github 주소가 들어가는지 알고 계신가요? Github을 나를 잘 알리는 포트폴리오로 사용할 수 있어요.
   * Github 정보로 나와 내 프로젝트를 잘 나타내봅니다. Github 에서 profile, 프로젝트 소개, 개발 블로그를 작성하는 방법을 알아봅니다.
   * **👀** 주요 키워드 : github profile , repo 소개 , github page

---

#### **2.** 내 작업을 반영해주시겠어요?  - PR

1. PR에 의미  
   * 협업할 때 자주 일어나는 시나리오를 상상해보며, 내 작업을 반영해달라고 요청하는 PR과 commit 을 되돌리고 임시로 저장하는 방법을 배워보겠습니다.
   * 👀 주요 키워드 : PR, commit 되돌리기 - amend, revert, reset , 작업내역 임시 저장 - stash

---

[참고 사이트]

1. [좋은 git 커밋 메시지 만드는 방법](https://meetup.toast.com/posts/106)
2. [gitignore 템플릿](https://www.toptal.com/developers/gitignore/)
3. [README 템플릿](https://github.com/ohahohah/readme-template/blob/master/README.md)
4. [마크다운 튜토리얼](https://www.markdowntutorial.com/)
5. [기술 트렌드](https://github.com/trending/developers)
6. [한국 오픈소스 활동 랭킹](http://rankedin.kr/users)
7. [성당과 시장 한글판(무료)](https://www.hanbit.co.kr/store/books/look.php?p_code=E8095481781)
8. [스프린트 페스티벌](https://hacktoberfest.digitalocean.com/)(헥토버페스트)
9. [스프린트 서울](https://sprintseoul.org/)
10. [컨트리뷰터에 첫 도전하는 사람들위 한 프로젝트](https://github.com/showcases/great-for-new-contributors)
11. [나만의 git 페이지](http://bang-star.github.io)

---

Git에 대한 정보를 정말 많이 배웠다.

이번 주차 글은 3번이나 날려먹었다... ㅇㅂㅇ

그냥 TIL로 올려버려야겠어요.... ㅇㅂㅇ
