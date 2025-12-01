import { Sidebar } from "./SIdeBar";



export function DashboardLayout({
    children,
    sidebarItems,
    activePath,
    brandName,
}) {
    console.log(activePath)
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {
                activePath !== "/login" &&
                <Sidebar
                    items={sidebarItems}
                    activePath={activePath}
                    brandName={brandName}
                />

            }
            <main className="flex-1 overflow-auto">
                <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
