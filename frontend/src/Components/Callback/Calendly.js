import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { v4 } from "uuid";

const CalendlyCallback = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryParams = Object.fromEntries(searchParams);
  const { code, state } = queryParams;

  useEffect(() => {
    if (code.length > 0 && state.length > 0) {
      const uid = v4();
      window.opener.postMessage({
        type: "CALENDLY_AUTH_SUCCESS",
        code,
        state,
        uid,
      });
      window.opener.last = uid;
    }
  }, []);

  return (
    <>
      <h1>Getting authentication info...</h1>
    </>
  );
};

export default CalendlyCallback;
