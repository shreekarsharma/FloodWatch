import { Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import DischargeChart from "../charts/DischargeChart";
import RainfallChart from "../charts/RainfallChart";

const summaryCards = [
  {
    title: "Latest Discharge",
    value: "842 m³/s",
    description: "Most recent observed discharge",
  },
  {
    title: "Latest Rainfall",
    value: "18.4 mm",
    description: "Recent recorded rainfall",
  },
  {
    title: "Soil Moisture",
    value: "0.61",
    description: "Recent soil moisture level",
  },
  {
    title: "Warning Level",
    value: "GREEN",
    description: "Current historical status",
  },
];

const glassCardStyles = {
  background: "rgba(255, 255, 255, 0.07)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  backdropFilter: "blur(24px) saturate(140%)",
  WebkitBackdropFilter: "blur(24px) saturate(140%)",
  boxShadow:
    "0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
};

function Dashboard() {
  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={1} c="white">
            FloodWatch Dashboard
          </Title>

          <Text c="gray.5" mt="xs">
            Historical flood monitoring, multi-horizon forecasting, and event
            analysis for the White Volta Basin.
          </Text>
        </div>

        <Stack gap={2} align="flex-end">
          <Text size="xs" c="gray.5">
            Nawuni Gauge
          </Text>

          <Text size="sm" fw={600} c="white">
            White Volta Basin
          </Text>

          <Text size="xs" c="gray.6">
            Historical data
          </Text>
        </Stack>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }}>
        {summaryCards.map((card) => (
          <Card
            key={card.title}
            padding="lg"
            radius="lg"
            style={glassCardStyles}
          >
            <Text size="sm" c="gray.4" fw={500}>
              {card.title}
            </Text>

            <Text size="28px" fw={700} c="white" mt="sm">
              {card.value}
            </Text>

            <Text size="xs" c="gray.5" mt={4}>
              {card.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }}>
        <Card
          padding="lg"
          radius="lg"
          style={{
            ...glassCardStyles,
            minHeight: 430,
          }}
        >
          <Title order={3} c="white">
            Historical Discharge
          </Title>

          <Text size="sm" c="gray.5" mt={4} mb="md">
            Recent observed discharge at the Nawuni gauge
          </Text>

          <DischargeChart />
        </Card>

        <Card
          padding="lg"
          radius="lg"
          style={{
            ...glassCardStyles,
            minHeight: 430,
          }}
        >
          <Title order={3} c="white">
            Recent Rainfall
          </Title>

          <Text size="sm" c="gray.5" mt={4} mb="md">
            Recent recorded rainfall
          </Text>

          <RainfallChart />
        </Card>
      </SimpleGrid>

      <Card
        padding="lg"
        radius="lg"
        style={{
          ...glassCardStyles,
          minHeight: 430,
        }}
      >
        <Title order={3} c="white">
          Current Warning Status
        </Title>

        <Text size="sm" c="gray.5" mt={4}>
          Historical status based on observed discharge
        </Text>

        <Text size="32px" fw={700} c="green.4" mt="lg">
          GREEN
        </Text>

        <Text size="sm" c="gray.5" mt="xs">
          Conditions are currently below the defined warning thresholds.
        </Text>
      </Card>
      <Card padding="lg" radius="lg" style={glassCardStyles}>
        <Title order={3} c="white">
          Forecast Overview
        </Title>

        <Text size="sm" c="gray.5" mt={4} mb="lg">
          Multi-horizon discharge forecasts
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Card
            padding="md"
            radius="md"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Text size="sm" c="gray.5">
              1-Day Forecast
            </Text>

            <Text size="24px" fw={700} c="white" mt="xs">
              910 m³/s
            </Text>

            <Text size="xs" c="green.4" mt={4}>
              GREEN
            </Text>
          </Card>

          <Card
            padding="md"
            radius="md"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Text size="sm" c="gray.5">
              3-Day Forecast
            </Text>

            <Text size="24px" fw={700} c="white" mt="xs">
              1040 m³/s
            </Text>

            <Text size="xs" c="yellow.4" mt={4}>
              YELLOW
            </Text>
          </Card>

          <Card
            padding="md"
            radius="md"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Text size="sm" c="gray.5">
              5-Day Forecast
            </Text>

            <Text size="24px" fw={700} c="white" mt="xs">
              1180 m³/s
            </Text>

            <Text size="xs" c="yellow.4" mt={4}>
              YELLOW
            </Text>
          </Card>
        </SimpleGrid>
      </Card>
      <Card padding="lg" radius="lg" style={glassCardStyles}>
        <Title order={3} c="white">
          Recent Flood Events
        </Title>

        <Text size="sm" c="gray.5" mt={4} mb="lg">
          Historical flood events detected from observed discharge
        </Text>

        <Stack gap="sm">
          <Group justify="space-between">
            <div>
              <Text size="sm" fw={600} c="white">
                Event 12
              </Text>

              <Text size="xs" c="gray.5">
                12 Aug 2005 – 21 Aug 2005
              </Text>
            </div>

            <div style={{ textAlign: "right" }}>
              <Text size="sm" fw={600} c="white">
                1,842 m³/s
              </Text>

              <Text size="xs" c="orange.4">
                High difficulty
              </Text>
            </div>
          </Group>

          <Group justify="space-between">
            <div>
              <Text size="sm" fw={600} c="white">
                Event 11
              </Text>

              <Text size="xs" c="gray.5">
                04 Aug 2004 – 12 Aug 2004
              </Text>
            </div>

            <div style={{ textAlign: "right" }}>
              <Text size="sm" fw={600} c="white">
                1,526 m³/s
              </Text>

              <Text size="xs" c="yellow.4">
                Medium difficulty
              </Text>
            </div>
          </Group>

          <Group justify="space-between">
            <div>
              <Text size="sm" fw={600} c="white">
                Event 10
              </Text>

              <Text size="xs" c="gray.5">
                19 Jul 2003 – 27 Jul 2003
              </Text>
            </div>

            <div style={{ textAlign: "right" }}>
              <Text size="sm" fw={600} c="white">
                1,314 m³/s
              </Text>

              <Text size="xs" c="green.4">
                Low difficulty
              </Text>
            </div>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}

export default Dashboard;
