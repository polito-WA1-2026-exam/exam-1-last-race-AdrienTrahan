import { useAuth } from '../providers/auth-provider.jsx';
import { ConnectionPanel } from './ConnectionPanel.jsx';

export function App() {
    const { user, login, register, logout } = useAuth();
    return (
        <>
            {user?.type === 'Anonymous' && <ConnectionPanel />}
            {user?.type === 'LoggedIn' && (
                <button onClick={logout}>Logout</button>
            )}
        </>
    );
}
