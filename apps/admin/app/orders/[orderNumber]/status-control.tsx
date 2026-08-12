'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Truck } from 'lucide-react';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@bobby/shared';
import { Alert, Button } from '@bobby/ui';
import { updateOrderStatus } from './actions';

export function StatusControl({
  orderNumber,
  status,
  transitions,
}: {
  orderNumber: string;
  status: OrderStatus;
  transitions: OrderStatus[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function move(next: OrderStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderNumber, next);
      if (result.ok) router.refresh();
      else setError(result.error ?? 'Could not update the order.');
    });
  }

  return (
    <div className="border-line bg-card border p-5">
      <h2 className="font-display text-maroon text-lg">Update status</h2>

      {transitions.length === 0 ? (
        <p className="text-muted mt-2 text-xs">
          This order is in a final state. No further changes are possible.
        </p>
      ) : (
        <>
          <p className="text-muted mt-1 text-xs">
            Currently <strong className="text-ink">{ORDER_STATUS_LABELS[status]}</strong>. Only
            valid next steps are shown.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {transitions.map((next) => (
              <Button
                key={next}
                size="sm"
                variant={next === 'CANCELLED' || next === 'REFUNDED' ? 'outline' : 'primary'}
                onClick={() => move(next)}
                loading={pending}
              >
                {ORDER_STATUS_LABELS[next]}
              </Button>
            ))}
          </div>
        </>
      )}

      {error && (
        <Alert tone="danger" className="mt-3">
          {error}
        </Alert>
      )}

      {status === 'PACKED' && (
        <div className="border-line mt-4 border-t pt-4">
          <p className="text-muted flex items-start gap-2 text-xs">
            <Truck className="text-gold-muted mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>
              With Shiprocket connected, marking this shipped would request a courier, assign an AWB
              and generate the label. Add credentials to <code>.env</code> to enable it.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
