import * as React from 'react';
import * as PropTypes from 'prop-types';
import './style.scss';

export class ModalContainer extends React.Component {
  static propTypes = {
    closeModal: PropTypes.func.isRequired,
    modal: PropTypes.any.isRequired,
    modalProps: PropTypes.any,
  };

  render() {
    const Modal = this.props.modal;

    return (
      <div className="tk-modal-container" onClick={this._handleClickOutside}>
        <div className="tk-modal-content" onClick={this._handleClickInside}>
          <Modal {...this.props.modalProps} />
        </div>
      </div>
    );
  }

  _handleClickOutside = (event) => {
    this.props.closeModal();
  };
  _handleClickInside = (event) => {
    event.stopPropagation();
  };
}
