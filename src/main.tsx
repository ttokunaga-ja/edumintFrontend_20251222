import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const enableMocking = async () => {
  if (
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_MSW === "true"
  ) {
    const { worker } = await import("@/mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
      quiet: true
    });
  }
};

const bootstrap = async () => {
  await enableMocking();
  const container = document.getElementById("root");
  if (!container) return;
  createRoot(container).render(<App />);
};

bootstrap();
