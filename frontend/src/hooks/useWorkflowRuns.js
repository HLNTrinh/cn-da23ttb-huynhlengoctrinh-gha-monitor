import { useEffect, useState } from 'react';
import { getRuns } from '../services/workflowApi.js';

export default function useWorkflowRuns(params = '') {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: '' }));
    getRuns(params).then((data) => {
      if (active) setState({ data, loading: false, error: '' });
    }).catch((error) => {
      if (active) setState({ data: null, loading: false, error: error.message });
    });
    return () => { active = false; };
  }, [params]);
  return state;
}
