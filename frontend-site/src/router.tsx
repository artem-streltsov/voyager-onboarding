import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Blocks from "./pages/Blocks";
import Transactions from "./pages/Transactions";
import Transaction from "./pages/Transaction";
import Block from "./pages/Block";
import ErrorPage from './ErrorPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "blocks",
        element: <Blocks />,
      },
      {
        path: "block/:blockNumber",
        element: <Block />,
      },
      {
        path: "transactions",
        element: <Transactions />,
      },
      {
        path: "transaction/:transactionHash",
        element: <Transaction />,
      },
    ]
  },
]);

export default router
