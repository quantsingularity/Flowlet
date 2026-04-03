import { Provider } from "react-redux";
import AppInner from "@/components/AppInner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { store } from "@/store";

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
