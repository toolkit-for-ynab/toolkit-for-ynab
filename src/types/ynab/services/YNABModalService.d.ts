import { YNABTransaction } from '../data/transaction';

type YNABModalService = {
  isModalOpen?: boolean;
  closeModal?: (e?: unknown) => void;
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
