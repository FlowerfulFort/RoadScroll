import ReactDOM from 'react-dom/client';
import EntryPoint from './EntryPoint';

const root = document.querySelector('#root');
if (!root) throw new Error('html road failed');
ReactDOM.createRoot(root).render(
    // 무슨 이유인지는 모르겠지만 React 18에서 StrictMode로 렌더하면
    // 렌더 후 해제하고 다시 렌더함. 그래서 Control을 map에 추가하는 것이 두번 이루어짐.
    <EntryPoint />
);
