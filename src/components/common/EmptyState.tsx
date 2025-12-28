import React from 'react'; export interface EmptyStateProps { title?: string; description?: string; action?: React.ReactNode; ?: string; children?: React.ReactNode;
} const EmptyState: React.FC<EmptyStateProps> = ({ title = 'No data available', description, action, children,
}) => { return ( <div > <h3 >{title}</h3> {description && <p >{description}</p>} {children} {action && <div style={{ display: undefined, justifyContent: "center" }>{action}</div>} </div> );
}; export default EmptyState;
