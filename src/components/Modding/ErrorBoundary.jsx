import React from "react";
import { Alert, AlertTitle, Button } from "@mui/material";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Database operation error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          <AlertTitle>Error</AlertTitle>
          Something went wrong with the database operation.
          <br />
          Error: {this.state.error?.message}
          <br />
          <Button
            color="inherit"
            size="small"
            onClick={() => this.setState({ hasError: false, error: null })}
            sx={{ mt: 1 }}
          >
            Try Again
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
