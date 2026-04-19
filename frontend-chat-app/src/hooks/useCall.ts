import { useCallback, useEffect, useRef, useState } from "react";
import { stompService } from "@/api";

export type CallState = "idle" | "calling" | "receiving" | "active" | "ended";

export interface CallSignalPayload {
  type: "offer" | "answer" | "ice-candidate" | "call-end" | "call-reject";
  conversationId: number;
  sdp?: string;
  candidate?: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
  senderId?: number;
  senderName?: string;
}

interface UseCallReturn {
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  incomingCall: CallSignalPayload | null;
  startCall: (conversationId: number) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  isMuted: boolean;
  isVideoOff: boolean;
  toggleMute: () => void;
  toggleVideo: () => void;
  duration: number;
  connectionQuality: "good" | "poor" | "bad";
  isSharingScreen: boolean;
  toggleScreenShare: () => Promise<void>;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useCall(): UseCallReturn {
  const [callState, setCallState] = useState<CallState>("idle");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallSignalPayload | null>(
    null,
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<
    "good" | "poor" | "bad"
  >("good");
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  const pc = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const activeConvId = useRef<number | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const isSharingScreenRef = useRef(false);

  const cleanup = useCallback(() => {
    pc.current?.close();
    pc.current = null;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (originalVideoTrackRef.current) {
      originalVideoTrackRef.current.stop();
      originalVideoTrackRef.current = null;
    }
    pendingCandidates.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setCallState("idle");
    setIncomingCall(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsSharingScreen(false);
    isSharingScreenRef.current = false;
    activeConvId.current = null;
  }, []);

  const createPeerConnection = useCallback(
    (convId: number) => {
      const peerConn = new RTCPeerConnection(ICE_SERVERS);
      activeConvId.current = convId;

      peerConn.onicecandidate = (e) => {
        if (e.candidate) {
          stompService.sendSignal({
            type: "ice-candidate",
            conversationId: convId,
            candidate: e.candidate.candidate,
            sdpMid: e.candidate.sdpMid ?? undefined,
            sdpMLineIndex: e.candidate.sdpMLineIndex ?? undefined,
          });
        }
      };

      peerConn.ontrack = (e) => {
        setRemoteStream(e.streams[0] ?? null);
      };

      peerConn.onconnectionstatechange = () => {
        if (
          peerConn.connectionState === "disconnected" ||
          peerConn.connectionState === "failed" ||
          peerConn.connectionState === "closed"
        ) {
          cleanup();
        }
      };

      pc.current = peerConn;
      return peerConn;
    },
    [cleanup],
  );

  const getMedia = useCallback(async (video = true) => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: video
        ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          }
        : false,
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (!pc.current || !localStreamRef.current) return;

    const videoSender = pc.current
      .getSenders()
      .find((s) => s.track?.kind === "video");
    if (!videoSender) return;

    if (!isSharingScreenRef.current) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
        originalVideoTrackRef.current = currentVideoTrack;

        await videoSender.replaceTrack(screenTrack);

        localStreamRef.current.removeTrack(currentVideoTrack);
        localStreamRef.current.addTrack(screenTrack);

        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

        screenTrack.onended = () => {
          if (isSharingScreenRef.current) {
            toggleScreenShare();
          }
        };

        setIsSharingScreen(true);
        isSharingScreenRef.current = true;
      } catch (err) {
        console.error("Screen share failed:", err);
      }
    } else {
      const screenTrack = localStreamRef.current.getVideoTracks()[0];
      let cameraTrack: MediaStreamTrack | null = null;

      if (
        originalVideoTrackRef.current &&
        originalVideoTrackRef.current.readyState === "live"
      ) {
        cameraTrack = originalVideoTrackRef.current;
      } else {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        cameraTrack = newStream.getVideoTracks()[0];
      }

      if (cameraTrack) {
        await videoSender.replaceTrack(cameraTrack);

        localStreamRef.current.removeTrack(screenTrack);
        localStreamRef.current.addTrack(cameraTrack);
        screenTrack.stop();

        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));

        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);
        stompService.sendSignal({
          type: "offer",
          conversationId: activeConvId.current!,
          sdp: offer.sdp,
        });
      }
      setIsSharingScreen(false);
      isSharingScreenRef.current = false;
      originalVideoTrackRef.current = null;
    }
  }, []);

  const startCall = useCallback(
    async (convId: number) => {
      try {
        setCallState("calling");
        const stream = await getMedia();
        const peerConn = createPeerConnection(convId);
        stream.getTracks().forEach((t) => peerConn.addTrack(t, stream));

        const offer = await peerConn.createOffer();
        await peerConn.setLocalDescription(offer);

        stompService.sendSignal({
          type: "offer",
          conversationId: convId,
          sdp: offer.sdp,
        });
      } catch (err) {
        console.error("[CALL] startCall failed:", err);
        cleanup();
      }
    },
    [getMedia, createPeerConnection, cleanup],
  );

  const acceptCall = useCallback(async () => {
    if (!incomingCall?.conversationId || !incomingCall.sdp) return;
    try {
      setCallState("active");
      const stream = await getMedia();
      const peerConn = createPeerConnection(incomingCall.conversationId);
      stream.getTracks().forEach((t) => peerConn.addTrack(t, stream));

      await peerConn.setRemoteDescription(
        new RTCSessionDescription({ type: "offer", sdp: incomingCall.sdp }),
      );

      for (const c of pendingCandidates.current) {
        await peerConn.addIceCandidate(new RTCIceCandidate(c));
      }
      pendingCandidates.current = [];

      const answer = await peerConn.createAnswer();
      await peerConn.setLocalDescription(answer);

      stompService.sendSignal({
        type: "answer",
        conversationId: incomingCall.conversationId,
        sdp: answer.sdp,
      });

      setIncomingCall(null);
    } catch (err) {
      console.error("[CALL] acceptCall failed:", err);
      cleanup();
    }
  }, [incomingCall, getMedia, createPeerConnection, cleanup]);

  const rejectCall = useCallback(() => {
    if (incomingCall?.conversationId) {
      stompService.sendSignal({
        type: "call-reject",
        conversationId: incomingCall.conversationId,
      });
    }
    cleanup();
  }, [incomingCall, cleanup]);

  const endCall = useCallback(() => {
    if (activeConvId.current != null) {
      stompService.sendSignal({
        type: "call-end",
        conversationId: activeConvId.current,
      });
    }
    cleanup();
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((m) => !m);
  }, []);

  const toggleVideo = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsVideoOff((v) => !v);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === "active") {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  useEffect(() => {
    if (!pc.current) return;

    const updateQuality = () => {
      const state = pc.current?.iceConnectionState;
      if (state === "connected") setConnectionQuality("good");
      else if (state === "checking") setConnectionQuality("poor");
      else if (state === "failed" || state === "disconnected")
        setConnectionQuality("bad");
    };

    pc.current.addEventListener("iceconnectionstatechange", updateQuality);
    updateQuality();

    let statsInterval: NodeJS.Timeout;
    const checkPacketLoss = async () => {
      if (pc.current && callState === "active") {
        const stats = await pc.current.getStats();
        let packetsLost = 0;
        stats.forEach((report) => {
          if (report.type === "inbound-rtp" && report.kind === "video") {
            packetsLost = report.packetsLost || 0;
          }
        });
        if (packetsLost > 100) setConnectionQuality("bad");
        else if (packetsLost > 30) setConnectionQuality("poor");
        else setConnectionQuality("good");
      }
    };
    if (callState === "active") {
      statsInterval = setInterval(checkPacketLoss, 5000);
    }

    return () => {
      pc.current?.removeEventListener(
        "iceconnectionstatechange",
        updateQuality,
      );
      clearInterval(statsInterval);
    };
  }, [pc.current, callState]);

  useEffect(() => {
    const unsub = stompService.onSignal(async (payload: CallSignalPayload) => {
      switch (payload.type) {
        case "offer":
          setIncomingCall(payload);
          setCallState("receiving");
          break;
        case "answer":
          if (pc.current && payload.sdp) {
            await pc.current.setRemoteDescription(
              new RTCSessionDescription({ type: "answer", sdp: payload.sdp }),
            );
            for (const c of pendingCandidates.current) {
              await pc.current.addIceCandidate(new RTCIceCandidate(c));
            }
            pendingCandidates.current = [];
            setCallState("active");
          }
          break;
        case "ice-candidate":
          if (payload.candidate) {
            const init: RTCIceCandidateInit = {
              candidate: payload.candidate,
              sdpMid: payload.sdpMid,
              sdpMLineIndex: payload.sdpMLineIndex,
            };
            if (pc.current?.remoteDescription) {
              await pc.current.addIceCandidate(new RTCIceCandidate(init));
            } else {
              pendingCandidates.current.push(init);
            }
          }
          break;
        case "call-end":
        case "call-reject":
          cleanup();
          break;
      }
    });
    return unsub;
  }, [cleanup]);

  return {
    callState,
    localStream,
    remoteStream,
    incomingCall,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    duration,
    connectionQuality,
    isSharingScreen,
    toggleScreenShare,
  };
}
