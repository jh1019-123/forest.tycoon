import { Peer, DataConnection } from "peerjs";
import { NetPacket } from "./types";

class ForestNetworkManager {
  peer: Peer | null = null;
  connections: { [id: string]: DataConnection } = {};
  isHost: boolean = false;
  myId: string = "";
  roomId: string = "";
  onPacketReceived: (packet: NetPacket) => void = () => {};
  onPlayerConnected: (id: string, name: string) => void = () => {};
  onPlayerDisconnected: (id: string) => void = () => {};
  onLog: (msg: string, type: "info" | "success" | "error") => void = () => {};

  constructor() {}

  // Generate a random room ID or allow custom one
  generateRoomId(): string {
    const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
    let code = "FOREST-";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Create a connection as Host
  startHost(
    customRoomId: string | null,
    onReady: (id: string) => void,
    onError: (err: string) => void
  ) {
    this.isHost = true;
    this.roomId = (customRoomId || this.generateRoomId()).toUpperCase();
    this.onLog(`주 세션 호스트를 시작하는 중... 방 ID: ${this.roomId}`, "info");

    try {
      // Create Peer with public peerjs server
      this.peer = new Peer(this.roomId, {
        debug: 1,
      });

      this.peer.on("open", (id) => {
        this.myId = id;
        this.onLog(`서버 연결 성공! 대기 상태입니다. [ID: ${id}]`, "success");
        onReady(id);
      });

      this.peer.on("connection", (conn) => {
        const clientId = conn.peer;
        this.onLog(`새로운 클라이언트 접속 감지: ${clientId}`, "info");

        this.setupConnection(conn);
      });

      this.peer.on("error", (err: any) => {
        this.onLog(`호스트 연결 오류: ${err.message || err.type || err}`, "error");
        // If port/id taken, try creating custom or random
        if (err.type === "unavailable-id") {
          this.onLog("이미 사용 중인 방 ID입니다. 새로운 무작위 ID로 재생성합니다.", "error");
          this.peer?.destroy();
          setTimeout(() => {
            this.startHost(null, onReady, onError);
          }, 1500);
        } else {
          onError(String(err.message || err.type || err));
        }
      });
    } catch (e: any) {
      this.onLog(`피어 초기화 실패: ${e.message}`, "error");
      onError(e.message || String(e));
    }
  }

  // Connect to Host as Client
  connectToHost(
    targetRoomId: string,
    cliName: string,
    onReady: () => void,
    onError: (err: string) => void
  ) {
    this.isHost = false;
    const targetId = targetRoomId.toUpperCase();
    this.roomId = targetId;
    this.myId = "GUEST-" + Math.floor(1000 + Math.random() * 9000);
    this.onLog(`호스트(${targetId})로 참가를 시도하는 중... 이웃 이름: ${cliName}`, "info");

    try {
      this.peer = new Peer(this.myId, {
        debug: 1,
      });

      this.peer.on("open", (id) => {
        this.onLog(`임시 피어 개설 성공 [${id}]`, "success");
        this.onLog(`호스트 연결 시도 중... 방 ID: ${targetId}`, "info");

        const conn = this.peer!.connect(targetId, {
          metadata: { name: cliName },
        });

        this.setupConnection(conn);

        conn.on("open", () => {
          this.onLog(`호스트와 연결 수립 완료! 게임 진입 중...`, "success");
          onReady();
        });
      });

      this.peer.on("error", (err: any) => {
        this.onLog(`클라이언트 피어 오류: ${err.message || err.type}`, "error");
        onError(String(err.message || err.type || err));
      });
    } catch (e: any) {
      this.onLog(`참가 초기화 오류: ${e.message}`, "error");
      onError(e.message || String(e));
    }
  }

  // Common connection listeners
  private setupConnection(conn: DataConnection) {
    const peerId = conn.peer;
    this.connections[peerId] = conn;

    conn.on("data", (data: any) => {
      // Ensure incoming packet matches type
      const packet = data as NetPacket;
      if (packet && packet.type) {
        this.onPacketReceived(packet);
      }
    });

    conn.on("close", () => {
      this.onLog(`아이디 ${peerId}과의 연결이 손실되었습니다.`, "error");
      delete this.connections[peerId];
      this.onPlayerDisconnected(peerId);
    });

    conn.on("error", (err: any) => {
      this.onLog(`연결 터널 에러 (${peerId}): ${err.message || err}`, "error");
    });

    // For host triggers
    if (this.isHost) {
      const clientName = (conn.metadata as any)?.name || "여행자";
      this.onPlayerConnected(peerId, clientName);
    }
  }

  // Send packet directly to Peer (clients send to Host, Hosts can send to specific peer)
  sendTo(targetPeerId: string, packet: NetPacket) {
    const conn = this.connections[targetPeerId];
    if (conn && conn.open) {
      conn.send(packet);
    }
  }

  // For Client to send to Host, or Host to send/broadcast
  send(packet: NetPacket) {
    if (this.isHost) {
      this.broadcast(packet);
    } else {
      // Client has exactly one connector, which is the host room ID
      const conn = this.connections[this.roomId];
      if (conn && conn.open) {
        conn.send(packet);
      }
    }
  }

  // Host broadcasts to ALL connected clients
  broadcast(packet: NetPacket) {
    if (!this.isHost) return;
    Object.values(this.connections).forEach((conn) => {
      if (conn.open) {
        conn.send(packet);
      }
    });
  }

  // Close connection
  disconnect() {
    this.onLog("연결 종료 및 리소스 정리 중...", "info");
    Object.values(this.connections).forEach((conn) => conn.close());
    this.connections = {};
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.myId = "";
    this.roomId = "";
    this.isHost = false;
  }
}

export const NetworkManager = new ForestNetworkManager();
