import * as React from 'react';
import * as PropTypes from 'prop-types';
import { TOOL_TYPES } from 'toolkit/extension/features/toolkit-tools/common/constants/tool-types';
import classnames from 'classnames';
import './styles.scss';

export class ToolSelectorComponent extends React.Component {
  static propTypes = {
    activeToolKey: PropTypes.string.isRequired,
    setActiveToolKey: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div className="tk-flex tk-pd-l-05 tk-flex-shrink-none tk-align-items-center tk-tool-selector">
        {TOOL_TYPES.map(({ key, name }) => {
          const toolNameClasses = classnames('tk-mg-r-05', 'tk-tool-selector__item', {
            'tk-tool-selector__item--active': this.props.activeToolKey === key,
          });

          return (
            <div className={toolNameClasses} data-tool-key={key} key={key} onClick={this._onSelect}>
              {name}
            </div>
          );
        })}
      </div>
    );
  }

  _onSelect = ({ currentTarget }) => {
    this.props.setActiveToolKey(currentTarget.dataset.toolKey);
  };
}
