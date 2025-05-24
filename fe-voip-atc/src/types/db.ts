import type { RowDataPacket } from "mysql2/promise";

// === USERS TABLE ===
export interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  email: string | null;
  password_hash: string;
  sip_password: string;
}

// === USER SETTINGS TABLE ===
export interface UserSettingsRow extends RowDataPacket {
  user_id: string;
  input_device_id: string | null;
  output_device_id: string | null;
  input_volume: number;
  output_volume: number;
  ptt_key: string;
  updated_at: Date;
}

export interface ChannelRow extends RowDataPacket {
  id: number;
  name: string;
  number: string;
  creator_id: number;
  created_at: Date;
  is_private: boolean;
}

export interface ChannelMemberRow extends RowDataPacket {
  id: number;
  channel_id: number;
  user_id: number;
  joined_at: Date;
}

// === CONTACTS TABLE ===
export interface ContactRow extends RowDataPacket {
  contact_id: number;
  user_id: number;
  name: string | null;
  username: string | null;
  created_at: Date;
}

// === CALL LIST TABLE ===
export interface CallListRow extends RowDataPacket {
  call_id: string;
  caller_id: string;
  receiver_id: string;
  start_time: Date;
  end_time: Date;
  recording_filename: string | null;
  s3_url: string | null;
  recording_uploaded: number;
  status: string;
}

export interface ChannelHistoryRow extends RowDataPacket {
  call_id: string | null;
  caller_id: string | null;
  channel: string | null;
  join_time: Date | null;
  leave_time: Date | null;
  recording_filename: string | null;
  recording_s3_url: string | null;
  log_speech_filename: string | null;
  log_speech_s3_url: string | null;
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
