import * as React from 'react';
import * as PropTypes from 'prop-types';
import { withModalContextProvider } from '$tools/common/components/modal';
import {
  SelectedToolContextPropType,
  withToolContext,
  withToolContextProvider,
} from '$tools/common/components/tool-context/component';
import { ToolFilters } from './components/tool-filters';
import { ToolSelector } from './components/tool-selector';
import './styles.scss';

function mapContextToProps(context) {
  return {
    selectedTool: context.selectedTool,
  };
}

export class RootComponent extends React.Component {
  static propTypes = {
    selectedTool: PropTypes.shape(SelectedToolContextPropType),
  };

  state = {
    filteredTransactions: [],
  };

  render() {
    const { component: Tool } = this.props.selectedTool;

    return (
      <div className="tk-tools-root tk-flex tk-flex-column tk-full-height">
        <ToolSelector />
        <ToolFilters />
        <Tool />
      </div>
    );
  }
}

export const Root = withToolContextProvider(
  withModalContextProvider(withToolContext(mapContextToProps)(RootComponent))
);
