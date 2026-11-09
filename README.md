# 오호플 OHOPL · 오늘의 호기심 플레이

오늘은 어떤 재미있는 걸 발견할까? AI로 만든 게임, 도구, 신기한 웹서비스가 모인 창작 마을.
정적 사이트(index.html 하나)라 빌드 없이 Vercel에 그대로 올라가요.

- 공유 미리보기 주소: index.html의 `https://ohopl.vercel.app`을 실제 도메인으로 바꾸기
- 작품으로 가는 링크 꼬리표: index.html의 `SITE_REF`

## 검색 노출(SEO·AEO) 페이지 만들기

작품 데이터(index.html의 WORKS 등)를 바꾼 뒤에는 아래 한 줄을 실행하고 같이 커밋해요.

```
node tools/build-seo.mjs                      # 지금 주소(ohopl.vercel.app)
node tools/build-seo.mjs https://새도메인.com   # 도메인을 산 뒤
```

만들어지는 것: 작품별 소개 페이지 `/w/<id>/`, 전체 목록 `/works/`, 이미지 포함 `sitemap.xml`, `robots.txt`, `llms.txt`,
메인 index.html의 구조화 데이터와 noscript 작품 링크.
