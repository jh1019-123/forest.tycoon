import { InventoryItem } from "./types";

export interface ItemProfile {
  key: string;
  name: string;
  type: "seed" | "crop" | "fish" | "food" | "material" | "decoration";
  buyPrice: number;
  sellPrice: number;
  description: string;
  stageSteps?: number; // For seeds/crops (growth rate speed boost)
}

// Full catalogue databases of Forest Tycoon
export const ITEM_PROFILES: { [key: string]: ItemProfile } = {
  // Seeds
  strawberry_seed: {
    key: "strawberry_seed",
    name: "딸기 씨앗",
    type: "seed",
    buyPrice: 15,
    sellPrice: 5,
    description: "새콤달콤한 딸기가 자라는 씨앗. (성장 완료까지 3회 물주기)",
    stageSteps: 3,
  },
  tomato_seed: {
    key: "tomato_seed",
    name: "토마토 씨앗",
    type: "seed",
    buyPrice: 20,
    sellPrice: 8,
    description: "탱글탱글 탐스러운 빨간 토마토가 자라는 씨앗. (성장 완료까지 4회 물주기)",
    stageSteps: 4,
  },
  corn_seed: {
    key: "corn_seed",
    name: "옥수수 씨앗",
    type: "seed",
    buyPrice: 30,
    sellPrice: 12,
    description: "키가 크고 알이 꽉 찬 옥수수가 자라는 씨앗. (성장 완료까지 5회 물주기)",
    stageSteps: 5,
  },
  pumpkin_seed: {
    key: "pumpkin_seed",
    name: "호박 씨앗",
    type: "seed",
    buyPrice: 50,
    sellPrice: 20,
    description: "동그랗고 큼직한 가을 노랑 호박 씨앗. (성장 완료까지 6회 물주기)",
    stageSteps: 6,
  },

  // Crops
  strawberry: {
    key: "strawberry",
    name: "딸기",
    type: "crop",
    buyPrice: 0,
    sellPrice: 45,
    description: "갓 수확한 싱싱하고 달콤한 밭 딸기.",
  },
  tomato: {
    key: "tomato",
    name: "토마토",
    type: "crop",
    buyPrice: 0,
    sellPrice: 65,
    description: "붉은 햇살을 가득 머금은 아삭아삭 토마토.",
  },
  corn: {
    key: "corn",
    name: "옥수수",
    type: "crop",
    buyPrice: 0,
    sellPrice: 90,
    description: "고소한 버터구이가 제격인 노란 초당 옥수수.",
  },
  pumpkin: {
    key: "pumpkin",
    name: "노란 호박",
    type: "crop",
    buyPrice: 0,
    sellPrice: 160,
    description: "마을 축제 때 널리 쓰이는 풍성하고 무거운 가을 호박.",
  },

  // Fishes
  carp: {
    key: "carp",
    name: "붕어",
    type: "fish",
    buyPrice: 0,
    sellPrice: 25,
    description: "강물에서 흔히 볼 수 있는 소박한 민물 붕어.",
  },
  salmon: {
    key: "salmon",
    name: "강 연어",
    type: "fish",
    buyPrice: 0,
    sellPrice: 80,
    description: "흐르는 푸른 강물을 거슬러 오르는 싱싱한 강 연어.",
  },
  snapper: {
    key: "snapper",
    name: "도미",
    type: "fish",
    buyPrice: 0,
    sellPrice: 150,
    description: "깊고 찬 바닷가 해안가에서 잡히는 붉은 도미.",
  },
  tuna: {
    key: "tuna",
    name: "참다랑어",
    type: "fish",
    buyPrice: 0,
    sellPrice: 300,
    description: "여름철 밤바다 깊은 심해에서 낚이는 대형 돗돔급 참다랑어.",
  },

  // Materials
  wood: {
    key: "wood",
    name: "튼튼한 원목",
    type: "material",
    buyPrice: 10,
    sellPrice: 4,
    description: "나무를 베어 얻은 아주 단단한 통나무.",
  },
  stone: {
    key: "stone",
    name: "단단한 바위돌",
    type: "material",
    buyPrice: 10,
    sellPrice: 4,
    description: "돌밭을 캐서 가공한 다용도 건축용 주춧돌.",
  },

  // Foods (Chef special recipes crafted via cooking bonfire)
  strawberry_jam: {
    key: "strawberry_jam",
    name: "딸기잼 토스트",
    type: "food",
    buyPrice: 0,
    sellPrice: 110,
    description: "신선한 딸기를 졸여 만든 잼을 얹은 따스한 토스트.",
  },
  tomato_soup: {
    key: "tomato_soup",
    name: "토마토 스튜 따끈탕",
    type: "food",
    buyPrice: 0,
    sellPrice: 140,
    description: "몸 속까지 사르르 녹여주는 보글보글 매콤 토마토 스프.",
  },
  popcorn: {
    key: "popcorn",
    name: "수제 허니 버터 팝콘",
    type: "food",
    buyPrice: 0,
    sellPrice: 190,
    description: "옥수수를 튀겨 달콤짭쪼름한 허니버터 소스를 묻힌 별미.",
  },
  pumpkin_pie: {
    key: "pumpkin_pie",
    name: "황금 단호박 수제 파이",
    type: "food",
    buyPrice: 0,
    sellPrice: 350,
    description: "잘 오븐된 가을 향기 가득 품은 황금 단호박 디저트 파이.",
  },

  // Decorations
  fence: {
    key: "fence",
    name: "목재 울타리",
    type: "decoration",
    buyPrice: 30,
    sellPrice: 10,
    description: "구획을 안락하게 나눠주는 클래식 목재 펜스.",
  },
  chair: {
    key: "chair",
    name: "통나무 의자",
    type: "decoration",
    buyPrice: 50,
    sellPrice: 15,
    description: "앉아서 쉴 수 있는 따뜻한 감각의 통나무 원통형 이지 체어.",
  },
  table: {
    key: "table",
    name: "돌 바위 테이블",
    type: "decoration",
    buyPrice: 80,
    sellPrice: 25,
    description: "야외 바베큐 파티나 다도를 즐기기 좋은 튼튼한 돌 탁자.",
  },
  flowerpot: {
    key: "flowerpot",
    name: "민들레 정원 화분",
    type: "decoration",
    buyPrice: 40,
    sellPrice: 12,
    description: "사시사철 노란 꽃이 은은히 고개를 흔드는 점토 화분.",
  },
  streetlight: {
    key: "streetlight",
    name: "안락 가로등",
    type: "decoration",
    buyPrice: 120,
    sellPrice: 40,
    description: "밤이 되면 주위를 따스하고 은은한 주황 전구빛으로 채워주는 램프.",
  },
};

// Craft recipes
export interface CraftRecipe {
  resultKey: string;
  name: string;
  woodNeeded: number;
  stoneNeeded: number;
  goldNeeded: number;
  description: string;
}

export const CRAFT_RECIPES: CraftRecipe[] = [
  {
    resultKey: "fence",
    name: "목재 울타리",
    woodNeeded: 3,
    stoneNeeded: 0,
    goldNeeded: 5,
    description: "마당 정문용 울타리를 손쉽게 엮어 제작합니다.",
  },
  {
    resultKey: "chair",
    name: "통나무 의자",
    woodNeeded: 5,
    stoneNeeded: 1,
    goldNeeded: 10,
    description: "목백합 나무를 깎아 안락한 소형 원목 체어를 만듭니다.",
  },
  {
    resultKey: "table",
    name: "돌 바위 테이블",
    woodNeeded: 4,
    stoneNeeded: 8,
    goldNeeded: 25,
    description: "평평히 다듬은 바위 상판에 받침대를 부착합니다.",
  },
  {
    resultKey: "flowerpot",
    name: "민들레 정원 화분",
    woodNeeded: 2,
    stoneNeeded: 2,
    goldNeeded: 15,
    description: "노란 아기꽃이 소박하게 잠든 테라코타 화분입니다.",
  },
  {
    resultKey: "streetlight",
    name: "안락 가로등",
    woodNeeded: 8,
    stoneNeeded: 5,
    goldNeeded: 50,
    description: "밤마실을 비춰줄 따스한 야외 원목 조명을 수공예 제작합니다.",
  },
];

// Cooking recipes
export interface CookingRecipe {
  resultKey: string;
  name: string;
  ingredients: { key: string; count: number }[];
  description: string;
}

export const COOKING_RECIPES: CookingRecipe[] = [
  {
    resultKey: "strawberry_jam",
    name: "딸기잼 토스트",
    ingredients: [{ key: "strawberry", count: 2 }, { key: "wood", count: 1 }], // needs a tiny bit of wood for firewood
    description: "달콤 달기 2개로 맛깔뜨끈 달달구리 토스트 한 장 요리하기.",
  },
  {
    resultKey: "tomato_soup",
    name: "토마토 스튜 따끈탕",
    ingredients: [{ key: "tomato", count: 2 }, { key: "stone", count: 1 }], // stones to hold cooking heat
    description: "신선한 빨강 토마토 2알로 보글보글 한 솥 푸짐하게 끓이기.",
  },
  {
    resultKey: "popcorn",
    name: "수제 허니 버터 팝콘",
    ingredients: [{ key: "corn", count: 2 }, { key: "wood", count: 2 }],
    description: "강불 오븐에 노란 옥수수 2개를 넣고 팡팡 팝콘으로 승화하기.",
  },
  {
    resultKey: "pumpkin_pie",
    name: "황금 단호박 수제 파이",
    ingredients: [{ key: "pumpkin", count: 1 }, { key: "wood", count: 3 }],
    description: "단호박 1덩이를 잘잘히 쪄서 고풍스럽고 바삭한 가을 파이 굽기.",
  },
];

// Static Map Generation
// 0: Water, 1: Grass, 2: Sand, 3: Wooden Platform/Bridge, 4: Dirt / Farming grid
export const GRID_COLS = 20;
export const GRID_ROWS = 20;

export function generateInitialMap(): number[][] {
  const map: number[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const row: number[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      // Default lush grass
      let tile = 1;

      // Beach at top rows (rows 0-1)
      if (r <= 1) {
        tile = 0; // Deep Sea
      } else if (r === 2) {
        tile = 2; // Sand coastline
      } else if (r === 3 && c % 3 === 0) {
        tile = 2; // Sandy dunes patches
      }

      // Winding river flowing top to bottom
      // High-to-low curve: col starts around 5 at r=3, swings right to 13, then goes towards bottom-left
      const riverCol = Math.floor(6 + 4 * Math.sin(r * 0.45));
      if (r > 1) {
        if (c === riverCol || c === riverCol + 1) {
          tile = 0; // River stream
        }
        // Build bridges so player is never locked
        if (r === 7 && (c === riverCol || c === riverCol + 1)) {
          tile = 3; // Horizontal Bridge 1
        }
        if (r === 15 && (c === riverCol || c === riverCol + 1)) {
          tile = 3; // Horizontal Bridge 2
        }
      }

      // Dedicated gardening plots fields at bottom-right
      if (r >= 12 && r <= 16 && c >= 14 && c <= 17) {
        if (tile === 1) {
          tile = 4; // Farm tilled soil patches
        }
      }

      row.push(tile);
    }
    map.push(row);
  }
  return map;
}

// Initial placements of interactive nodes (Trees and Rocks)
export interface ResourceNode {
  id: string;
  type: "tree" | "rock";
  gridX: number;
  gridY: number;
  lives: number; // For chopping clicks
  maxLives: number;
}

export function getInitialResources(): ResourceNode[] {
  const nodes: ResourceNode[] = [
    // Left forest
    { id: "tree_1", type: "tree", gridX: 2, gridY: 5, lives: 3, maxLives: 3 },
    { id: "tree_2", type: "tree", gridX: 3, gridY: 8, lives: 3, maxLives: 3 },
    { id: "tree_3", type: "tree", gridX: 1, gridY: 13, lives: 3, maxLives: 3 },
    { id: "tree_4", type: "tree", gridX: 4, gridY: 16, lives: 3, maxLives: 3 },
    { id: "tree_5", type: "tree", gridX: 2, gridY: 18, lives: 3, maxLives: 3 },

    // Stone quarries on right
    { id: "rock_1", type: "rock", gridX: 18, gridY: 4, lives: 4, maxLives: 4 },
    { id: "rock_2", type: "rock", gridX: 19, gridY: 8, lives: 4, maxLives: 4 },
    { id: "rock_3", type: "rock", gridX: 13, gridY: 10, lives: 4, maxLives: 4 },
    { id: "rock_4", type: "rock", gridX: 18, gridY: 17, lives: 4, maxLives: 4 },
    { id: "rock_5", type: "rock", gridX: 14, gridY: 19, lives: 4, maxLives: 4 },
  ];
  return nodes;
}

// Animal Villager NPC Data templates
export interface VillagerTemplate {
  name: string;
  species: "rabbit" | "bear" | "penguin" | "squirrel";
  personality: string;
  favoriteItem: string;
  quotes: string[];
}

export const VILLAGER_TEMPLATES: VillagerTemplate[] = [
  {
    name: "루나 (Luna)",
    species: "rabbit",
    personality: "수줍음 많고 친절한",
    favoriteItem: "strawberry",
    quotes: [
      "안녕...? 봄바람이 꽃잎을 물들이고 있어. 딸기 향기가 너무 달콤해...",
      "꽃들에게 매일 아침 말을 걸어주면, 더 아름답게 활짝 웃어준답니다.",
      "선착장 옆에서 피어나는 들꽃을 가장 좋아해요... 너도 같이 볼래?",
    ]
  },
  {
    name: "보리 (Barnaby)",
    species: "bear",
    personality: "느긋하고 호탕한 식도락가",
    favoriteItem: "pumpkin_pie",
    quotes: [
      "크하하! 오늘 아침 베이커리 냄새 끝내주는데! 배에서 꼬르륵 소리가 나잖아!",
      "열심히 일했으면 빵빵하게 먹어야지! 따스한 단호박 파이 하나면 세상이 행복해져~",
      "마을 광장이 널찍해서 낮잠 자기 딱 좋단 말이지. 쿨쿨...",
    ]
  },
  {
    name: "펭구 (Pippin)",
    species: "penguin",
    personality: "자신감 넘치는 낚시 고수",
    favoriteItem: "snapper",
    quotes: [
      "헤이 아미고! 낚시는 손끝의 우주를 낚아채는 대예술이라구! 날 따라올 수 있겠나?",
      "깊은 바위 연안에 붉은 도미가 자주 지나다녀! 찌가 잠기면 즉시 채어야 해!",
      "오늘도 바다가 푸르러 기분이 최고야! 파도 소리에 맞춰 춤이라도 출까?",
    ]
  },
  {
    name: "단풍이 (Maple)",
    species: "squirrel",
    personality: "연구 지적인 영리한 도토리 수집가",
    favoriteItem: "wood",
    quotes: [
      "토양 질량과 수분 축적량에 따르면 오늘 농사가 풍작일 확률은 무려 94.2%야!",
      "가구 공예에 흥미가 있다면 원목과 바위를 단단히 엮는 게 기초랍니다.",
      "마을 가로등 아래에서 일지를 작성하면 감성 전력 효율이 최고조에 달하지!",
    ]
  }
];
