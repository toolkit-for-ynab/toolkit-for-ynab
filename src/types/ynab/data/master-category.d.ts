import type { YNABSubCategory } from './sub-category';

interface YNABMasterCategory {
  entityId: string;
  sortableIndex: number;
  subCategories: Array<YNABSubCategory>;
}
