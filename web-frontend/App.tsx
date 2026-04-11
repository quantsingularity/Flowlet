import { Provider } from "react-redux";
import AppInner from "@/src/components/layout/AppInner";
import ErrorBoundary from "@/src/components/layout/ErrorBoundary";
import { store } from "@/src/store";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppInner />
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
