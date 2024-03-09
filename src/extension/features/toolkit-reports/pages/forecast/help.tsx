import React from 'react';
import './styles.scss';
import { useModal } from 'toolkit/extension/features/toolkit-reports/common/components/modal';

export const ForecastHelp = () => {
  const { showModal } = useModal();
  return (
    <div className="tk-forecast-help-container">
      <button
        onClick={() => showModal(HelpModal, {})}
        className="tk-button tk-button--hollow tk-button--medium tk-button--text"
      >
        How does this work?
      </button>
    </div>
  );
};

const HelpModal = () => {
  const { closeModal } = useModal();
  return (
    <div className="tk-forecast-help-modal">
      <div>
        <p>
          This report uses{' '}
          <a href="https://www.investopedia.com/terms/m/montecarlosimulation.asp" target="_blank">
            Monte Carlo Simulation
          </a>{' '}
          to calculate the probability of having a different net worth in 10 years.
        </p>

        <p>
          Based on your prior net worth change history, it projects 100 possible scenarios in which
          your net worth could change in the next 10 years. It then calculates the minimal net worth
          for the top 90%, 75%, 50%, 25%, and 10% projections (i.e., in the top 10% of projections,
          your final net worth was $xx,xxx or more).
        </p>

        <p>For each bucket, an example projection is then selected and displayed on chart.</p>
      </div>
      <button onClick={closeModal} className="tk-button">
        Close
      </button>
    </div>
  );
};
