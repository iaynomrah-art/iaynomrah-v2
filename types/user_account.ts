export interface UserAccount {
  id: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  contact_number_1: number | null;
  contact_number_2: number | null;
  email: string | null;
  unit_id: string | null;
}
