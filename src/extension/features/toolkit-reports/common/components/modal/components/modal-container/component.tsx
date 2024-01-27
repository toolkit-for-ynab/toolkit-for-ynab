import React from 'react';
import './style.scss';
import { ComponentType } from 'react';

type ModalContainerProps = {
  modal: ComponentType<any>;
  modalProps: any;
  closeModal: () => void;
};

export class ModalContainer extends React.Component<ModalContainerProps> {
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

  _handleClickOutside = (event: React.MouseEvent) => {
    this.props.closeModal();
  };
  _handleClickInside = (event: React.MouseEvent) => {
    event.stopPropagation();
  };
}
