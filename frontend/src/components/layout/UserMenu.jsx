import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function UserMenu() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="border-t border-border-subtle p-4">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-mono text-sm font-semibold text-white">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm font-medium text-text-primary">
                        {user?.name || "User"}
                    </p>

                    <p className="truncate font-body text-xs text-text-secondary">
                        {user?.email || ""}
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary"
            >
                <LogOut size={16} />
                Log out
            </button>
        </div>
    );
}

export default UserMenu;