export interface Bot {
  id: string;
  created_at: string;
  user_id: string | null;
  balance: number | null;
  status: string | null;
  bet: number | null;
  pattern: string | null;
  level: number | null;
  target_profit: number | null;
  command: boolean | null;
  duration: number | null;
  strategy: string | null;
  credential_id: string | null;
  unit_name: string | null;
  franchise_id: string | null;
  guid: string | null;
  api_base_url: string | null;
  bot_status: 'run' | 'stop' | null;
}


