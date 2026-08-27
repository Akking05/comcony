import { useEffect, useState } from 'react';
import { adminApi } from '../api.js';
import { Badge, ErrorState, PageHeader, Panel, Select, Spinner, formatDate } from '../components/ui.jsx';

const STATUS_TONE = { new: 'success', in_progress: 'warning', done: 'neutral', spam: 'danger' };
const STATUS_LABEL = { new: 'Новая', in_progress: 'В работе', done: 'Закрыта', spam: 'Спам' };

function Metric({ icon, label, value, hint }) {
  return (
    <div className="rounded-sm border border-outline-variant/60 bg-surface/40 p-5">
      <div className="mb-3 flex items-center gap-2 text-primary">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
        <span className="font-label-sm text-[10px] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="font-headline-lg text-[32px] leading-none text-white">{value}</div>
      {hint && <div className="mt-2 font-label-sm text-[11px] text-outline">{hint}</div>}
    </div>
  );
}

/** Столбчатый график по дням — без библиотек, на flex. */
function DailyChart({ daily }) {
  if (!daily.length) {
    return <p className="py-8 text-center font-body-md text-body-md text-on-surface-variant">Пока нет данных за период.</p>;
  }

  const peak = Math.max(...daily.map((day) => day.visits), 1);

  return (
    <div className="flex h-44 items-end gap-1 overflow-x-auto pb-1">
      {daily.map((day) => (
        <div key={day.day} className="group flex min-w-[14px] flex-1 flex-col items-center gap-2">
          <div className="relative flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-sm bg-primary/30 transition-all group-hover:bg-primary/60"
              style={{ height: `${Math.max(2, (day.visits / peak) * 100)}%` }}
            ></div>
            <div className="pointer-events-none absolute -top-1 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-sm border border-outline-variant bg-surface px-2 py-1 font-label-sm text-[10px] text-white group-hover:block">
              {day.day}: {day.visits} визитов, {day.requests} заявок
            </div>
          </div>
          <span className="font-label-sm text-[9px] text-outline">{day.day.slice(8)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState(30);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    adminApi.stats(days).then(setStats).catch(setError);
  };

  useEffect(load, [days]);

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!stats) return <Spinner />;

  return (
    <>
      <PageHeader title="Дашборд" description="Сводка по каталогу, заявкам и посещаемости">
        <Select value={days} onChange={(event) => setDays(Number(event.target.value))} className="w-auto">
          <option value={7}>7 дней</option>
          <option value={30}>30 дней</option>
          <option value={90}>90 дней</option>
          <option value={365}>Год</option>
        </Select>
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon="inventory_2"
          label="Товары"
          value={stats.products.total}
          hint={`${stats.products.published} опубликовано, ${stats.products.draft} черновиков`}
        />
        <Metric
          icon="mark_email_unread"
          label="Заявки"
          value={stats.requests.total}
          hint={stats.requests.new > 0 ? `${stats.requests.new} новых` : 'Новых нет'}
        />
        <Metric icon="visibility" label="Визиты" value={stats.traffic.visits} hint={`за ${stats.period_days} дн.`} />
        <Metric
          icon="ads_click"
          label="Просмотры товаров"
          value={stats.traffic.product_views}
          hint={`за ${stats.period_days} дн.`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Посещаемость" className="xl:col-span-2">
          <DailyChart daily={stats.daily} />
        </Panel>

        <Panel title="Популярные товары">
          {stats.top_products.length === 0 ? (
            <p className="py-6 text-center font-body-md text-body-md text-on-surface-variant">
              Пока нет просмотров.
            </p>
          ) : (
            <ol className="space-y-3">
              {stats.top_products.map((product, index) => (
                <li key={product.slug} className="flex items-center gap-3">
                  <span className="font-label-mono w-5 text-[11px] text-outline">{index + 1}</span>
                  <a
                    href={`/products/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate font-body-md text-body-md text-on-surface hover:text-primary"
                  >
                    {product.name}
                  </a>
                  <span className="font-label-md text-label-md text-primary">{product.views}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <Panel
        title="Последние заявки"
        className="mt-6"
        action={
          <a href="/admin/requests" className="font-label-sm text-[11px] uppercase tracking-widest text-primary hover:underline">
            Все заявки
          </a>
        }
      >
        {stats.latest_requests.length === 0 ? (
          <p className="py-6 text-center font-body-md text-body-md text-on-surface-variant">Заявок пока нет.</p>
        ) : (
          <ul className="divide-y divide-outline-variant/40">
            {stats.latest_requests.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Badge tone={STATUS_TONE[request.status]}>{STATUS_LABEL[request.status]}</Badge>
                <span className="font-label-md text-label-md text-white">{request.name}</span>
                <span className="min-w-0 flex-1 truncate font-body-md text-body-md text-on-surface-variant">
                  {request.subject || request.product_name || '—'}
                </span>
                <span className="font-label-sm text-[11px] text-outline">{formatDate(request.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
