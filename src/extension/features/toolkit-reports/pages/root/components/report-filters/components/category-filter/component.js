import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Collections } from 'toolkit/extension/utils/collections';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { LabeledCheckbox } from 'toolkit-reports/common/components/labeled-checkbox';
import './styles.scss';

function sortableIndexCompare(a, b) {
  return a.sortableIndex - b.sortableIndex;
}

export function getStoredCategoryFilters(reportKey) {
  const stored = getToolkitStorageKey(`category-filters-${reportKey}`, {
    ignoreSubCategories: []
  });

  return {
    ignoreSubCategories: new Set(stored.ignoreSubCategories)
  };
}

function storeCategoryFilters(reportKey, filters) {
  setToolkitStorageKey(`category-filters-${reportKey}`, {
    ignoreSubCategories: Array.from(filters.ignoreSubCategories)
  });
}

export class CategoryFilterComponent extends React.Component {
  static propTypes = {
    activeReportKey: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  }

  state = getStoredCategoryFilters(this.props.activeReportKey)

  render() {
    const { masterCategoriesCollection, subCategoriesCollection } = Collections;
    const { ignoreSubCategories } = this.state;
    const categoriesList = [];
    masterCategoriesCollection.forEach((masterCategory) => {
      const { entityId: masterCategoryId } = masterCategory;
      if (masterCategory.isTombstone || masterCategory.internalName) {
        return;
      }

      const subCategories = subCategoriesCollection.findItemsByMasterCategoryId(masterCategoryId);
      const areAllSubCategoriesIgnored = subCategories.every(({ entityId }) => ignoreSubCategories.has(entityId));

      categoriesList.push((
        <div key={masterCategoryId}>
          <LabeledCheckbox
            id={masterCategoryId}
            checked={!areAllSubCategoriesIgnored}
            label={masterCategory.name}
            onChange={this._handleMasterCategoryToggled}
          />
        </div>
      ));

      subCategories.sort(sortableIndexCompare).forEach((subCategory) => {
        const { entityId: subCategoryId } = subCategory;
        if (subCategory.isTombstone || subCategory.internalName) {
          return;
        }

        categoriesList.push((
          <div className="tk-mg-l-1" key={subCategoryId}>
            <LabeledCheckbox
              id={subCategoryId}
              checked={!this.state.ignoreSubCategories.has(subCategoryId)}
              label={subCategory.name}
              onChange={this._handleSubCategoryToggled}
            />
          </div>
        ));
      });
    });

    return (
      <div className="tk-category-filter tk-pd-1">
        <h3 className="tk-mg-0">Categories</h3>
        <div className="tk-flex tk-mg-t-1 tk-mg-b-05 tk-pd-y-05 tk-border-y tk-modal-content__header-actions">
          <button className="tk-button tk-button--small tk-button--text" onClick={this._handleSelectAll}>Select All</button>
          <button className="tk-button tk-button--small tk-button--text tk-mg-l-05" onClick={this._handleSelectNone}>Select None</button>
        </div>
        <div className="tk-category-filter__category-list tk-pd-x-05">
          {categoriesList}
        </div>
        <div className="tk-flex tk-justify-content-center tk-mg-t-1">
          <button className="tk-button tk-button--hollow" onClick={this.props.onCancel}>Cancel</button>
          <button className="tk-button tk-mg-l-05" onClick={this._save}>Done</button>
        </div>
      </div>
    );
  }

  _handleSelectAll = () => {
    const { ignoreSubCategories } = this.state;
    ignoreSubCategories.clear();
    this.setState({ ignoreSubCategories });
  }

  _handleSelectNone = () => {
    const { ignoreSubCategories } = this.state;
    const { masterCategoriesCollection, subCategoriesCollection } = Collections;

    masterCategoriesCollection.forEach((masterCategory) => {
      const { entityId: masterCategoryId } = masterCategory;
      if (!masterCategory.isTombstone && !masterCategory.internalName) {
        subCategoriesCollection.findItemsByMasterCategoryId(masterCategoryId).sort(sortableIndexCompare).forEach((subCategory) => {
          const { entityId: subCategoryId } = subCategory;
          if (!subCategory.isTombstone || !subCategory.internalName) {
            ignoreSubCategories.add(subCategoryId);
          }
        });
      }
    });

    this.setState({ ignoreSubCategories });
  }

  _handleMasterCategoryToggled = ({ currentTarget }) => {
    const { checked, name } = currentTarget;
    const { ignoreSubCategories } = this.state;
    const subCategories = Collections.subCategoriesCollection.findItemsByMasterCategoryId(name);
    if (checked) {
      subCategories.forEach(({ entityId }) => ignoreSubCategories.delete(entityId));
    } else {
      subCategories.forEach(({ entityId }) => ignoreSubCategories.add(entityId));
    }

    this.setState({ ignoreSubCategories });
  }

  _handleSubCategoryToggled = ({ currentTarget }) => {
    const { checked, name } = currentTarget;
    const { ignoreSubCategories } = this.state;
    if (checked) {
      ignoreSubCategories.delete(name);
    } else {
      ignoreSubCategories.add(name);
    }

    this.setState({ ignoreSubCategories });
  }

  _save = () => {
    storeCategoryFilters(this.props.activeReportKey, this.state);
    this.props.onSave(this.state.ignoreSubCategories);
  }
}
