import { useCallback, useEffect, useRef, useState } from 'react';
import { apiError } from '../api/client';
import { responseError, toCollection } from '../lib/apiData';

export default function useApiResource(fetcher, options = {}) {
  const { enabled = true, params, key = '' } = options;
  const fetcherRef = useRef(fetcher);
  const paramsRef = useRef(params);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');

  fetcherRef.current = fetcher;
  paramsRef.current = params;

  const load = useCallback(async () => {
    if (!enabled) return [];

    setLoading(true);
    setError('');

    try {
      const response = await fetcherRef.current(paramsRef.current);
      const serverError = responseError(response.data);
      if (serverError) throw new Error(serverError);

      const result = toCollection(response.data);
      setData(result);
      return result;
    } catch (requestError) {
      setError(apiError(requestError));
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, [enabled, key]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  return { data, setData, loading, error, reload: load };
}
