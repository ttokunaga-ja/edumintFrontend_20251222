// @ts-nocheck
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/primitives/alert';
import { Button } from '@/components/primitives/button';

export type HealthStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';

export interface HealthAlertProps {
  category: string; // e.g., "コイン残高・出金", "AI生成エンジン", "コミュニティ機能"
  status: HealthStatus;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  disableCTA?: boolean; // CTAボタンを無効化するか
  className?: string;
}

const statusConfig = {
  operational: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-900',
    iconClassName: 'text-green-600',
  },
  degraded: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    iconClassName: 'text-yellow-600',
  },
  outage: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-900',
    iconClassName: 'text-red-600',
  },
  maintenance: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-900',
    iconClassName: 'text-blue-600',
  },
};

export function ContextHealthAlert({
  category,
  status,
  message,
  action,
  disableCTA,
  className = '',
}: HealthAlertProps) {
  // operational の場合は表示しない
  if (status === 'operational') return null;

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Alert className={`${config.className} ${className} mb-4`}>
      <Icon className={`size-4 ${config.iconClassName}`} />
      <AlertTitle style={{
      display: "flex",
      alignItems: "center"
    }}>
        <span>{category}</span>
        {disableCTA && (
          <span className={undefined}>
            一時的にご利用いただけません
          </span>
        )}
      </AlertTitle>
      <AlertDescription className={undefined}>
        <p className={undefined}>{message}</p>
        {action && (
          <Button
            variant="outline"
            size="sm"
            onClick={action.onClick}
            className={undefined}
          >
            {action.label}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

export interface ServiceHealthSummaryProps {
  services: Array<{
    category: string;
    status: HealthStatus;
    message: string;
    action?: {
      label: string;
      onClick: () => void;
    };
<<<<<<< HEAD
  };
=======
  }>;
>>>>>>> parent of 0a29049 (fix(jsx): add missing closing brace before > (auto))
  className?: string;
}

export function ServiceHealthSummary({ services, className = '' }: ServiceHealthSummaryProps) {
  // 問題のあるサービスのみを表示
  const alertServices = services.filter((s) => s.status !== 'operational');

  if (alertServices.length === 0) {
    return (
      <div className={`border border-green-200 bg-green-50 rounded-xl p-6 ${className}`}>
        <div style={{
      display: "flex",
      alignItems: "center"
    }}>
          <CheckCircle className={undefined} />
          <div>
            <h3 className={undefined}>すべてのサービスが正常に稼働中</h3>
            <p className={undefined}>
              現在、すべての機能を通常どおりご利用いただけます。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className={undefined}>サービス状態</h3>
      <div className={undefined}>
        {services.map((service, index) => {
          const config = statusConfig[service.status];
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={`border rounded-xl p-4 ${service.status === 'operational' ? 'border-gray-200 bg-gray-50' : config.className
                }`}
            >
              <div style={{
      display: "flex"
    }}>
                <Icon
                  className={`size-5 flex-shrink-0 mt-0.5 ${service.status === 'operational' ? 'text-gray-500' : config.iconClassName
                    }`} />
                <div className={undefined}>
                  <h4 className={undefined}>{service.category}</h4>
                  <p className={undefined}>{service.message}</p>
                  {service.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={service.action.onClick}
                      className={undefined}
                    >
                      {service.action.label}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
