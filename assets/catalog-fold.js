(function () {
  "use strict";

  var catalogStage = document.getElementById("categories");
  var sectorList = document.getElementById("sector-list");
  var brandPrompt = document.getElementById("brand-prompt");
  var brandMeta = document.getElementById("brand-meta");
  var brandCopy = document.getElementById("brand-copy");
  var brandMarquee = document.getElementById("brand-marquee");
  var brandTrack = document.getElementById("brand-track");
  var resultsKicker = document.getElementById("results-kicker");
  var resultsHeading = document.getElementById("results-heading");
  var resultsCopy = document.getElementById("results-copy");
  var productGrid = document.getElementById("product-grid");
  var productLightbox = document.getElementById("product-lightbox");
  var lightboxMedia = document.getElementById("lightbox-media");
  var lightboxSector = document.getElementById("lightbox-sector");
  var lightboxBrand = document.getElementById("lightbox-brand");
  var lightboxPrice = document.getElementById("lightbox-price");
  var lightboxTitle = document.getElementById("lightbox-title");
  var lightboxNote = document.getElementById("lightbox-note");
  var lightboxDescription = document.getElementById("lightbox-description");
  var lightboxClose = document.getElementById("lightbox-close");

  if (!catalogStage || !sectorList || !productGrid) {
    return;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getBrandMark(brand) {
    var marks = {
      "Dior": "DIOR",
      "Chanel": "CHANEL",
      "Carolina Herrera": "212",
      "Apple": "AIR",
      "Sony": "SONY",
      "Marshall": "AMP",
      "JBL": "JBL",
      "Johnnie Walker": "JW",
      "Jack Daniel's": "JD",
      "Bombay Sapphire": "BS",
      "Corona": "SUN",
      "Lindt": "LINDT",
      "Toblerone": "TRI",
      "Pringles": "MINI",
      "Reese's": "DUO",
      "Lancome": "LAN",
      "MAC": "MAC",
      "Fenty": "FENTY",
      "Polo Ralph Lauren": "RL",
      "Tommy Hilfiger": "TH",
      "Calvin Klein": "CK",
      "Nike Sportswear": "NSW",
      "Ray-Ban": "RAY",
      "Prada": "PRA",
      "Tiffany": "ATLAS",
      "Montblanc": "MB"
    };

    return marks[brand] || String(brand || "").slice(0, 4).toUpperCase();
  }

  function bottleArt(options) {
    var bodyFill = options.body || "#243a85";
    var labelFill = options.label || "#f3e0ba";
    var capFill = options.cap || labelFill;
    var accentFill = options.accent || "#ffffff";
    var bodyPath = options.shape === "square"
      ? "M66 94H154V110C154 123 161 136 169 147C176 157 180 169 180 182V228C180 249 163 266 142 266H78C57 266 40 249 40 228V182C40 169 44 157 51 147C59 136 66 123 66 110V94Z"
      : "M74 84H146V102C146 116 152 128 162 139C171 149 176 161 176 175V228C176 249 159 266 138 266H82C61 266 44 249 44 228V175C44 161 49 149 58 139C68 128 74 116 74 102V84Z";

    return `
      <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
        <rect x="87" y="26" width="46" height="42" rx="14" fill="${capFill}" opacity="0.95"></rect>
        <rect x="95" y="10" width="30" height="24" rx="10" fill="${accentFill}" opacity="0.26"></rect>
        <path d="${bodyPath}" fill="${bodyFill}" opacity="0.96"></path>
        <path d="M70 116C82 126 96 130 110 130C124 130 138 126 150 116" stroke="${accentFill}" stroke-linecap="round" stroke-width="5" opacity="0.26"></path>
        <rect x="66" y="142" width="88" height="70" rx="18" fill="${labelFill}" opacity="0.92"></rect>
        <path d="M86 168H134" stroke="${bodyFill}" stroke-linecap="round" stroke-width="4" opacity="0.58"></path>
        <path d="M92 186H128" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.72"></path>
        <path d="M84 224C94 232 102 236 110 236C118 236 126 232 136 224" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.34"></path>
      </svg>
    `;
  }

  function boxArt(options) {
    var bodyFill = options.body || "#d5a551";
    var capFill = options.cap || "#f6e7c7";
    var accentFill = options.accent || "#ffffff";

    return `
      <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
        <path d="M56 110L110 76L164 110V204L110 238L56 204V110Z" fill="${bodyFill}" opacity="0.96"></path>
        <path d="M110 76V238" stroke="${accentFill}" stroke-opacity="0.42" stroke-width="4"></path>
        <path d="M56 110L110 144L164 110" stroke="${accentFill}" stroke-opacity="0.3" stroke-width="4"></path>
        <rect x="78" y="136" width="64" height="48" rx="14" fill="${capFill}" opacity="0.92"></rect>
        <path d="M92 160H128" stroke="${bodyFill}" stroke-linecap="round" stroke-width="5" opacity="0.58"></path>
        <path d="M84 214C95 203 104 198 110 198C116 198 125 203 136 214" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.34"></path>
      </svg>
    `;
  }

  function prismArt(options) {
    var bodyFill = options.body || "#e1b652";
    var accentFill = options.accent || "#2d1b0f";
    var sideFill = options.side || "#b8832b";

    return `
      <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
        <path d="M48 194L110 88L172 194H48Z" fill="${bodyFill}" opacity="0.97"></path>
        <path d="M110 88L140 194H172L110 88Z" fill="${sideFill}" opacity="0.92"></path>
        <path d="M72 158H140" stroke="${accentFill}" stroke-linecap="round" stroke-width="6" opacity="0.52"></path>
        <path d="M82 178H130" stroke="${accentFill}" stroke-linecap="round" stroke-width="6" opacity="0.32"></path>
      </svg>
    `;
  }

  function canArt(options) {
    var bodyFill = options.body || "#d64f45";
    var capFill = options.cap || "#f3d35c";
    var accentFill = options.accent || "#ffffff";

    return `
      <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
        <rect x="70" y="44" width="80" height="212" rx="34" fill="${bodyFill}" opacity="0.96"></rect>
        <ellipse cx="110" cy="62" rx="40" ry="14" fill="${capFill}" opacity="0.95"></ellipse>
        <ellipse cx="110" cy="236" rx="40" ry="14" fill="${capFill}" opacity="0.74"></ellipse>
        <rect x="74" y="106" width="72" height="72" rx="18" fill="${capFill}" opacity="0.92"></rect>
        <path d="M88 140H132" stroke="${bodyFill}" stroke-linecap="round" stroke-width="6" opacity="0.58"></path>
        <path d="M92 194C100 188 106 186 110 186C114 186 120 188 128 194" stroke="${accentFill}" stroke-linecap="round" stroke-width="5" opacity="0.5"></path>
      </svg>
    `;
  }

  function pouchArt(options) {
    var bodyFill = options.body || "#ec7c2b";
    var stripeFill = options.stripe || "#f8d7a7";
    var accentFill = options.accent || "#4b1908";

    return `
      <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
        <path d="M68 72H152L166 100L154 252H66L54 100L68 72Z" fill="${bodyFill}" opacity="0.96"></path>
        <path d="M82 72H138L128 98H92L82 72Z" fill="${stripeFill}" opacity="0.94"></path>
        <rect x="72" y="126" width="76" height="70" rx="20" fill="${stripeFill}" opacity="0.92"></rect>
        <path d="M90 160H130" stroke="${accentFill}" stroke-linecap="round" stroke-width="6" opacity="0.56"></path>
        <path d="M92 212C98 206 104 203 110 203C116 203 122 206 128 212" stroke="${stripeFill}" stroke-linecap="round" stroke-width="5" opacity="0.74"></path>
      </svg>
    `;
  }

  function tagArt(options) {
    var bodyFill = options.body || "#2b2f39";
    var accentFill = options.accent || "#ffffff";
    var strapFill = options.strap || "#727b88";

    return `
      <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
        <path d="M80 66H142L172 98V226C172 244 158 258 140 258H80C62 258 48 244 48 226V98C48 80 62 66 80 66Z" fill="${bodyFill}" opacity="0.96"></path>
        <circle cx="132" cy="102" r="10" fill="${strapFill}" opacity="0.92"></circle>
        <path d="M90 132H130" stroke="${accentFill}" stroke-linecap="round" stroke-width="5" opacity="0.52"></path>
        <path d="M90 154H126" stroke="${accentFill}" stroke-linecap="round" stroke-width="5" opacity="0.28"></path>
        <path d="M104 36C126 36 144 54 144 76V90" stroke="${strapFill}" stroke-linecap="round" stroke-width="8" opacity="0.86"></path>
      </svg>
    `;
  }

  function watchArt(options) {
    var caseFill = options.caseFill || "#dbe8f7";
    var dialFill = options.dialFill || "#0f1723";
    var accentFill = options.accent || "#7ec4ff";

    return `
      <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
        <rect x="86" y="26" width="48" height="62" rx="18" fill="${accentFill}" opacity="0.34"></rect>
        <rect x="86" y="212" width="48" height="62" rx="18" fill="${accentFill}" opacity="0.34"></rect>
        <circle cx="110" cy="150" r="56" fill="${caseFill}" opacity="0.96"></circle>
        <circle cx="110" cy="150" r="40" fill="${dialFill}" opacity="0.94"></circle>
        <path d="M110 122V150L126 166" stroke="${caseFill}" stroke-linecap="round" stroke-width="6"></path>
        <circle cx="110" cy="150" r="4" fill="${accentFill}" opacity="0.86"></circle>
      </svg>
    `;
  }

  function passportArt(options) {
    var bodyFill = options.body || "#163a59";
    var accentFill = options.accent || "#d7e8ff";
    var spineFill = options.spine || "#2b5883";

    return `
      <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
        <rect x="58" y="54" width="104" height="192" rx="24" fill="${bodyFill}" opacity="0.96"></rect>
        <rect x="58" y="54" width="18" height="192" rx="12" fill="${spineFill}" opacity="0.92"></rect>
        <path d="M88 110H136" stroke="${accentFill}" stroke-linecap="round" stroke-width="6" opacity="0.54"></path>
        <path d="M88 138H128" stroke="${accentFill}" stroke-linecap="round" stroke-width="6" opacity="0.26"></path>
        <circle cx="110" cy="188" r="18" stroke="${accentFill}" stroke-width="5" opacity="0.48"></circle>
        <path d="M102 188H118" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.56"></path>
      </svg>
    `;
  }

  function garmentArt(options) {
    var bodyFill = options.body || "#2d3342";
    var accentFill = options.accent || "#ffffff";
    var trimFill = options.trim || "#9da8ba";
    var variant = options.variant || "jacket";
    var collar = "";
    var detail = "";

    if (variant === "polo") {
      collar = `
        <path d="M90 72L110 92L130 72" fill="${trimFill}" opacity="0.96"></path>
        <path d="M102 82L110 104L118 82" fill="${accentFill}" opacity="0.24"></path>
      `;
      detail = `
        <path d="M110 106V228" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.38"></path>
        <path d="M92 134H128" stroke="${accentFill}" stroke-linecap="round" stroke-width="5" opacity="0.3"></path>
      `;
    } else if (variant === "hoodie") {
      collar = `
        <path d="M80 84C80 58 94 42 110 42C126 42 140 58 140 84V102H80V84Z" fill="${trimFill}" opacity="0.9"></path>
        <path d="M98 90C101 82 105 78 110 78C115 78 119 82 122 90" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.34"></path>
      `;
      detail = `
        <path d="M110 116V234" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.28"></path>
        <path d="M90 170H130" stroke="${accentFill}" stroke-linecap="round" stroke-width="5" opacity="0.24"></path>
      `;
    } else if (variant === "knit") {
      collar = `<path d="M92 78C96 70 103 66 110 66C117 66 124 70 128 78" stroke="${trimFill}" stroke-linecap="round" stroke-width="8" opacity="0.9"></path>`;
      detail = `
        <path d="M78 142H142" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.18"></path>
        <path d="M78 168H142" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.18"></path>
        <path d="M78 194H142" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.18"></path>
      `;
    } else {
      collar = `
        <path d="M88 72L110 96L132 72" fill="${trimFill}" opacity="0.96"></path>
        <path d="M104 82H116L110 104L104 82Z" fill="${accentFill}" opacity="0.2"></path>
      `;
      detail = `
        <path d="M110 102V234" stroke="${accentFill}" stroke-linecap="round" stroke-width="4" opacity="0.38"></path>
        <path d="M86 136H98" stroke="${accentFill}" stroke-linecap="round" stroke-width="5" opacity="0.22"></path>
        <path d="M122 136H134" stroke="${accentFill}" stroke-linecap="round" stroke-width="5" opacity="0.22"></path>
      `;
    }

    return `
      <svg aria-hidden="true" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
        <path d="M74 74H146L174 118L156 252H64L46 118L74 74Z" fill="${bodyFill}" opacity="0.96"></path>
        <path d="M74 74L46 118L62 132L82 110" fill="${trimFill}" opacity="0.3"></path>
        <path d="M146 74L174 118L158 132L138 110" fill="${trimFill}" opacity="0.3"></path>
        ${collar}
        ${detail}
        <path d="M82 248H138" stroke="${trimFill}" stroke-linecap="round" stroke-width="8" opacity="0.76"></path>
      </svg>
    `;
  }

  var sectorIcons = {
    "perfumery": `
      <svg aria-hidden="true" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M26 12H38"></path>
        <path d="M28 12V19"></path>
        <path d="M36 12V19"></path>
        <rect x="18" y="20" width="28" height="32" rx="9"></rect>
        <path d="M18 29C24 26.5 28.7 25.5 32 25.5C35.3 25.5 40 26.5 46 29"></path>
        <path d="M24 40C26.7 42.4 29.3 43.6 32 43.6C34.7 43.6 37.3 42.4 40 40"></path>
      </svg>
    `,
    "electronics": `
      <svg aria-hidden="true" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 33V30C18 22.8 23.8 17 31 17H33C40.2 17 46 22.8 46 30V33"></path>
        <rect x="14" y="31" width="9" height="17" rx="4.5"></rect>
        <rect x="41" y="31" width="9" height="17" rx="4.5"></rect>
        <path d="M23 39C25.6 42.4 28.5 44 32 44C35.5 44 38.4 42.4 41 39"></path>
        <path d="M49 22L52 19"></path>
      </svg>
    `,
    "drinks": `
      <svg aria-hidden="true" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 11H28V18H20V11Z"></path>
        <path d="M18 20H30V27C30 32 34 36 34 43V48C34 52 31 55 27 55H21C17 55 14 52 14 48V43C14 36 18 32 18 27V20Z"></path>
        <path d="M39 31H50L48 49H41L39 31Z"></path>
        <path d="M41 37H48"></path>
      </svg>
    `,
    "food": `
      <svg aria-hidden="true" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="18" width="34" height="28" rx="8"></rect>
        <path d="M26 18V46"></path>
        <path d="M38 18V46"></path>
        <path d="M15 32H49"></path>
        <path d="M20 14L24 18"></path>
      </svg>
    `,
    "apparel": `
      <svg aria-hidden="true" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 18C32 14.7 34.5 12 37.5 12C40.5 12 43 14.7 43 18C43 20.4 41.8 22.4 39.3 23.9L34 27"></path>
        <path d="M14 40L32 27L50 40"></path>
        <path d="M18 40H46"></path>
      </svg>
    `
  };

  var sectors = [
    {
      id: "perfumery",
      name: "Perfumaria",
      sup: "edit",
      accent: "#d7b56d",
      soft: "rgba(215, 181, 109, 0.18)",
      icon: sectorIcons.perfumery,
      description: "Fragrancias de assinatura com leitura editorial, menos volume visual e mais presenca de marca.",
      brandNote: "Dior, Chanel e Carolina Herrera atravessam a dobra como assinatura lenta de vitrine em Madison Avenue.",
      brands: [
        { name: "Dior", logoClass: "wordmark-serif wordmark-wide" },
        { name: "Chanel", logoClass: "wordmark-classic" },
        { name: "Carolina Herrera", logoClass: "wordmark-serif" }
      ],
      products: [
        {
          id: "pf1",
          brand: "Dior",
          name: "Sauvage Elixir 60ml",
          note: "ambar amadeirado",
          price: "US$ 129 info",
          description: "Leitura intensa e limpa, pensada para presentear com impacto sem perder refinamento.",
          image: "https://images.pexels.com/photos/34882894/pexels-photo-34882894.jpeg?cs=srgb&dl=pexels-christopher-welsch-leveroni-2150186467-34882894.jpg&fm=jpg",
          position: "center center",
          tone: "rgba(197, 159, 88, 0.2)",
          shape: "tall",
          radius: "38px 18px 34px 20px",
          lift: 0
        },
        {
          id: "pf2",
          brand: "Chanel",
          name: "No.5 Eau de Parfum",
          note: "floral iluminado",
          price: "US$ 118 info",
          description: "Uma presenca mais luminosa e elegante, com pegada precisa de corredor premium.",
          image: "https://images.pexels.com/photos/36226235/pexels-photo-36226235.jpeg?cs=srgb&dl=pexels-samuel-gay-820551583-36226235.jpg&fm=jpg",
          position: "center 18%",
          tone: "rgba(255, 255, 255, 0.12)",
          shape: "soft",
          radius: "24px 38px 22px 34px",
          lift: 32
        },
        {
          id: "pf3",
          brand: "Carolina Herrera",
          name: "212 Sexy Eau de Parfum",
          note: "doce noturno",
          price: "US$ 112 info",
          description: "Um perfume de atmosfera urbana, mostrado como objeto de desejo e nao como vitrine pesada.",
          image: "https://images.pexels.com/photos/17217406/pexels-photo-17217406.jpeg?cs=srgb&dl=pexels-agustina-r-street-353574760-17217406.jpg&fm=jpg",
          position: "center 24%",
          tone: "rgba(111, 142, 112, 0.18)",
          shape: "portrait",
          radius: "32px 26px 34px 18px",
          lift: 10
        },
        {
          id: "pf4",
          brand: "Dior",
          name: "Miss Dior Eau de Parfum",
          note: "floral luminoso",
          price: "US$ 124 info",
          description: "Assinatura leve com brilho contido, ideal para uma dobra que privilegia respiro e sofisticao.",
          image: "https://images.pexels.com/photos/32630385/pexels-photo-32630385.jpeg?cs=srgb&dl=pexels-fashionneedles-32630385.jpg&fm=jpg",
          position: "center 10%",
          tone: "rgba(214, 183, 110, 0.16)",
          shape: "wide",
          radius: "20px 34px 30px 24px",
          lift: 24
        }
      ]
    },
    {
      id: "electronics",
      name: "Eletros",
      sup: "sound",
      accent: "#91d4ff",
      soft: "rgba(145, 212, 255, 0.17)",
      icon: sectorIcons.electronics,
      description: "Objetos compactos para viagem, mostrados com calma visual e foco em silhueta, superficie e uso.",
      brandNote: "Apple, Sony, Marshall e JBL deslizam como wordmarks de lounge, com bastante respiro entre cada assinatura.",
      brands: [
        { name: "Apple", logoClass: "wordmark-tech" },
        { name: "Sony", logoClass: "wordmark-mono" },
        { name: "Marshall", logoClass: "wordmark-serif" },
        { name: "JBL", logoClass: "wordmark-classic" }
      ],
      products: [
        {
          id: "el1",
          brand: "Apple",
          name: "AirPods Pro Travel",
          note: "audio imersivo",
          price: "US$ 249 info",
          description: "Tecnologia de bolso com leitura limpa e framing pensado para uso em deslocamento.",
          image: "https://images.pexels.com/photos/33033055/pexels-photo-33033055.jpeg?cs=srgb&dl=pexels-regeci-33033055.jpg&fm=jpg",
          position: "center center",
          tone: "rgba(124, 203, 255, 0.18)",
          shape: "portrait",
          radius: "36px 18px 34px 24px",
          lift: 0
        },
        {
          id: "el2",
          brand: "Apple",
          name: "Apple Watch Transit",
          note: "ritmo em pulso",
          price: "US$ 279 info",
          description: "Um companion compacto, exposto de forma aspiracional e sem contaminar a dobra com ruido tecnico.",
          image: "https://images.pexels.com/photos/5081417/pexels-photo-5081417.jpeg?cs=srgb&dl=pexels-cottonbro-5081417.jpg&fm=jpg",
          position: "center center",
          tone: "rgba(150, 203, 255, 0.18)",
          shape: "wide",
          radius: "24px 40px 22px 36px",
          lift: 26
        },
        {
          id: "el3",
          brand: "Sony",
          name: "WH-1000XM5 Quiet Set",
          note: "long haul audio",
          price: "US$ 328 info",
          description: "Acabamento calmo e silencioso, tratado como objeto premium dentro de uma vitrine mais leve.",
          image: "https://images.pexels.com/photos/7772548/pexels-photo-7772548.jpeg?cs=srgb&dl=pexels-caleboquendo-7772548.jpg&fm=jpg",
          position: "center center",
          tone: "rgba(178, 124, 255, 0.16)",
          shape: "soft",
          radius: "34px 28px 36px 18px",
          lift: 12
        },
        {
          id: "el4",
          brand: "JBL",
          name: "Clip Speaker",
          note: "som de mesa",
          price: "US$ 199 info",
          description: "Forma compacta com presenca forte, apresentada mais como design object do que como item de prateleira comum.",
          image: "https://images.pexels.com/photos/18589085/pexels-photo-18589085.jpeg?cs=srgb&dl=pexels-gupta-sahil-140074270-18589085.jpg&fm=jpg",
          position: "center center",
          tone: "rgba(255, 206, 125, 0.14)",
          shape: "wide",
          radius: "26px 34px 24px 34px",
          lift: 28
        }
      ]
    },
    {
      id: "drinks",
      name: "Bebidas",
      sup: "night",
      accent: "#f0a15d",
      soft: "rgba(240, 161, 93, 0.18)",
      icon: sectorIcons.drinks,
      description: "Rotulos iconicos reinterpretados em silhuetas limpas, com o mesmo peso de uma vitrine duty free de madrugada.",
      brandNote: "Johnnie Walker, Jack Daniel's, Bombay Sapphire e Corona entram como logos tipograficas espacadas, quase flutuando no corredor.",
      brands: [
        { name: "Johnnie Walker", logoClass: "wordmark-italic" },
        { name: "Jack Daniel's", logoClass: "wordmark-classic" },
        { name: "Bombay Sapphire", logoClass: "wordmark-mono" },
        { name: "Corona", logoClass: "wordmark-serif" }
      ],
      products: [
        {
          id: "dr1",
          brand: "Johnnie Walker",
          name: "Black Label 1L",
          note: "blend encorpado",
          price: "US$ 46 info",
          description: "Garrafa de gesto inclinado e aura noturna, perfeita para uma apresentacao mais autoral do setor.",
          image: "https://images.pexels.com/photos/35326382/pexels-photo-35326382.jpeg?cs=srgb&dl=pexels-didsss-35326382.jpg&fm=jpg",
          position: "center center",
          art: bottleArt({ body: "#1c2028", label: "#e6d2a6", cap: "#b88a49", accent: "#ffffff", shape: "square" }),
          tone: "rgba(240, 161, 93, 0.2)",
          shape: "tall",
          radius: "36px 18px 32px 20px",
          lift: 18
        },
        {
          id: "dr2",
          brand: "Jack Daniel's",
          name: "Old No. 7 1L",
          note: "label iconic",
          price: "US$ 48 info",
          description: "Volume mais marcado e leitura grafica direta, sem copiar o rotulo literalmente.",
          image: "https://images.pexels.com/photos/616833/pexels-photo-616833.jpeg?cs=srgb&dl=pexels-isabella-mendes-107313-616833.jpg&fm=jpg",
          position: "center center",
          art: bottleArt({ body: "#121418", label: "#f0e9d8", cap: "#cba76e", accent: "#ffffff", shape: "square" }),
          tone: "rgba(210, 170, 121, 0.18)",
          shape: "soft",
          radius: "22px 36px 24px 34px",
          lift: 0
        },
        {
          id: "dr3",
          brand: "Bombay Sapphire",
          name: "Bombay Sapphire 750ml",
          note: "botanicos citricos",
          price: "US$ 38 info",
          description: "A garrafa entra como joia azul do corredor, com brilho contido e bastante respiro ao redor.",
          image: "https://images.pexels.com/photos/5947033/pexels-photo-5947033.jpeg?cs=srgb&dl=pexels-polina-tankilevitch-5947033.jpg&fm=jpg",
          position: "center center",
          art: bottleArt({ body: "#1f57a8", label: "#d5e6ff", cap: "#9fc1ff", accent: "#ffffff" }),
          tone: "rgba(99, 150, 255, 0.16)",
          shape: "tall",
          radius: "38px 20px 34px 24px",
          lift: 28
        },
        {
          id: "dr4",
          brand: "Corona",
          name: "Corona Extra 330ml",
          note: "fresh arrival",
          price: "US$ 19 info",
          description: "Long neck solar com leitura leve e uma energia mais aberta dentro da selecao de bebidas.",
          image: "https://images.pexels.com/photos/12907616/pexels-photo-12907616.jpeg?cs=srgb&dl=pexels-ylanite-koppens-1826990-12907616.jpg&fm=jpg",
          position: "center center",
          art: bottleArt({ body: "#d1a24b", label: "#fbf1d8", cap: "#fff3b7", accent: "#4a2b08" }),
          tone: "rgba(255, 208, 116, 0.18)",
          shape: "portrait",
          radius: "28px 34px 22px 34px",
          lift: 12
        }
      ]
    },
    {
      id: "food",
      name: "Comidas",
      sup: "gifts",
      accent: "#f0c775",
      soft: "rgba(240, 199, 117, 0.18)",
      icon: sectorIcons.food,
      description: "Snacks e gift packs entram como pequenos achados de corredor, com formas marcantes e composicao respirada.",
      brandNote: "Lindt, Toblerone, Pringles e Reese's aparecem como uma faixa suave de lembrancas de viagem, sem nenhum container pesado.",
      brands: [
        { name: "Lindt", logoClass: "wordmark-script" },
        { name: "Toblerone", logoClass: "wordmark-classic" },
        { name: "Pringles", logoClass: "wordmark-mono" },
        { name: "Reese's", logoClass: "wordmark-wide" }
      ],
      products: [
        {
          id: "fd1",
          brand: "Lindt",
          name: "Swiss Gift Selection",
          note: "gift box dourada",
          price: "US$ 28 info",
          description: "Uma caixa pensada como presente rapido, tratada aqui como objeto dourado de vitrine editorial.",
          image: "https://images.pexels.com/photos/32054000/pexels-photo-32054000.jpeg?cs=srgb&dl=pexels-banu-422109548-32054000.jpg&fm=jpg",
          position: "center center",
          art: boxArt({ body: "#caa04c", cap: "#f6e6c8", accent: "#fff7e7" }),
          tone: "rgba(240, 199, 117, 0.18)",
          shape: "soft",
          radius: "36px 24px 34px 18px",
          lift: 6
        },
        {
          id: "fd2",
          brand: "Toblerone",
          name: "Travel Chocolate Pack",
          note: "selecionado para viagem",
          price: "US$ 16 info",
          description: "Chocolate de viagem tratado como destaque leve de vitrine, mais proximo de uma mesa-curadoria do que de uma prateleira comum.",
          image: "https://images.pexels.com/photos/14456348/pexels-photo-14456348.jpeg?cs=srgb&dl=pexels-karolina-grabowska-5632371-14456348.jpg&fm=jpg",
          position: "center center",
          art: prismArt({ body: "#e0b754", side: "#bc8831", accent: "#3a220d" }),
          tone: "rgba(224, 183, 84, 0.18)",
          shape: "wide",
          radius: "22px 36px 24px 32px",
          lift: 30
        },
        {
          id: "fd3",
          brand: "Pringles",
          name: "Snack Break Crisps",
          note: "carry on snack",
          price: "US$ 12 info",
          description: "Um snack rapido de corredor, escolhido para dar contraste de textura e cor sem transformar a dobra em marketplace.",
          image: "https://images.pexels.com/photos/13428176/pexels-photo-13428176.jpeg?cs=srgb&dl=pexels-mateusz-feliksik-2142543928-13428176.jpg&fm=jpg",
          position: "center center",
          art: canArt({ body: "#cf4e3f", cap: "#f1d25a", accent: "#fff2cf" }),
          tone: "rgba(255, 132, 102, 0.16)",
          shape: "tall",
          radius: "34px 18px 30px 22px",
          lift: 14
        },
        {
          id: "fd4",
          brand: "Reese's",
          name: "Peanut Candy Mix",
          note: "sweet carry",
          price: "US$ 9 info",
          description: "Pequeno mix doce para fechar a composicao com calor cromatico e uma leitura mais casual de freeshop.",
          image: "https://images.pexels.com/photos/32054002/pexels-photo-32054002.jpeg?cs=srgb&dl=pexels-banu-422109548-32054002.jpg&fm=jpg",
          position: "center center",
          art: pouchArt({ body: "#ea7a2d", stripe: "#f8d6a8", accent: "#56210a" }),
          tone: "rgba(234, 122, 45, 0.18)",
          shape: "soft",
          radius: "24px 32px 22px 34px",
          lift: 24
        }
      ]
    },
    {
      id: "apparel",
      name: "Vestuario",
      sup: "wardrobe",
      accent: "#9fb4d8",
      soft: "rgba(159, 180, 216, 0.18)",
      icon: sectorIcons.apparel,
      description: "Pecas de viagem com corte limpo e silhueta forte, tratadas como objetos editoriais e nao como grade de loja.",
      brandNote: "Polo Ralph Lauren, Tommy Hilfiger, Calvin Klein e Nike Sportswear entram como um corredor de guarda-roupa cosmopolita, leve e aspiracional.",
      brands: [
        { name: "Polo Ralph Lauren", logoClass: "wordmark-serif" },
        { name: "Tommy Hilfiger", logoClass: "wordmark-wide" },
        { name: "Calvin Klein", logoClass: "wordmark-classic" },
        { name: "Nike Sportswear", logoClass: "wordmark-tech" }
      ],
      products: [
        {
          id: "vt1",
          brand: "Polo Ralph Lauren",
          name: "Travel Polo Midnight",
          note: "gola limpa",
          price: "US$ 86 info",
          description: "Uma polo enxuta, pensada para viagem e mostrada com a mesma calma visual de uma vitrine de downtown Manhattan.",
          image: "https://images.pexels.com/photos/9558768/pexels-photo-9558768.jpeg?cs=srgb&dl=pexels-jcproductionsdigitalart-9558768.jpg&fm=jpg",
          position: "center top",
          art: garmentArt({ variant: "polo", body: "#202f4f", trim: "#d8e2f1", accent: "#ffffff" }),
          tone: "rgba(159, 180, 216, 0.16)",
          shape: "tall",
          radius: "34px 20px 30px 24px",
          lift: 0
        },
        {
          id: "vt2",
          brand: "Tommy Hilfiger",
          name: "Downtown Bomber",
          note: "layer urbana",
          price: "US$ 119 info",
          description: "Jaqueta compacta com leitura grafica forte, apresentada como peca-objeto e sem ruido de marketplace.",
          image: "https://images.pexels.com/photos/7760256/pexels-photo-7760256.jpeg?cs=srgb&dl=pexels-pavel-danilyuk-7760256.jpg&fm=jpg",
          position: "center top",
          art: garmentArt({ variant: "jacket", body: "#1f2534", trim: "#d5d9e3", accent: "#df3f4a" }),
          tone: "rgba(117, 137, 182, 0.18)",
          shape: "soft",
          radius: "24px 36px 22px 34px",
          lift: 26
        },
        {
          id: "vt3",
          brand: "Calvin Klein",
          name: "Essential Knit Sand",
          note: "malha leve",
          price: "US$ 94 info",
          description: "Textura minimalista e leitura suave para manter o setor com postura premium e muito respiro.",
          image: "https://images.pexels.com/photos/6311611/pexels-photo-6311611.jpeg?cs=srgb&dl=pexels-kowalievska-6311611.jpg&fm=jpg",
          position: "center top",
          art: garmentArt({ variant: "knit", body: "#d9d1c3", trim: "#ffffff", accent: "#5f5a52" }),
          tone: "rgba(217, 209, 195, 0.18)",
          shape: "wide",
          radius: "30px 30px 24px 34px",
          lift: 12
        },
        {
          id: "vt4",
          brand: "Nike Sportswear",
          name: "Manhattan Hoodie",
          note: "street comfort",
          price: "US$ 102 info",
          description: "Uma silhueta casual de viagem, tratada como destaque editorial dentro da dobra e nao como card repetitivo.",
          image: "https://images.pexels.com/photos/9594667/pexels-photo-9594667.jpeg?cs=srgb&dl=pexels-ron-lach-9594667.jpg&fm=jpg",
          position: "center center",
          art: garmentArt({ variant: "hoodie", body: "#2a2f38", trim: "#aab2bf", accent: "#dfe7f5" }),
          tone: "rgba(170, 178, 191, 0.18)",
          shape: "portrait",
          radius: "36px 18px 32px 22px",
          lift: 24
        }
      ]
    }
  ];

  var featuredMix = ["pf1", "el1", "dr3", "vt2", "fd2", "pf2", "el3", "dr1", "vt4", "fd1"];
  var state = {
    sectorId: null,
    lastFocusedElement: null
  };
  var productsById = {};
  var allProducts = [];

  sectors.forEach(function (sector) {
    sector.products.forEach(function (product) {
      var enrichedProduct = Object.assign({}, product, {
        sectorId: sector.id,
        sectorName: sector.name,
        accent: sector.accent,
        accentSoft: sector.soft,
        brandMark: product.brandMark || getBrandMark(product.brand)
      });

      productsById[enrichedProduct.id] = enrichedProduct;
      allProducts.push(enrichedProduct);
    });
  });

  function getCurrentSector() {
    return sectors.find(function (sector) {
      return sector.id === state.sectorId;
    }) || null;
  }

  function setCatalogAccent(sector) {
    var accent = sector ? sector.accent : "#8faeff";
    var soft = sector ? sector.soft : "rgba(143, 174, 255, 0.16)";
    catalogStage.style.setProperty("--catalog-accent", accent);
    catalogStage.style.setProperty("--catalog-accent-soft", soft);
  }

  function getVisibleProducts() {
    if (!state.sectorId) {
      return featuredMix.map(function (id) {
        return productsById[id];
      }).filter(Boolean);
    }

    return allProducts.filter(function (product) {
      return product.sectorId === state.sectorId;
    });
  }

  function createMediaMarkup(product, isLightbox) {
    var loadingAttr = isLightbox ? "" : ' loading="lazy" decoding="async"';
    if (product.image) {
      return `<img alt="${escapeHtml(product.name)}" src="${escapeHtml(product.image)}" style="object-position:${product.position || "center center"};"${loadingAttr} />`;
    }

    if (product.art) {
      return `<div class="product-illustration">${product.art}</div>`;
    }

    return "";
  }

  function renderSectors() {
    sectorList.innerHTML = sectors.map(function (sector, index) {
      var isActive = state.sectorId === sector.id;
      return `
        <button
          aria-label="Selecionar ${escapeHtml(sector.name)}"
          aria-pressed="${isActive ? "true" : "false"}"
          class="sector-pill${isActive ? " is-active" : ""}"
          data-sector-id="${sector.id}"
          style="--delay:${(index * 0.05).toFixed(2)}s"
          type="button"
        >
          <span aria-hidden="true" class="sector-icon">${sector.icon}</span>
          <span class="sector-name">${escapeHtml(sector.name)}</span>
        </button>
      `;
    }).join("");
  }

  function renderBrands() {
    var sector = getCurrentSector();

    if (!sector) {
      if (brandPrompt) {
        brandPrompt.hidden = false;
      }
      if (brandMeta) {
        brandMeta.hidden = true;
      }
      if (brandMarquee) {
        brandMarquee.hidden = true;
      }
      if (brandTrack) {
        brandTrack.innerHTML = "";
      }
      return;
    }

    if (brandPrompt) {
      brandPrompt.hidden = true;
    }
    if (brandMeta) {
      brandMeta.hidden = false;
    }
    if (brandMarquee) {
      brandMarquee.hidden = false;
    }
    if (brandCopy) {
      brandCopy.textContent = sector.brandNote;
    }
    if (brandTrack) {
      var brandMarkup = sector.brands.map(function (brand) {
        return `<span class="brand-wordmark ${brand.logoClass || ""}">${escapeHtml(brand.name)}</span>`;
      }).join("");

      brandTrack.innerHTML = [0, 1, 2, 3].map(function (index) {
        return `<span class="brand-lane"${index > 0 ? ' aria-hidden="true"' : ""}>${brandMarkup}</span>`;
      }).join("");
      brandTrack.style.animationDuration = Math.max(34, sector.brands.length * 8) + "s";
    }
  }

  function renderResults(products) {
    var sector = getCurrentSector();

    if (!sector) {
      if (resultsKicker) {
        resultsKicker.textContent = sectors.length + " setores / best sellers";
      }
      if (resultsHeading) {
        resultsHeading.textContent = "Produtos para descobrir";
      }
      if (resultsCopy) {
        resultsCopy.textContent = "Antes de escolher um corredor, a dobra mistura os itens mais pedidos para manter descoberta, movimento e uma leitura menos previsivel.";
      }
      return;
    }

    if (resultsKicker) {
      resultsKicker.textContent = products.length + " itens / " + sector.sup;
    }
    if (resultsHeading) {
      resultsHeading.textContent = sector.name;
    }
    if (resultsCopy) {
      resultsCopy.textContent = sector.description;
    }
  }

  function renderProducts() {
    var products = getVisibleProducts();
    renderResults(products);

    productGrid.innerHTML = products.map(function (product, index) {
      return `
        <button
          aria-label="Abrir ${escapeHtml(product.name)}"
          class="product-node"
          data-product-id="${product.id}"
          style="--delay:${(index * 0.06).toFixed(2)}s; --lift:${product.lift || 0}px; --product-tone:${product.tone}; --figure-radius:${product.radius || "34px 20px 30px 20px"};"
          type="button"
        >
          <span class="product-figure" data-shape="${product.shape || "portrait"}">
            ${createMediaMarkup(product, false)}
            <span class="product-brand-mark">${escapeHtml(product.brandMark)}</span>
          </span>
          <span class="product-copy">
            <span class="product-brand">${escapeHtml(product.brand)}</span>
            <span class="product-name">${escapeHtml(product.name)}</span>
            <span class="product-note">${escapeHtml(product.note)}</span>
          </span>
          <span class="product-price">${escapeHtml(product.price)}</span>
        </button>
      `;
    }).join("");
  }

  function openLightbox(product, trigger) {
    if (!productLightbox || !lightboxMedia) {
      return;
    }

    state.lastFocusedElement = trigger || document.activeElement;
    productLightbox.style.setProperty("--catalog-accent", product.accent || "#8faeff");
    productLightbox.style.setProperty("--catalog-accent-soft", product.accentSoft || "rgba(143, 174, 255, 0.16)");
    lightboxMedia.innerHTML = createMediaMarkup(product, true) + `<span class="product-brand-mark lightbox-watermark">${escapeHtml(product.brandMark)}</span>`;

    if (lightboxSector) {
      lightboxSector.textContent = product.sectorName + " / editorial selection";
    }
    if (lightboxBrand) {
      lightboxBrand.textContent = product.brand;
    }
    if (lightboxPrice) {
      lightboxPrice.textContent = product.price;
    }
    if (lightboxTitle) {
      lightboxTitle.textContent = product.name;
    }
    if (lightboxNote) {
      lightboxNote.textContent = product.note;
    }
    if (lightboxDescription) {
      lightboxDescription.textContent = product.description;
    }

    productLightbox.classList.add("is-open");
    productLightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    if (lightboxClose) {
      lightboxClose.focus();
    }
  }

  function closeLightbox() {
    if (!productLightbox || !productLightbox.classList.contains("is-open")) {
      return;
    }

    productLightbox.classList.remove("is-open");
    productLightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === "function") {
      state.lastFocusedElement.focus();
    }
  }

  function renderCatalog() {
    setCatalogAccent(getCurrentSector());
    renderSectors();
    renderBrands();
    renderProducts();
  }

  sectorList.addEventListener("click", function (event) {
    var target = event.target.closest("[data-sector-id]");
    if (!target) {
      return;
    }

    var nextSectorId = target.getAttribute("data-sector-id");
    state.sectorId = state.sectorId === nextSectorId ? null : nextSectorId;
    renderCatalog();
  });

  productGrid.addEventListener("click", function (event) {
    var target = event.target.closest("[data-product-id]");
    if (!target) {
      return;
    }

    var productId = target.getAttribute("data-product-id");
    if (productsById[productId]) {
      openLightbox(productsById[productId], target);
    }
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", function () {
      closeLightbox();
    });
  }

  if (productLightbox) {
    productLightbox.addEventListener("click", function (event) {
      if (event.target && event.target.hasAttribute("data-close-lightbox")) {
        closeLightbox();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });

  renderCatalog();
}());
