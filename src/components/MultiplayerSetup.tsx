import React, { useState } from "react";
import { PlayerRole } from "../types";
import { Github, Play, Users, Compass, Sprout, Coins } from "lucide-react";

interface MultiplayerSetupProps {
  onJoin: (name: string, color: string, role: PlayerRole, lobbyMode: "host" | "client" | "single", targetRoomId: string) => void;
}

export const MultiplayerSetup: React.FC<MultiplayerSetupProps> = ({ onJoin }) => {
  const [name, setName] = useState(() => {
    const defaultNames = ["숲속 여우", "노란 곰돌이", "바람 토끼", "고수 펭귄", "도토리 다람쥐", "소박한 사슴"];
    return defaultNames[Math.floor(Math.random() * defaultNames.length)];
  });
  const [color, setColor] = useState("#d4a373"); // default warm wood
  const [role, setRole] = useState<PlayerRole>("farmer");
  const [roomId, setRoomId] = useState("");
  const [lobbyMode, setLobbyMode] = useState<"menu" | "host" | "client">("menu");

  const colors = [
    { name: "진지 원목", value: "#d4a373" },
    { name: "새싹 리프", value: "#8cba80" },
    { name: "호박 오렌지", value: "#e07a5f" },
    { name: "해바라기 노랑", value: "#f4a261" },
    { name: "깊은 청 바다", value: "#457b9d" },
    { name: "벚꽃 분홍", value: "#ffb5a7" },
  ];

  const roles = [
    {
      key: "farmer",
      name: "초록 농부 🌾",
      perk: "작물 수확량 2배 보너스 및 저렴한 농지 흙 영양 설계",
    },
    {
      key: "fisherman",
      name: "강 낚시꾼 🎣",
      perk: "물고기 바이트 반응 시간 단축 및 수중 탐지 찌 강화",
    },
    {
      key: "chef",
      name: "숲속 요리사 🍳",
      perk: "요리 판매 시 골드 대폭 추가 및 특수 간편 소스 레시피",
    },
    {
      key: "merchant",
      name: "장돌뱅이 상인 💰",
      perk: "씨앗 50% 반값 특별 우대 및 시작 시 보너스 300골드 수령",
    },
    {
      key: "designer",
      name: "황금 디자이너 🛠️",
      perk: "원목/돌 가구 제작 재료 절반 절약 및 한정 컬러 장식 가구 오픈",
    },
  ];

  const handleSubmit = (mode: "host" | "client" | "single") => {
    if (!name.trim()) return;
    onJoin(name, color, role, mode, roomId.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-[#1b2416] bg-opacity-95 flex items-center justify-center p-4 relative overflow-hidden" id="multisetup-container">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#557c53] opacity-10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#f4a261] opacity-5 blur-3xl"></div>

      <div className="w-full max-w-xl bg-[#283823] border-4 border-[#415a3a] shadow-2xl rounded-2xl p-6 md:p-8 relative z-10 animate-pop">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-[#3c5436] text-[#8cba80] mb-2 animate-float">
            <Sprout size={36} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#fdfbeb] tracking-tight cozy-heading">숲 타이쿤</h1>
          <p className="text-[#a1b399] text-sm mt-1">Cozy Multiplayer Farm & Forest Tycoon</p>
        </div>

        {lobbyMode === "menu" ? (
          <div className="space-y-6">
            {/* Player Character Builder */}
            <div className="bg-[#1f2c1a] border border-[#344a30] p-4 rounded-xl space-y-4">
              <h2 className="text-sm font-bold text-[#8cba80] uppercase tracking-wider">내 이웃 정보 생성</h2>
              
              <div>
                <label className="block text-xs text-[#a1b399] mb-1">이웃 닉네임</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 10))}
                    placeholder="닉네임을 입력하세요"
                    className="flex-1 px-3 py-2 bg-[#121c10] border border-[#3c5436] rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#8cba80]"
                  />
                  <button
                    onClick={() => {
                      const randAdjs = ["은은한", "반짝이는", "동글동글", "졸린", "춤추는", "영리한"];
                      const randAnis = ["토끼", "다람쥐", "너구리", "펭귄", "아기사슴", "곰돌이"];
                      setName(randAdjs[Math.floor(Math.random() * randAdjs.length)] + " " + randAnis[Math.floor(Math.random() * randAnis.length)]);
                    }}
                    className="px-3 bg-[#3c5436] hover:bg-[#4d6b46] text-white text-xs font-semibold rounded-lg transition"
                  >
                    주사위
                  </button>
                </div>
              </div>

              {/* Avatar Color Selector */}
              <div>
                <label className="block text-xs text-[#a1b399] mb-1.5">이웃 컬러 (멜빵바지 오버롤 디자인)</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className="group flex items-center justify-center p-1.5 rounded-lg border-2 transition"
                      style={{
                        borderColor: color === c.value ? "#cfd4c5" : "transparent",
                        backgroundColor: "#162013",
                      }}
                    >
                      <span className="w-5 h-5 rounded-full block border" style={{ backgroundColor: c.value }}></span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Perks */}
              <div>
                <label className="block text-xs text-[#a1b399] mb-1.5">마을 역할 분담 (전문가 특화)</label>
                <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-1">
                  {roles.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => setRole(r.key as PlayerRole)}
                      className={`text-left p-2.5 rounded-lg border transition ${
                        role === r.key
                          ? "bg-[#344a30] border-[#8cba80] text-white"
                          : "bg-[#182315] border-[#293d25] hover:bg-[#1d2b19] text-[#cfd4c5]"
                      }`}
                    >
                      <div className="text-xs font-bold">{r.name}</div>
                      <div className="text-[10px] text-[#a1b399] mt-0.5 leading-relaxed">{r.perk}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="lobby-trigger-buttons">
              <button
                onClick={() => setLobbyMode("host")}
                className="py-3 bg-[#557c53] hover:bg-[#648f61] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
              >
                <Play size={18} />
                내 마을 호스트하기 (방장)
              </button>
              <button
                onClick={() => setLobbyMode("client")}
                className="py-3 bg-[#f4a261] hover:bg-[#f6b27e] text-[#1b2416] font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
              >
                <Users size={18} />
                친구 마을 놀러가기 (이웃)
              </button>
            </div>

            {/* Single Play */}
            <div className="text-center pt-2 border-t border-[#3c5436]" id="singleplay-btn">
              <button
                onClick={() => handleSubmit("single")}
                className="text-[#a1b399] hover:text-[#cfd4c5] text-xs underline font-medium transition"
              >
                혼자서 조용히 힐링 숲 가꾸기 (싱글플레이어)
              </button>
            </div>
          </div>
        ) : lobbyMode === "host" ? (
          <div className="space-y-4 animate-pop">
            <h2 className="text-lg font-bold text-[#fdfbeb] cozy-heading">나만의 숲의 마을 개설</h2>
            <p className="text-xs text-[#a1b399] leading-relaxed">
              호스트로 시작하면, PeerJS의 중계 서버를 이용하여 이웃들이 내 마을로 찾아올 수 있는 고유 방 키를 발급받습니다. 다른 탭이나 친구인 클라이언트에게 방 키를 전달하여 멀티 플레이어가 가능합니다.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setLobbyMode("menu")}
                className="flex-1 py-2 bg-[#3c5436] hover:bg-[#4d6b46] text-white text-xs font-bold rounded-lg transition"
              >
                뒤로가기
              </button>
              <button
                onClick={() => handleSubmit("host")}
                className="flex-1 py-2 bg-[#557c53] hover:bg-[#648f61] text-white text-xs font-bold rounded-lg transition"
              >
                숲 생성하기 🏡
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-pop">
            <h2 className="text-lg font-bold text-[#fdfbeb] cozy-heading">이웃 마을 여행하기</h2>
            <p className="text-xs text-[#a1b399] leading-relaxed">
              연결할 친구 세션의 고유 방 코드가 필요합니다. 호스트 이웃의 초대 코드를 복사하여 기입해주세요. (예: FOREST-WXYZ)
            </p>

            <div>
              <label className="block text-xs text-[#a1b399] mb-1">마을 숲 방 코드 (ID)</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="FOREST-WXYZ 양식 코드"
                className="w-full px-3 py-2 bg-[#121c10] border border-[#3c5436] rounded-lg text-white font-mono text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-[#f4a261]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setLobbyMode("menu")}
                className="flex-1 py-2 bg-[#3c5436] hover:bg-[#4d6b46] text-white text-xs font-bold rounded-lg transition"
              >
                뒤로가기
              </button>
              <button
                disabled={!roomId.trim()}
                onClick={() => handleSubmit("client")}
                className="flex-1 py-2 bg-[#f4a261] disabled:opacity-40 disabled:hover:bg-[#f4a261] hover:bg-[#f6b27e] text-[#1b2416] text-xs font-bold rounded-lg transition"
              >
                이동 열차 탑승 🚂
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
