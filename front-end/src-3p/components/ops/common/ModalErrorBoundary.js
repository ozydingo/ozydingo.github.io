import ErrorBoundary from './ErrorBoundary';

class ModalErrorBoundary extends ErrorBoundary {
  // For modals that start hidden, render nothing on error.
  // This is meant to wrap modals placed in a parent component that are passed
  // a "show" or similar prop and are often hidden. Use a regular ErrorBoundary
  // inside the modal if you wish to display a fallback within a failed modal.
  renderOnError() {
    return null;
  }
}

export default ModalErrorBoundary;
