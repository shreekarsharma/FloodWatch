import { getHistoricalData } from "../services/api";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Group,
  Loader,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

const glassCardStyles = {
  background: "rgba(255, 255, 255, 0.07)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  backdropFilter: "blur(24px) saturate(140%)",
  WebkitBackdropFilter: "blur(24px) saturate(140%)",
  boxShadow:
    "0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
};

function HistoricalData() {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [variable, setVariable] = useState("Discharge");
  const [warningLevel, setWarningLevel] = useState("All levels");
  useEffect(() => {
    async function loadHistoricalData() {
      setLoading(true);
      setError("");

      try {
        const data = await getHistoricalData();
        setHistoricalData(data);
      } catch (err) {
        setError("Unable to load historical data.");
      } finally {
        setLoading(false);
      }
    }

    loadHistoricalData();
  }, []);
  const handleApplyFilters = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getHistoricalData({
        startDate,
        endDate,
        variable,
        warningLevel,
      });

      setHistoricalData(data);
    } catch (err) {
      setError("Unable to load historical data.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={1} c="white">
            Historical Data
          </Title>

          <Text c="gray.5" mt="xs">
            Explore historical hydrological and environmental observations.
          </Text>
        </div>

        <div>
          <Text size="xs" c="gray.5">
            Dataset
          </Text>

          <Text size="sm" fw={600} c="white">
            White Volta Basin
          </Text>
        </div>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }}>
        <Card padding="lg" radius="lg" style={glassCardStyles}>
          <Text size="sm" c="gray.4">
            Date Range
          </Text>

          <Text size="22px" fw={700} c="white" mt="sm">
            1987 – 2007
          </Text>

          <Text size="xs" c="gray.5" mt={4}>
            Forecast analysis period
          </Text>
        </Card>

        <Card padding="lg" radius="lg" style={glassCardStyles}>
          <Text size="sm" c="gray.4">
            Observations
          </Text>

          <Text size="22px" fw={700} c="white" mt="sm">
            13,514
          </Text>

          <Text size="xs" c="gray.5" mt={4}>
            Prepared feature records
          </Text>
        </Card>

        <Card padding="lg" radius="lg" style={glassCardStyles}>
          <Text size="sm" c="gray.4">
            Main Variable
          </Text>

          <Text size="22px" fw={700} c="white" mt="sm">
            Discharge
          </Text>

          <Text size="xs" c="gray.5" mt={4}>
            Nawuni gauge observations
          </Text>
        </Card>

        <Card padding="lg" radius="lg" style={glassCardStyles}>
          <Text size="sm" c="gray.4">
            Flood Threshold
          </Text>

          <Text size="22px" fw={700} c="white" mt="sm">
            1,114 m³/s
          </Text>

          <Text size="xs" c="gray.5" mt={4}>
            Historical event detection level
          </Text>
        </Card>
      </SimpleGrid>

      <Card padding="lg" radius="lg" style={glassCardStyles}>
        <Title order={3} c="white">
          Historical Observations
        </Title>

        <Text size="sm" c="gray.5" mt={4}>
          Select a date range and variables to explore the historical dataset.
        </Text>

        <Group mt="xl" align="flex-end" grow>
          <TextInput
            label="Start Date"
            value={startDate}
            onChange={(event) => setStartDate(event.currentTarget.value)}
            placeholder="YYYY-MM-DD"
            styles={{
              label: { color: "#cbd5e1" },
              input: {
                background: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 255, 255, 0.14)",
                color: "white",
              },
            }}
          />

          <TextInput
            label="End Date"
            value={endDate}
            onChange={(event) => setEndDate(event.currentTarget.value)}
            placeholder="YYYY-MM-DD"
            styles={{
              label: { color: "#cbd5e1" },
              input: {
                background: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 255, 255, 0.14)",
                color: "white",
              },
            }}
          />

          <Select
            label="Variable"
            placeholder="Select variable"
            data={[
              "Discharge",
              "Rainfall",
              "Soil Moisture",
              "Temperature",
              "Reservoir Storage",
            ]}
            value={variable}
            onChange={setVariable}
            styles={{
              label: { color: "#cbd5e1" },
              input: {
                background: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 255, 255, 0.14)",
                color: "white",
              },
            }}
          />

          <Select
            label="Warning Level"
            placeholder="All levels"
            data={["All levels", "GREEN", "YELLOW", "ORANGE", "RED"]}
            value={warningLevel}
            onChange={setWarningLevel}
            styles={{
              label: { color: "#cbd5e1" },
              input: {
                background: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 255, 255, 0.14)",
                color: "white",
              },
            }}
          />

          <Button
            color="cyan"
            variant="light"
            onClick={handleApplyFilters}
            loading={loading}
          >
            Apply Filters
          </Button>
        </Group>

        <Card
          mt="lg"
          padding={0}
          radius="md"
          style={{
            background: "rgba(255, 255, 255, 0.035)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            overflow: "hidden",
          }}
        >
          <Table.ScrollContainer minWidth={900}>
            <Table
              highlightOnHover
              styles={{
                th: {
                  color: "#cbd5e1",
                  background: "rgba(255, 255, 255, 0.04)",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                },
                td: {
                  color: "#e2e8f0",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
                },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Discharge</Table.Th>
                  <Table.Th>Rainfall</Table.Th>
                  <Table.Th>Soil Moisture</Table.Th>
                  <Table.Th>Temperature</Table.Th>
                  <Table.Th>Reservoir Storage</Table.Th>
                  <Table.Th>Warning Level</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {historicalData.map((row, index) => (
                  <Table.Tr key={row.date || index}>
                    <Table.Td>{row.date || "—"}</Table.Td>
                    <Table.Td>{row.discharge ?? "—"}</Table.Td>
                    <Table.Td>{row.rainfall ?? "—"}</Table.Td>
                    <Table.Td>{row.soil_moisture ?? "—"}</Table.Td>
                    <Table.Td>{row.temperature ?? "—"}</Table.Td>
                    <Table.Td>{row.reservoir_storage ?? "—"}</Table.Td>
                    <Table.Td>{row.warning_level ?? "—"}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
        <Card
          mt="md"
          padding="sm"
          radius="lg"
          style={{
            background: "rgba(255, 255, 255, 0.045)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Group justify="space-between">
            <Text size="sm" c="gray.5">
              Showing 0 of 13,514 records
            </Text>

            <Pagination total={1} color="cyan" size="sm" />
          </Group>
        </Card>
      </Card>
    </Stack>
  );
}

export default HistoricalData;
