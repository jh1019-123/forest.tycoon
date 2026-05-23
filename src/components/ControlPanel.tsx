import React, { useState } from "react";
import { InventoryItem, Player, PlayerRole } from "../types";
import { ITEM_PROFILES, ItemProfile, CRAFT_RECIPES, CRAFT_RECIPES as CraftBlueprint, COOKING_RECIPES } from "../gameData";
import { ShoppingBag, Hammer, Compass, Users, MessageSquare, Send, BookOpen, AlertCircle, Sparkles } from "lucide-react";

interface ControlPanelProps {
  inventory: InventoryItem[];
  selectedItem: InventoryItem | null;
  onSelectItem: (item: InventoryItem | null) => void;
  gold: number;
  role: PlayerRole;
  players: Player[];
  logs: { msg: string; type: "info" | "success" | "error"; time: string }[];
  roomId: string;
  isHost: boolean;
  onSellItem: (itemKey: string, quantity: number) => void;
  onBuyItem: (itemKey: string) => void;
  onCraftItem: (recipeKey: string) => void;
  onCookItem: (recipeKey: string) => void;
  onUpgradeTown: (facilityKey: string) => void;
  villageUpgrades: string[];
  chatMessages: { sender: string; text: string; time: string }[];
  onSendChat: (text: string) => void;
  onUseItem: (item: InventoryItem) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  inventory,
  selectedItem,
  onSelectItem,
  gold,
  role,
  players,
  logs,
  roomId,
  isHost,
  onSellItem,
  onBuyItem,
  onCraftItem,
  onCookItem,
  onUpgradeTown,
  villageUpgrades,
  chatMessages,
  onSendChat,
  onUseItem,
}) => {
  const [activeTab, setActiveTab] = useState<"backpack" | "shop" | "forge" | "upgrades" | "coop">("backpack");
  const [chatIn, setChatIn] = useState("");

  const getInventoryCount = (key: string): number => {
    return inventory.find((i) => i.key === key)?.count || 0;
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatIn.trim()) return;
    onSendChat(chatIn.trim());
    setChatIn("");
  };

  // Upgrades list
  const facilities = [
    {
      key: "hotspring",
      name: "♨️ 유황 테라피 온천지",
      costGold: 1000,
      woodNeeded: 20,
      stoneNeeded: 20,
      description: "마을 서쪽에 온천탕을 만듭니다. 목욕 가운을 입은 관광 온천객이 소환되어 팁을 지불합니다.",
      tip: "소환율 +40%, 마사지 벤치 추가"
    },
    {
      key: "hotel",
      name: "🏨 아늑한 돌길 펜션 호텔",
      costGold: 2000,
      woodNeeded: 45,
      stoneNeeded: 30,
      description: "동쪽에 고풍스런 통나무 펜션을 개장합니다. 부유한 귀족 관광객이 스폰되어 농작물을 고가에 구매합니다.",
      tip: "전체 품목 판매 차익 +20% 증가"
    },
    {
      key: "port",
      name: "🚢 선착장 블루 마리나 항구",
      costGold: 3500,
      woodNeeded: 60,
      stoneNeeded: 50,
      description: "바다 쪽에 대형 요트 항구를 신축합니다. 희귀 크라켄 및 원양어가 물가 연안에 스폰되어 낚을 기회가 활짝 열립니다.",
      tip: "원양어 참다랑어(Tuna) 낚시 확률 증진"
    },
  ];

  return (
    <div className="w-full lg:w-96 bg-[#212f1b] border-t-4 lg:border-t-0 lg:border-l-4 border-[#324527] flex flex-col h-[600px] lg:h-full" id="control-panel">
      {/* Navigation tabs */}
      <div className="grid grid-cols-5 bg-[#172213] border-b-2 border-[#2b3c22]">
        {[
          { id: "backpack", label: "배낭", icon: <ShoppingBag size={16} /> },
          { id: "shop", label: "상점", icon: <Sparkles size={16} /> },
          { id: "forge", label: "제작", icon: <Hammer size={16} /> },
          { id: "upgrades", label: "확장", icon: <Compass size={16} /> },
          { id: "coop", label: "채팅", icon: <Users size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition relative ${
              activeTab === tab.id
                ? "bg-[#212f1b] text-[#9fc78f]"
                : "text-[#7b9176] hover:bg-[#1f2d1a] hover:text-[#cfd4c5]"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#8cba80]"></span>
            )}
          </button>
        ))}
      </div>

      {/* Tab body content */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        
        {/* BACKPACK TAB */}
        {activeTab === "backpack" && (
          <div className="space-y-4 animate-pop">
            <div className="flex justify-between items-center bg-[#172213] p-2.5 rounded-lg border border-[#2b3c22]">
              <span className="text-xs text-[#a1b399] font-bold">인벤토리 수량</span>
              <span className="text-xs text-white font-mono">{inventory.filter(i => i.count > 0).length} / 20칸</span>
            </div>

            {inventory.filter((i) => i.count > 0).length === 0 ? (
              <div className="text-center py-12 text-[#798e72]">
                <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
                <p className="text-sm font-medium">배낭이 텅 비어 있습니다.</p>
                <p className="text-[10px] mt-1 text-[#61745b]">풀을 나무로 베고 자원을 캐거나 상점에서 씨앗을 구매해 보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {inventory
                  .filter((item) => item.count > 0)
                  .map((item) => {
                    const prof = ITEM_PROFILES[item.key];
                    const isEquipped = selectedItem?.key === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => onSelectItem(isEquipped ? null : item)}
                        className={`aspect-square p-1 rounded-xl transition flex flex-col items-center justify-between border relative ${
                          isEquipped
                            ? "bg-[#3d5933] border-[#8cba80] shadow-md scale-95"
                            : "bg-[#182315] border-[#2d3e28] hover:bg-[#1c2c19]"
                        }`}
                      >
                        {/* Cozy symbol indicator or letters */}
                        <div className="w-8 h-8 rounded-lg bg-[#243521] flex items-center justify-center text-xl relative shadow-inner">
                          {item.type === "seed" && "🌱"}
                          {item.type === "crop" && (item.key === "strawberry" ? "🍓" : item.key === "tomato" ? "🍅" : item.key === "corn" ? "🌽" : "🎃")}
                          {item.type === "fish" && (item.key === "carp" ? "🐟" : item.key === "salmon" ? "🍣" : item.key === "snapper" ? "🐠" : "🐳")}
                          {item.type === "material" && (item.key === "wood" ? "🪵" : "🪨")}
                          {item.type === "food" && "🍛"}
                          {item.type === "decoration" && (item.key === "fence" ? "🪵" : item.key === "streetlight" ? "💡" : "🪴")}
                        </div>
                        <span className="text-[10px] font-bold text-[#dde2db] truncate max-w-full text-center px-0.5">{item.name}</span>
                        <span className="absolute top-1 right-1 bg-[#2e4228] border border-[#445f3c] text-white text-[9px] font-mono px-1 rounded-md">
                          {item.count}
                        </span>
                      </button>
                    );
                  })}
              </div>
            )}

            {/* Selected item desk */}
            {selectedItem && (
              <div className="bg-[#182315] border-2 border-[#3d5933] rounded-xl p-3 space-y-2.5 animate-pop">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-[#8cba80]">{selectedItem.name}</h3>
                    <p className="text-[10px] text-[#7c9176] mt-0.5 font-mono">분류: {selectedItem.type.toUpperCase()}</p>
                  </div>
                  <button onClick={() => onSelectItem(null)} className="text-[#7c9176] hover:text-white text-xs">&times;</button>
                </div>
                <p className="text-xs text-[#bac5b8] leading-relaxed bg-[#11190f] p-2 rounded border border-[#23331e]">
                  {ITEM_PROFILES[selectedItem.key]?.description || "소박한 아이작입니다."}
                </p>

                <div className="flex gap-2 pt-1">
                  {selectedItem.type === "seed" && (
                    <button
                      onClick={() => onUseItem(selectedItem)}
                      className="flex-1 py-1.5 bg-[#4c7c3c] hover:bg-[#5b9549] text-white text-[11px] font-bold rounded-lg transition"
                    >
                      밭 흙에 파종하기 🌱
                    </button>
                  )}
                  {selectedItem.type === "decoration" && (
                    <button
                      onClick={() => onUseItem(selectedItem)}
                      className="flex-1 py-1.5 bg-[#f4a261] hover:bg-[#f6b27e] text-[#1b2416] text-[11px] font-bold rounded-lg transition animate-pulse"
                    >
                      마당 배치 모드 🛠️
                    </button>
                  )}
                  {selectedItem.type === "food" && (
                    <button
                      onClick={() => onUseItem(selectedItem)}
                      className="flex-1 py-1.5 bg-[#9c5a3c] hover:bg-[#b56b49] text-white text-[11px] font-bold rounded-lg transition"
                    >
                      맛있게 먹기 (보너스 수령) 😋
                    </button>
                  )}
                  {(selectedItem.type === "crop" || selectedItem.type === "fish" || selectedItem.type === "material") && (
                    <button
                      onClick={() => onSellItem(selectedItem.key, 1)}
                      className="flex-1 py-1.5 bg-[#a33737] hover:bg-[#be4343] text-white text-[11px] font-bold rounded-lg transition"
                    >
                      상점에 1개 즉시 판매 💵
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SHOP TAB */}
        {activeTab === "shop" && (
          <div className="space-y-4 animate-pop">
            <div className="bg-[#172213] p-3 rounded-lg border border-[#2b3c22] flex justify-between items-center">
              <div>
                <span className="text-xs text-[#a1b399] font-bold">할인 혜택 현황</span>
                <p className="text-[10px] text-[#7c9176] mt-0.5">상인(Merchant)은 50% 세일 적용!</p>
              </div>
              <span className="text-white text-xs font-bold font-mono">
                {role === "merchant" ? "50% 적용 중 🔥" : "할인 없음"}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#8cba80] tracking-wider uppercase">농가 파종용 씨앗 판매</h3>
              {[
                "strawberry_seed",
                "tomato_seed",
                "corn_seed",
                "pumpkin_seed",
              ].map((key) => {
                const item = ITEM_PROFILES[key];
                if (!item) return null;
                const buyPrice = role === "merchant" ? Math.floor(item.buyPrice * 0.5) : item.buyPrice;
                return (
                  <div key={key} className="bg-[#182315] border border-[#2d3e28] rounded-xl p-3 flex justify-between items-center hover:border-[#3d5933] transition">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>🌱 {item.name}</span>
                        <span className="text-[9px] bg-[#23341e] text-[#a1b399] px-1 rounded">씨앗</span>
                      </div>
                      <div className="text-[10px] text-[#71856b] mt-0.5">{item.description}</div>
                    </div>
                    <button
                      disabled={gold < buyPrice}
                      onClick={() => onBuyItem(key)}
                      className="px-2.5 py-1.5 bg-[#4c7c3c] hover:bg-[#5b9549] disabled:opacity-30 disabled:hover:bg-[#4c7c3c] text-white text-[11px] font-bold rounded-lg transition shrink-0"
                    >
                      {buyPrice}G 구매
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Sells helper */}
            <div className="pt-3 border-t border-[#30442a] space-y-2">
              <h3 className="text-xs font-bold text-[#8cba80] tracking-wider">가공 소장품 즉시 단매</h3>
              <p className="text-[10px] text-[#71856b]">가방에 담긴 농작물, 밤 낚시 물고기 등을 상점에 원클릭 처분하여 즉전 골드로 환원합니다.</p>
              <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5">
                {inventory
                  .filter((item) => (item.type === "crop" || item.type === "fish" || item.type === "material") && item.count > 0)
                  .map((item) => {
                    const prof = ITEM_PROFILES[item.key];
                    if (!prof) return null;
                    return (
                      <div key={item.key} className="text-xs bg-[#121c10] border border-[#1e2e1a] p-2 rounded-lg flex justify-between items-center">
                        <span className="text-slate-100 font-medium">{item.name} x{item.count}</span>
                        <button
                          onClick={() => onSellItem(item.key, item.count)}
                          className="px-2 py-0.5 bg-[#a33737] text-white hover:bg-red-700 text-[10px] rounded transition"
                        >
                          전부 판매 (+{prof.sellPrice * item.count}G)
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* FORGE TAB */}
        {activeTab === "forge" && (
          <div className="space-y-5 animate-pop">
            
            {/* Resources indicators */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#172213] p-2 rounded-lg border border-[#2b3c22] text-center">
                <span className="block text-[10px] text-[#7c9176] font-bold">가지고 있는 통나무 🪵</span>
                <span className="text-white font-mono text-base font-extrabold">{getInventoryCount("wood")} 개</span>
              </div>
              <div className="bg-[#172213] p-2 rounded-lg border border-[#2b3c22] text-center">
                <span className="block text-[10px] text-[#7c9176] font-bold">가지고 있는 바위돌 🪨</span>
                <span className="text-white font-mono text-base font-extrabold">{getInventoryCount("stone")} 개</span>
              </div>
            </div>

            {/* CRAFT */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#8cba80] tracking-wider border-b border-[#31462a] pb-1 uppercase">마을 인테리어 제작 블루프린트</h3>
              {CRAFT_RECIPES.map((r) => {
                const wood = role === "designer" ? Math.max(1, Math.floor(r.woodNeeded * 0.5)) : r.woodNeeded;
                const stone = role === "designer" ? Math.max(1, Math.floor(r.stoneNeeded * 0.5)) : r.stoneNeeded;
                const cost = r.goldNeeded;
                const hasMaterials = getInventoryCount("wood") >= wood && getInventoryCount("stone") >= stone && gold >= cost;

                return (
                  <div key={r.resultKey} className="bg-[#182315] border border-[#2d3e28] rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-white">🛠️ {r.name}</h4>
                      <span className="text-[10px] text-[#f4a261] font-bold bg-[#342416] px-1 rounded">비용 : {cost}G</span>
                    </div>
                    <p className="text-[10px] text-[#7c9176]">{r.description}</p>
                    <div className="flex justify-between items-center pt-1.5 border-t border-[#23351f]">
                      <div className="flex gap-2 text-[10px]">
                        <span className={getInventoryCount("wood") >= wood ? "text-[#9fc78f]" : "text-[#dd8383]"}>로그: {wood}</span>
                        <span className={getInventoryCount("stone") >= stone ? "text-[#9fc78f]" : "text-[#dd8383]"}>스톤: {stone}</span>
                      </div>
                      <button
                        disabled={!hasMaterials}
                        onClick={() => onCraftItem(r.resultKey)}
                        className="px-2 py-1 bg-[#557c53] hover:bg-[#659163] disabled:opacity-30 disabled:hover:bg-[#557c53] text-[10px] text-white font-bold rounded transition"
                      >
                        공예 조립
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* COOKING */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#8cba80] tracking-wider border-b border-[#31462a] pb-1 uppercase">조리 화로 레시피 (셰프 전용 마진)</h3>
              {COOKING_RECIPES.map((r) => {
                const hasIngredients = r.ingredients.every((ing) => getInventoryCount(ing.key) >= ing.count);
                return (
                  <div key={r.resultKey} className="bg-[#1e1714] border border-[#3e2c24] rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-amber-200">🍳 {r.name}</h4>
                      <span className="text-[9px] bg-[#342621] text-amber-400 px-1 rounded font-bold">대단매 : {ITEM_PROFILES[r.resultKey]?.sellPrice}G</span>
                    </div>
                    <p className="text-[10px] text-[#9b857a]">{r.description}</p>
                    <div className="flex justify-between items-center pt-1 border-t border-[#342621]">
                      <div className="flex flex-wrap gap-2 text-[10px] text-[#a1b399]">
                        {r.ingredients.map((ing) => (
                          <span
                            key={ing.key}
                            className={getInventoryCount(ing.key) >= ing.count ? "text-[#9fc78f]" : "text-[#dd8383]"}
                          >
                            {ITEM_PROFILES[ing.key]?.name}: {ing.count}
                          </span>
                        ))}
                      </div>
                      <button
                        disabled={!hasIngredients}
                        onClick={() => onCookItem(r.resultKey)}
                        className="px-2 py-1 bg-amber-700 hover:bg-amber-600 disabled:opacity-30 disabled:hover:bg-amber-700 text-[10px] text-white font-bold rounded transition"
                      >
                        셰프 요리하기 🍲
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TOWN EXPANSION TAB */}
        {activeTab === "upgrades" && (
          <div className="space-y-4 animate-pop">
            <h3 className="text-xs font-bold text-[#8cba80] tracking-wider uppercase">마을 SOC 공동시설 신축 투자</h3>
            <p className="text-[10px] text-[#71856b] mb-4">공동의 금고 및 원목, 돌 자원을 모아 마을 시설을 해금하고 확장하세요. 새로운 시설은 더 활기차게 이웃들의 스폰 환경을 개선하고 보조 편의를 촉진합니다.</p>

            <div className="space-y-3">
              {facilities.map((fac) => {
                const isBuilt = villageUpgrades.includes(fac.key);
                const hasGold = gold >= fac.costGold;
                const hasWood = getInventoryCount("wood") >= fac.woodNeeded;
                const hasStone = getInventoryCount("stone") >= fac.stoneNeeded;

                return (
                  <div
                    key={fac.key}
                    className={`border rounded-xl p-3 space-y-2 relative transition ${
                      isBuilt
                        ? "bg-[#1d2719] border-[#4f753e] bg-opacity-70"
                        : "bg-[#182315] border-[#293824]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {fac.name}
                          {isBuilt && (
                            <span className="text-[9px] bg-[#426134] text-white px-1.5 py-0.5 rounded font-bold font-mono animate-pulse">
                              건립 완료 🌟
                            </span>
                          )}
                        </h4>
                      </div>
                      {!isBuilt && (
                        <span className="text-amber-300 font-mono text-xs font-bold bg-[#2f2312] px-1 rounded">
                          {fac.costGold} G
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#7c9176] leading-relaxed">{fac.description}</p>
                    <div className="text-[9px] text-[#8cba80] bg-[#12190f] p-1.5 rounded border border-[#202f1a]">
                      주요 보너스: {fac.tip}
                    </div>

                    {!isBuilt && (
                      <div className="flex justify-between items-center pt-2 border-t border-[#23351f]">
                        <div className="flex gap-2 text-[10px]">
                          <span className={hasWood ? "text-[#9fc78f]" : "text-[#dd8383]"}>목재 {fac.woodNeeded}</span>
                          <span className={hasStone ? "text-[#9fc78f]" : "text-[#dd8383]"}>석재 {fac.stoneNeeded}</span>
                        </div>
                        <button
                          disabled={!hasGold || !hasWood || !hasStone}
                          onClick={() => onUpgradeTown(fac.key)}
                          className="px-2.5 py-1 bg-[#4c7c3c] hover:bg-[#5b9549] disabled:opacity-30 disabled:hover:bg-[#4c7c3c] text-[10px] text-white font-bold rounded transition"
                        >
                          건설 후원 발령
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CO-OP CHAT TAB */}
        {activeTab === "coop" && (
          <div className="flex flex-col h-[480px] lg:h-[70vh] bg-[#182315] border border-[#2d3e28] rounded-xl overflow-hidden animate-pop">
            
            {/* Room code banner */}
            <div className="bg-[#121a10] border-b border-[#2d3e28] p-3 flex justify-between items-center text-xs">
              <div>
                <span className="text-[#7c9176] font-mono block text-[9px]">마을 방 키 코드</span>
                <span className="font-mono text-white font-bold tracking-widest">{roomId || "로컬 싱글 플레이"}</span>
              </div>
              <div className="text-right">
                <span className="text-[#7c9176] font-mono block text-[9px]">참가한 이웃 수</span>
                <span className="text-amber-100 font-bold font-mono">{players.length} 명</span>
              </div>
            </div>

            {/* Players scrolling queue */}
            <div className="p-2 border-b border-[#1b2617] flex gap-1.5 overflow-x-auto bg-[#172213] min-h-[46px] items-center">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#243521] border border-[#3b5237] px-2 py-0.5 rounded-full flex items-center gap-1.5 shrink-0 text-[10px] text-[#dde2db]"
                >
                  <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: p.color }}></span>
                  <span className="font-bold">{p.name}</span>
                </div>
              ))}
            </div>

            {/* Chat list */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-[290px] min-h-[200px]" id="chat-messages-box">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12 text-[#5a7056] text-[11px] font-medium">
                  <MessageSquare className="mx-auto mb-1 opacity-40 animate-pulse" size={24} />
                  아직 새로운 대화가 없습니다.<br />멀티플 편지와 이웃 격려를 건네보세요.
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className="text-[11px] leading-relaxed">
                    <span className="text-[#8cba80] font-bold">[{msg.sender}]</span>{" "}
                    <span className="text-[#dde2db] bg-[#22331f] px-1.5 py-0.5 rounded break-all">{msg.text}</span>
                    <span className="text-[#596d55] font-mono text-[9px] float-right">{msg.time}</span>
                  </div>
                ))
              )}
            </div>

            {/* Logs Queue */}
            <div className="p-2 bg-[#0e160c] border-t border-[#1b2617] h-20 overflow-y-auto space-y-1 pr-1 font-mono text-[9px] text-[#8e9f89]">
              {logs.slice(-5).map((log, i) => (
                <div key={i} className="flex gap-1">
                  <span className={log.type === "success" ? "text-green-400" : log.type === "error" ? "text-red-400" : "text-amber-300"}>●</span>
                  <span className="text-[8px] text-[#4b5947]">{log.time}</span>
                  <span>{log.msg}</span>
                </div>
              ))}
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleChatSend} className="p-2 bg-[#121a10] border-t border-[#293a23] flex gap-1.5">
              <input
                type="text"
                value={chatIn}
                onChange={(e) => setChatIn(e.target.value.slice(0, 40))}
                placeholder="마을 메세지를 입력해 주세요..."
                className="flex-1 bg-[#10140e] border border-[#2b3c22] rounded-lg text-xs text-white px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#8cba80]"
              />
              <button
                type="submit"
                className="p-1.5 bg-[#4c7c3c] hover:bg-[#5b9549] text-white rounded-lg transition"
              >
                <Send size={15} />
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
