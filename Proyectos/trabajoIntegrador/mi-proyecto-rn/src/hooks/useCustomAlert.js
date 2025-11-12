import { useState } from "react";

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
    buttons: [],
  });

  const showAlert = ({
    title,
    message,
    type = "info",
    buttons = [{ text: "OK" }],
  }) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      buttons,
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  return {
    alertConfig,
    showAlert,
    hideAlert,
  };
};
