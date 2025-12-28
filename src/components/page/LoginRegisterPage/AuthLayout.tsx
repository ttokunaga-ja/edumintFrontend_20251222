import React from 'react';
import { Card } from '@/components/primitives/card'; interface AuthLayoutProps { title: string; description?: string; children: React.ReactNode;
} export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, description, children }) => { return ( <div style={{ display: undefined, alignItems: "center", justifyContent: "center", paddingLeft: "1rem", paddingRight: "1rem" }> <Card > <div > <h1 >{title}</h1> {description && <p >{description}</p>} </div> {children} </Card> </div> );
};
