import { LogOut } from "lucide-react";

function UserMenu() {
    return (
        <div className="border-t border-border-subtle p-4">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-mono text-sm font-semibold text-white">
                    U
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm font-medium text-text-primary">
                        User
                    </p>

                    <p className="truncate font-body text-xs text-text-secondary">
                        Developer
                    </p>
                </div>
            </div>

            <button
                type="button"
                className="mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary"
            >
                <LogOut size={16} />
                Log out
            </button>
        </div>
    );
}

export default UserMenu;