import { Box, Text } from "@mantine/core";
import { IScene } from "@/entities/BookEntities";
import { useMedia } from "@/providers/MediaQueryProvider/MediaQueryProvider";

const desktopStyle = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #f1f1f1",
  height: "30px",
  color: "#787878",
  padding: "8px 32px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
  zIndex: "99",
  width: "900px",
};

export const SceneStatusPanel = (props: { scene: IScene }) => {
  return (
    <>
      <Box style={desktopStyle}>
        <Text size="sm">
          Символов: {props.scene?.totalSymbolCountWoSpaces} /{" "}
          {props.scene?.totalSymbolCountWithSpaces}
        </Text>
      </Box>
    </>
  );
};
