import { Stack } from "@mantine/core";

import { useMediaQuery } from "@mantine/hooks";

import Xd from "./components/Xd";
import { isMobileQuery } from "./lib/utils";

function App() {
  const isMobile = useMediaQuery(isMobileQuery);

  return (
    <Stack h="100vh" c="primary" p={0}>
      <Xd />
    </Stack>
  );
}

export default App;
