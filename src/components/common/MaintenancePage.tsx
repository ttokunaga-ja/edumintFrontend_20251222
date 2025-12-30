import React from 'react'; export interface MaintenancePageProps { title?: string; message?: string;
} const MaintenancePage: React.FC<MaintenancePageProps> = ({ title = 'メンテナンス中です', message = '現在システムメンテナンスを実施しています。しばらく時間をおいてから再度お試しください。',
}) => { return ( <div> <div> <div style={{ display: undefined, alignItems: "center", justifyContent: "center" }> <span>🛠️</span> </div> <h1>{title}</h1> <p>{message}</p> </div> </div> );
}; export default MaintenancePage;
