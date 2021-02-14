import React from 'react';
import PropTypes from 'prop-types';

// Generic error boundary component.
//
// To use a custom fallback UI, inherit from this component and override the
// `renderOnError` method.

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // This function can take a 'error' arg, in case that's helpful for the UI
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
    // This is ops so console is perfect for error info
    console.error(error); // eslint-disable-line no-console
    console.error(info); // eslint-disable-line no-console
  }

  renderOnError() {
    return (
      <div>Something went wrong.</div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderOnError();
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
};

export default ErrorBoundary;
