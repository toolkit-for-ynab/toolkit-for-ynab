import React, { useEffect } from 'react';
export const ReconcileInputModal = () => {
  const [shouldShow, setShouldShow] = useEffect(true);
  const [amount, setAmount] = useEffect(0.0);

  let setAmountWithValidation = e => {
    let value = e.target.value;
    setAmount(value);
    if (numberValidation(value)) {
      console.log('passed');
    } else {
      console.log('error');
    }
  };

  let numberValidation = input => {
    if (input.contains('!')) {
      return false;
    }
    return true;
  };
  if (!shouldShow) return;
  return (
    <div className={'modal'}>
      Attempt to auto-reconcile
      <input type="text" onChange={setAmountWithValidation}>
        {amount}
      </input>{' '}
      amount
      <button>YES</button>
      <button onClick={() => setShouldShow(false)}>No</button>
    </div>
  );
};
