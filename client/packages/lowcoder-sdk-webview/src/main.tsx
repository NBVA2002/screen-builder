import React from "react";
import ReactDOM from 'react-dom/client'
import App from "./App";

const apiKey = new URL(location.href).searchParams.get("LOWCODER_API_KEY");
if (apiKey) {
    localStorage.setItem("LOWCODER_API_KEY", apiKey);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App/>);