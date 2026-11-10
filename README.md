# 오호플 OHOPL · 오늘의 호기심 플레이

오늘은 어떤 재미있는 걸 발견할까? AI로 만든 게임, 도구, 신기한 웹서비스가 모인 창작 마을.
정적 사이트(index.html 하나)라 빌드 없이 Vercel에 그대로 올라가요.

- 대표 주소: https://ohopl.com (www와 ohopl.vercel.app도 열림)
- 작품으로 가는 링크 꼬리표: index.html의 `SITE_REF`

## 발견 노트(블로그)

`content/posts.mjs`에 글을 추가해요. `date`가 오늘(한국 시간) 이전인 글만 공개되고, 매일 0시 5분에 GitHub Actions(daily-publish)가 그날 글을 자동으로 올려요.

## 검색 노출(SEO·AEO) 페이지 만들기

작품 데이터(index.html의 WORKS 등)를 바꾼 뒤에는 아래 한 줄을 실행하고 같이 커밋해요.

```
node tools/build-seo.mjs                      # 기본 주소 https://ohopl.com
node tools/build-seo.mjs https://새도메인.com   # 도메인을 산 뒤
```

만들어지는 것: 작품별 소개 페이지 `/w/<id>/`, 전체 목록 `/works/`, 이미지 포함 `sitemap.xml`, `robots.txt`, `llms.txt`,
메인 index.html의 구조화 데이터와 noscript 작품 링크.
