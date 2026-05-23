import React from "react";
import { Season, TimeOfDay } from "../types";
import { CloudSun, CloudRain, Snowflake, Coins, Sun, Moon, Sparkles, User, HelpCircle } from "lucide-react";

interface GameHudProps {
  day: number;
  season: Season;
  weather: "sunny" | "rainy" | "snowy";
  timeIndex: number;
  gold: number;
  villageLevel: number;
  villageExp: number;
  role: string;
  name: string;
  color: string;
  onShowGuide: () => void;
  onResetSave: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  day,
  season,
  weather,
  timeIndex,
  gold,
  villageLevel,
  villageExp,
  role,
  name,
  color,
  onShowGuide,
  onResetSave,
}) => {
  // Convert minutes (0 to 1440) to standard time
  const totalMinutes = Math.floor(timeIndex);
  const hour = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;
  const paddedHour = String(hour).padStart(2, "0");
  const paddedMinute = String(minute).padStart(2, "0");

  // Determine current period
  let period: TimeOfDay = TimeOfDay.DAY;
  if (hour >= 6 && hour < 12) period = TimeOfDay.MORNING;
  else if (hour >= 12 && hour < 17) period = TimeOfDay.DAY;
  else if (hour >= 17 && hour < 20) period = TimeOfDay.EVENING;
  else period = TimeOfDay.NIGHT;

  const getSeasonLabel = (s: Season) => {
    switch (s) {
      case Season.SPRING:
        return "봄 🌸 (벚꽃바람)";
      case Season.SUMMER:
        return "여름 🌿 (초록바다)";
      case Season.AUTUMN:
        return "가을 🍁 (단풍낙엽)";
      case Season.WINTER:
        return "겨울 ❄️ (하얀소금)";
    }
  };

  const getRoleEmoji = (r: string) => {
    switch (r) {
      case "farmer": return "🌾 농부";
      case "fisherman": return "🎣 낚시꾼";
      case "chef": return "🍳 요리사";
      case "merchant": return "💰 상인";
      case "designer": return "🛠️ 디자이너";
      default: return "🏕️ 여행자";
    }
  };

  const expToNextLevel = villageLevel * 200;
  const expPercent = Math.min(100, Math.floor((villageExp / expToNextLevel) * 100));

  return (
    <div className="w-full bg-[#1b2614] border-b-4 border-[#324527] px-4 py-3 flex flex-wrap gap-4 items-center justify-between" id="game-hud">
      {/* Profile summary */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center relative shadow-inner"
          style={{ backgroundColor: color }}
        >
          <span className="text-white text-base font-bold select-none">{name.charAt(0)}</span>
          <div className="absolute -bottom-1 -right-1 bg-[#4a6b3e] text-[9px] px-1 rounded-full border text-white font-mono">
            Lv.{villageLevel}
          </div>
        </div>
        <div>
          <div className="text-white font-bold text-sm tracking-tight flex items-center gap-1">
            {name}
            <span className="text-[10px] bg-[#344a29] px-1.5 py-0.5 rounded text-[#9fc78f] font-mono">
              {getRoleEmoji(role)}
            </span>
          </div>
          {/* EXP bar */}
          <div className="w-28 bg-[#0c1308] h-1.5 rounded-full mt-1 overflow-hidden">
            <div className="bg-[#8fc782] h-full rounded-full transition-all duration-300" style={{ width: `${expPercent}%` }}></div>
          </div>
          <div className="text-[9px] text-[#8e9f89] font-mono mt-0.5">마을 전력: {villageExp}/{expToNextLevel} EXP</div>
        </div>
      </div>

      {/* Season & Cycles */}
      <div className="flex items-center gap-5 bg-[#121a0c] px-4 py-2 rounded-xl border border-[#2b3c22]">
        <div className="text-center border-r border-[#26371c] pr-4">
          <div className="text-[10px] text-[#71856b] font-bold">마을 연대기</div>
          <div className="text-amber-100 text-sm font-extrabold tracking-tight">계절: {getSeasonLabel(season)}</div>
          <div className="text-[10px] text-[#bac5b8] font-medium mt-0.5">{day}일차 마을 아침</div>
        </div>

        {/* Time of Day */}
        <div className="text-center flex items-center gap-2">
          <div className="text-left">
            <div className="text-[10px] text-[#71856b] font-bold uppercase tracking-wider">숲 일광 시계</div>
            <div className="text-white text-lg font-mono font-bold tracking-widest">{paddedHour}:{paddedMinute}</div>
          </div>
          <div>
            {period === TimeOfDay.MORNING && <Sun className="text-orange-300 animate-float" size={24} />}
            {period === TimeOfDay.DAY && <Sun className="text-amber-400 animate-pulse" size={24} />}
            {period === TimeOfDay.EVENING && <Sun className="text-orange-500 animate-float" size={24} />}
            {period === TimeOfDay.NIGHT && <Moon className="text-[#bfdbfe] animate-float" size={24} />}
          </div>
        </div>

        {/* Weather */}
        <div className="text-center border-l border-[#26371c] pl-4 flex flex-col items-center">
          <div className="text-[10px] text-[#71856b] font-bold">오프라인 기후</div>
          <div className="flex items-center gap-1 text-[#bac5b8] text-xs font-semibold mt-1">
            {weather === "sunny" && (
              <>
                <CloudSun size={15} className="text-amber-300" />
                <span>맑음🌤️</span>
              </>
            )}
            {weather === "rainy" && (
              <>
                <CloudRain size={15} className="text-blue-300" />
                <span>가을비☔</span>
              </>
            )}
            {weather === "snowy" && (
              <>
                <Snowflake size={15} className="text-cyan-200" />
                <span>함박눈❄️</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Gold & Quick Actions */}
      <div className="flex items-center gap-4">
        {/* Money Vault */}
        <div className="bg-[#fbbf24] bg-opacity-10 border-2 border-[#f59e0b] px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
          <Coins className="text-[#fbbf24] animate-bounce" size={20} />
          <div>
            <div className="text-[9px] text-[#cc9c31] font-bold uppercase">공유 공동 금고</div>
            <div className="text-white font-mono font-extrabold text-base tracking-wider leading-none">
              {gold.toLocaleString()} <span className="text-[#fbbf24] text-xs font-sans">골드</span>
            </div>
          </div>
        </div>

        <button
          onClick={onShowGuide}
          title="가이드 보기"
          className="p-2 border-[#3c5436] border-2 text-[#9fc78f] hover:bg-[#2b3c22] hover:text-white rounded-lg transition"
        >
          <HelpCircle size={18} />
        </button>

        <button
          onClick={onResetSave}
          className="px-2.5 py-1.5 text-[11px] font-bold bg-[#7a2e2e] hover:bg-[#993b3b] rounded-lg border border-[#a64242] text-white transition"
        >
          초기화
        </button>
      </div>
    </div>
  );
};
