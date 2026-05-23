import React, { useState, useEffect, useRef } from "react";
import { Player, InventoryItem, WorldState, NetPacket, Season, Crop, PlacedDecoration, Villager } from "./types";
import {
  generateInitialMap,
  getInitialResources,
  GRID_COLS,
  GRID_ROWS,
  ResourceNode,
  VILLAGER_TEMPLATES,
  ITEM_PROFILES
} from "./gameData";
import { NetworkManager } from "./network";
import { CozySound } from "./sound";
import { MultiplayerSetup } from "./components/MultiplayerSetup";
import { GameHud } from "./components/GameHud";
import { ControlPanel } from "./components/ControlPanel";
import { X, Volume2, VolumeX, HelpCircle, Sparkles } from "lucide-react";

// Floating text particle for "RPG juicy feel"
interface FloatIndicator {
  id: string;
  text: string;
  color: string;
  x: number; // grid coords
  y: number; // grid coords
  alpha: number;
}

// Visual weather particles
interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export default function App() {
  const [joined, setJoined] = useState(false);
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [worldState, setWorldState] = useState<WorldState>(() => {
    // Try to load save file
    const cached = localStorage.getItem("forest_tycoon_save_v1");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }
    return {
      timeIndex: 360, // 06:00 Morning start
      day: 1,
      season: Season.SPRING,
      weather: "sunny",
      crops: {},
      decorations: {},
      shippingBin: [],
      soldRecordYesterday: [],
      villageLevel: 1,
      villageExp: 0,
    };
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const cached = localStorage.getItem("forest_tycoon_inv_v1");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }
    return [
      { type: "seed", key: "strawberry_seed", name: "딸기 씨앗", count: 3 },
      { type: "seed", key: "tomato_seed", name: "토마토 씨앗", count: 2 },
      { type: "material", key: "wood", name: "튼튼한 원목", count: 10 },
      { type: "material", key: "stone", name: "단단한 바위돌", count: 5 },
    ];
  });

  const [gold, setGold] = useState(() => {
    const cached = localStorage.getItem("forest_tycoon_gold_v1");
    return cached ? parseInt(cached, 10) : 350;
  });

  const [activeResources, setActiveResources] = useState<ResourceNode[]>(() => {
    return getInitialResources();
  });

  const [villagers, setVillagers] = useState<Villager[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [dialogueNPC, setDialogueNPC] = useState<Villager | null>(null);
  const [villageUpgrades, setVillageUpgrades] = useState<string[]>([]);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // Non-state refs for rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const floatIndicatorsRef = useRef<FloatIndicator[]>([]);
  const weatherParticlesRef = useRef<WeatherParticle[]>([]);
  const mapGridRef = useRef<number[][]>(generateInitialMap());
  const localPlayerRef = useRef<Player | null>(null);
  const playersMapRef = useRef<{ [id: string]: Player }>({});
  const selectedItemKeyRef = useRef<string | null>(null);
  
  const [logs, setLogs] = useState<{ msg: string; type: "info" | "success" | "error"; time: string }[]>([]);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);

  // Fishing state
  const [fishingState, setFishingState] = useState<"idle" | "ready" | "casting" | "nibble" | "caught">("idle");
  const fishingTimerRef = useRef<any>(null);

  // Push logger
  const pushLog = (msg: string, type: "info" | "success" | "error" = "info") => {
    const time = new Date().toLocaleTimeString("ko-KR", { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [...prev, { msg, type, time }].slice(-30));
  };

  useEffect(() => {
    selectedItemKeyRef.current = selectedItem?.key || null;
  }, [selectedItem]);

  // Save State helpers
  useEffect(() => {
    if (joined) {
      localStorage.setItem("forest_tycoon_save_v1", JSON.stringify(worldState));
      localStorage.setItem("forest_tycoon_inv_v1", JSON.stringify(inventory));
      localStorage.setItem("forest_tycoon_gold_v1", gold.toString());
    }
  }, [worldState, inventory, gold, joined]);

  // Setup Villagers first time
  useEffect(() => {
    const list: Villager[] = VILLAGER_TEMPLATES.map((tmpl, idx) => {
      // Scatter in beautiful positions
      const posX = 4 + idx * 4;
      const posY = 5 + (idx % 2) * 5;
      return {
        id: "villager_" + idx,
        name: tmpl.name,
        species: tmpl.species,
        personality: tmpl.personality,
        favoriteItem: tmpl.favoriteItem,
        friendship: 0,
        gridX: posX,
        gridY: posY,
        targetX: posX,
        targetY: posY,
        emoteTimer: rInt(10, 60),
        emoteType: null,
        quote: tmpl.quotes[0]
      };
    });
    setVillagers(list);
  }, []);

  // Helper numbers
  function rInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // Triggered when client logs in
  const handleLobbyJoin = (
    cliName: string,
    cliColor: string,
    cliRole: string,
    mode: "host" | "client" | "single",
    targetRoomId: string
  ) => {
    CozySound.toggleSound(soundOn);
    pushLog(`${cliName}(님) 환영합니다! 당신은 마법 같은 숲의 ${getRoleLabel(cliRole)}입니다.`, "success");

    const pId = mode === "client" ? "cli_" + Math.floor(Math.random()*10000) : "host_" + Math.floor(Math.random()*10000);
    const pGold = cliRole === "merchant" ? 650 : 350;
    setGold(pGold);

    const newborn: Player = {
      id: pId,
      name: cliName,
      color: cliColor,
      role: cliRole as any,
      x: 10,
      y: 10,
      gold: pGold,
      lastActive: Date.now(),
    };

    localPlayerRef.current = newborn;
    setLocalPlayer(newborn);
    setPlayers([newborn]);
    playersMapRef.current[pId] = newborn;

    if (mode === "single") {
      setJoined(true);
      pushLog("나 홀로 싱글플레이어를 개시합니다.", "info");
    } else if (mode === "host") {
      NetworkManager.onLog = (msg, flag) => pushLog(msg, flag);
      NetworkManager.onPlayerConnected = (connId, name) => {
        pushLog(`새로운 이웃 (${name}) 님이 숲에 도래했습니다!`, "success");
        // Sync full current world state with them
        NetworkManager.sendTo(connId, {
          type: "sync-world",
          senderId: NewbornId(),
          senderName: NewbornName(),
          payload: {
            worldState,
            activeResources,
            villageUpgrades,
            gold,
          },
        });
      };

      NetworkManager.onPlayerDisconnected = (connId) => {
        pushLog(`이웃 (${connId}) 님이 열차를 타고 은하로 떠났습니다.`, "error");
        setPlayers((prev) => prev.filter((p) => p.id !== connId));
        delete playersMapRef.current[connId];
      };

      NetworkManager.onPacketReceived = handleIncomingPacket;

      NetworkManager.startHost(
        null,
        (id) => {
          setJoined(true);
          pushLog(`서버 링크 준비 완료! 방 번호: [${id}]`, "success");
        },
        (err) => {
          pushLog("호스팅 실패: " + err, "error");
        }
      );
    } else if (mode === "client") {
      NetworkManager.onLog = (msg, flag) => pushLog(msg, flag);
      NetworkManager.onPacketReceived = handleIncomingPacket;

      NetworkManager.connectToHost(
        targetRoomId,
        cliName,
        () => {
          setJoined(true);
          pushLog("호스트 마을 진입 및 네트워크 소작 위임 성공!", "success");
          // notify join packet
          NetworkManager.send({
            type: "join",
            senderId: newborn.id,
            senderName: newborn.name,
            payload: { color: cliColor, role: cliRole },
          });
        },
        (err) => {
          pushLog("마을 접속에 실패했습니다: " + err, "error");
        }
      );
    }
  };

  const NewbornId = () => localPlayerRef.current?.id || "";
  const NewbornName = () => localPlayerRef.current?.name || "";

  function getRoleLabel(r: string) {
    if (r === "farmer") return "🌾 농지 개간가";
    if (r === "fisherman") return "🎣 일류 아귀꾼";
    if (r === "chef") return "🍳 화로 요리사";
    if (r === "merchant") return "💰 황금 대상인";
    return "🛠️ 공방 조립가";
  }

  // Network Packet dispatcher
  const handleIncomingPacket = (pack: NetPacket) => {
    switch (pack.type) {
      case "join": {
        // Host updates guest list
        const guest: Player = {
          id: pack.senderId,
          name: pack.senderName,
          color: pack.payload.color,
          role: pack.payload.role,
          x: 10,
          y: 10,
          gold: 0,
          lastActive: Date.now(),
        };
        playersMapRef.current[pack.senderId] = guest;
        setPlayers(Object.values(playersMapRef.current));
        pushLog(`이웃 ${pack.senderName}님이 멜빵코브를 장착하고 들어왔습니다!`, "success");

        // Broadcast player list to everyone
        if (NetworkManager.isHost) {
          NetworkManager.broadcast({
            type: "member-list",
            senderId: NewbornId(),
            senderName: NewbornName(),
            payload: Object.values(playersMapRef.current),
          });
        }
        break;
      }

      case "member-list": {
        const list = pack.payload as Player[];
        list.forEach((p) => {
          playersMapRef.current[p.id] = p;
        });
        setPlayers(Object.values(playersMapRef.current));
        break;
      }

      case "sync-world": {
        const payload = pack.payload;
        setWorldState(payload.worldState);
        setActiveResources(payload.activeResources);
        setVillageUpgrades(payload.villageUpgrades);
        setGold(payload.gold);
        pushLog("기후와 숲의 가계부 정보를 완벽 동기화 완료했습니다.", "success");
        break;
      }

      case "move": {
        const { id, x, y } = pack.payload;
        if (playersMapRef.current[id]) {
          playersMapRef.current[id].x = x;
          playersMapRef.current[id].y = y;
          setPlayers(Object.values(playersMapRef.current));
        }
        break;
      }

      case "chat": {
        const chat = { sender: pack.senderName, text: pack.payload.text, time: pack.payload.time };
        setChatMessages((prev) => [...prev, chat].slice(-50));
        break;
      }

      case "gold-sync": {
        setGold(pack.payload);
        break;
      }

      case "sound-sync": {
        const soundType = pack.payload;
        if (soundType === "chop") CozySound.playChop();
        else if (soundType === "water") CozySound.playWatering();
        else if (soundType === "mine") CozySound.playMine();
        else if (soundType === "splash") CozySound.playSplash();
        break;
      }

      case "interact": {
        // Host handle action authority
        const { action, gridX, gridY, nodeId } = pack.payload;
        if (action === "harvest") {
          handleHarvestClick(gridX, gridY);
        } else if (action === "water") {
          handleWaterClick(gridX, gridY);
        } else if (action === "plant") {
          handlePlantClick(gridX, gridY, pack.payload.seedKey);
        } else if (action === "chop") {
          handleResourceChop(nodeId);
        }
        break;
      }
    }
  };

  // Chat message sending
  const handleChatSend = (text: string) => {
    const time = new Date().toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit' });
    const packet: NetPacket = {
      type: "chat",
      senderId: NewbornId(),
      senderName: NewbornName(),
      payload: { text, time },
    };
    setChatMessages((prev) => [...prev, { sender: NewbornName(), text, time }].slice(-50));
    NetworkManager.send(packet);
  };

  // Visual text triggers
  const addTextIndicator = (text: string, color: string, x: number, y: number) => {
    const id = "ind_" + Math.random();
    floatIndicatorsRef.current.push({ id, text, color, x, y, alpha: 1.0 });
  };

  // Crop / Farm actions
  const handlePlantClick = (gx: number, gy: number, seedKey: string) => {
    const key = `${gx}_${gy}`;
    // If not soil, cannot plant
    if (mapGridRef.current[gy][gx] !== 4) return;
    if (worldState.crops[key]) return;

    const newCrop: Crop = {
      id: "crop_" + Math.random(),
      gridX: gx,
      gridY: gy,
      type: seedKey.replace("_seed", ""),
      growthStage: 0,
      plantedAt: Date.now(),
      lastWateredAt: Date.now(),
      isWatered: true,
    };

    setWorldState((prev) => {
      const nextCrops = { ...prev.crops, [key]: newCrop };
      return { ...prev, crops: nextCrops };
    });

    if (NetworkManager.isHost) {
      NetworkManager.broadcast({
        type: "sync-world",
        senderId: NewbornId(),
        senderName: NewbornName(),
        payload: { worldState: { ...worldState, crops: { ...worldState.crops, [key]: newCrop } }, activeResources, villageUpgrades, gold },
      });
    }

    addTextIndicator("가꾸는 흙 씨앗 파종 완료 🌱", "#8cba80", gx, gy);
    CozySound.playWatering();
  };

  const handleWaterClick = (gx: number, gy: number) => {
    const key = `${gx}_${gy}`;
    const crop = worldState.crops[key];
    if (!crop || crop.isWatered) return;

    const updatedCrop = { ...crop, isWatered: true, lastWateredAt: Date.now() };
    setWorldState((prev) => ({
      ...prev,
      crops: { ...prev.crops, [key]: updatedCrop },
    }));

    addTextIndicator("영양 가득 수분 보충 💦", "#60a5fa", gx, gy);
    CozySound.playWatering();
  };

  const handleHarvestClick = (gx: number, gy: number) => {
    const key = `${gx}_${gy}`;
    const crop = worldState.crops[key];
    if (!crop || crop.growthStage < 3) return;

    // Remove crop from tile
    setWorldState((prev) => {
      const nextCrops = { ...prev.crops };
      delete nextCrops[key];
      // Give experience
      const bonusExp = (localPlayer?.role === "farmer" ? rInt(15, 25) : rInt(8, 15));
      const nextExp = prev.villageExp + bonusExp;
      const progressLevel = nextExp >= prev.villageLevel * 200;

      return {
        ...prev,
        crops: nextCrops,
        villageExp: progressLevel ? nextExp - prev.villageLevel * 200 : nextExp,
        villageLevel: progressLevel ? prev.villageLevel + 1 : prev.villageLevel,
      };
    });

    // Award items
    const yieldCount = localPlayer?.role === "farmer" ? 2 : 1;
    setInventory((prev) => {
      return prev.map((item) => {
        if (item.key === crop.type) {
          return { ...item, count: item.count + yieldCount };
        }
        return item;
      });
    });

    addTextIndicator(`풍작 수확! (+${yieldCount} ${crop.type === "strawberry" ? "딸기" : crop.type === "tomato" ? "토마토" : "옥수수"}) 🧺`, "#f59e0b", gx, gy);
    CozySound.playSuccessFanfare();
  };

  // Chopping wood / rocks nodes
  const handleResourceChop = (nodeId: string) => {
    const node = activeResources.find((rn) => rn.id === nodeId);
    if (!node || node.lives <= 0) return;

    const updatedNodes = activeResources.map((rn) => {
      if (rn.id === nodeId) {
        return { ...rn, lives: rn.lives - 1 };
      }
      return rn;
    });

    setActiveResources(updatedNodes);

    if (node.type === "tree") {
      CozySound.playChop();
      if (NetworkManager.isHost) {
        NetworkManager.broadcast({ type: "sound-sync", senderId: NewbornId(), senderName: NewbornName(), payload: "chop" });
      }
      setInventory((prev) =>
        prev.map((i) => (i.key === "wood" ? { ...i, count: i.count + 1 } : i))
      );
      addTextIndicator("🪵 원목 잎 수집 +1", "#8cba80", node.gridX, node.gridY);
    } else {
      CozySound.playMine();
      if (NetworkManager.isHost) {
        NetworkManager.broadcast({ type: "sound-sync", senderId: NewbornId(), senderName: NewbornName(), payload: "mine" });
      }
      setInventory((prev) =>
        prev.map((i) => (i.key === "stone" ? { ...i, count: i.count + 1 } : i))
      );
      addTextIndicator("🪨 철제 잔돌 +1", "#cfd4c5", node.gridX, node.gridY);
    }

    // If broken completely, schedule respawn in 30 seconds
    if (node.lives - 1 <= 0) {
      addTextIndicator("완배 철수! (대기 복원 중) 🌲", "#e07a5f", node.gridX, node.gridY);
      setTimeout(() => {
        setActiveResources((curr) =>
          curr.map((rn) => (rn.id === nodeId ? { ...rn, lives: rn.maxLives } : rn))
        );
      }, 30000);
    }
  };

  // Clicking/Tapping any tile on Canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!localPlayer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const tileW = canvas.width / GRID_COLS;
    const tileH = canvas.height / GRID_ROWS;

    const gx = Math.floor(clickX / tileW);
    const gy = Math.floor(clickY / tileH);

    if (gx < 0 || gx >= GRID_COLS || gy < 0 || gy >= GRID_ROWS) return;

    // Move player towards clicked tile smoothly
    const updatePl: Player = { ...localPlayer, x: gx, y: gy };
    setLocalPlayer(updatePl);
    localPlayerRef.current = updatePl;

    if (playersMapRef.current[localPlayer.id]) {
      playersMapRef.current[localPlayer.id].x = gx;
      playersMapRef.current[localPlayer.id].y = gy;
    }

    // Broadcast moves
    NetworkManager.send({
      type: "move",
      senderId: localPlayer.id,
      senderName: localPlayer.name,
      payload: { id: localPlayer.id, x: gx, y: gy },
    });

    // Check interaction with clicked tile
    setTimeout(() => {
      evaluateInteraction(gx, gy);
    }, 100);
  };

  const evaluateInteraction = (gx: number, gy: number) => {
    // 1. Check if resource node is present
    const node = activeResources.find((rn) => rn.gridX === gx && rn.gridY === gy && rn.lives > 0);
    if (node) {
      if (NetworkManager.isHost || !NetworkManager.peer) {
        handleResourceChop(node.id);
      } else {
        NetworkManager.send({
          type: "interact",
          senderId: NewbornId(),
          senderName: NewbornName(),
          payload: { action: "chop", nodeId: node.id },
        });
      }
      return;
    }

    // 2. Check if talking to NPC villager
    const npc = villagers.find((v) => Math.abs(v.gridX - gx) <= 1 && Math.abs(v.gridY - gy) <= 1);
    if (npc) {
      setDialogueNPC(npc);
      CozySound.playTalkBeep(npc.name.charCodeAt(0) % 200);
      return;
    }

    // 3. Fishing near river (tile 0) or sea (r <= 1)
    if (mapGridRef.current[gy][gx] === 0) {
      if (fishingState === "idle") {
        startFishing();
      } else if (fishingState === "nibble") {
        caughtFish();
      }
      return;
    }

    // 4. Planting / Farming mechanics
    const key = `${gx}_${gy}`;
    const crop = worldState.crops[key];

    if (crop) {
      if (crop.growthStage >= 3) {
        // Harvest
        handleHarvestClick(gx, gy);
      } else if (!crop.isWatered) {
        // Water
        handleWaterClick(gx, gy);
      }
    } else {
      // Check if seed selected
      if (selectedItem?.type === "seed") {
        handlePlantClick(gx, gy, selectedItem.key);
      }
    }
  };

  // Fishing Mini-game
  const startFishing = () => {
    setFishingState("casting");
    CozySound.playSplash();
    pushLog("가벼운 찌를 바다 속으로 던졌습니다... 낚시 고리가 정착할 때까지 침묵하세요.", "info");

    const wait = 2000 + Math.random() * 3000;
    fishingTimerRef.current = setTimeout(() => {
      setFishingState("nibble");
      addTextIndicator("찌가 물밑으로 잠깁니다! 지금 낚아채세요!!! Reels!", "#60a5fa", (localPlayerRef.current?.x || 10), (localPlayerRef.current?.y || 10));
    }, wait);
  };

  const caughtFish = () => {
    clearTimeout(fishingTimerRef.current);
    const fishOptions = ["carp", "salmon", "snapper"];
    if (villageUpgrades.includes("port")) {
      fishOptions.push("tuna"); // Harbor unlocks rare tuna!
    }

    const caught = fishOptions[Math.floor(Math.random() * fishOptions.length)];
    const prof = ITEM_PROFILES[caught];

    setInventory((prev) =>
      prev.map((i) => (i.key === caught ? { ...i, count: i.count + 1 } : i))
    );

    addTextIndicator(`낚시 파이트 연타 성공! ${prof.name} 포획 🎣`, "#fbbf24", (localPlayer?.x || 10), (localPlayer?.y || 10));
    CozySound.playSuccessFanfare();
    setFishingState("idle");
  };

  // Reset/Clear coordinates
  const handleResetSaveFile = () => {
    if (window.confirm("정말로 일지와 가방 자원 가계부를 초기 상태로 정리할까요?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // General Store transaction API
  const handleSellItem = (itemKey: string, qty: number) => {
    const prof = ITEM_PROFILES[itemKey];
    if (!prof) return;

    // Chef bonus
    const multiplier = (localPlayer?.role === "chef" && prof.type === "food") ? 1.5 : 1.0;
    const sellGold = Math.floor(prof.sellPrice * qty * multiplier);

    setInventory((prev) =>
      prev.map((i) => (i.key === itemKey ? { ...i, count: Math.max(0, i.count - qty) } : i))
    );
    setGold((g) => {
      const nextGold = g + sellGold;
      if (NetworkManager.isHost) {
        NetworkManager.broadcast({ type: "gold-sync", senderId: NewbornId(), senderName: NewbornName(), payload: nextGold });
      }
      return nextGold;
    });

    pushLog(`[판매 완] ${prof.name} ${qty}개를 즉각 팔아 ${sellGold} 골드를 수확했습니다.`, "success");
    CozySound.playRegister();
  };

  const handleBuyItem = (itemKey: string) => {
    const prof = ITEM_PROFILES[itemKey];
    if (!prof) return;

    const cost = localPlayer?.role === "merchant" ? Math.floor(prof.buyPrice * 0.5) : prof.buyPrice;
    if (gold < cost) return;

    setGold((g) => {
      const nextGold = g - cost;
      if (NetworkManager.isHost) {
        NetworkManager.broadcast({ type: "gold-sync", senderId: NewbornId(), senderName: NewbornName(), payload: nextGold });
      }
      return nextGold;
    });

    setInventory((prev) => {
      let found = false;
      const next = prev.map((item) => {
        if (item.key === itemKey) {
          found = true;
          return { ...item, count: item.count + 1 };
        }
        return item;
      });
      if (!found) {
        next.push({ type: prof.type, key: prof.key, name: prof.name, count: 1 });
      }
      return next;
    });

    pushLog(`[구매 완] 매장 가계부 인출: ${prof.name} 입고완료 (-${cost}G)`, "info");
    CozySound.playRegister();
  };

  // Blueprints crafting
  const handleCraftItem = (blueprintKey: string) => {
    const isDesigner = localPlayer?.role === "designer";
    // Check recipes
    setInventory((prev) => {
      return prev.map((item) => {
        if (item.key === "wood") {
          return { ...item, count: Math.max(0, item.count - (isDesigner ? 2 : 4)) };
        }
        if (item.key === "stone") {
          return { ...item, count: Math.max(0, item.count - (isDesigner ? 2 : 4)) };
        }
        return item;
      });
    });

    setInventory((prev) => {
      let found = false;
      const next = prev.map((item) => {
        if (item.key === blueprintKey) {
          found = true;
          return { ...item, count: item.count + 1 };
        }
        return item;
      });
      if (!found) {
        next.push({ type: "decoration", key: blueprintKey, name: ITEM_PROFILES[blueprintKey]?.name || blueprintKey, count: 1 });
      }
      return next;
    });

    pushLog(`[제작 성공] 마을 조형물: ${ITEM_PROFILES[blueprintKey]?.name} 제작 완료`, "success");
    CozySound.playSuccessFanfare();
  };

  const handleCookItem = (recipeKey: string) => {
    // Cooked
    setInventory((prev) => {
      let found = false;
      const next = prev.map((item) => {
        if (item.key === recipeKey) {
          found = true;
          return { ...item, count: item.count + 1 };
        }
        return item;
      });
      if (!found) {
        next.push({ type: "food", key: recipeKey, name: ITEM_PROFILES[recipeKey]?.name || recipeKey, count: 1 });
      }
      return next;
    });

    pushLog(`가마솥 불꽃 조리: ${ITEM_PROFILES[recipeKey]?.name} 일류 셰프 완요!`, "success");
    CozySound.playSuccessFanfare();
  };

  const handleUpgradeTown = (facKey: string) => {
    setVillageUpgrades((prev) => [...prev, facKey]);
    pushLog(`[기념 건비] 우리의 자랑스런 숲의 확장: [${facKey}] 투자 신축 건립 완료!`, "success");
    CozySound.playSuccessFanfare();
  };

  const handleUseItem = (item: InventoryItem) => {
    if (item.type === "food") {
      // Eat
      setInventory((prev) =>
        prev.map((i) => (i.key === item.key ? { ...i, count: i.count - 1 } : i))
      );
      setGold((g) => g + 80); // Quick nourishment dividend
      addTextIndicator("냠냠! 든든해졌습니다! (+80G 보정) 🥘", "#cfd4c5", (localPlayer?.x || 10), (localPlayer?.y || 10));
      CozySound.playSuccessFanfare();
      setSelectedItem(null);
    }
  };

  // Simulation ticks for crops and hours
  useEffect(() => {
    if (!joined) return;

    const timer = setInterval(() => {
      // Ticking time indices
      setWorldState((prev) => {
        let nIndex = prev.timeIndex + 3; // 3 seconds equal 3 minutes in-game
        let nDay = prev.day;
        let nSeason = prev.season;

        if (nIndex >= 1440) {
          nIndex = 0;
          nDay += 1;
          if (nDay > 10) {
            nDay = 1;
            nSeason = prev.season === Season.SPRING ? Season.SUMMER : prev.season === Season.SUMMER ? Season.AUTUMN : prev.season === Season.AUTUMN ? Season.WINTER : Season.SPRING;
          }
        }

        // Host authoritative update crops
        const nextCrops = { ...prev.crops };
        Object.keys(nextCrops).forEach((key) => {
          const crop = nextCrops[key];
          if (crop.isWatered && crop.growthStage < 3) {
            const seedTmpl = ITEM_PROFILES[crop.type + "_seed"];
            const steps = seedTmpl?.stageSteps || 3;
            // random chance to grow
            if (Math.random() < 0.1) {
              crop.growthStage += 1;
              crop.isWatered = false; // needs watering again
            }
          }
        });

        return {
          ...prev,
          timeIndex: nIndex,
          day: nDay,
          season: nSeason,
          crops: nextCrops,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [joined]);

  // Main canvas drawing frame logic (60FPS)
  useEffect(() => {
    if (!joined) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Retina DPI boost
    canvas.width = 960;
    canvas.height = 760;

    const tileW = canvas.width / GRID_COLS;
    const tileH = canvas.height / GRID_ROWS;

    // Generate weather dust particles
    if (weatherParticlesRef.current.length === 0) {
      for (let i = 0; i < 40; i++) {
        weatherParticlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: -1 - Math.random() * 2,
          vy: 2 + Math.random() * 3,
          size: 1 + Math.random() * 3,
          color: "rgba(255, 255, 255, 0.4)",
        });
      }
    }

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw static grid
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const type = mapGridRef.current[r][c];
          let color = "#3b5334"; // grass default

          if (type === 0) color = "#1e40af"; // Sea/River
          else if (type === 2) color = "#eab308"; // Sand dunes
          else if (type === 3) color = "#78350f"; // Wood Bridge
          else if (type === 4) color = "#451a03"; // Dirt Farm

          ctx.fillStyle = color;
          ctx.fillRect(c * tileW, r * tileH, tileW - 0.5, tileH - 0.5);

          // Subtle grid dots or gridline offsets
          ctx.strokeStyle = "rgba(10, 20, 5, 0.1)";
          ctx.strokeRect(c * tileW, r * tileH, tileW, tileH);
        }
      }

      // Draw bridges planks details
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if (mapGridRef.current[r][c] === 3) {
            ctx.fillStyle = "#854d0e";
            ctx.fillRect(c * tileW + 2, r * tileH + 8, tileW - 4, 3);
            ctx.fillRect(c * tileW + 2, r * tileH + 20, tileW - 4, 3);
          }
        }
      }

      // 2. Draw placed crops
      const cropsList = Object.values(worldState.crops) as Crop[];
      cropsList.forEach((crop) => {
        const cx = crop.gridX * tileW + tileW / 2;
        const cy = crop.gridY * tileH + tileH / 2;

        // Leaf outline
        ctx.fillStyle = "#16a34a";
        ctx.beginPath();
        ctx.arc(cx, cy + 4, 8 + crop.growthStage * 3, 0, Math.PI * 2);
        ctx.fill();

        // Strawberry/Tomato fruit indicator if completely grown
        if (crop.growthStage >= 3) {
          ctx.fillStyle = crop.type === "strawberry" ? "#e11d48" : crop.type === "tomato" ? "#ef4444" : "#fbbf24";
          ctx.beginPath();
          ctx.arc(cx, cy - 2, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Watering drop blue outline
        if (!crop.isWatered) {
          ctx.fillStyle = "rgba(239, 68, 68, 0.7)";
          ctx.fillRect(crop.gridX * tileW + 4, crop.gridY * tileH + 4, 6, 6);
        } else {
          ctx.fillStyle = "rgba(59, 130, 246, 0.8)";
          ctx.fillRect(crop.gridX * tileW + 4, crop.gridY * tileH + 4, 6, 6);
        }
      });

      // 3. Draw resource nodes
      activeResources.forEach((n) => {
        if (n.lives <= 0) return;
        const nx = n.gridX * tileW + tileW / 2;
        const ny = n.gridY * tileH + tileH / 2;

        if (n.type === "tree") {
          // Shadow
          ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
          ctx.beginPath();
          ctx.arc(nx, ny + 10, 16, 0, Math.PI * 2);
          ctx.fill();

          // Trunk
          ctx.fillStyle = "#b45309";
          ctx.fillRect(nx - 4, ny, 8, 16);

          // Foliage
          ctx.fillStyle = "#15803d";
          ctx.beginPath();
          ctx.arc(nx, ny - 6, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#166534";
          ctx.beginPath();
          ctx.arc(nx - 6, ny - 10, 12, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Rock
          ctx.fillStyle = "#4b5563";
          ctx.beginPath();
          ctx.ellipse(nx, ny + 6, 16, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          // Rock highlight
          ctx.fillStyle = "#9ca3af";
          ctx.beginPath();
          ctx.arc(nx - 4, ny + 2, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 4. Draw static facilities designs
      // Cafe facility top-right
      ctx.fillStyle = "#543310"; // wood house body
      ctx.fillRect(15 * tileW, 4 * tileH, 120, 60);
      ctx.fillStyle = "#78350f"; // roof
      ctx.beginPath();
      ctx.moveTo(15 * tileW - 10, 4 * tileH);
      ctx.lineTo(15 * tileW + 60, 4 * tileH - 25);
      ctx.lineTo(15 * tileW + 130, 4 * tileH);
      ctx.fill();
      ctx.fillStyle = "#fbbf24"; // sign boards
      ctx.fillRect(15 * tileW + 40, 4 * tileH + 20, 40, 20);
      ctx.fillStyle = "#1c1917";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("숲 카페", 15 * tileW + 46, 4 * tileH + 32);

      // Shipping bin visual check
      ctx.fillStyle = "#b45309";
      ctx.fillRect(10 * tileW, 8 * tileH, 30, 30);
      ctx.strokeStyle = "#451a03";
      ctx.strokeRect(10 * tileW, 8 * tileH, 30, 30);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 8px sans-serif";
      ctx.fillText("수거함", 10 * tileW + 2, 8 * tileH + 18);

      // Draw hotsprings if built
      if (villageUpgrades.includes("hotspring")) {
        ctx.fillStyle = "#38bdf8"; // warm cyan water
        ctx.fillRect(2 * tileW, 14 * tileH, 80, 50);
        ctx.strokeStyle = "#a1a1aa";
        ctx.lineWidth = 4;
        ctx.strokeRect(2 * tileW, 14 * tileH, 80, 50);
        ctx.lineWidth = 1;

        // Draw hot spring steam ripples
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.beginPath();
        const rippleOffset = (Date.now() / 300) % 15;
        ctx.arc(3 * tileW + 10, 15 * tileH + 10 + rippleOffset, 6, 0, Math.PI, true);
        ctx.stroke();
      }

      // Draw hotel if built
      if (villageUpgrades.includes("hotel")) {
        ctx.fillStyle = "#1e1b4b"; // luxury magenta purple
        ctx.fillRect(16 * tileW, 13 * tileH, 140, 80);
        ctx.fillStyle = "#db2777";
        ctx.fillRect(16 * tileW - 10, 13 * tileH, 160, 12); // deluxe banner
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("🏨 Resort Hotel", 17 * tileW, 13 * tileH + 28);
      }

      // 5. Draw animal villagers AI
      villagers.forEach((v) => {
        const vxCount = v.gridX * tileW + tileW / 2;
        const vyCount = v.gridY * tileH + tileH / 2;

        // Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.beginPath();
        ctx.arc(vxCount, vyCount + 8, 10, 0, Math.PI * 2);
        ctx.fill();

        // Main colorful body based on species
        ctx.fillStyle = v.species === "rabbit" ? "#ffb5a7" : v.species === "bear" ? "#9c6644" : v.species === "penguin" ? "#457b9d" : "#f4a261";
        ctx.beginPath();
        ctx.arc(vxCount, vyCount, 12, 0, Math.PI * 2);
        ctx.fill();

        // Ear loops
        if (v.species === "rabbit") {
          ctx.beginPath();
          ctx.ellipse(vxCount - 5, vyCount - 14, 4, 10, 0, 0, Math.PI * 2);
          ctx.ellipse(vxCount + 5, vyCount - 14, 4, 10, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Villager names
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(v.name.split(" ")[0], vxCount, vyCount - 18);
        ctx.textAlign = "left"; // reset

        // Emote bubbles
        if (v.emoteType) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillRect(vxCount + 10, vyCount - 25, 20, 15);
          ctx.strokeStyle = "#1b2614";
          ctx.strokeRect(vxCount + 10, vyCount - 25, 20, 15);
          ctx.fillStyle = "#e11d48";
          ctx.font = "bold 11px sans-serif";
          ctx.fillText("❤️", vxCount + 14, vyCount - 14);
        }
      });

      // 6. Draw other network players
      players.forEach((p) => {
        const px = p.x * tileW + tileW / 2;
        const py = p.y * tileH + tileH / 2;

        // Outer glow
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1; // reset

        // Bod
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(px - 4, py - 2, 2, 0, Math.PI * 2);
        ctx.arc(px + 4, py - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Face outline text tags
        ctx.fillStyle = "#090d07";
        ctx.font = "bold 9px monospace";
        ctx.fillText(p.name, px - 16, py - 18);
      });

      // Local player highlight
      if (localPlayer) {
        const lpx = localPlayer.x * tileW + tileW / 2;
        const lpy = localPlayer.y * tileH + tileH / 2;
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(localPlayer.x * tileW, localPlayer.y * tileH, tileW, tileH);
      }

      // 7. Visual overlays (Morning, sunset, evening weather filters)
      const hour = Math.floor(worldState.timeIndex / 60) % 24;
      let filterColor = "rgba(0, 0, 0, 0)";

      if (hour >= 17 && hour < 20) {
        // Evening sunset beautiful orange tint
        filterColor = "rgba(249, 115, 22, 0.12)";
      } else if (hour >= 20 || hour < 6) {
        // Starry night navy dark tint
        filterColor = "rgba(15, 23, 42, 0.35)";
      }

      ctx.fillStyle = filterColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Night streetlight glow effect
      if (hour >= 18 || hour < 6) {
        // Find lighting locations or draw yellow gradient spots around streetlights
      }

      // 8. Particle weather systems
      if (worldState.weather === "snowy") {
        ctx.fillStyle = "#ffffff";
        weatherParticlesRef.current.forEach((part) => {
          ctx.beginPath();
          ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
          ctx.fill();

          part.x += part.vx * 0.2;
          part.y += part.vy * 0.3;

          if (part.y > canvas.height) {
            part.y = 0;
            part.x = Math.random() * canvas.width;
          }
        });
      } else if (worldState.weather === "rainy") {
        ctx.strokeStyle = "rgba(147, 197, 253, 0.4)";
        ctx.lineWidth = 1.5;
        weatherParticlesRef.current.forEach((part) => {
          ctx.beginPath();
          ctx.moveTo(part.x, part.y);
          ctx.lineTo(part.x - 3, part.y + 10);
          ctx.stroke();

          part.x += part.vx * 0.5;
          part.y += part.vy * 0.8;

          if (part.y > canvas.height) {
            part.y = 0;
            part.x = Math.random() * canvas.width;
          }
        });
        ctx.lineWidth = 1;
      }

      // 9. Floating score markers
      floatIndicatorsRef.current.forEach((ind) => {
        ctx.fillStyle = ind.color;
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(ind.text, ind.x * tileW, ind.y * tileH - (1.0 - ind.alpha) * 30);
        ind.alpha -= 0.015;
      });

      floatIndicatorsRef.current = floatIndicatorsRef.current.filter((i) => i.alpha > 0);

      animId = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => cancelAnimationFrame(animId);
  }, [joined, worldState, activeResources, players, villagers, villageUpgrades]);

  return (
    <div className="min-h-screen bg-[#11190e] text-[#dde2db] flex flex-col font-sans relative overflow-hidden" id="app-root">
      
      {!joined ? (
        <MultiplayerSetup onJoin={handleLobbyJoin} />
      ) : (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Main game viewport with top HUD */}
          <GameHud
            day={worldState.day}
            season={worldState.season}
            weather={worldState.weather}
            timeIndex={worldState.timeIndex}
            gold={gold}
            villageLevel={worldState.villageLevel}
            villageExp={worldState.villageExp}
            role={localPlayer?.role || "farmer"}
            name={localPlayer?.name || "Forest Companion"}
            color={localPlayer?.color || "#fff"}
            onShowGuide={() => setIsGuideOpen(true)}
            onResetSave={handleResetSaveFile}
          />

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 bg-[#162013]">
            
            {/* Left side viewport canvas board with cozy framing */}
            <div className="flex-1 p-4 flex flex-col justify-center items-center overflow-auto min-h-0 relative select-none">
              
              {/* Overlay tutorial tip */}
              <div className="absolute top-6 left-6 z-10 bg-[#12190f] bg-opacity-90 px-4 py-2 rounded-xl text-xs border border-[#304429] shadow-md max-w-sm pointer-events-none space-y-1">
                <span className="text-[#8cba80] font-bold block">💡 숲 조작 힌트</span>
                <p className="text-[10px] text-[#71856b] leading-relaxed">
                  키보드 이동 또는 **캔버스 원하는 타일 클릭**으로 자동 원클릭 이동 및 식재, 벌채, 수확 인터랙트가 연동 처리됩니다. 강/바다에 클릭 시 낚시 찌 투마가 활성화됩니다!
                </p>
              </div>

              {/* Sound volume controller */}
              <button
                onClick={() => {
                  const state = CozySound.toggleSound();
                  setSoundOn(state);
                }}
                className="absolute top-6 right-6 z-10 p-2 bg-[#12190f] border border-[#304429] text-[#9fc78f] hover:bg-[#202f1a] hover:text-white rounded-xl shadow-md transition"
              >
                {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <div className="border-4 border-[#324527] rounded-2xl bg-[#090d07] shadow-2xl relative overflow-hidden flex justify-center items-center">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="max-w-full h-auto cursor-crosshair outline-none"
                  style={{ width: "768px", height: "600px" }}
                />

                {/* Nibble "!!!" alert bubble */}
                {fishingState === "nibble" && (
                  <div
                    onClick={caughtFish}
                    className="absolute z-20 cursor-pointer bg-red-600 animate-bounce border-2 border-white px-3 py-1.5 rounded-full font-extrabold text-white text-xs shadow-lg tracking-wider"
                    style={{
                      left: `${((localPlayer?.x || 10) / GRID_COLS) * 100}%`,
                      top: `${((localPlayer?.y || 10) / GRID_ROWS) * 100 - 10}%`,
                    }}
                  >
                    HIT!!! Reels! 🎣
                  </div>
                )}
              </div>
            </div>

            {/* Right side control panel */}
            <ControlPanel
              inventory={inventory}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
              gold={gold}
              role={localPlayer?.role || "farmer"}
              players={players}
              logs={logs}
              roomId={NetworkManager.roomId}
              isHost={NetworkManager.isHost}
              onSellItem={handleSellItem}
              onBuyItem={handleBuyItem}
              onCraftItem={handleCraftItem}
              onCookItem={handleCookItem}
              onUpgradeTown={handleUpgradeTown}
              villageUpgrades={villageUpgrades}
              chatMessages={chatMessages}
              onSendChat={handleChatSend}
              onUseItem={handleUseItem}
            />

          </div>
        </div>
      )}

      {/* NPC CHAT DIALOGUE OVERLAY MODAL */}
      {dialogueNPC && (
        <div className="fixed inset-0 z-50 bg-[#000000] bg-opacity-65 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#253621] border-4 border-[#435e3b] rounded-2xl p-6 shadow-2xl relative animate-pop text-slate-100">
            <button
              onClick={() => setDialogueNPC(null)}
              className="absolute top-4 right-4 text-[#7c9176] hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex gap-4 items-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-[#162114] border-2 border-[#435e3b] flex items-center justify-center text-4xl shadow-inner relative">
                {dialogueNPC.species === "rabbit" && "🐰"}
                {dialogueNPC.species === "bear" && "🐻"}
                {dialogueNPC.species === "penguin" && "🐧"}
                {dialogueNPC.species === "squirrel" && "🐿️"}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {dialogueNPC.name}
                  <span className="text-[10px] bg-[#364d30] text-[#8cba80] px-1.5 py-0.5 rounded">
                    {dialogueNPC.personality}
                  </span>
                </h3>
                <p className="text-[10px] text-[#71856b] font-medium leading-relaxed mt-0.5">최애 관심사: {ITEM_PROFILES[dialogueNPC.favoriteItem]?.name || "원목"}</p>
              </div>
            </div>

            <p className="text-xs bg-[#111a0f] text-[#bac5b8] p-4 rounded-xl border border-[#2b3c22] leading-relaxed mb-4 italic">
              &quot;{dialogueNPC.quote}&quot;
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const giftCount = inventory.find((i) => i.key === dialogueNPC.favoriteItem)?.count || 0;
                  if (giftCount > 0) {
                    setInventory((prev) =>
                      prev.map((i) => (i.key === dialogueNPC.favoriteItem ? { ...i, count: i.count - 1 } : i))
                    );
                    setGold((g) => g + 150); // Gift success bonus
                    const updatedNpc = { ...dialogueNPC, friendship: Math.min(100, dialogueNPC.friendship + 20), quote: "오맛나!!! 내가 세상에서 가장 좋아하는 품목이군요! 감사의 팁(+150G)을 전달합니다! 고마워!" };
                    setDialogueNPC(updatedNpc);
                    setVillagers((prev) => prev.map((v) => (v.id === dialogueNPC.id ? updatedNpc : v)));
                    addTextIndicator("우정 결속도 지수 단련 상승! 🧡", "#ffb5a7", (localPlayer?.x || 10), (localPlayer?.y || 10));
                    CozySound.playSuccessFanfare();
                  } else {
                    alert(`최애 선물인 [${ITEM_PROFILES[dialogueNPC.favoriteItem]?.name}]이(가) 가방에 없습니다...`);
                  }
                }}
                className="w-full py-2 bg-[#4c7c3c] hover:bg-[#5b9549] text-xs text-white font-bold rounded-lg transition"
              >
                💝 최애 품목 선물 건네기 (+우정도 강화)
              </button>

              <button
                onClick={() => {
                  // Switch quote
                  const tmpl = VILLAGER_TEMPLATES.find((t) => t.name.startsWith(dialogueNPC.name.split(" ")[0]));
                  if (tmpl) {
                    const nextQ = tmpl.quotes[rInt(0, tmpl.quotes.length - 1)];
                    setDialogueNPC({ ...dialogueNPC, quote: nextQ });
                  }
                  CozySound.playTalkBeep(dialogueNPC.name.charCodeAt(0) % 200);
                }}
                className="w-full py-2 bg-[#172213] hover:bg-[#1f2d1a] text-xs text-[#a1b399] border border-[#2d3e28] rounded-lg transition"
              >
                💬 마을 이야기 더 대화하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TUTORIAL GUIDE MODAL */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000] bg-opacity-70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#212c1a] border-4 border-[#324527] rounded-3xl p-6 shadow-2xl relative animate-pop max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsGuideOpen(false)}
              className="absolute top-4 right-4 text-[#7c9176] hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-white mb-3 cozy-heading flex items-center gap-2">
              <Sparkles size={20} className="text-amber-400" />
              마을 사용 대강 가이드 요약
            </h3>

            <div className="text-xs space-y-3 text-[#bac5b8] leading-relaxed">
              <p>
                <strong>숲 타이쿤</strong>은 평화롭고 따스한 나만의 숲속 섬을 기획하고 주민들과 가치를 영위하는 타이쿤 Co-op 힐링 라이프입니다.
              </p>
              <div className="bg-[#12190f] p-3 rounded-xl border border-[#2b3c22] space-y-1">
                <span className="text-[#8cba80] font-bold">🌾 1단계: 씨앗 파종 및 물주기</span>
                <p>배낭 탭에서 씨앗을 선택한 후 마당의 농지(어두운 갈색 구역)를 클릭해 심으세요. 물이 빠진 빨간 보정구간은 식수를 주어 파랗게 물들여주어야 가속 성장합니다!</p>
              </div>
              <div className="bg-[#12190f] p-3 rounded-xl border border-[#2b3c22] space-y-1">
                <span className="text-[#8cba80] font-bold">🎣 2단계: 유유자적 강 낚시</span>
                <p>흐르는 푸른 강이나 상단의 푸른 바다를 클릭하면 낚시 찌가 투마됩니다. "!!!" 기포가 올라오는 즉시 화면의 리빌 히트 단추를 터치하면 붕어, 연어, 도미가 손에 담깁니다.</p>
              </div>
              <div className="bg-[#12190f] p-3 rounded-xl border border-[#2b3c22] space-y-1">
                <span className="text-[#8cba80] font-bold">🪵 3단계: 벌채 및 부수 가공품 제작</span>
                <p>필드의 녹색 잎사귀 나무나 짙은 회색 광석 바위를 클릭하면 도끼와 정으로 가공하여 통나무, 단바위 석재들을 가방에 축적할 수 있습니다. 제작대 탭에서 울타리, 통나무 의자, 가로등으로 즉석 조립할 수 있습니다.</p>
              </div>
              <div className="bg-[#12190f] p-3 rounded-xl border border-[#2b3c22] space-y-1">
                <span className="text-[#8cba80] font-bold">♨️ 4단계: 공동 사회간접자본 신축</span>
                <p>마을 가계부를 융성하게 하여 유황 온천탕, 신축 호텔을 건설하세요! 마실 목욕 가운을 탑승한 관광 등산자들과 사치 숙박 귀족들의 여유로운 팁 세례가 발령됩니다.</p>
              </div>
            </div>

            <button
              onClick={() => setIsGuideOpen(false)}
              className="mt-5 w-full py-2.5 bg-[#4c7c3c] hover:bg-[#5b9549] text-xs font-bold text-white rounded-xl transition"
            >
              알겠습니다. 숲 정착하러 가기 🌳
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
