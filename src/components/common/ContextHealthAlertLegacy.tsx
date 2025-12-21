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
      <AlertTitle className="flex items-center justify-between">
        <span>{category}</span>
        {disableCTA && (
          <span className="text-xs font-normal opacity-75">
            一時的にご利用いただけません
          </span>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm mb-3">{message}</p>
        {action && (
          <Button
            variant="outline"
            size="sm"
            onClick={action.onClick}
            className="mt-2"
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
  }>;
  className?: string;
}

export function ServiceHealthSummary({ services, className = '' }: ServiceHealthSummaryProps) {
  // 問題のあるサービスのみを表示
  const alertServices = services.filter((s) => s.status !== 'operational');

  if (alertServices.length === 0) {
    return (
      <div className={`border border-green-200 bg-green-50 rounded-xl p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <CheckCircle className="size-6 text-green-600" />
          <div>
            <h3 className="text-green-900">すべてのサービスが正常に稼働中</h3>
            <p className="text-sm text-green-700 mt-1">
              現在、すべての機能を通常どおりご利用いただけます。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-gray-900">サービス状態</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service, index) => {
          const config = statusConfig[service.status];
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={`border rounded-xl p-4 ${service.status === 'operational' ? 'border-gray-200 bg-gray-50' : config.className
                }`}
            >
              <div className="flex items-start space-x-3">
                <Icon
                  className={`size-5 flex-shrink-0 mt-0.5 ${service.status === 'operational' ? 'text-gray-500' : config.iconClassName
                    }`}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1">{service.category}</h4>
                  <p className="text-xs opacity-90 mb-2">{service.message}</p>
                  {service.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={service.action.onClick}
                      className="text-xs h-8"
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
