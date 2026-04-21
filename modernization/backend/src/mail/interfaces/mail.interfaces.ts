export interface SendMailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
  attachments?: Array<{ filename: string; path: string }>;
  priority?: 'high' | 'normal' | 'low';
}

export interface MailQueueJob {
  id?: string;
  options: SendMailOptions;
  attempts: number;
  maxAttempts: number;
}

export interface LicenseWarningData {
  userId: string;
  userName: string;
  userEmail: string;
  licenses: Array<{
    name: string;
    maturityDate: Date;
    daysUntilExpiry: number;
  }>;
}

export interface AirlineDebtData {
  userId: string;
  userName: string;
  userEmail: string;
  airlineName: string;
  debtValue: number;
  debtMaturityDate: Date;
  jobDetails: {
    departure: string;
    arrival: string;
    model: string;
    flightTime: string;
    distance: number;
    pax: number;
    cargo: number;
  };
}

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  confirmationLink: string;
}

export interface PasswordResetData {
  userName: string;
  userEmail: string;
  resetLink: string;
  expiresIn: string;
}
