export interface PlayHistory {
  id: string;
  created_at: string;
  bot_id: string | null;
  level: string | null;
  start_balance: number | null;
  end_balance: number | null;
  pnl: number | null;
}
