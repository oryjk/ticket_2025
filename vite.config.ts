import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
	base:  '/ticket-monitor/',
	plugins: [
		uni()]
});