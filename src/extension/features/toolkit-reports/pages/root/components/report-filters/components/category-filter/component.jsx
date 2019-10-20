import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Collections } from 'toolkit/extension/utils/collections';
import { LabeledCheckbox } from 'toolkit-reports/common/components/labeled-checkbox';
import './styles.scss';

function sortableIndexCompare(a, b) {
  return a.sortableIndex - b.sortableIndex;
}

export class CategoryFilterComponent extends React.Component {
  _masterCategoriesCollection = Collections.masterCategoriesCollection;
  _subCategoriesCollection = Collections.subCategoriesCollection;

  static propTypes = {
    activeReportKey: PropTypes.string.isRequired,
    categoryFilterIds: PropTypes.any.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
  };

  state = {
    categoryFilterIds: this.props.categoryFilterIds,
  };

  render() {
    const { categoryFilterIds } = this.state;
    const categoriesList = [];
    this._masterCategoriesCollection.forEach(masterCategory => {
      const { entityId: masterCategoryId } = masterCategory;
      if (
        masterCategory.isTombstone ||
        masterCategory.isDebtPaymentMasterCategory() ||
        masterCategory.isInternalMasterCategory()
      ) {
        return;
      }

      const isHiddenMasterCategory = masterCategory.isHiddenMasterCategory();
      const subCategories = this._subCategoriesCollection.findItemsByMasterCategoryId(
        masterCategoryId
      );
      if (!subCategories) {
        return;
      }

      const areAllSubCategoriesIgnored = subCategories.every(({ entityId }) =>
        categoryFilterIds.has(entityId)
      );

      categoriesList.push(
        <div key={masterCategoryId} className="tk-category-filter__labeled-checkbox--parent">
          <LabeledCheckbox
            id={masterCategoryId}
            checked={!areAllSubCategoriesIgnored}
            label={masterCategory.name}
            onChange={this._handleMasterCategoryToggled}
          />
        </div>
      );

      subCategories.sort(sortableIndexCompare).forEach(subCategory => {
        const { entityId: subCategoryId } = subCategory;
        if (subCategory.isTombstone || (subCategory.internalName && !isHiddenMasterCategory)) {
          return;
        }

        categoriesList.push(
          <div className="tk-mg-l-1" key={subCategoryId}>
            <LabeledCheckbox
              id={subCategoryId}
              checked={!this.state.categoryFilterIds.has(subCategoryId)}
              label={subCategory.name}
              onChange={this._handleSubCategoryToggled}
            />
          </div>
        );
      });
    });

    return (
      <div className="tk-category-filter tk-pd-1">
        <h3 className="tk-mg-0">Categories</h3>
        <div className="tk-flex tk-mg-t-1 tk-mg-b-05 tk-pd-y-05 tk-border-y tk-modal-content__header-actions">
          <button
            className="tk-button tk-button--small tk-button--text"
            onClick={this._handleSelectAll}
          >
            Select All
          </button>
          <button
            className="tk-button tk-button--small tk-button--text tk-mg-l-05"
            onClick={this._handleSelectNone}
          >
            Select None
          </button>
        </div>
        <div className="tk-category-filter__category-list tk-pd-x-05">{categoriesList}</div>
        <div className="tk-flex tk-justify-content-center tk-mg-t-1">
          <button className="tk-button tk-button--hollow" onClick={this.props.onCancel}>
            Cancel
          </button>
          <button className="tk-button tk-mg-l-05" onClick={this._save}>
            Done
          </button>
        </div>
      </div>
    );
  }

  _handleSelectAll = () => {
    const { categoryFilterIds } = this.state;
    categoryFilterIds.clear();
    this.setState({ categoryFilterIds });
  };

  _handleSelectNone = () => {
    const { categoryFilterIds } = this.state;

    this._masterCategoriesCollection.forEach(masterCategory => {
      const { entityId: masterCategoryId } = masterCategory;
      const isHiddenMasterCategory = masterCategory.isHiddenMasterCategory();

      if (!masterCategory.isTombstone && (!masterCategory.internalName || isHiddenMasterCategory)) {
        const subCategories = this._subCategoriesCollection.findItemsByMasterCategoryId(
          masterCategoryId
        );
        if (!subCategories) {
          return;
        }

        subCategories.forEach(subCategory => {
          const { entityId: subCategoryId } = subCategory;
          if (!subCategory.isTombstone || (!subCategory.internalName || isHiddenMasterCategory)) {
            categoryFilterIds.add(subCategoryId);
          }
        });
      }
    });

    this.setState({ categoryFilterIds });
  };

  _handleMasterCategoryToggled = ({ currentTarget }) => {
    const { checked, name } = currentTarget;
    const { categoryFilterIds } = this.state;
    const subCategories = this._subCategoriesCollection.findItemsByMasterCategoryId(name);
    if (!subCategories) {
      return;
    }

    if (checked) {
      subCategories.forEach(({ entityId }) => categoryFilterIds.delete(entityId));
    } else {
      subCategories.forEach(({ entityId }) => categoryFilterIds.add(entityId));
    }

    this.setState({ categoryFilterIds });
  };

  _handleSubCategoryToggled = ({ currentTarget }) => {
    const { checked, name } = currentTarget;
    const { categoryFilterIds } = this.state;
    if (checked) {
      categoryFilterIds.delete(name);
    } else {
      categoryFilterIds.add(name);
    }

    this.setState({ categoryFilterIds });
  };

  _save = () => {
    this.props.onSave(this.state.categoryFilterIds);
  };
}
