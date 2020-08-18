import * as React from 'react';
import { ModalContainer } from '../components/modal-container';

const { Provider, Consumer } = React.createContext({
  showModal: () => {},
  closeModal: () => {},
});

export function withModalContextProvider(InnerComponent) {
  return class WithModalContextProvider extends React.Component {
    state = {
      modal: null,
      modalProps: null,
    };

    render() {
      const Modal = this.state.modal;

      return (
        <React.Fragment>
          <Provider
            value={{
              closeModal: this._closeModal,
              showModal: this._showModal,
            }}
          >
            <InnerComponent {...this.props} />
          </Provider>
          {Modal && (
            <ModalContainer
              closeModal={this._closeModal}
              modal={this.state.modal}
              modalProps={this.state.modalProps}
            />
          )}
        </React.Fragment>
      );
    }

    _closeModal = () => {
      this.setState({ modal: null, modalProps: null });
    };

    _showModal = (modal, modalProps) => {
      this.setState({ modal, modalProps });
    };
  };
}

export function withModalContext(mapContextToProps) {
  return function(InnerComponent) {
    return class WithModalContextProvider extends React.Component {
      render() {
        return (
          <Consumer>
            {value => <InnerComponent {...this.props} {...mapContextToProps(value)} />}
          </Consumer>
        );
      }
    };
  };
}
