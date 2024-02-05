import { YNABSubCategory } from './sub-category';

export interface YNABMasterCategory {
  entityId: string;
  sortableIndex: number;
  subCategories: Array<YNABSubCategory>;
}
