import React, { useEffect, useRef, useState, useCallback } from "react";
import Avatar from "@/components/atoms/Avatar/Avatar";
import type { CallState } from "@/hooks/useCall";
import styles from "./CallOverlay.module.scss";
import { BiSolidVolumeMute, BiSolidVolumeFull } from "react-icons/bi";
import { BsCameraVideoFill, BsCameraVideoOffFill } from "react-icons/bs";
import { FiPhone, FiPhoneOff } from "react-icons/fi";
import { BiExitFullscreen, BiFullscreen } from "react-icons/bi";
import { MdScreenShare, MdStopScreenShare } from "react-icons/md";

interface Props {
  callState: CallState;
  peerName: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  duration: number;
  connectionQuality: "good" | "poor" | "bad";
  isSharingScreen?: boolean;
  peerAvatarUrl?: string;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare?: () => void;
}

const CallOverlay: React.FC<Props> = ({
  callState,
  peerName,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  duration,
  connectionQuality,
  isSharingScreen = false,
  peerAvatarUrl,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isPipActive, setIsPipActive] = useState(false);
  const [isScreenShareSupported, setIsScreenShareSupported] = useState(true);
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSupport = () => {
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      setIsMobile(mobile);
      if (mobile) {
        setFitMode("contain");
      }
      const hasGetDisplayMedia = !!navigator.mediaDevices?.getDisplayMedia;
      setIsScreenShareSupported(!mobile && hasGetDisplayMedia);
    };
    checkSupport();
  }, []);

  useEffect(() => {
    const video = remoteVideoRef.current;
    if (!video) return;
    const checkAspectRatio = () => {
      if (video.videoWidth && video.videoHeight) {
        const ratio = video.videoWidth / video.videoHeight;

        if (ratio > 1.6 && !isMobile) {
          setFitMode("contain");
        } else if (!isMobile) {
          setFitMode("cover");
        }
      }
    };
    video.addEventListener("loadedmetadata", checkAspectRatio);
    return () => video.removeEventListener("loadedmetadata", checkAspectRatio);
  }, [remoteVideoRef.current, isMobile]);

  useEffect(() => {
    if (localVideoRef.current && localStream instanceof MediaStream) {
      localVideoRef.current.srcObject = localStream;
    } else if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream instanceof MediaStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    } else if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [remoteStream]);

  const togglePictureInPicture = async () => {
    if (!remoteVideoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await remoteVideoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP error:", err);
    }
  };

  useEffect(() => {
    const video = remoteVideoRef.current;
    if (!video) return;
    const onEnterPip = () => setIsPipActive(true);
    const onLeavePip = () => setIsPipActive(false);
    video.addEventListener("enterpictureinpicture", onEnterPip);
    video.addEventListener("leavepictureinpicture", onLeavePip);
    if (document.pictureInPictureElement === video) setIsPipActive(true);
    return () => {
      video.removeEventListener("enterpictureinpicture", onEnterPip);
      video.removeEventListener("leavepictureinpicture", onLeavePip);
    };
  }, [remoteVideoRef.current]);

  useEffect(() => {
    const handleDocumentPipChange = () => {
      if (
        remoteVideoRef.current &&
        document.pictureInPictureElement !== remoteVideoRef.current
      ) {
        setIsPipActive(false);
      }
    };
    document.addEventListener("leavepictureinpicture", handleDocumentPipChange);
    return () =>
      document.removeEventListener(
        "leavepictureinpicture",
        handleDocumentPipChange,
      );
  }, []);

  const handleScreenShareClick = useCallback(() => {
    if (!isScreenShareSupported) {
      alert(
        "Screen sharing is not supported on mobile browsers. Please use a desktop browser for this feature.",
      );
      return;
    }
    onToggleScreenShare?.();
  }, [isScreenShareSupported, onToggleScreenShare]);

  if (callState === "idle") return null;

  return (
    <div className={styles.overlay}>
      {remoteStream instanceof MediaStream ? (
        <video
          ref={remoteVideoRef}
          className={`${styles.remoteVideo} ${fitMode === "contain" ? styles.screenShare : ""}`}
          autoPlay
          playsInline
        />
      ) : (
        <div className={styles.avatarCenter}>
          <div className={styles.avatarRing}>
            <Avatar name={peerName} size={96} avatarUrl={peerAvatarUrl} />
          </div>
          <p className={styles.peerName}>{peerName}</p>
          <p className={styles.statusText}>
            {callState === "calling" && "Calling…"}
            {callState === "receiving" && "Incoming video call"}
            {callState === "active" && "Connecting…"}
          </p>
        </div>
      )}

      {localStream instanceof MediaStream && (
        <video
          ref={localVideoRef}
          className={`${styles.localVideo} ${isVideoOff ? styles.hidden : ""}`}
          autoPlay
          playsInline
          muted
        />
      )}

      <div className={styles.topBar}>
        <div className={styles.callInfo}>
          <div
            className={`${styles.qualityDot} ${styles[connectionQuality]}`}
          />
          <span className={styles.timer}>
            {Math.floor(duration / 60)}:
            {(duration % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className={styles.controls}>
        {callState === "receiving" ? (
          <>
            <div className={styles.controlGroup}>
              <button className={styles.acceptBtn} onClick={onAccept}>
                <FiPhone />
              </button>
              <span className={styles.controlLabel}>Accept</span>
            </div>
            <div className={styles.controlGroup}>
              <button className={styles.rejectBtn} onClick={onReject}>
                <FiPhoneOff />
              </button>
              <span className={styles.controlLabel}>Decline</span>
            </div>
          </>
        ) : (
          <>
            <div className={styles.controlGroup}>
              <button
                className={`${styles.ctrlBtn} ${isPipActive ? styles.ctrlActive : ""}`}
                onClick={togglePictureInPicture}
                title="Picture in picture"
              >
                {isPipActive ? <BiExitFullscreen /> : <BiFullscreen />}
              </button>
              <span className={styles.controlLabel}>PiP</span>
            </div>
            <div className={styles.controlGroup}>
              <button
                className={`${styles.ctrlBtn} ${isMuted ? styles.ctrlActive : ""}`}
                onClick={onToggleMute}
              >
                {isMuted ? <BiSolidVolumeMute /> : <BiSolidVolumeFull />}
              </button>
              <span className={styles.controlLabel}>Mute</span>
            </div>
            <div className={styles.controlGroup}>
              <button className={styles.endBtn} onClick={onEnd}>
                <FiPhoneOff />
              </button>
              <span className={styles.controlLabel}>End</span>
            </div>
            <div className={styles.controlGroup}>
              <button
                className={`${styles.ctrlBtn} ${isVideoOff ? styles.ctrlActive : ""}`}
                onClick={onToggleVideo}
              >
                {isVideoOff ? <BsCameraVideoOffFill /> : <BsCameraVideoFill />}
              </button>
              <span className={styles.controlLabel}>Video</span>
            </div>

            {onToggleScreenShare && (
              <div className={styles.controlGroup}>
                <button
                  className={`${styles.ctrlBtn} ${!isScreenShareSupported ? styles.disabled : ""} ${isSharingScreen ? styles.ctrlActive : ""}`}
                  onClick={handleScreenShareClick}
                  title={
                    !isScreenShareSupported
                      ? "Screen sharing not supported on mobile"
                      : isSharingScreen
                        ? "Stop sharing"
                        : "Share screen"
                  }
                  disabled={!isScreenShareSupported}
                >
                  {isSharingScreen ? <MdStopScreenShare /> : <MdScreenShare />}
                </button>
                <span className={styles.controlLabel}>Share</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CallOverlay;
