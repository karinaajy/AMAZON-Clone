import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <h2>😔 出现了一些问题</h2>
            <p>很抱歉，页面遇到了错误。请刷新页面重试。</p>
            <button 
              className="error-boundary__button"
              onClick={() => window.location.reload()}
            >
              刷新页面
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="error-boundary__details">
                <summary>错误详情 (开发模式)</summary>
                <pre>{this.state.error && this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
