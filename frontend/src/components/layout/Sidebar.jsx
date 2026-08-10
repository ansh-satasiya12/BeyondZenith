import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    GitBranch,
    Code2,
    Code,
    Settings,
} from "lucide-react";
import UserMenu from "./UserMenu";

const navigation = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "GitHub",
        path: "/github",
        icon: GitBranch,
    },
    {
        label: "Codeforces",
        path: "/codeforces",
        icon: Code2,
    },
    {
        label: "LeetCode",
        path: "/leetcode",
        icon: Code,
    },
    {
        label: "Settings",
        path: "/settings",
        icon: Settings,
    },
];

function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 hidden h-screen w-60 border-r border-border-subtle bg-bg-surface lg:flex lg:flex-col">
            <div className="border-b border-border-subtle p-6">
                <h1 className="font-display text-xl font-bold text-text-primary">
                    BeyondZenith
                </h1>
            </div>

            <nav className="flex-1 p-4">
                <div className="space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-md px-4 py-3 font-body text-sm transition ${isActive
                                        ? "border-l-2 border-brand-500 bg-bg-surface-raised text-text-primary"
                                        : "text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary"
                                    }`
                                }
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>
            <UserMenu />
        </aside>
    );
}

export default Sidebar;