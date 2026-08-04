import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";

function App() {
    useEffect(() => {
        const handleForbidden = () => {
            if (window.location.pathname !== "/403") {
                window.history.pushState({}, "", "/403");
                window.dispatchEvent(new PopStateEvent("popstate"));
            }
        };
        window.addEventListener("app:forbidden", handleForbidden);
        return () => window.removeEventListener("app:forbidden", handleForbidden);
    }, []);

    return <AppRoutes />;
}

export default App;
