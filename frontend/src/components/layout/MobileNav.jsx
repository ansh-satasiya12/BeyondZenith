import { NavLink } from "react-router-dom";
import {
	LayoutDashboard,
	GitBranch,
	Code2,
	Code,
	Settings,
} from "lucide-react";

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

function MobileNav() {
	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border-subtle bg-bg-surface lg:hidden">
			{navigation.map((item) => {
				const Icon = item.icon;

				return (
					<NavLink
						key={item.path}
						to={item.path}
						aria-label={item.label}
						className={({ isActive }) =>
							`flex h-full w-full items-center justify-center ${isActive
								? "text-brand-500"
								: "text-text-secondary"
							}`
						}
					>
						<Icon size={22} />
					</NavLink>
				);
			})}
		</nav>
	);
}

export default MobileNav;