import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MobileNav from "./MobileNav";

const pageTitles = {
    "/dashboard": "Dashboard",
    "/github": "GitHub",
    "/codeforces": "Codeforces",
    "/leetcode": "LeetCode",
    "/settings": "Settings",
};

function AppLayout() {
    const location = useLocation();

    const title = pageTitles[location.pathname] || "BeyondZenith";

    return (
        <div className="min-h-screen bg-bg-canvas">
            <Sidebar />

            <div className="lg:ml-60">
                <TopBar title={title} />

                <main className="p-6">
                    <Outlet />
                </main>
            </div>
            <MobileNav />
        </div>
    );
}

export default AppLayout;