/* App.jsx: thin application boundary; routing lives in src/routes and providers in main.jsx. */
import { useSelector } from "react-redux";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes";
export default function App() {
  const auth = useSelector(state => state.auth);
  return <RouterProvider router={router} context={{ auth }} />;
}
