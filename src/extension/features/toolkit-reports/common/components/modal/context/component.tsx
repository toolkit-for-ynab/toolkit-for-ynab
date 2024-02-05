import { ModalContainer } from '../components/modal-container';
import React, { ComponentType, createContext } from 'react';

export type ModalContextType = {
  showModal: <T extends object>(modal: ComponentType<T>, props: T) => void;
  closeModal: () => void;
};

const { Provider, Consumer } = createContext<ModalContextType>({
  showModal: () => {},
  closeModal: () => {},
});

export function withModalContextProvider<T extends object>(InnerComponent: ComponentType<T>) {
  return class WithModalContextProvider extends React.Component<
    T,
    { modal: null | ComponentType<any>; modalProps: any }
  > {
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
              modal={Modal}
              modalProps={this.state.modalProps}
            />
          )}
        </React.Fragment>
      );
    }

    _closeModal = () => {
      this.setState({ modal: null, modalProps: null });
    };

    _showModal = <T extends object>(modal: ComponentType<T>, modalProps: T) => {
      this.setState({ modal, modalProps });
    };
  };
}

export function withModalContext<T extends object>(
  mapContextToProps: (ctx: ModalContextType) => T
) {
  return function <P extends object>(InnerComponent: ComponentType<P>) {
    return class WithModalContextProvider extends React.Component {
      render() {
        return (
          <Consumer>
            {/* @ts-ignore */}
            {(value) => <InnerComponent {...this.props} {...mapContextToProps(value)} />}
          </Consumer>
        );
      }
    };
  };
}
