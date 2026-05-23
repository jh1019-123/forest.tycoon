export enum Season {
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  AUTUMN = "AUTUMN",
  WINTER = "WINTER"
}

export enum TimeOfDay {
  MORNING = "MORNING",
  DAY = "DAY",
  EVENING = "EVENING",
  NIGHT = "NIGHT"
}

export type PlayerRole = "farmer" | "fisherman" | "chef" | "merchant" | "designer";

export interface Player {
  id: string; // Peer JS connection ID or Host ID
  name: string;
  color: string;
  role: PlayerRole;
  x: number; // grid coords, or smooth canvas coords. Let's use world map float x
  y: number; // world map float y
  gold: number;
  lastActive: number;
}

export interface InventoryItem {
  type: "seed" | "crop" | "fish" | "food" | "material" | "decoration";
  key: string; // e.g., "strawberry", "tomato", "salmon", "wood", "stone", "fence"
  name: string;
  count: number;
}

export interface Crop {
  id: string;
  gridX: number;
  gridY: number;
  type: string; // "strawberry" | "tomato" | "corn" | "pumpkin"
  growthStage: number; // 0, 1, 2, 3 (grown)
  plantedAt: number; // timestamp
  lastWateredAt: number; // timestamp
  isWatered: boolean;
}

export interface PlacedDecoration {
  id: string;
  gridX: number;
  gridY: number;
  key: string; // e.g., "fence", "chair", "table", "streetlight", "flowerpot"
  color: string;
}

export interface Villager {
  id: string;
  name: string;
  species: string; // "rabbit" | "bear" | "penguin" | "squirrel"
  personality: string;
  favoriteItem: string;
  friendship: number; // 0 to 100
  gridX: number;
  gridY: number;
  targetX: number;
  targetY: number;
  emoteTimer: number;
  emoteType: "happy" | "tired" | "heart" | "sleep" | "chat" | null;
  quote: string;
}

export interface WorldState {
  timeIndex: number; // 0 to 1440 (minutes in a day)
  day: number;
  season: Season;
  weather: "sunny" | "rainy" | "snowy";
  crops: { [key: string]: Crop }; // key: "x_y"
  decorations: { [key: string]: PlacedDecoration }; // key: "x_y"
  shippingBin: InventoryItem[];
  soldRecordYesterday: { key: string; name: string; count: number; gold: number }[];
  villageLevel: number;
  villageExp: number;
}

// PeerJS Packet types
export type NetPacketType =
  | "join"
  | "sync-world"
  | "move"
  | "interact"
  | "chat"
  | "member-list"
  | "gold-sync"
  | "sound-sync";

export interface NetPacket {
  type: NetPacketType;
  senderId: string;
  senderName: string;
  payload: any;
}
