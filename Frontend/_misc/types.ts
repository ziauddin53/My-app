
export interface UserProfile {
  id: string;
  email: string;
  points: number;
  wallet_balance: number;
  admin_points?: number;
  full_name?: string;
  role: 'admin' | 'user';
  device_id?: string;
  referral_code?: string;
  last_check_in?: string;
  is_blocked?: boolean;
}

export enum TaskType {
  VIDEO_AD = 'VIDEO_AD',
  GAME_INSTALL = 'GAME_INSTALL',
  OFFERWALL = 'OFFERWALL',
  QUIZ = 'QUIZ'
}

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  reward_points: number;
  reward_percentage: number;
  status: 'active' | 'completed' | 'inactive';
  icon: string;
}

export enum TransactionType {
  CONVERSION = 'CONVERSION',
  CASHOUT = 'CASHOUT',
  BONUS = 'BONUS'
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  points?: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method?: 'bkash' | 'nagad' | 'recharge' | 'giftcard' | 'wallet';
  account_number?: string;
  operator?: string;
  created_at: string;
}

export interface SystemSettings {
  min_withdrawal: number;
  points_per_taka: number;
  referral_bonus: number;
  is_under_maintenance: boolean;
  is_bkash_enabled: boolean;
  is_nagad_enabled: boolean;
  is_recharge_enabled: boolean;
  is_giftcard_enabled: boolean;
  is_auto_payout_enabled: boolean;
  app_notice: string;
  support_link: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}
