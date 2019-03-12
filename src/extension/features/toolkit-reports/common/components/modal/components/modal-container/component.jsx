import * as React from 'react';
import * as PropTypes from 'prop-types';
import './style.scss';

export class ModalContainer extends React.Component {
  modalNode = null;

  static propTypes = {
    closeModal: PropTypes.func.isRequired,
    modal: PropTypes.any.isRequired,
    modalProps: PropTypes.any,
  };

  componentDidMount() {
    document.addEventListener('click', this._handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this._handleClick, false);
  }

  render() {
    const Modal = this.props.modal;

    return (
      <div className="tk-modal-container">
        <div className="tk-modal-content" ref={this._saveModalContentNode}>
          <Modal {...this.props.modalProps} />
        </div>
      </div>
    );
  }

  _saveModalContentNode = node => {
    this.modalContentNode = node;
  };

  _handleClick = event => {
    if (this.modalContentNode && this.modalContentNode.contains(event.target)) {
      return;
    }

    this.props.closeModal();
  };
}
