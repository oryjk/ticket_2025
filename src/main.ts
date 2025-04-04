import { createSSRApp } from "vue";
import App from "./App.vue";
import './style.css' // Import your main CSS file
export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
