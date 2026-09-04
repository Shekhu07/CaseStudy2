import SurveyView from "../SurveyView";
import { SURVEYS } from "../data";

export const metadata = {
  title: "User Research Survey — Responses",
  description: "All 16 anonymised responses from the wishlist user research survey.",
};

export default function Page() {
  const survey = SURVEYS.find((s) => s.id === "wishlist")!;
  return <SurveyView survey={survey} />;
}
