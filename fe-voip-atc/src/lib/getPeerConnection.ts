import { Inviter, Invitation, SessionDescriptionHandler } from "sip.js";

type SessionLike = Inviter | Invitation | null;

type WebRTCSessionHandler = SessionDescriptionHandler & {
  peerConnection: RTCPeerConnection;
};

/**
 * Get the RTCPeerConnection from a SIP.js session if available.
 * Works for both Inviter and Invitation.
 */
export function getPeerConnection(
  session: SessionLike
): RTCPeerConnection | undefined {
  if (!session) return undefined;

  const sdh = session.sessionDescriptionHandler as
    | WebRTCSessionHandler
    | undefined;
  return sdh?.peerConnection;
}
