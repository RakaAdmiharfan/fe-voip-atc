import type { RowDataPacket } from "mysql2/promise";

// === USERS TABLE ===
export interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  email: string | null;
  password_hash: string;
  sip_password: string;
}

// === CONTACTS TABLE ===
export interface ContactRow extends RowDataPacket {
  contact_id: number;
  user_id: number;
  name: string | null;
  username: string | null;
  created_at: Date;
}

// === PS_AUTH TABLE ===
export interface PsAuthRow extends RowDataPacket {
  id: string;
  auth_type: string | null;
  password: string | null;
  username: string | null;
}

// === PS_AORS TABLE ===
export interface PsAorRow extends RowDataPacket {
  id: string;
  max_contacts: number | null;
}

// === PS_ENDPOINTS TABLE ===
export interface PsEndpointRow extends RowDataPacket {
  id: string;
  transport: string | null;
  aors: string | null;
  auth: string | null;
  context: string | null;
  disallow: string | null;
  allow: string | null;
  direct_media: string | null;
  dtmf_mode: string | null;
  rewrite_contact: string | null;
  rtp_symmetric: string | null;
  force_rport: string | null;
  use_avpf: string | null;
  media_encryption: string | null;
  ice_support: string | null;
  dtls_verify: string | null;
  dtls_setup: string | null;
  media_use_received_transport: string | null;
  rtcp_mux: string | null;
  webrtc: string | null;
}
