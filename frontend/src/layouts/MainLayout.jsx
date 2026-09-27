import { NavLink, Outlet } from "react-router-dom";
import { AppShell, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  LayoutDashboard,
  Database,
  CloudRain,
  Waves,
  ChartNoAxesCombined,
  Lightbulb,
} from "lucide-react";

function MainLayout() {
  const navigation = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Historical Data",
      path: "/historical-data",
      icon: Database,
    },
    {
      name: "Forecast",
      path: "/forecast",
      icon: CloudRain,
    },
    {
      name: "Flood Events",
      path: "/flood-events",
      icon: Waves,
    },
    {
      name: "Event Difficulty",
      path: "/event-difficulty",
      icon: ChartNoAxesCombined,
    },
    {
      name: "Explainability",
      path: "/explainability",
      icon: Lightbulb,
    },
  ];

  return (
    <AppShell
      navbar={{
        width: 270,
        breakpoint: "md",
        collapsed: {
          mobile: true,
        },
      }}
      header={{
        height: {
          base: 60,
          md: 0,
        },
      }}
      padding="lg"
      styles={{
        main: {
          background: "transparent",
        },
        navbar: {
          background: "rgba(255, 255, 255, 0.035)",
          backdropFilter: "blur(28px) saturate(140%)",
          WebkitBackdropFilter: "blur(28px) saturate(140%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.14)",
          boxShadow: "4px 0 30px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <AppShell.Header
        hiddenFrom="md"
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <Group h="100%" px="md">
          <Text size="lg" fw={700} c="white">
            🌊 FloodWatch
          </Text>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Text size="xl" fw={700} c="white">
            🌊 FloodWatch
          </Text>

          <Text size="xs" c="gray.5" mt={4}>
            Historical Flood Forecasting
          </Text>
        </AppShell.Section>

        <AppShell.Section grow mt="xl">
          <Stack gap="xs">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={{ textDecoration: "none" }}
                >
                  {({ isActive }) => (
                    <Group
                      gap="sm"
                      px="sm"
                      py="sm"
                      style={{
                        borderRadius: 10,
                        color: isActive ? "#ffffff" : "#94a3b8",
                        background: isActive
                          ? "rgba(255, 255, 255, 0.12)"
                          : "transparent",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <ThemeIcon
                        variant="transparent"
                        size="sm"
                        c={isActive ? "cyan.3" : "gray.5"}
                      >
                        <Icon size={18} />
                      </ThemeIcon>

                      <Text size="sm" fw={isActive ? 600 : 400}>
                        {item.name}
                      </Text>
                    </Group>
                  )}
                </NavLink>
              );
            })}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Text size="xs" c="gray.6">
            White Volta Basin
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export default MainLayout;
