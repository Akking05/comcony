import { useEffect, useState } from 'react';
import { adminApi } from '../api.js';
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  IconButton,
  PageHeader,
  Select,
  Spinner,
  Textarea,
  formatDate,
  useToast,
} from '../components/ui.jsx';

const STATUSES = [
  { value: 'new', label: 'Новая', tone: 'success' },
  { value: 'in_progress', label: 'В работе', tone: 'warning' },
  { value: 'done', label: 'Закрыта', tone: 'neutral' },
  { value: 'spam', label: 'Спам', tone: 'danger' },
];

const statusMeta = (value) => STATUSES.find((status) => status.value === value) ?? STATUSES[0];

function RequestCard({ request, readOnly, onStatus, onNote, onDelete }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(request.note ?? '');
  const meta = statusMeta(request.status);

  return (
    <div className="rounded-sm border border-hairline-soft bg-part-fill">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <Badge tone={meta.tone}>{meta.label}</Badge>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="font-body-md text-[15px] text-ink">{request.name}</span>
          <span className="min-w-0 flex-1 truncate font-body-md text-[15px] text-ink-dim">
            {request.subject || '(без темы)'}
          </span>
        </button>

        {request.product_name && (
          <a
            href={`/products/${request.product_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden font-label-md text-label-md uppercase text-stencil hover:text-ink sm:inline"
          >
            {request.product_name}
          </a>
        )}

        <span className="hidden font-label-xs text-label-xs text-ink-quiet md:inline">
          {formatDate(request.created_at)}
        </span>

        <IconButton icon={open ? 'expand_less' : 'expand_more'} title="Подробнее" onClick={() => setOpen(!open)} />
      </div>

      {open && (
        <div className="space-y-4 border-t border-hairline-soft px-4 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {request.email && (
              <div>
                <span className="block font-label-2xs text-label-2xs uppercase text-ink-quiet">Email</span>
                <a href={`mailto:${request.email}`} className="font-body-md text-[15px] text-ink underline decoration-hairline hover:decoration-stencil">
                  {request.email}
                </a>
              </div>
            )}
            {request.phone && (
              <div>
                <span className="block font-label-2xs text-label-2xs uppercase text-ink-quiet">Телефон</span>
                <a href={`tel:${request.phone}`} className="font-body-md text-[15px] text-ink underline decoration-hairline hover:decoration-stencil">
                  {request.phone}
                </a>
              </div>
            )}
          </div>

          {request.message && (
            <div>
              <span className="mb-1 block font-label-2xs text-label-2xs uppercase text-ink-quiet">
                Сообщение
              </span>
              <p className="whitespace-pre-line font-body-md text-[15px] text-ink">{request.message}</p>
            </div>
          )}

          {!readOnly && (
            <div className="flex flex-wrap items-end gap-3 border-t border-hairline-soft pt-4">
              <label className="flex-1 space-y-1.5">
                <span className="block font-label-2xs text-label-2xs uppercase text-ink-quiet">
                  Внутренняя заметка
                </span>
                <Textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
              </label>

              <Button
                icon="save"
                disabled={note === (request.note ?? '')}
                onClick={() => onNote(request.id, note)}
              >
                Сохранить
              </Button>

              <Select
                value={request.status}
                onChange={(event) => onStatus(request.id, event.target.value)}
                className="w-auto"
              >
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>

              <IconButton icon="delete" title="Удалить заявку" onClick={() => onDelete(request)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Requests({ user }) {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const notify = useToast();

  const readOnly = user.role === 'viewer';

  const load = () => {
    setError(null);
    adminApi.requests(filter).then(setData).catch(setError);
  };

  useEffect(load, [filter]);

  const changeStatus = async (id, status) => {
    try {
      await adminApi.updateRequest(id, { status });
      load();
      notify('Статус обновлён');
    } catch (statusError) {
      notify(statusError.message, 'error');
    }
  };

  const saveNote = async (id, note) => {
    try {
      await adminApi.updateRequest(id, { note });
      load();
      notify('Заметка сохранена');
    } catch (noteError) {
      notify(noteError.message, 'error');
    }
  };

  const remove = async () => {
    const request = confirming;
    setConfirming(null);

    try {
      await adminApi.deleteRequest(request.id);
      load();
      notify('Заявка удалена');
    } catch (deleteError) {
      notify(deleteError.message, 'error');
    }
  };

  if (error) return <ErrorState error={error} onRetry={load} />;
  if (!data) return <Spinner />;

  const total = Object.values(data.counts).reduce((sum, count) => sum + count, 0);

  return (
    <>
      <PageHeader title="Заявки" description={`Всего ${total}, новых ${data.counts.new ?? 0}`} />

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('')}
          aria-pressed={filter === ''}
          className={`border px-3.5 py-2 font-label-md text-label-md uppercase transition-colors duration-150 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            filter === '' ? 'kns-roll border-hairline text-ink' : 'border-hairline-soft text-ink-dim hover:border-hairline hover:text-ink'
          }`}
        >
          Все ({total})
        </button>

        {STATUSES.map((status) => (
          <button
            key={status.value}
            type="button"
            onClick={() => setFilter(status.value)}
            aria-pressed={filter === status.value}
            className={`border px-3.5 py-2 font-label-md text-label-md uppercase transition-colors duration-150 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              filter === status.value
                ? 'kns-roll border-hairline text-ink'
                : 'border-hairline-soft text-ink-dim hover:border-hairline hover:text-ink'
            }`}
          >
            {status.label} ({data.counts[status.value] ?? 0})
          </button>
        ))}
      </div>

      {data.requests.length === 0 ? (
        <EmptyState
          icon="mark_email_read"
          title={filter ? 'В этой категории пусто' : 'Заявок пока нет'}
          description="Сюда попадают обращения с формы на странице «Контакты» и запросы цены со страниц товаров."
        />
      ) : (
        <div className="space-y-2">
          {data.requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              readOnly={readOnly}
              onStatus={changeStatus}
              onNote={saveNote}
              onDelete={setConfirming}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        title="Удалить заявку?"
        description={`Обращение от «${confirming?.name}» будет удалено безвозвратно.`}
        onConfirm={remove}
        onCancel={() => setConfirming(null)}
      />
    </>
  );
}
