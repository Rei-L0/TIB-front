import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainPage, ShortsListPage, ShortsViewerPage, UploadPage } from "@/pages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="max-w-md mx-auto bg-white min-h-screen">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/shorts" element={<ShortsListPage />} />
            <Route path="/shorts/viewer" element={<ShortsViewerPage />} />
            <Route path="/upload" element={<UploadPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
