---
title: "[약국 길찾기 서비스] 추천 결과 저장 기능 구현과 카카오 키워드 장소 검색 API 적용하기"
kind: "article"
permalink: "/posts/tistory-325.html"
published_on: "2023-01-19"
section: "프로젝트"
category: "프로젝트 / 약국 길찾기 / 주소 검색·길안내"
---

## 추천 결과 저장 기능 구현

---

### 비즈니스 로직 점검

---

#### KakaoAddressSearchService

고객이 문자열 기반에 주소를 입력하면 카카오 주소 검색 API를 이용하여 위치 기반 데이터로 변환한다. 

응답 값을 살펴보면 몇 건이 검색되었는지 대한 메타데이터와 위치 기반 데이터인 DocumentDto가 반환된다.

리스트로 넘겨주는 이유는 사용자가 문자열 기반 주소 데이터로 전달할 때 자세하게 입력했을 수도 "서울대학로"와 같이 애매하게 입력하면 인근 지역이 전부 검색되게 되기 때문에 리스트로 넘겨주는데 여기서 1개만 사용할 것이다. 

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/325)

---

#### DirectionService

카카오 API에서 응답 받은 DocumentDto를 이용하여 거리 계산 알고리즘을 진행한다. 

고객이 입력한 주소를 기준으로 가까운 약국을 찾아준다.

1. 약국 리스트를 조회
2. 약국 리스트를 순회
   1. Haversine formula 를 이용하여 고객의 주소와 약국의 주소를 비교하여 거리를 계산한다.
   2. 고객의 주소, 약국의 주소 그리고 거리 값을 가진 Direction 객체를 생성한다.
3. 반경 10KM 이내로 필터
4. 고객의 주소와 약국의 주소를 비교하여 계산된 거리를 기준으로 오름차순 정렬
5. 정렬된 데이터에서 3개만 추출

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class DirectionService {

    private static final int MAX_SEARCH_COUNT = 3; // 약국 최대 검색 갯수
    private static final double RADIUS_KM = 10.0; // 반경 10 km

    private final PharmacySearchService pharmacySearchService;

    public List<Direction> buildDirectionList(DocumentDto documentDto) {

        if(Objects.isNull(documentDto)) return Collections.emptyList();

        return pharmacySearchService.searchPharmacyDtoList()
                .stream().map(pharmacyDto ->
                        Direction.builder()
                                .inputAddress(documentDto.getAddressName())
                                .inputLatitude(documentDto.getLatitude())
                                .inputLongitude(documentDto.getLongitude())
                                .targetPharmacyName(pharmacyDto.getPharmacyName())
                                .targetAddress(pharmacyDto.getPharmacyAddress())
                                .targetLatitude(pharmacyDto.getLatitude())
                                .targetLongitude(pharmacyDto.getLongitude())
                                .distance(
                                        calculateDistance(documentDto.getLatitude(), documentDto.getLongitude(),
                                                pharmacyDto.getLatitude(), pharmacyDto.getLongitude())
                                )
                                .build())
                .filter(direction -> direction.getDistance() <= RADIUS_KM)
                .sorted(Comparator.comparing(Direction::getDistance))
                .limit(MAX_SEARCH_COUNT)
                .collect(Collectors.toList());
    }

    // Haversine formula
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        lat1 = Math.toRadians(lat1);
        lon1 = Math.toRadians(lon1);
        lat2 = Math.toRadians(lat2);
        lon2 = Math.toRadians(lon2);

        double earthRadius = 6371; //Kilometers
        return earthRadius * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
    }
}
```

현재 buildDirectionList와 카카오 API 메소드가 분리가 되어있는데, 이 부분을 조합하여 추천 결과를 저장하는 로직을 만들려고 한다.

### 추천 결과 저장 기능 구현

---

#### Repository 생성

Direction 정보를 이용해서 사용자에게 길 안내를 해주기 위해 데이터베이스에 저장하려 한다. 원할하게 데이터베이스에 저장하기 위해 JpaRepository를 이용한다.

```java
public interface DirectionRepository extends JpaRepository<Direction, Long> {
}
```

---

#### 조회 결과 저장

전체 Direction 리스트를 전달받아 데이터베이스 저장하는 메소드를 만들려고 한다. 이를 위해 DirectionRepository를 의존성 주입을 받아와서 서비스 레이어에서 사용할 수 있도록 하였다.

전달된 파라미터에 대한 유효성 검사를 하고 해당 정보를 전체 저장하고, 데이터 변경이 발생하기 때문에 @Transaction 를 붙여주었다.

```java
public class DirectionService {

    private static final int MAX_SEARCH_COUNT = 3; // 약국 최대 검색 갯수
    private static final double RADIUS_KM = 10.0; // 반경 10 km

    private final PharmacySearchService pharmacySearchService;
    private final DirectionRepository directionRepository;

    @Transactional
    public List<Direction> saveAll(List<Direction> directionList) {
        if(CollectionUtils.isEmpty(directionList)) return Collections.emptyList();
        return directionRepository.saveAll(directionList);
    }
}
```

---

#### 약국 추천 서비스

최종적으로 약국 추천하는 서비스를 만들어 카카오 API 메소드와 Direction Service에서 만든 기능들을 조합해서 최종적으로 고객에게 길안내 해주기 위한 데이터를 저장하는 서비스이다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/325)

* 현재 프론트 화면이 존재하지 않기 때문에 반환 값을 void로 설정하였다.

1. 유효성 체크
   1. 재실행 모두 실패하여 null을 반환하는 경우
   2. 검색된 데이터 결과인 반환된 위도, 경도 정보가 Null 인경우
2. 카카오 API 호출 결과 정상적으로 반환된 경우  
   1. 카카오 API로 반환된 위치 기반 데이터 리스트 중 첫번째 데이터만 사용
   2. 위치 기반 데이터를 기준으로 약국 리스트 조회
   3. 추천된 약국 리스트 저장

현재 완성된 코드가 아니기 때문에 검증은 후추에 할 것이고 검색 기능인 requestAddressService()에 대한 테스트 케이스를 작성해보려 한다. 아래 코드에서 1개 케이스에 대한 테스트 코드가 작성되었다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/325)

아래와 같이 Spock는 where 문에 데이터 테이블을 만들어 여러 케이스를 편하게 테스트할 수 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/325)

테스트 실행 결과 다음과 같이 정상 동작 한다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/325)

## 카카오 키워드 장소 검색 API 적용하기

---

카카오에서 제공하는 키워드로 장소 검색하는 API를 적용해보려 한다.

### 카카오 키워드 장소 검색 API

---

#### 카테고리로 장소 검색하는 기능이 필요한 이유

1. **확장성**  
   현재 약국 도메인을 사용하여 개발하고 있는데 이를 바탕으로 편의점 찾기, 보건소 찾기 등 다른 프로젝트를 만들 때 용이하게 사용하기 위함이다.
2. **안전성**  
   공공기관에서 제공하는 약국 데이터를 사용하고 있는데 약국 데이터를 자세히 보면 알 수 있는데 전체 지역을 포함하는 데이터가 아닌 서울 성북구만 해당하는 데이터라는 제한적인 문제가 발생할 수 있다.  

   약국의 위치가 변경될 경우 변하지 않는 데이터로 추천된다는 문제가 발생한다.   

   위와 같이 약국의 위치가 변경되거나 지역에 제한적이지 않게 하기 위함이다.

### 카테고리 장소 검색 API 에 대한 설명

---

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/325)

카테고리 장소 검색 API는 미리 정의된 카테고리 코드에 해당하는 장소 검색 결과를 지정된 정렬 기준에 따라 제공하는 APi다.

#### **카테고리 코드**

카테고리는 대형마트, 편의점, 학교 등이 다양하게 제공하고 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/325)

#### **Request**

Request 파라미티를 보면 **카테고리 코드**에 해당하는 정보를 **위도**와 **경도** 기준으로 **반경** 내에서 검색할 것인지에 대해 전달 받고 있다. 이때 **sort** 파라미터를 통해 정렬 방식(distance: 거리기준)을 선택할 수 있다.

키워드 파라미터를 봤을 때

고객이 입력한 문자열 기반 주소 정보를 기반으로 위치 기반 데이터인 위도, 경도로 변환하고

위치기반 데이터인 위도, 경도를 파라미터로 추가하고 카테고리를 설정하면 위도 경도 기준으로 가까운 약국을 찾아준다.

공공기관 데이터를 사용하지 않고도 API를 이용하여 가까운 약국을 찾아줄 수 있게 된다. 더 나아가서 카테고리를 약국이 아닌 다른 카테고리(편의점, 마트, 학교 등)로 변경해서 API를 사용할 수도 있다.

[[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/325)](https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-category-request)

---

#### Response

Response는 주소 검색 API와 유사하게 meda Dto, document Dto를 받고 있다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/325)

---

#### API 검증

구현하기 전에 Postman 등을 통해 API 호출해보고 원하는 결과 값이 맞는지에 대해서 검증이 필요하다.

호출을 할 수 있도록 Kakao API에서 Sample을 제공하고 있다.

[[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/325)](https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-category-sample)

Request

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/325)

#### 

Response

distance를 보면 알 수 있듯이 가까운 거리 순서대로 추천해주고 있다. 이를 바탕으로 카테고리로 API를 호출하는 기능을 구현해보려고 한다.

공공기관에서 받은 데이터를 대신하여 카테고리 API로 호출하는 것으로 변경할 수 있다.

```java
{
    "documents": [
        {
            "address_name": "서울 강남구 대치동 943-16",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "0",
            "id": "16618597",
            "phone": "02-558-5476",
            "place_name": "장생당약국",
            "place_url": "http://place.map.kakao.com/16618597",
            "road_address_name": "서울 강남구 테헤란로84길 17",
            "x": "127.058969686607",
            "y": "37.5060533424248"
        },
        {
            "address_name": "서울 강남구 대치동 942",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "157",
            "id": "16037969",
            "phone": "02-528-3528",
            "place_name": "해성약국",
            "place_url": "http://place.map.kakao.com/16037969",
            "road_address_name": "서울 강남구 테헤란로 504",
            "x": "127.05734602769212",
            "y": "37.50662718101623"
        },
        {
            "address_name": "서울 강남구 대치동 944",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "167",
            "id": "16068348",
            "phone": "070-4127-1351",
            "place_name": "미소약국",
            "place_url": "http://place.map.kakao.com/16068348",
            "road_address_name": "서울 강남구 테헤란로 514",
            "x": "127.05975342400005",
            "y": "37.50742608014587"
        },
        {
            "address_name": "서울 강남구 삼성동 157-36",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "199",
            "id": "1737370081",
            "phone": "0507-1438-1969",
            "place_name": "삼성참약사약국",
            "place_url": "http://place.map.kakao.com/1737370081",
            "road_address_name": "서울 강남구 테헤란로 505",
            "x": "127.05756834490765",
            "y": "37.50746320545419"
        },
        {
            "address_name": "서울 강남구 삼성동 158-16",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "203",
            "id": "12625052",
            "phone": "02-569-4111",
            "place_name": "삼성하나약국",
            "place_url": "http://place.map.kakao.com/12625052",
            "road_address_name": "서울 강남구 테헤란로 509",
            "x": "127.05820647978969",
            "y": "37.50778004643713"
        },
        {
            "address_name": "서울 강남구 삼성동 157-33",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "224",
            "id": "1617442521",
            "phone": "02-508-0918",
            "place_name": "미소산약국",
            "place_url": "http://place.map.kakao.com/1617442521",
            "road_address_name": "서울 강남구 테헤란로 503",
            "x": "127.05716571972143",
            "y": "37.507481421085785"
        },
        {
            "address_name": "서울 강남구 삼성동 158-14",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "259",
            "id": "1956474733",
            "phone": "02-555-1130",
            "place_name": "사랑온누리약국",
            "place_url": "http://place.map.kakao.com/1956474733",
            "road_address_name": "서울 강남구 삼성로92길 27",
            "x": "127.05854963554441",
            "y": "37.508367331955526"
        },
        {
            "address_name": "서울 강남구 삼성동 158-12",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "288",
            "id": "16036410",
            "phone": "02-555-6806",
            "place_name": "소망약국",
            "place_url": "http://place.map.kakao.com/16036410",
            "road_address_name": "서울 강남구 테헤란로87길 13",
            "x": "127.058632414374",
            "y": "37.5086411963255"
        },
        {
            "address_name": "서울 강남구 삼성동 158-10",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "302",
            "id": "13508696",
            "phone": "02-508-1363",
            "place_name": "참좋은약국",
            "place_url": "http://place.map.kakao.com/13508696",
            "road_address_name": "서울 강남구 테헤란로87길 17",
            "x": "127.05852732111232",
            "y": "37.508759280055614"
        },
        {
            "address_name": "서울 강남구 대치동 891-42",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "332",
            "id": "22790133",
            "phone": "02-567-0409",
            "place_name": "7층애약국",
            "place_url": "http://place.map.kakao.com/22790133",
            "road_address_name": "서울 강남구 테헤란로78길 8",
            "x": "127.055255198674",
            "y": "37.5056118438096"
        },
        {
            "address_name": "서울 강남구 대치동 961",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "334",
            "id": "16762282",
            "phone": "02-3288-9772",
            "place_name": "프라임엠약국",
            "place_url": "http://place.map.kakao.com/16762282",
            "road_address_name": "서울 강남구 삼성로 352",
            "x": "127.05907136629968",
            "y": "37.503043933902255"
        },
        {
            "address_name": "서울 강남구 대치동 966-4",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "345",
            "id": "790486495",
            "phone": "02-567-3375",
            "place_name": "대치이화약국",
            "place_url": "http://place.map.kakao.com/790486495",
            "road_address_name": "서울 강남구 역삼로 536",
            "x": "127.061695791115",
            "y": "37.5038210611108"
        },
        {
            "address_name": "서울 강남구 대치동 901-67",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "349",
            "id": "9021939",
            "phone": "02-3453-9557",
            "place_name": "서울온누리약국",
            "place_url": "http://place.map.kakao.com/9021939",
            "road_address_name": "서울 강남구 역삼로77길 23",
            "x": "127.05599929188102",
            "y": "37.50397436681256"
        },
        {
            "address_name": "서울 강남구 삼성동 155-11",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "370",
            "id": "16059439",
            "phone": "02-555-5505",
            "place_name": "삼성수약국",
            "place_url": "http://place.map.kakao.com/16059439",
            "road_address_name": "서울 강남구 삼성로96길 11",
            "x": "127.05683429549198",
            "y": "37.50892228761633"
        },
        {
            "address_name": "서울 강남구 대치동 946",
            "category_group_code": "PM9",
            "category_group_name": "약국",
            "category_name": "의료,건강 > 약국",
            "distance": "373",
            "id": "1038692105",
            "phone": "02-553-0777",
            "place_name": "허지웅약국",
            "place_url": "http://place.map.kakao.com/1038692105",
            "road_address_name": "서울 강남구 테헤란로 532",
            "x": "127.06230216889006",
            "y": "37.50812844811193"
        }
    ],
    "meta": {
        "is_end": false,
        "pageable_count": 45,
        "same_name": null,
        "total_count": 2703
    }
}
```

### 카테고리 장소 검색 API 구현

---

#### DocumentDto

Reponse에 맞게 추가된 필드는 placeName과 distance

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/325)

---

#### KakaoUriBuilderService

Request에 위도, 경도, 반경(미터 단위), 카테고리와 정렬 기준을 전달한다.

#### 

```java
private static final String KAKAO_LOCAL_CATEGORY_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/category.json";

public URI buildUriByCategorySearch(double latitude, double longitude, double radius, String category) {

    double meterRadius = radius * 1000;

    UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(KAKAO_LOCAL_CATEGORY_SEARCH_URL);
    uriBuilder.queryParam("category_group_code", category);
    uriBuilder.queryParam("x", longitude);
    uriBuilder.queryParam("y", latitude);
    uriBuilder.queryParam("radius", meterRadius);
    uriBuilder.queryParam("sort","distance");

    URI uri = uriBuilder.build().encode().toUri();

    log.info("[KakaoAddressSearchService buildUriByCategorySearch] uri: {} ", uri);

    return uri;
}
```

---

#### KakaoCategorySearchService

동일하게 KakaoAPI를 호출하기 위한 restTeamplate가 필요하고 나머지는 유사하다.

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoCategorySearchService {

    private final KakaoUriBuilderService kakaoUriBuilderService;

    private final RestTemplate restTemplate;

    private static final String PHARMACY_CATEGORY = "PM9"; // 약국 카테고리

    @Value("${kakao.rest.api.key}")
    private String kakaoRestApiKey;

    public KakaoApiResponseDto requestPharmacyCategorySearch(double latitude, double longitude, double radius) {

        URI uri = kakaoUriBuilderService.buildUriByCategorySearch(latitude, longitude, radius, PHARMACY_CATEGORY);

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, "KakaoAK "+ kakaoRestApiKey);
        HttpEntity httpEntity = new HttpEntity<>(headers);

        return restTemplate.exchange(uri, HttpMethod.GET, httpEntity, KakaoApiResponseDto.class).getBody();
    }
}
```

---

#### DirectionService

기존 코드와 차이점은 기존에는 공공기관에서 받은 데이터를 기준으로 고객이 입력한 정보를 찾았었다.

카테고리 검색 기능은 공공기관에서 받은 데이터를 이용하지 않고 카테고리를 이용해서 장소를 검색하는 것으로 변경되었다.

```java
// pharmacy search by category kakao api
public List<Direction> buildDirectionListByCategoryApi(DocumentDto inputDocumentDto) {
    if(Objects.isNull(inputDocumentDto)) return Collections.emptyList();

    return kakaoCategorySearchService
            .requestPharmacyCategorySearch(inputDocumentDto.getLatitude(), inputDocumentDto.getLongitude(), RADIUS_KM)
            .getDocumentList()
            .stream().map(resultDocumentDto ->
                    Direction.builder()
                            .inputAddress(inputDocumentDto.getAddressName())
                            .inputLatitude(inputDocumentDto.getLatitude())
                            .inputLongitude(inputDocumentDto.getLongitude())
                            .targetPharmacyName(resultDocumentDto.getPlaceName())
                            .targetAddress(resultDocumentDto.getAddressName())
                            .targetLatitude(resultDocumentDto.getLatitude())
                            .targetLongitude(resultDocumentDto.getLongitude())
                            .distance(resultDocumentDto.getDistance() * 0.001) // km 단위
                            .build())
            .limit(MAX_SEARCH_COUNT)
            .collect(Collectors.toList());
}
```

---

#### PharmacyRecommendationService

다음과 같이 간단하게 변경이 가능하다.

[원문에서 스크린샷 보기](https://to-be-a-artist.tistory.com/325)

####
