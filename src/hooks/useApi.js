import { useEffect, useState } from 'react';

/**
 * Загрузка данных из API. Возвращает { data, loading, error }.
 *
 * fetcher получает AbortSignal — запрос отменяется при уходе со страницы,
 * поэтому ответ от брошенного запроса не перезапишет состояние нового.
 */
export function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();

    setState((previous) => ({ ...previous, loading: true, error: null }));

    fetcher(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return;

        setState({ data: null, loading: false, error });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
