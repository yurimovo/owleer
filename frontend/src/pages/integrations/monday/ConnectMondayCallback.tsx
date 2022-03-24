import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Loader from "../../../utils/elements/Loader";
import { createIntegration } from "../../../utils/integratons/createIntegration";

export default function ConnectMondayCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const history = useHistory();

  useEffect(() => {
    setIsLoading(true);
    createIntegration({
      payload: { code: code },
      type: "monday",
      name: "Monday",
    })
      .then((r) => {
        history.push("/integrations/monday");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return isLoading ? (
    <Loader title="Binding with monday.com..." />
  ) : (
    <div>We are all set.</div>
  );
}
