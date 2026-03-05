export interface Credential {
  id: string;
  created_at: string;
  username: string | null;
  password: string | null;
  user_id: string | null;
  platform_id: number | null;
}
