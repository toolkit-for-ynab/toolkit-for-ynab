import { YNABTransaction } from '../data/transaction';

export type YNABModalService = {
  isModalOpen?: boolean;
  closeModal?: (e?: unknown) => void;
  openModal?: (name: string) => void;
  setDataForModal?: (data: any) => void;
} & (
  | {
      currentModal?: 'modals/budget/activity';
      modalValue?: {
        selectedActivityTransactions?: YNABTransaction[];
      };
    }
  | {
      currentModal?: 'modals/reports/transactions';
      modalValue?: {
        modalTransactions?: YNABTransaction[];
      };
    }
);
