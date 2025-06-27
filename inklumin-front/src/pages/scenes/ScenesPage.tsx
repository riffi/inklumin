import { useEffect } from "react";
import { Box } from "@mantine/core";
import { SceneLayout } from "@/components/scenes/SceneLayout/SceneLayout";
import { useUiSettingsStore } from "@/stores/uiSettingsStore/uiSettingsStore";

export const ScenesPage = () => {
  const { isNavbarOpened, toggleNavbarOpened } = useUiSettingsStore();

  useEffect(() => {
    // При переходе на страницу сцен сворачиваем меню
    if (isNavbarOpened) {
      toggleNavbarOpened();
    }
  }, []);

  return (
    <Box>
      <SceneLayout />
    </Box>
  );
};
