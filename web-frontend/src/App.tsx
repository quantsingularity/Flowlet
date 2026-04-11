import { Provider } from "react-redux";
import AppInner from "@/components/layout/AppInner";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import { store } from "@/store";

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
