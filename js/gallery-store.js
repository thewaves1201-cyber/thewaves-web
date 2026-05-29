(function () {
  "use strict";

  var STORAGE_KEY_V1 = "waves_gallery_v1";
  var STORAGE_KEY = "waves_gallery_v2";
  var SITE_GALLERY_URL = "data/gallery.json";
  var SITE_INDEX_HERO_URL = "data/index-hero.json";
  /** gallery / hero 배포 시 숫자 올리면 CDN·브라우저 캐시 무효화 */
  var GALLERY_DEPLOY_REV = "20260529-gallery";
  var GALLERY_REV_KEY = "waves_gallery_rev";

  var memoryStore = null;
  var storageReady = false;
  var lastGalleryRev = "";

  var ADMIN_PAGE_LIST = [
    {
      id: "index",
      label: "메인 (index.html)",
      sections: [{ id: "hero", title: "메인 히어로 (상단 큰 이미지)", variant: "hero" }],
    },
    {
      id: "brand-marketing",
      label: "BRAND MARKETING (brand-marketing.html)",
      sections: [{ id: "items", title: "갤러리", variant: "wide" }],
    },
    {
      id: "media-contents",
      label: "MEDIA CONTENTS (media-contents.html)",
      sections: [{ id: "items", title: "갤러리", variant: "wide" }],
    },
    {
      id: "entertainment-contents",
      label: "ENTERTAINMENT CONTENTS (entertainment-contents.html)",
      sections: [{ id: "items", title: "갤러리", variant: "wide" }],
    },
    {
      id: "artist-management",
      label: "ARTIST MANAGEMENT (artist-management.html)",
      sections: [{ id: "items", title: "아티스트", variant: "portrait" }],
    },
    {
      id: "music-publishing",
      label: "MUSIC PUBLISHING (music-publishing.html)",
      sections: [{ id: "items", title: "퍼블리싱 앨범", variant: "square" }],
    },
    {
      id: "artist-park-seo-young",
      label: "Park Seo Young (artist-park-seo-young.html)",
      sections: [
        { id: "album", title: "ALBUM", variant: "square" },
        { id: "live-clip", title: "LIVE CLIP", variant: "wide" },
      ],
    },
    {
      id: "artist-mincheon",
      label: "MINCHEON (artist-mincheon.html)",
      sections: [
        { id: "album", title: "ALBUM", variant: "square" },
        { id: "live-clip", title: "LIVE CLIP", variant: "wide" },
      ],
    },
    {
      id: "artist-dain",
      label: "DAIN (artist-dain.html)",
      sections: [
        { id: "album", title: "ALBUM", variant: "square" },
        { id: "live-clip", title: "LIVE CLIP", variant: "wide" },
      ],
    },
    {
      id: "artist-mauve",
      label: "Mauve (artist-mauve.html)",
      sections: [
        { id: "album", title: "ALBUM", variant: "square" },
        { id: "live-clip", title: "LIVE CLIP", variant: "wide" },
      ],
    },
    {
      id: "artist-solt",
      label: "SoLt (artist-solt.html)",
      sections: [
        { id: "album", title: "ALBUM", variant: "square" },
        { id: "live-clip", title: "LIVE CLIP", variant: "wide" },
      ],
    },
    {
      id: "partners",
      label: "PARTNERS (partners.html)",
      sections: [{ id: "items", title: "파트너 로고", variant: "partner" }],
    },
  ];

  var ARTIST_PARK_SEO_YOUNG_PAGE_DEFAULTS = {
    album: [
      {
        image:
          "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
        href: "#",
        title: "Universe",
        description: "2025. 03. 16",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
        href: "#",
        title: "REPEAT",
        description: "2024. 07. 20",
        eyebrow: "",
        showPlay: false,
      },
    ],
    "live-clip": [
      {
        image:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=960&q=80",
        href: "https://www.youtube.com/",
        title: "눈(feat.이문세) - Zion.T",
        description: "Cover by 박서영(Park Seo Young)",
        eyebrow: "",
        showPlay: true,
      },
    ],
  };

  var ARTIST_MINCHEON_PAGE_DEFAULTS = {
    album: [
      {
        image:
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
        href: "#",
        title: "izx! [WAVY]",
        description: "24.10.23",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80",
        href: "#",
        title: "Digital Single 'Moonlight'",
        description: "2024.07.22",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80",
        href: "#",
        title: "2nd SINGLE ALBUM [Set Me Free]",
        description: "2023.07.12",
        eyebrow: "",
        showPlay: true,
      },
    ],
    "live-clip": [
      {
        image:
          "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=960&q=80",
        href: "https://www.youtube.com/",
        title: "[MV] 민천(Mincheon) _ Way Up",
        description: "",
        eyebrow: "",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=960&q=80",
        href: "https://www.youtube.com/",
        title: "MINO - Drunk Talk (취했) | Cover by MINCHEON & SoLt",
        description: "",
        eyebrow: "",
        showPlay: true,
      },
    ],
  };

  var ARTIST_DAIN_PAGE_DEFAULTS = {
    album: [
      {
        image:
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
        href: "#",
        title: "1st SINGLE ALBUM [PEONY]",
        description: "2022.04.26",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        href: "#",
        title: "5th SINGLE ALBUM [Traveler]",
        description: "2023.10.11",
        eyebrow: "",
        showPlay: false,
      },
    ],
    "live-clip": [
      {
        image:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=960&q=80",
        href: "https://www.youtube.com/",
        title: "IU - Celebrity | Cover by DAIN",
        description: "",
        eyebrow: "",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=960&q=80",
        href: "https://www.youtube.com/",
        title: "DAIN - Traveler Official Video",
        description: "",
        eyebrow: "",
        showPlay: true,
      },
    ],
  };

  var ARTIST_MAUVE_PAGE_DEFAULTS = {
    album: [
      {
        image:
          "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80",
        href: "#",
        title: "SINGLE ALBUM [Take a ride]",
        description: "2024.07.17",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
        href: "#",
        title: "SINGLE ALBUM [고양이]",
        description: "2022.10.18",
        eyebrow: "",
        showPlay: false,
      },
    ],
    "live-clip": [
      {
        image:
          "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=960&q=80",
        href: "https://www.youtube.com/",
        title: "Lauv - Steal The Show | Cover by Mauve",
        description: "",
        eyebrow: "",
        showPlay: true,
      },
    ],
  };

  var ARTIST_SOLT_PAGE_DEFAULTS = {
    album: [
      {
        image:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
        href: "#",
        title: "SINGLE [give me a ride]",
        description: "2024.07.27",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80",
        href: "#",
        title: "SINGLE [WALK]",
        description: "2023.07.05",
        eyebrow: "",
        showPlay: false,
      },
    ],
    "live-clip": [
      {
        image:
          "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=960&q=80",
        href: "https://www.youtube.com/",
        title: "[LIVECLIP] 솔트(SoLt) _ walk",
        description: "",
        eyebrow: "",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=960&q=80",
        href: "https://www.youtube.com/",
        title: "GODS ft. NewJeans(뉴진스) | Cover By SoLt",
        description: "",
        eyebrow: "",
        showPlay: true,
      },
    ],
  };

  var ARTIST_PAGE_DEFAULTS = {
    "artist-park-seo-young": ARTIST_PARK_SEO_YOUNG_PAGE_DEFAULTS,
    "artist-mincheon": ARTIST_MINCHEON_PAGE_DEFAULTS,
    "artist-dain": ARTIST_DAIN_PAGE_DEFAULTS,
    "artist-mauve": ARTIST_MAUVE_PAGE_DEFAULTS,
    "artist-solt": ARTIST_SOLT_PAGE_DEFAULTS,
  };

  var MUSIC_PUBLISHING_PAGE_DEFAULT_ITEMS = [
      {
        image:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80",
        href: "#",
        title: "이 자리에(Acoustic Ver)",
        description: "워너원",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
        href: "#",
        title: "CLOCK",
        description: "인피니트",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80",
        href: "#",
        title: "HALLA",
        description: "트리플아이즈(Triple iz)",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80",
        href: "#",
        title: "WAVY",
        description: "아이즈엑스(izx!)",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
        href: "#",
        title: "O.O",
        description: "엔믹스(NMIXX)",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=80",
        href: "#",
        title: "No Matter What",
        description: "골든차일드",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
        href: "#",
        title: "WALK",
        description: "SoLt(솔트)",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=80",
        href: "#",
        title: "Traveler",
        description: "다인(DAIN)",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=900&q=80",
        href: "#",
        title: "Purple Sunrise",
        description: "iflandies(이프랜디스)",
        eyebrow: "",
        showPlay: false,
      },
    ];

  var ARTIST_MANAGEMENT_PAGE_DEFAULT_ITEMS = [
      {
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
        href: "artist-park-seo-young.html",
        title: "박서영(PARK SEO YOUNG)",
        description: "",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
        href: "artist-mincheon.html",
        title: "민천(MINCHEON)",
        description: "",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        href: "artist-dain.html",
        title: "다인(DAIN)",
        description: "",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80",
        href: "artist-mauve.html",
        title: "모브(MAUVE)",
        description: "",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
        href: "artist-solt.html",
        title: "솔트(SOLT)",
        description: "",
        eyebrow: "",
        showPlay: false,
      },
    ];

  var PARTNERS_PAGE_DEFAULT_ITEMS = [
    { image: "", href: "", title: "", description: "SKT 이프랜드", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "스마일게이트", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "MBC", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "Mnet", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "사운드리퍼블리카", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "넷마블", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "포스코", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "현대건설", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "현대 MOTOR GROUP", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "크록스", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "MNH", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "엔씨소프트", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "ALL THE KPOP", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "한국관광공사", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "서울특별시", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "브이레인저", eyebrow: "", showPlay: false },
    { image: "", href: "", title: "", description: "블록베리 크리에이티브", eyebrow: "", showPlay: false },
  ];

  var BRAND_MARKETING_PAGE_DEFAULT_ITEMS = [
      {
        image:
          "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "SKT ifland X 걸그룹 '에스파' 팬밋업 송출",
        description: "SKT ifland X 걸그룹 '에스파' 팬밋업 송출",
        eyebrow: "",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "SKT ifland 글로벌 프로젝트 걸그룹 '트리플아이즈(Triple iz)' 제작",
        description: "'트리플아이즈(Triple iz)' 제작",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "걸그룹 '시크릿넘버(SECRET NUMBER)'",
        description: "XR 메타버스 콘서트 기획&제작",
        eyebrow: "",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "BAND NELL(넬)",
        description: "XR 메타버스 콘서트 기획&제작",
        eyebrow: "",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "가수 'HYOLYN(효린)'",
        description: "메타버스 콘서트 제작지원",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "SKT ifland",
        description: "버츄얼 아티스트 '이프랜디스(iFLANDIES)' 제작",
        eyebrow: "",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "버추얼아이돌 '이프랜디스' & SF9 '영빈'",
        description: "음원 'Purple Sunrise' 및 팬밋업 라이브 제작",
        eyebrow: "",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "MBC X izx!",
        description: "프로젝트 보이그룹 '아이즈엑스' 제작 · SHOWCASE",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "SKT ifland",
        description: "글로벌 런칭 트레일러 콘텐츠 제작",
        eyebrow: "",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "SMILEGATE",
        description: "버츄얼 아티스트 YUA(한유아) 콘텐츠 제작",
        eyebrow: "",
        showPlay: false,
      },
  ];

  var INDEX_PAGE_DEFAULTS = {
    hero: [
      {
        image:
          "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=2000&q=80",
        href: "#",
        title: "BAND NELL\nMETAVERSE CONCERT",
        description: "넬 메타버스 콘서트 제작지원",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=2000&q=80",
        href: "#",
        title: "LIVE &\nDIGITAL EXPERIENCE",
        description: "라이브 · 디지털 콘텐츠 기획 · 제작",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=2000&q=80",
        href: "#",
        title: "BRANDED\nENTERTAINMENT",
        description: "브랜디드 엔터테인먼트 프로젝트",
        eyebrow: "",
        showPlay: false,
      },
    ],
    media: [
      {
        image:
          "https://images.unsplash.com/photo-1574717025058-2f8737d2e2b7?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "HYBE",
        description: "BTS OFFICIAL LIGHT STICK VER.3 ARMY BOMB",
        eyebrow: "",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "MBC X KOREANET",
        description: "KPOP STAR SHOWCASE 제작지원(음향팀)",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "걸그룹 '지니어스(Geenius)'",
        description: "데뷔앨범 'Voyage' MV 제작",
        eyebrow: "",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "LG METAWARE",
        description: "LG 메타웨어 USP 광고영상 제작",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "METATALK 메타톡!",
        description: "배우 박서영, 이희루 메타인터뷰 제작",
        eyebrow: "",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "L'ORÉAL KOREA",
        description: "이노베이션 센터 5주년 기념 행사 촬영",
        eyebrow: "",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "한국관광공사",
        description: "Big Marvel X Visit Korea '한량'",
        eyebrow: "",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "현대건설 힐스테이트",
        description: "빅마블과 함께하는 루프스테이션",
        eyebrow: "",
        showPlay: false,
      },
    ],
    entertainment: [
      {
        image:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "디지털 콘텐츠 '원데이 클라쓰' 시리즈 후반 편집",
        description: "MNET KCON",
        eyebrow: "MNET KCON",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "보이그룹 '보이즈넥스트도어' COMING HOME NEXT 시리즈 후반 편집",
        description: "MNET KCON",
        eyebrow: "MNET KCON",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "프로젝트 보이그룹 예능 'We are izx!' 제작",
        description: "MBC X ALL THE KPOP",
        eyebrow: "MBC X ALL THE KPOP",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "'WAVY' MV 제작",
        description: "izx!(아이즈엑스)",
        eyebrow: "izx!",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1574717025058-2f8737d2e2b7?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "댄스 에이스들의 랜덤 플레이 댄스",
        description: "MNET 로드투킹덤",
        eyebrow: "MNET",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "보컬 에이스들의 라이브",
        description: "MNET 로드투킹덤",
        eyebrow: "MNET",
        showPlay: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "Debut Showcase 제작",
        description: "izx!(아이즈엑스)",
        eyebrow: "izx!",
        showPlay: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
        href: "#",
        title: "가수 '다인(Dain)'",
        description: "'Traveler' MV 제작",
        eyebrow: "다인",
        showPlay: true,
      },
    ],
  };

  function escHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escAttr(s) {
    return escHtml(s).replace(/'/g, "&#39;");
  }

  function safeHref(url) {
    var u = String(url || "").trim();
    if (!u) return "#";
    var low = u.toLowerCase();
    if (low.indexOf("javascript:") === 0 || low.indexOf("data:") === 0) {
      return "#";
    }
    return u;
  }

  function isExternal(href) {
    return /^https?:\/\//i.test(href);
  }

  function hasRealHref(href) {
    var h = String(href || "").trim();
    return !!(h && h !== "#");
  }

  function parseYouTubeId(url) {
    var u = String(url || "").trim();
    if (!u) return "";
    var m = u.match(
      /(?:youtube\.com\/watch\?[^#]*v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (m) return m[1];
    m = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : "";
  }

  function isYouTubeVideoUrl(url) {
    return !!parseYouTubeId(url);
  }

  var PLACEHOLDER_IMG =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

  function safeImageSrc(url) {
    var u = String(url || "").trim();
    if (!u) return "";
    var low = u.toLowerCase();
    if (low.indexOf("javascript:") === 0) return "";
    return u;
  }

  function hasGalleryImage(item) {
    var u = safeImageSrc(item && item.image);
    if (!u) return false;
    if (u === PLACEHOLDER_IMG) return false;
    return true;
  }

  function countDataImages(store) {
    var n = 0;
    if (!store || !store.pages) return 0;
    Object.keys(store.pages).forEach(function (pid) {
      var page = store.pages[pid];
      if (!page || typeof page !== "object") return;
      Object.keys(page).forEach(function (sid) {
        var list = page[sid];
        if (!Array.isArray(list)) return;
        list.forEach(function (item) {
          if (hasGalleryImage(item)) n += 1;
        });
      });
    });
    return n;
  }

  function pickRicherGalleryStore(a, b) {
    var aN = countDataImages(a);
    var bN = countDataImages(b);
    if (aN !== bN) return aN > bN ? a : b;
    try {
      return JSON.stringify(a).length >= JSON.stringify(b).length ? a : b;
    } catch (e) {
      return b;
    }
  }

  function isGalleryAdminPage() {
    try {
      var path = (location.pathname || "").toLowerCase();
      if (/admin(-design)?\.html$/.test(path)) return true;
      if (document.body && document.body.classList.contains("admin-body")) return true;
    } catch (e) {}
    return false;
  }

  function resolveGalleryStore(fromSite, fromLs, fromIdb) {
    /* admin 페이지만 IndexedDB 우선(미저장 편집 유지). 공개 페이지는 배포 gallery.json 우선 */
    if (
      isGalleryAdminPage() &&
      fromIdb &&
      fromIdb.pages &&
      Object.keys(fromIdb.pages).length
    ) {
      return ensurePagesShape(fromIdb);
    }
    var store = defaultStore();
    [fromSite, fromLs].forEach(function (src) {
      if (src) store = pickRicherGalleryStore(store, src);
    });
    return store;
  }

  function galleryFetchUrl(path) {
    return (
      path +
      (GALLERY_DEPLOY_REV
        ? (path.indexOf("?") >= 0 ? "&" : "?") +
          "v=" +
          encodeURIComponent(GALLERY_DEPLOY_REV)
        : "")
    );
  }

  function fetchJsonUrl(url, cb) {
    cb = cb || function () {};
    if (typeof fetch !== "function") {
      cb(null);
      return;
    }
    fetch(galleryFetchUrl(url), { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (raw) {
        cb(raw || null);
      })
      .catch(function () {
        cb(null);
      });
  }

  function mergeIndexHeroIntoStore(store, heroItems) {
    if (!heroItems || !heroItems.length) return store;
    var base = store || defaultStore();
    if (!base.pages) base.pages = {};
    if (!base.pages.index) base.pages.index = {};
    base.pages.index.hero = heroItems.map(normalizeItem);
    return base;
  }

  function fetchBundledIndexHero(cb) {
    cb = cb || function () {};
    fetchJsonUrl(SITE_INDEX_HERO_URL, function (raw) {
      if (raw && raw.version === 2 && Array.isArray(raw.hero) && raw.hero.length) {
        try {
          cb(raw.hero.map(normalizeItem));
          return;
        } catch (e) {}
      }
      cb(null);
    });
  }

  function fetchBundledGallery(cb) {
    cb = cb || function () {};
    fetchJsonUrl(SITE_GALLERY_URL, function (raw) {
      if (raw && raw.version === 2 && raw.pages) {
        try {
          cb(ensurePagesShape(raw));
          return;
        } catch (e) {}
      }
      cb(null);
    });
  }

  function exportDeployGalleryStore(store) {
    return JSON.stringify(ensurePagesShape(store || defaultStore()), null, 2);
  }

  function normalizeMultiline(s) {
    return String(s || "")
      .split(/\r?\n/)
      .map(function (line) {
        return line.trim();
      })
      .join("\n")
      .replace(/^\n+|\n+$/g, "");
  }

  function normalizeItem(raw) {
    var href = safeHref(raw.href);
    return {
      image: safeImageSrc(raw.image),
      href: href,
      title: normalizeMultiline(raw.title),
      description: String(raw.description || "").trim(),
      eyebrow: String(raw.eyebrow || "").trim(),
      showPlay: !!parseYouTubeId(href),
    };
  }

  function normalizeFlatGalleriesV1(data) {
    var out = {};
    ["branded", "media", "entertainment", "music"].forEach(function (id) {
      var list = data[id];
      if (!Array.isArray(list)) {
        if (id === "branded") {
          list = BRAND_MARKETING_PAGE_DEFAULT_ITEMS;
        } else if (id === "music") {
          list = MUSIC_PUBLISHING_PAGE_DEFAULT_ITEMS;
        } else {
          list = INDEX_PAGE_DEFAULTS[id];
        }
      }
      out[id] = list.map(normalizeItem);
    });
    return out;
  }

  function defaultStore() {
    var pages = {};
    ADMIN_PAGE_LIST.forEach(function (p) {
      pages[p.id] = {};
      p.sections.forEach(function (sec) {
        if (p.id === "index" && INDEX_PAGE_DEFAULTS[sec.id]) {
          pages[p.id][sec.id] = INDEX_PAGE_DEFAULTS[sec.id].map(normalizeItem);
        } else if (p.id === "brand-marketing" && sec.id === "items") {
          pages[p.id][sec.id] = BRAND_MARKETING_PAGE_DEFAULT_ITEMS.map(
            normalizeItem
          );
        } else if (p.id === "media-contents" && sec.id === "items") {
          pages[p.id][sec.id] = INDEX_PAGE_DEFAULTS.media.map(normalizeItem);
        } else if (p.id === "entertainment-contents" && sec.id === "items") {
          pages[p.id][sec.id] = INDEX_PAGE_DEFAULTS.entertainment.map(
            normalizeItem
          );
        } else if (p.id === "artist-management" && sec.id === "items") {
          pages[p.id][sec.id] = ARTIST_MANAGEMENT_PAGE_DEFAULT_ITEMS.map(
            normalizeItem
          );
        } else if (p.id === "music-publishing" && sec.id === "items") {
          pages[p.id][sec.id] = MUSIC_PUBLISHING_PAGE_DEFAULT_ITEMS.map(
            normalizeItem
          );
        } else if (ARTIST_PAGE_DEFAULTS[p.id] && ARTIST_PAGE_DEFAULTS[p.id][sec.id]) {
          pages[p.id][sec.id] = ARTIST_PAGE_DEFAULTS[p.id][sec.id].map(
            normalizeItem
          );
        } else if (p.id === "partners" && sec.id === "items") {
          pages[p.id][sec.id] = PARTNERS_PAGE_DEFAULT_ITEMS.map(normalizeItem);
        } else {
          pages[p.id][sec.id] = [];
        }
      });
    });
    return { version: 2, pages: pages };
  }

  function ensurePagesShape(store) {
    if (!store || typeof store !== "object") return defaultStore();
    if (!store.pages) store.pages = {};
    var d = defaultStore();
    Object.keys(d.pages).forEach(function (pid) {
      if (!store.pages[pid]) store.pages[pid] = JSON.parse(JSON.stringify(d.pages[pid]));
      Object.keys(d.pages[pid]).forEach(function (sid) {
        if (!Array.isArray(store.pages[pid][sid])) {
          store.pages[pid][sid] = d.pages[pid][sid].map(normalizeItem);
        } else {
          store.pages[pid][sid] = store.pages[pid][sid].map(normalizeItem);
        }
        if (
          !store.pages[pid][sid].length &&
          d.pages[pid][sid] &&
          d.pages[pid][sid].length
        ) {
          /* partners 빈 배열 → 기본 17칸(이미지 없음)으로 덮어쓰면 업로드가 사라진 것처럼 보임 */
          if (pid === "partners" && sid === "items") {
            /* intentionally empty */
          } else {
            store.pages[pid][sid] = d.pages[pid][sid].map(normalizeItem);
          }
        }
      });
      if (pid === "music-business") {
        var mb = store.pages[pid];
        if (mb && Array.isArray(mb.items) && mb.items.length) {
          mb["music-publishing"] = mb.items.map(normalizeItem);
          delete mb.items;
        }
      }
    });

    (function migrateMusicPublishingPage() {
      var mbiz = store.pages["music-business"];
      if (!store.pages["music-publishing"]) store.pages["music-publishing"] = {};
      var mp = store.pages["music-publishing"];
      if (!Array.isArray(mp.items)) mp.items = [];

      if (
        mbiz &&
        Array.isArray(mbiz["music-publishing"]) &&
        mbiz["music-publishing"].length
      ) {
        if (!mp.items.length) {
          mp.items = mbiz["music-publishing"].map(normalizeItem);
        }
        delete mbiz["music-publishing"];
      }
    })();

    (function migrateArtistManagementPage() {
      var mbiz = store.pages["music-business"];
      if (!store.pages["artist-management"]) store.pages["artist-management"] = {};
      var am = store.pages["artist-management"];
      if (!Array.isArray(am.items)) am.items = [];

      if (
        mbiz &&
        Array.isArray(mbiz["artist-management"]) &&
        mbiz["artist-management"].length
      ) {
        if (!am.items.length) {
          am.items = mbiz["artist-management"].map(normalizeItem);
        }
        delete mbiz["artist-management"];
      }
    })();

    (function migrateMainSlotsToContentPages() {
      var idx = store.pages.index;
      var bm = store.pages["brand-marketing"];
      var mc = store.pages["media-contents"];
      var ec = store.pages["entertainment-contents"];
      if (!idx || !bm || !mc || !ec) return;

      if (Array.isArray(idx.branded) && idx.branded.length) {
        bm.items = idx.branded.map(normalizeItem);
        delete idx.branded;
      }
      if (Array.isArray(idx.media) && idx.media.length) {
        if (!Array.isArray(mc.items) || mc.items.length === 0) {
          mc.items = idx.media.map(normalizeItem);
        }
        delete idx.media;
      }
      if (Array.isArray(idx.entertainment) && idx.entertainment.length) {
        if (!Array.isArray(ec.items) || ec.items.length === 0) {
          ec.items = idx.entertainment.map(normalizeItem);
        }
        delete idx.entertainment;
      }

      var mbiz = store.pages["music-business"];
      var mpPage = store.pages["music-publishing"];
      if (!mpPage) store.pages["music-publishing"] = { items: [] };
      if (!Array.isArray(mpPage.items)) mpPage.items = [];
      var amPage = store.pages["artist-management"];
      if (!amPage) store.pages["artist-management"] = { items: [] };
      if (!Array.isArray(amPage.items)) amPage.items = [];
      if (idx && Array.isArray(idx.music) && idx.music.length) {
        if (!amPage.items.length) {
          amPage.items = idx.music.map(normalizeItem);
        } else if (!mpPage.items.length) {
          mpPage.items = idx.music.map(normalizeItem);
        }
        delete idx.music;
      }
    })();

    store.version = 2;
    return store;
  }

  function loadRawFromLocalStorage() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.version === 2 && parsed.pages) {
          return ensurePagesShape(parsed);
        }
      }
      var raw1 = localStorage.getItem(STORAGE_KEY_V1);
      if (raw1) {
        var flat = JSON.parse(raw1);
        var flatNorm = normalizeFlatGalleriesV1(flat);
        var base = defaultStore();
        if (!base.pages["artist-management"]) base.pages["artist-management"] = {};
        base.pages["artist-management"].items = flatNorm.music;
        base.pages["brand-marketing"].items = flatNorm.branded;
        base.pages["media-contents"].items = flatNorm.media;
        base.pages["entertainment-contents"].items = flatNorm.entertainment;
        localStorage.removeItem(STORAGE_KEY_V1);
        return base;
      }
    } catch (e) {}
    return null;
  }

  function clearLegacyGalleryLocalStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function bumpGalleryRev() {
    try {
      localStorage.setItem(GALLERY_REV_KEY, String(Date.now()));
    } catch (e) {}
  }

  function saveRaw(store) {
    memoryStore = ensurePagesShape(store);
    var json = JSON.stringify(memoryStore);
    if (window.WavesGalleryDB) {
      window.WavesGalleryDB.saveGallery(json, function (err) {
        if (!err) {
          clearLegacyGalleryLocalStorage();
          bumpGalleryRev();
          return;
        }
        try {
          localStorage.setItem(STORAGE_KEY, json);
        } catch (e) {
          throw e;
        }
      });
      return;
    }
    localStorage.setItem(STORAGE_KEY, json);
    bumpGalleryRev();
  }

  function saveRawAsync(store, cb) {
    memoryStore = ensurePagesShape(store);
    var json = JSON.stringify(memoryStore);
    cb = cb || function () {};

    if (window.WavesGalleryDB) {
      window.WavesGalleryDB.saveGallery(json, function (err) {
        if (!err) {
          clearLegacyGalleryLocalStorage();
          bumpGalleryRev();
          cb(null);
          return;
        }
        try {
          localStorage.setItem(STORAGE_KEY, json);
          bumpGalleryRev();
          cb(null);
        } catch (e2) {
          cb(e2);
        }
      });
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, json);
      bumpGalleryRev();
      cb(null);
    } catch (e3) {
      cb(e3);
    }
  }

  function reloadFromPersistentStorage(done) {
    done = done || function () {};
    if (!window.WavesGalleryDB) {
      done();
      return;
    }
    window.WavesGalleryDB.loadGallery(function (err, json) {
      if (err || !json) {
        done();
        return;
      }
      try {
        memoryStore = ensurePagesShape(JSON.parse(json));
        renderIntoPage();
      } catch (e) {
        /* ignore */
      }
      done();
    });
  }

  function initGalleryRevListener() {
    try {
      lastGalleryRev = localStorage.getItem(GALLERY_REV_KEY) || "";
    } catch (e) {
      lastGalleryRev = "";
    }

    window.addEventListener("storage", function (e) {
      if (e.key !== GALLERY_REV_KEY || !e.newValue || !storageReady) return;
      if (e.newValue === lastGalleryRev) return;
      lastGalleryRev = e.newValue;
      reloadFromPersistentStorage();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "visible" || !storageReady) return;
      var rev = "";
      try {
        rev = localStorage.getItem(GALLERY_REV_KEY) || "";
      } catch (e2) {
        rev = "";
      }
      if (rev && rev !== lastGalleryRev) {
        lastGalleryRev = rev;
        reloadFromPersistentStorage();
      }
    });
  }

  function loadRaw() {
    if (memoryStore) {
      return JSON.parse(JSON.stringify(memoryStore));
    }
    var ls = loadRawFromLocalStorage();
    return ls || defaultStore();
  }

  function initGalleryStorage(done) {
    done = done || function () {};

    function finish(store) {
      memoryStore = store;
      storageReady = true;
      try {
        renderIntoPage();
      } catch (e) {}
      done(store);
    }

    function applyGallerySources(fromSite, fromHero) {
      if (!window.WavesGalleryDB) {
        var quick = mergeIndexHeroIntoStore(
          resolveGalleryStore(fromSite, loadRawFromLocalStorage(), null),
          fromHero
        );
        finish(quick);
        return;
      }

      window.WavesGalleryDB.loadGallery(function (err, json) {
        var fromIdb = null;
        if (!err && json) {
          try {
            fromIdb = ensurePagesShape(JSON.parse(json));
          } catch (e) {
            fromIdb = null;
          }
        }

        var usedIdb =
          fromIdb && fromIdb.pages && Object.keys(fromIdb.pages).length > 0;
        var store = mergeIndexHeroIntoStore(
          resolveGalleryStore(
            fromSite,
            loadRawFromLocalStorage(),
            fromIdb
          ),
          fromHero
        );

        if (usedIdb && isGalleryAdminPage()) {
          finish(store);
          return;
        }

        var payload = JSON.stringify(store);
        window.WavesGalleryDB.saveGallery(payload, function () {
          clearLegacyGalleryLocalStorage();
          finish(store);
        });
      });
    }

    fetchBundledIndexHero(function (fromHero) {
      fetchBundledGallery(function (fromSite) {
        applyGallerySources(fromSite, fromHero);
      });
    });
  }

  function loadPage(pageId) {
    var s = loadRaw();
    var p = s.pages[pageId];
    return p ? JSON.parse(JSON.stringify(p)) : {};
  }

  function load() {
    return loadPage("index");
  }

  function save(data) {
    if (data && data.version === 2 && data.pages) {
      saveRaw(data);
      return;
    }
    var flat = normalizeFlatGalleriesV1(data);
    var s = loadRaw();
    if (!s.pages.index) s.pages.index = {};
    if (!s.pages["artist-management"]) s.pages["artist-management"] = {};
    if (!s.pages["brand-marketing"]) s.pages["brand-marketing"] = {};
    if (!s.pages["media-contents"]) s.pages["media-contents"] = {};
    if (!s.pages["entertainment-contents"]) s.pages["entertainment-contents"] = {};
    s.pages["artist-management"].items = flat.music;
    s.pages["brand-marketing"].items = flat.branded;
    s.pages["media-contents"].items = flat.media;
    s.pages["entertainment-contents"].items = flat.entertainment;
    delete s.pages.index.branded;
    delete s.pages.index.media;
    delete s.pages.index.entertainment;
    delete s.pages.index.music;
    saveRaw(s);
  }

  function resetToDefaults() {
    memoryStore = null;
    clearLegacyGalleryLocalStorage();
    try {
      localStorage.removeItem(STORAGE_KEY_V1);
    } catch (e) {}
    if (window.WavesGalleryDB) {
      window.WavesGalleryDB.removeGallery(function () {});
    }
  }

  function renderHeroSlide(item, slideIndex) {
    var img = safeImageSrc(item.image);
    var mediaHtml =
      img !== ""
        ? '<img class="hero-slide__img" src="' +
          escAttr(img) +
          '" alt="" decoding="async"' +
          (slideIndex === 0 ? ' fetchpriority="high"' : "") +
          " />"
        : "";
    var titleRaw = normalizeMultiline(item.title || "");
    var titleLines = titleRaw.split(/\r?\n/);
    var titleHtml = titleLines
      .map(function (line) {
        return (
          '<span class="hero-slide__title-line">' + escHtml(line) + "</span>"
        );
      })
      .join("");
    var descRaw = String(item.description || "").trim();
    var subHtml = "";
    if (descRaw) {
      subHtml = descRaw
        .split(/\r?\n/)
        .map(function (line) {
          return line.trim();
        })
        .map(function (line) {
          return (
            '<span class="hero-slide__sub-line">' + escHtml(line) + "</span>"
          );
        })
        .join("");
    }
    return (
      '<div class="swiper-slide hero-slide">' +
      '<div class="hero-slide__media" aria-hidden="true">' +
      mediaHtml +
      "</div>" +
      '<div class="hero-slide__shade"></div>' +
      '<div class="hero-slide__copy">' +
      '<h1 class="hero-slide__title">' +
      titleHtml +
      "</h1>" +
      '<p class="hero-slide__sub">' +
      subHtml +
      "</p>" +
      "</div>" +
      "</div>"
    );
  }

  function renderCard(item, variant, opts) {
    opts = opts || {};
    var omitCaption = !!opts.omitCaption;
    var square = variant === "square";
    var portrait = variant === "portrait";
    var isPartner = variant === "partner";
    var hasEyebrow = !!item.eyebrow && !omitCaption && !isPartner;
    var cardClass = "gallery-card";
    if (square) cardClass += " gallery-card--square";
    else if (portrait) cardClass += " gallery-card--portrait";
    else if (isPartner) cardClass += " gallery-card--partner";
    if (isPartner && !hasGalleryImage(item)) cardClass += " gallery-card--no-logo";
    if (portrait && omitCaption && String(item.title || "").trim()) {
      cardClass += " gallery-card--portrait-hover";
    }

    var textClass = "gallery-card__text";
    if (hasEyebrow) textClass += " gallery-card__text--stack";
    if (square || portrait) textClass += " gallery-card__text--center";

    var playClass = "gallery-card__play";
    if (square || portrait) playClass += " gallery-card__play--corner";

    var href = safeHref(item.href);
    var youtubeId = parseYouTubeId(href);
    var showPlayIcon = !!youtubeId;

    var playHtml = showPlayIcon
      ? '<span class="' +
        playClass +
        '" aria-hidden="true"></span>'
      : "";

    var eyebrowHtml = hasEyebrow
      ? '<span class="gallery-card__eyebrow">' +
        escHtml(item.eyebrow) +
        "</span>"
      : "";
    var linkOut = hasRealHref(href) && !youtubeId;
    var ext = isExternal(href);
    var targetAttr = ext
      ? ' target="_blank" rel="noopener noreferrer"'
      : "";

    var titleStr = String(item.title || "").trim();
    var ariaLabel =
      titleStr !== ""
        ? ' aria-label="' + escAttr(titleStr) + '"'
        : "";

    var imgW = square ? "400" : portrait ? "320" : isPartner ? "400" : "640";
    var imgH = square ? "400" : portrait ? "480" : isPartner ? "120" : "360";
    var imgUrl = hasGalleryImage(item)
      ? escAttr(safeImageSrc(item.image))
      : escAttr(PLACEHOLDER_IMG);
    var imgAltAttr =
      omitCaption && titleStr
        ? ' alt="' + escAttr(titleStr) + '"'
        : ' alt=""';

    var desc = String(item.description || "").trim();
    var descHtml = desc
      ? "<span>" + escHtml(desc) + "</span>"
      : "";

    var textBlock =
      !omitCaption && !isPartner
        ? '<div class="' +
          textClass +
          '">' +
          eyebrowHtml +
          "<strong>" +
          escHtml(item.title) +
          "</strong>" +
          descHtml +
          "</div>"
        : "";

    if (isPartner && !omitCaption) {
      var partnerLabel = desc || titleStr;
      textBlock = partnerLabel
        ? '<div class="gallery-card__text gallery-card__text--partner"><span>' +
          escHtml(partnerLabel) +
          "</span></div>"
        : "";
    }

    var hoverOverlayHtml =
      portrait && omitCaption && titleStr
        ? '<span class="gallery-card__hover" aria-hidden="true"><span class="gallery-card__hover-name">' +
          escHtml(item.title) +
          "</span></span>"
        : "";

    var mediaHtml = isPartner && !hasGalleryImage(item)
      ? '<div class="gallery-card__media gallery-card__media--empty" aria-hidden="true"></div>'
      : '<div class="gallery-card__media">' +
        '<img src="' +
        imgUrl +
        '"' +
        imgAltAttr +
        ' width="' +
        imgW +
        '" height="' +
        imgH +
        '" loading="lazy" />' +
        playHtml +
        hoverOverlayHtml +
        "</div>";

    var wrapOpen = '<div class="swiper-slide gallery-card-wrap">';
    var wrapClose = "</div>";

    if (isPartner) {
      if (linkOut) {
        return (
          wrapOpen +
          '<a class="' +
          cardClass +
          '" href="' +
          escAttr(href) +
          '"' +
          targetAttr +
          ariaLabel +
          ">" +
          mediaHtml +
          textBlock +
          "</a>" +
          wrapClose
        );
      }
      return (
        wrapOpen +
        '<div class="' +
        cardClass +
        '">' +
        mediaHtml +
        textBlock +
        "</div>" +
        wrapClose
      );
    }

    if (linkOut) {
      return (
        wrapOpen +
        '<a class="' +
        cardClass +
        '" href="' +
        escAttr(href) +
        '"' +
        targetAttr +
        ariaLabel +
        ">" +
        mediaHtml +
        textBlock +
        "</a>" +
        wrapClose
      );
    }

    if (youtubeId) {
      var videoLabel =
        ariaLabel || ' aria-label="동영상 재생"';
      return (
        wrapOpen +
        '<button type="button" class="' +
        cardClass +
        ' gallery-card--lightbox gallery-card--video" data-lightbox-type="youtube" data-youtube-id="' +
        escAttr(youtubeId) +
        '" data-lightbox-title="' +
        escAttr(titleStr) +
        '"' +
        videoLabel +
        ">" +
        mediaHtml +
        textBlock +
        "</button>" +
        wrapClose
      );
    }

    if (!item.image) {
      return (
        wrapOpen +
        '<div class="' +
        cardClass +
        ' gallery-card--static">' +
        mediaHtml +
        textBlock +
        "</div>" +
        wrapClose
      );
    }

    var lightboxLabel =
      ariaLabel || ' aria-label="이미지 크게 보기"';

    return (
      wrapOpen +
      '<button type="button" class="' +
      cardClass +
      ' gallery-card--lightbox" data-lightbox-src="' +
      escAttr(item.image) +
      '" data-lightbox-title="' +
      escAttr(titleStr) +
      '"' +
      lightboxLabel +
      ">" +
      mediaHtml +
      textBlock +
      "</button>" +
      wrapClose
    );
  }

  function renderIntoPage() {
    var store = loadRaw();
    document.querySelectorAll("[data-gallery-id]").forEach(function (el) {
      var page = el.getAttribute("data-gallery-page") || "index";
      var slot = el.getAttribute("data-gallery-id");
      if (!slot) return;
      var pageData = store.pages[page] || {};
      var list = Array.isArray(pageData[slot]) ? pageData[slot] : [];
      if (!list.length) {
        var fallback = defaultStore();
        if (
          fallback.pages[page] &&
          Array.isArray(fallback.pages[page][slot]) &&
          fallback.pages[page][slot].length
        ) {
          list = fallback.pages[page][slot];
        }
      }

      if (slot === "hero") {
        el.innerHTML = list
          .map(function (it, idx) {
            return renderHeroSlide(it, idx);
          })
          .join("");
        return;
      }

      var variant =
        el.getAttribute("data-gallery-variant") ||
        (slot === "music" && page === "index" ? "square" : "wide");
      var captionMode = el.getAttribute("data-gallery-caption") || "";
      var omitCaption = captionMode === "off";
      var html = list
        .map(function (it) {
          return renderCard(it, variant, { omitCaption: omitCaption });
        })
        .join("");
      el.innerHTML = html;
    });
    try {
      document.dispatchEvent(new CustomEvent("waves-gallery:render"));
    } catch (e) {}
  }

  function isStorageReady() {
    return storageReady;
  }

  function whenStorageReady(fn) {
    if (storageReady) {
      fn();
      return;
    }
    document.addEventListener("waves-gallery-storage-ready", fn, {
      once: true,
    });
  }

  window.WavesGallery = {
    STORAGE_KEY: STORAGE_KEY,
    STORAGE_KEY_V1: STORAGE_KEY_V1,
    DEFAULTS: INDEX_PAGE_DEFAULTS,
    INDEX_PAGE_DEFAULTS: INDEX_PAGE_DEFAULTS,
    BRAND_MARKETING_PAGE_DEFAULT_ITEMS: BRAND_MARKETING_PAGE_DEFAULT_ITEMS,
    PARTNERS_PAGE_DEFAULT_ITEMS: PARTNERS_PAGE_DEFAULT_ITEMS,
    ARTIST_MANAGEMENT_PAGE_DEFAULT_ITEMS: ARTIST_MANAGEMENT_PAGE_DEFAULT_ITEMS,
    MUSIC_PUBLISHING_PAGE_DEFAULT_ITEMS: MUSIC_PUBLISHING_PAGE_DEFAULT_ITEMS,
    ARTIST_PAGE_DEFAULTS: ARTIST_PAGE_DEFAULTS,
    ARTIST_PARK_SEO_YOUNG_PAGE_DEFAULTS: ARTIST_PARK_SEO_YOUNG_PAGE_DEFAULTS,
    ADMIN_PAGE_LIST: ADMIN_PAGE_LIST,
    load: load,
    loadRaw: loadRaw,
    loadPage: loadPage,
    save: save,
    saveStore: saveRaw,
    saveStoreAsync: saveRawAsync,
    resetToDefaults: resetToDefaults,
    normalizeAll: normalizeFlatGalleriesV1,
    normalizeItem: normalizeItem,
    hasGalleryImage: hasGalleryImage,
    PLACEHOLDER_IMG: PLACEHOLDER_IMG,
    parseYouTubeId: parseYouTubeId,
    isYouTubeVideoUrl: isYouTubeVideoUrl,
    ensurePagesShape: ensurePagesShape,
    renderIntoPage: renderIntoPage,
    isStorageReady: isStorageReady,
    whenStorageReady: whenStorageReady,
    exportDeployGalleryStore: exportDeployGalleryStore,
    reloadFromPersistentStorage: reloadFromPersistentStorage,
    SITE_GALLERY_URL: SITE_GALLERY_URL,
    GALLERY_REV_KEY: GALLERY_REV_KEY,
  };

  initGalleryRevListener();

  initGalleryStorage(function () {
    try {
      document.dispatchEvent(new CustomEvent("waves-gallery-storage-ready"));
    } catch (e) {}
  });
})();
