import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error to monitoring service here
    // Example: send to Sentry or server-side log
    // console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: '#fff7f7', border: '1px solid #ffd1d1', borderRadius: 6 }}>
          <h3 style={{ margin: 0, color: '#c53030' }}>Đã xảy ra lỗi trong thành phần.</h3>
          <p style={{ color: '#6b2a2a' }}>Vui lòng thử tải lại trang hoặc liên hệ với quản trị viên.</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
