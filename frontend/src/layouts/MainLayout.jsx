import { NavLink, Outlet } from "react-router-dom"
import {
  LayoutDashboard,
  Database,
  CloudRain,
  Waves,
  ChartNoAxesCombined,
  Lightbulb,
} from "lucide-react"

function MainLayout() {
  const navigation = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Historical Data", path: "/historical-data", icon: Database },
    { name: "Forecast", path: "/forecast", icon: CloudRain },
    { name: "Flood Events", path: "/flood-events", icon: Waves },
    { name: "Event Difficulty", path: "/event-difficulty", icon: ChartNoAxesCombined },
    { name: "Explainability", path: "/explainability", icon: Lightbulb },
  ]

  return (
    <div className="min-h-screen bg-transparent text-slate-200">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] border-r border-white/10 bg-white/[0.035] backdrop-blur-2xl md:block">
        <div className="flex h-full flex-col p-5">
          <div>
            <h1 className="text-xl font-bold text-white">
              🌊 FloodWatch
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Historical Flood Forecasting
            </p>
          </div>

          <nav className="mt-8 flex-1 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                      isActive
                        ? "bg-white/[0.12] font-semibold text-white"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        className={isActive ? "text-cyan-300" : "text-slate-500"}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>

          <p className="text-xs text-slate-600">
            White Volta Basin
          </p>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 h-[60px] border-b border-white/10 bg-white/[0.06] backdrop-blur-2xl md:hidden">
        <div className="flex h-full items-center px-4">
          <span className="text-lg font-bold text-white">
            🌊 FloodWatch
          </span>
        </div>
      </header>

      <main className="min-h-screen px-4 py-6 pt-[84px] md:ml-[270px] md:px-8 md:py-8 md:pt-8">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout