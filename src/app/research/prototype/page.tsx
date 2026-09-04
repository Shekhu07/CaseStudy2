import SurveyView from "../SurveyView";
import { SURVEYS } from "../data";

export const metadata = {
  title: "Prototype Survey — Responses",
  description: "All 11 anonymised responses from the prototype usability study.",
};

export default function Page() {
  const survey = SURVEYS.find((s) => s.id === "prototype")!;
  return <SurveyView survey={survey} />;
}
