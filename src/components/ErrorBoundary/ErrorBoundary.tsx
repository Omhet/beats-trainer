import * as Accordion from "@radix-ui/react-accordion";
import { Component, ErrorInfo, ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo,
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleCopyToClipboard = () => {
        const { error, errorInfo } = this.state;
        const message = `Error: ${error?.message}\n\nStack Trace:\n${error?.stack}\n\nComponent Stack:\n${errorInfo?.componentStack}`;
        navigator.clipboard.writeText(message);
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className={styles.container}>
                    <div className={styles.content}>
                        <h1 className={styles.title}>Something went wrong.</h1>
                        <p className={styles.message}>
                            {this.state.error?.message}
                        </p>

                        <div className={styles.actions}>
                            <button
                                onClick={this.handleReload}
                                className={styles.button}
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={this.handleCopyToClipboard}
                                className={styles.button}
                            >
                                Copy Error Details
                            </button>
                        </div>

                        <Accordion.Root
                            type="single"
                            collapsible
                            className={styles.accordionRoot}
                        >
                            <Accordion.Item
                                value="stack-trace"
                                className={styles.accordionItem}
                            >
                                <Accordion.Header>
                                    <Accordion.Trigger
                                        className={styles.accordionTrigger}
                                    >
                                        Show Stack Trace
                                    </Accordion.Trigger>
                                </Accordion.Header>
                                <Accordion.Content
                                    className={styles.accordionContent}
                                >
                                    <div className={styles.stackContainer}>
                                        <pre className={styles.stack}>
                                            {this.state.error?.stack}
                                            {"\n\nComponent Stack:\n"}
                                            {
                                                this.state.errorInfo
                                                    ?.componentStack
                                            }
                                        </pre>
                                    </div>
                                </Accordion.Content>
                            </Accordion.Item>
                        </Accordion.Root>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
