import { Fragment } from 'react';
import type { FC, ReactNode, SyntheticEvent, FormEvent } from 'react'; export interface PageHeaderProps { title: string; description?: string; actions?: ReactNode;
} export const PageHeader: FC<PageHeaderProps> = ({ title, description, actions, }) => { return ( <div> <div> <h1>{title}</h1> {description && <p>{description}</p>} </div> {actions && <div style={{ display: undefined, alignItems: "center", gap: "0.5rem" }>{actions}</div>} </div> );
}; export default PageHeader;
